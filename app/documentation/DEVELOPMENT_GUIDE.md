# PRS Frontend Development Guide

## Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **npm** or **bun** package manager
- **Git** for version control
- **VS Code** (recommended) with TypeScript extensions

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd PRS/app
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Using bun (recommended)
   bun install
   ```

3. **Environment configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure environment variables
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/
   ```

4. **Start development server**
   ```bash
   # Using npm
   npm run dev
   
   # Using bun
   bun dev
   ```

## Project Structure Deep Dive

### App Router Structure
```
src/app/
├── (auth)/                 # Authentication group
│   ├── login/
│   └── change-password/
├── (dashboard)/           # Dashboard group with layout
│   ├── layout.tsx        # Shared dashboard layout
│   ├── org-admin/        # Role-specific routes
│   ├── salesperson/
│   ├── verifier/
│   └── settings/
└── api/                  # API routes
    └── auth/
```

### Component Organization
```
src/components/
├── core/                 # Framework components
│   ├── UnifiedTable.tsx  # Advanced data table
│   ├── UnifiedForm.tsx   # Dynamic form builder
│   └── TableSkeleton.tsx # Loading states
├── dashboard/           # Role-specific components
│   ├── org-admin/
│   ├── salesperson/
│   └── verifier/
├── forms/              # Form components
├── shared/             # Shared utilities
├── ui/                # Design system components
└── global-components/ # App-wide components
```

### State Management
```
src/stores/
├── authStore.ts        # Authentication state
├── uiStore.ts         # UI state (sidebar, modals)
└── appStore.ts        # Application preferences
```

### API Integration
```
src/hooks/api/
├── useClients.ts      # Client management
├── useDeals.ts        # Deal operations
├── useDashboard.ts    # Dashboard data
└── useOrganizations.ts # Organization data
```

## Development Workflow

### 1. Feature Development

#### Creating New Features
```bash
# Create feature branch
git checkout -b feature/new-dashboard-widget

# Develop feature
# - Add components
# - Update types
# - Add tests
# - Update documentation

# Commit changes
git commit -m "feat: add new dashboard widget"
```

#### Component Development Pattern
```typescript
// 1. Define types
interface WidgetProps {
  data: DashboardData
  onUpdate: (data: DashboardData) => void
}

// 2. Create component
export function DashboardWidget({ data, onUpdate }: WidgetProps) {
  // Implementation
}

// 3. Add to exports
export { DashboardWidget } from './DashboardWidget'
```

### 2. Testing Strategy

#### Unit Testing with Vitest
```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

#### Test Structure
```typescript
// Component test example
import { render, screen } from '@testing-library/react'
import { DashboardWidget } from './DashboardWidget'

describe('DashboardWidget', () => {
  it('should render widget data', () => {
    const mockData = { /* test data */ }
    render(<DashboardWidget data={mockData} onUpdate={vi.fn()} />)
    
    expect(screen.getByText('Widget Title')).toBeInTheDocument()
  })
})
```

#### E2E Testing with Playwright
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

### 3. Code Quality

#### ESLint Configuration
```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint --fix
```

#### TypeScript Best Practices
```typescript
// Use strict typing
interface StrictProps {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  metadata?: Record<string, unknown>
}

// Avoid any types
// ❌ Don't do this
const data: any = response.data

// ✅ Do this instead
interface ApiResponse {
  data: DealData[]
  status: number
}
const response: ApiResponse = await api.get('/deals')
```

## Component Development Guidelines

### 1. Core Components

#### UnifiedTable Usage
```typescript
import { UnifiedTable } from '@/components/core/UnifiedTable'

function DealsPage() {
  const { data, isLoading } = useDeals()
  
  return (
    <UnifiedTable
      data={data}
      columns={dealsColumns}
      loading={isLoading}
      searchable
      filterable
      exportable
    />
  )
}
```

#### UnifiedForm Usage
```typescript
import { UnifiedForm } from '@/components/core/UnifiedForm'

function CreateDealForm() {
  return (
    <UnifiedForm
      schema={dealSchema}
      onSubmit={handleSubmit}
      fields={[
        { name: 'clientId', type: 'select', options: clients },
        { name: 'amount', type: 'number', required: true },
        { name: 'description', type: 'textarea' }
      ]}
    />
  )
}
```

### 2. State Management Patterns

#### Zustand Store Pattern
```typescript
// stores/dealStore.ts
interface DealStore {
  deals: Deal[]
  selectedDeal: Deal | null
  filters: DealFilters
  actions: {
    setDeals: (deals: Deal[]) => void
    selectDeal: (deal: Deal) => void
    updateFilters: (filters: Partial<DealFilters>) => void
  }
}

export const useDealStore = create<DealStore>((set, get) => ({
  deals: [],
  selectedDeal: null,
  filters: {},
  actions: {
    setDeals: (deals) => set({ deals }),
    selectDeal: (deal) => set({ selectedDeal: deal }),
    updateFilters: (filters) => 
      set(state => ({ filters: { ...state.filters, ...filters } }))
  }
}))
```

#### React Query Integration
```typescript
// hooks/api/useDeals.ts
export function useDeals(filters?: DealFilters) {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: () => api.deals.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.deals.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['deals'])
    }
  })
}
```

### 3. API Integration

#### API Client Configuration
```typescript
// lib/api-client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      redirectToLogin()
    }
    return Promise.reject(error)
  }
)
```

#### Type-Safe API Hooks
```typescript
// Define API response types
interface DealsResponse {
  data: Deal[]
  pagination: PaginationInfo
}

// Create typed hook
export function useDeals(params: DealParams = {}) {
  return useQuery<DealsResponse, ApiError>({
    queryKey: ['deals', params],
    queryFn: () => api.get('/deals', { params }),
    select: (data) => data.data,
  })
}
```

## Performance Optimization

### 1. Code Splitting

#### Route-Based Splitting
```typescript
// Lazy load heavy components
const HeavyAnalytics = lazy(() => import('./HeavyAnalytics'))

function Dashboard() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <HeavyAnalytics />
    </Suspense>
  )
}
```

#### Component-Based Splitting
```typescript
// Split large feature components
const DealForm = lazy(() => 
  import('./DealForm').then(module => ({ default: module.DealForm }))
)
```

### 2. Caching Strategies

#### React Query Configuration
```typescript
// Configure global cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})
```

#### Prefetching
```typescript
// Prefetch related data
function DealsList() {
  const queryClient = useQueryClient()
  
  const handleDealHover = (dealId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['deal', dealId],
      queryFn: () => api.deals.getById(dealId),
    })
  }
  
  return (
    <div>
      {deals.map(deal => (
        <DealCard 
          key={deal.id}
          deal={deal}
          onMouseEnter={() => handleDealHover(deal.id)}
        />
      ))}
    </div>
  )
}
```

### 3. Bundle Optimization

#### Analyzing Bundle Size
```bash
# Build and analyze
npm run build
npx @next/bundle-analyzer
```

#### Import Optimization
```typescript
// ❌ Don't import entire libraries
import * as _ from 'lodash'

// ✅ Import specific functions
import { debounce } from 'lodash'

// ✅ Use tree-shakable imports
import debounce from 'lodash/debounce'
```

## Security Best Practices

### 1. Authentication Handling

```typescript
// Secure token storage
const authStore = create<AuthStore>((set, get) => ({
  token: null,
  user: null,
  
  login: async (credentials) => {
    const response = await api.auth.login(credentials)
    
    // Store token securely
    localStorage.setItem('auth_token', response.token)
    
    set({ 
      token: response.token,
      user: response.user 
    })
  },
  
  logout: () => {
    localStorage.removeItem('auth_token')
    set({ token: null, user: null })
  }
}))
```

### 2. Input Validation

```typescript
// Use Zod for validation
import { z } from 'zod'

const dealSchema = z.object({
  clientId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
  status: z.enum(['pending', 'approved', 'rejected'])
})

// Validate in components
function CreateDeal() {
  const form = useForm({
    resolver: zodResolver(dealSchema)
  })
  
  // Form will automatically validate
}
```

### 3. Permission-Based Rendering

```typescript
// Permission gate component
function PermissionGate({ 
  permission, 
  children 
}: { 
  permission: string
  children: React.ReactNode 
}) {
  const { hasPermission } = useAuth()
  
  if (!hasPermission(permission)) {
    return null
  }
  
  return <>{children}</>
}

// Usage
function AdminPanel() {
  return (
    <PermissionGate permission="manage:users">
      <UserManagement />
    </PermissionGate>
  )
}
```

## Debugging and Troubleshooting

### 1. Development Tools

#### React Query Devtools
```typescript
// Enable in development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <>
      <MyApp />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  )
}
```

#### Zustand Devtools
```typescript
// Enable store debugging
const useStore = create(
  devtools(
    (set, get) => ({
      // store implementation
    }),
    {
      name: 'app-store',
    }
  )
)
```

### 2. Error Handling

#### Error Boundaries
```typescript
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }

    return this.props.children
  }
}
```

#### API Error Handling
```typescript
// Global error handler
function useApiError() {
  return useMutation({
    mutationFn: api.someEndpoint,
    onError: (error: ApiError) => {
      if (error.status === 400) {
        toast.error(error.message)
      } else if (error.status === 500) {
        toast.error('Internal server error')
      }
    }
  })
}
```

## Deployment

### 1. Build Process

```bash
# Production build
npm run build

# Start production server
npm start
```

### 2. Environment Configuration

```bash
# Production environment variables
NEXT_PUBLIC_API_URL=https://api.production.com
NEXT_PUBLIC_WS_URL=wss://api.production.com/ws
```

### 3. Performance Monitoring

```typescript
// Add performance monitoring
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Send to analytics service
  analytics.track('web-vitals', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
  })
}
```

## Contributing Guidelines

### 1. Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### 2. Commit Messages
Follow conventional commits:
```
feat: add user management dashboard
fix: resolve authentication token refresh issue
docs: update API integration guide
refactor: optimize deal table performance
```

### 3. Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit PR with detailed description
5. Address review feedback
6. Merge after approval

This development guide provides the foundation for contributing to the PRS frontend codebase while maintaining code quality and consistency.