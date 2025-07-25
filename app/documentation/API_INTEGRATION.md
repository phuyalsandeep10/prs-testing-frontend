# PRS API Integration Guide

## Overview

This guide covers the integration between the PRS frontend and backend API, including authentication, data fetching patterns, error handling, and best practices for API communication.

## API Configuration

### Base Configuration

```typescript
// lib/api-client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/
```

## Authentication

### Login Endpoints

The PRS system supports multiple authentication endpoints for different user roles:

```typescript
// Authentication endpoints
const AUTH_ENDPOINTS = {
  REGULAR_LOGIN: '/auth/login/',
  SUPER_ADMIN_LOGIN: '/auth/login/super-admin/',
  ORG_ADMIN_LOGIN: '/auth/login/org-admin/',
  OTP_VERIFY: '/auth/verify-otp/',
  REFRESH_TOKEN: '/auth/refresh/',
  LOGOUT: '/auth/logout/',
  CHANGE_PASSWORD: '/auth/change-password/',
}
```

### Authentication Flow

```typescript
// lib/auth.ts
interface LoginCredentials {
  email: string
  password: string
  organization_id?: string
}

interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
  permissions: string[]
}

class AuthService {
  async login(credentials: LoginCredentials, endpoint: string): Promise<AuthResponse> {
    const response = await apiClient.post(endpoint, credentials)
    
    // Store tokens securely
    this.setTokens(response.data.access_token, response.data.refresh_token)
    
    return response.data
  }
  
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    const response = await apiClient.post('/auth/refresh/', {
      refresh: refreshToken
    })
    
    this.setAccessToken(response.data.access)
    return response.data.access
  }
  
  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }
}
```

### Request Interceptors

```typescript
// Add authentication to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

### Response Interceptors

```typescript
// Handle token refresh automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const newToken = await authService.refreshToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Redirect to login
        authService.logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)
```

## Data Fetching with React Query

### Query Client Setup

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

### API Service Layer

```typescript
// lib/api/deals.ts
interface Deal {
  id: string
  client_id: string
  amount: number
  status: 'pending' | 'verified' | 'approved' | 'rejected'
  created_at: string
  payments: Payment[]
}

interface DealFilters {
  status?: string
  client_id?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}

export const dealsApi = {
  getAll: (filters: DealFilters = {}) =>
    apiClient.get<PaginatedResponse<Deal>>('/deals/', { params: filters }),
    
  getById: (id: string) =>
    apiClient.get<Deal>(`/deals/${id}/`),
    
  create: (data: CreateDealRequest) =>
    apiClient.post<Deal>('/deals/', data),
    
  update: (id: string, data: UpdateDealRequest) =>
    apiClient.patch<Deal>(`/deals/${id}/`, data),
    
  delete: (id: string) =>
    apiClient.delete(`/deals/${id}/`),
    
  addPayment: (dealId: string, payment: CreatePaymentRequest) =>
    apiClient.post<Payment>(`/deals/${dealId}/payments/`, payment),
    
  verify: (id: string, verification: VerificationRequest) =>
    apiClient.post<Deal>(`/deals/${id}/verify/`, verification),
}
```

### Custom Hooks

```typescript
// hooks/api/useDeals.ts
export function useDeals(filters: DealFilters = {}) {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: () => dealsApi.getAll(filters),
    select: (data) => data.data,
    keepPreviousData: true,
  })
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: () => dealsApi.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: dealsApi.create,
    onSuccess: (newDeal) => {
      // Update deals list
      queryClient.invalidateQueries(['deals'])
      
      // Add to cache
      queryClient.setQueryData(['deal', newDeal.data.id], newDeal.data)
      
      // Show success message
      toast.success('Deal created successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create deal')
    },
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealRequest }) =>
      dealsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['deal', id])
      
      // Snapshot previous value
      const previousDeal = queryClient.getQueryData(['deal', id])
      
      // Optimistically update
      queryClient.setQueryData(['deal', id], (old: Deal) => ({
        ...old,
        ...data,
      }))
      
      return { previousDeal }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousDeal) {
        queryClient.setQueryData(['deal', variables.id], context.previousDeal)
      }
      toast.error('Failed to update deal')
    },
    onSuccess: (updatedDeal) => {
      queryClient.invalidateQueries(['deals'])
      toast.success('Deal updated successfully')
    },
  })
}
```

### Optimistic Updates

```typescript
// Optimistic mutations for better UX
export function useVerifyDeal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, verification }: { id: string; verification: VerificationRequest }) =>
      dealsApi.verify(id, verification),
    onMutate: async ({ id, verification }) => {
      await queryClient.cancelQueries(['deal', id])
      
      const previousDeal = queryClient.getQueryData(['deal', id])
      
      // Optimistically update deal status
      queryClient.setQueryData(['deal', id], (old: Deal) => ({
        ...old,
        status: verification.approved ? 'verified' : 'rejected',
        verification_notes: verification.notes,
      }))
      
      return { previousDeal }
    },
    onError: (error, { id }, context) => {
      if (context?.previousDeal) {
        queryClient.setQueryData(['deal', id], context.previousDeal)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deals'])
    },
  })
}
```

## Real-time Communication

### WebSocket Integration

```typescript
// lib/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  
  connect(token: string) {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMessage(data)
    }
    
    this.ws.onclose = () => {
      this.handleReconnect()
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }
  
  private handleMessage(data: WebSocketMessage) {
    switch (data.type) {
      case 'deal_updated':
        queryClient.invalidateQueries(['deal', data.payload.id])
        break
      case 'notification':
        notificationStore.addNotification(data.payload)
        break
      default:
        console.log('Unknown message type:', data.type)
    }
  }
  
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++
        this.connect(getAccessToken())
      }, 1000 * this.reconnectAttempts)
    }
  }
}
```

### Notification System

```typescript
// hooks/useRealtimeNotifications.ts
export function useRealtimeNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  useEffect(() => {
    if (!user) return
    
    const ws = new WebSocketService()
    ws.connect(getAccessToken())
    
    // Listen for notification events
    ws.on('notification', (notification) => {
      // Update notifications cache
      queryClient.setQueryData(['notifications'], (old: Notification[]) => 
        [notification, ...(old || [])]
      )
      
      // Show toast
      toast.info(notification.message)
    })
    
    return () => ws.disconnect()
  }, [user, queryClient])
}
```

## Error Handling

### Error Types

```typescript
// types/api.ts
export interface ApiError {
  message: string
  status: number
  code?: string
  field_errors?: Record<string, string[]>
}

export interface ValidationError extends ApiError {
  field_errors: Record<string, string[]>
}
```

### Error Handler

```typescript
// lib/error-handler.ts
export function handleApiError(error: AxiosError): never {
  if (error.response) {
    const apiError: ApiError = {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      code: error.response.data?.code,
      field_errors: error.response.data?.field_errors,
    }
    throw apiError
  } else if (error.request) {
    throw new Error('Network error - please check your connection')
  } else {
    throw new Error(error.message)
  }
}
```

### Global Error Boundary

```typescript
// components/ErrorBoundary.tsx
export function ApiErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="p-4 border border-red-200 rounded">
          <h2 className="text-lg font-semibold text-red-600">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {error.message}
          </p>
          <button 
            onClick={resetErrorBoundary}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Try again
          </button>
        </div>
      )}
      onError={(error) => {
        // Log to error reporting service
        console.error('API Error:', error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

## Performance Optimization

### Request Deduplication

```typescript
// React Query automatically deduplicates requests
// Multiple components calling the same query will share the request

function DealOverview({ dealId }: { dealId: string }) {
  const { data: deal } = useDeal(dealId) // Request A
  return <DealCard deal={deal} />
}

function DealDetails({ dealId }: { dealId: string }) {
  const { data: deal } = useDeal(dealId) // Same request as A - deduplicated
  return <DealForm deal={deal} />
}
```

### Background Refetching

```typescript
// Configure background refetching
export function useDeals(filters: DealFilters = {}) {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: () => dealsApi.getAll(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  })
}
```

### Prefetching

```typescript
// Prefetch related data on hover
function DealCard({ deal }: { deal: Deal }) {
  const queryClient = useQueryClient()
  
  const prefetchDealDetails = () => {
    queryClient.prefetchQuery({
      queryKey: ['deal', deal.id],
      queryFn: () => dealsApi.getById(deal.id),
      staleTime: 60000, // 1 minute
    })
  }
  
  return (
    <div onMouseEnter={prefetchDealDetails}>
      <h3>{deal.title}</h3>
      <p>{deal.amount}</p>
    </div>
  )
}
```

### Pagination

```typescript
// Infinite queries for large datasets
export function useInfiniteDeals(filters: DealFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['deals', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      dealsApi.getAll({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.data.has_next ? lastPage.data.page + 1 : undefined
    },
    select: (data) => ({
      pages: data.pages.map(page => page.data.results).flat(),
      pageParams: data.pageParams,
    }),
  })
}
```

## Caching Strategies

### Cache Configuration

```typescript
// Different cache times for different data types
const CACHE_TIMES = {
  USER_PROFILE: 15 * 60 * 1000, // 15 minutes
  DEALS: 5 * 60 * 1000, // 5 minutes
  CLIENTS: 10 * 60 * 1000, // 10 minutes
  DASHBOARD_STATS: 2 * 60 * 1000, // 2 minutes
  STATIC_DATA: 60 * 60 * 1000, // 1 hour
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userApi.getProfile(),
    staleTime: CACHE_TIMES.USER_PROFILE,
    cacheTime: CACHE_TIMES.USER_PROFILE * 2,
  })
}
```

### Cache Invalidation

```typescript
// Strategic cache invalidation
export function useUpdateDeal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: dealsApi.update,
    onSuccess: (updatedDeal) => {
      // Invalidate related queries
      queryClient.invalidateQueries(['deals'])
      queryClient.invalidateQueries(['deal', updatedDeal.data.id])
      queryClient.invalidateQueries(['dashboard', 'stats'])
      
      // Update specific cached deal
      queryClient.setQueryData(['deal', updatedDeal.data.id], updatedDeal.data)
    },
  })
}
```

### Offline Support

```typescript
// Persist cache for offline support
import { persistQueryClient } from '@tanstack/react-query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

persistQueryClient({
  queryClient,
  persister,
})
```

## Testing API Integration

### Mock Service Worker Setup

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  rest.get('/api/deals/', (req, res, ctx) => {
    return res(
      ctx.json({
        results: [
          { id: '1', title: 'Test Deal', amount: 1000, status: 'pending' },
        ],
        count: 1,
        has_next: false,
      })
    )
  }),
  
  rest.post('/api/deals/', (req, res, ctx) => {
    return res(
      ctx.json({
        id: '2',
        title: 'New Deal',
        amount: 2000,
        status: 'pending',
      })
    )
  }),
]
```

### Hook Testing

```typescript
// tests/hooks/useDeals.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDeals } from '@/hooks/api/useDeals'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

test('should fetch deals', async () => {
  const { result } = renderHook(() => useDeals(), {
    wrapper: createWrapper(),
  })
  
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
  })
  
  expect(result.current.data).toHaveLength(1)
  expect(result.current.data[0].title).toBe('Test Deal')
})
```

## Best Practices

### 1. Type Safety
- Always define TypeScript interfaces for API responses
- Use generic types for consistent API patterns
- Validate runtime data with Zod schemas

### 2. Error Handling
- Implement consistent error handling across all API calls
- Provide meaningful error messages to users
- Log errors for debugging and monitoring

### 3. Performance
- Use React Query for intelligent caching
- Implement optimistic updates for better UX
- Prefetch data when possible

### 4. Security
- Never log sensitive data
- Implement proper token management
- Validate all user inputs

### 5. Maintainability
- Organize API calls in service layers
- Use custom hooks for reusable logic
- Document API integration patterns

This comprehensive API integration guide ensures consistent, performant, and maintainable communication between the PRS frontend and backend systems.