# Frontend-Backend API Compatibility Guide

## 🔄 Overview

This document outlines the compatibility changes made to ensure the frontend works seamlessly with the Django backend API.

## 🚨 Major Changes Made

### 1. **API Base URL Standardization**

**Before (Multiple inconsistent URLs):**
```typescript
// Different files using different base URLs
'http://localhost:3001/api'     // lib/api/client.ts
'http://localhost:3000/dashboard/salesperson/' // salesapi.tsx
'/api'                          // lib/api.ts
```

**After (Standardized):**
```typescript
// All files now use consistent backend URL
'http://localhost:8000/api/v1'  // Django backend URL
```

### 2. **Authentication Token Format**

**Before (JWT Bearer):**
```typescript
headers['Authorization'] = `Bearer ${token}`;
```

**After (Django Token):**
```typescript
headers['Authorization'] = `Token ${token}`;
```

### 3. **Deal API Structure**

**Backend provides both structures:**
- **Nested (Recommended):** `/api/v1/clients/{client_id}/deals/`
- **Flat (Compatibility):** `/api/v1/deals/` *(for frontend compatibility)*

## 📋 Updated API Endpoints

### **Authentication**
```typescript
// Login
POST /api/v1/auth/login/
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "token": "abc123...",
    "user": {
      "id": 1,
      "email": "user@example.com", 
      "role": "salesperson",
      "organization": {...}
    }
  }
}

// Logout
POST /api/v1/auth/logout/
```

### **Clients Management**
```typescript
// Get all clients
GET /api/v1/clients/
?page=1&limit=10&search=client_name&category=loyal&status=clear

// Create client
POST /api/v1/clients/
{
  "name": "Client Name",
  "email": "client@example.com",
  "category": "loyal",
  "primaryContactName": "John Doe",
  "primaryContactPhone": "+1234567890",
  "address": "123 Main St",
  "expectedValue": 50000,
  "remarks": "VIP client"
}

// Get client details
GET /api/v1/clients/{id}/

// Update client
PUT /api/v1/clients/{id}/

// Delete client
DELETE /api/v1/clients/{id}/
```

### **Deals Management (Flat Structure for Frontend)**
```typescript
// Get all deals (flat access)
GET /api/v1/deals/
?page=1&limit=10&pay_status=pending&source_type=referral

// Create deal (flat access)
POST /api/v1/deals/
{
  "client_id": 1,
  "client_name": "Test Client",
  "deal_value": "5000.00",
  "pay_status": "full_payment",
  "source_type": "referral",
  "payment_method": "bank_transfer",
  "deal_date": "2024-01-15",
  "due_date": "2024-02-15",
  "remarks": "Important deal"
}

// Update deal status (for verifiers)
PATCH /api/v1/deals/{id}/update_status/
{
  "status": "verified",
  "verifierRemarks": "Payment confirmed"
}

// Get deal details
GET /api/v1/deals/{id}/
```

### **Users Management**
```typescript
// Get all users
GET /api/v1/auth/users/
?page=1&limit=10&search=username&role=salesperson

// Create user
POST /api/v1/auth/users/
{
  "email": "newuser@example.com", 
  "username": "newuser",
  "password": "securepassword",
  "role": "salesperson",
  "organization": 1
}

// Get user details
GET /api/v1/auth/users/{id}/

// Update user
PUT /api/v1/auth/users/{id}/

// Change user status
PATCH /api/v1/auth/users/{id}/
{
  "is_active": false
}
```

### **Commission Management**
```typescript
// Get commissions
GET /api/v1/commissions/
?user=1&organization=1&date_from=2024-01-01&date_to=2024-01-31

// Create commission
POST /api/v1/commissions/
{
  "user": 1,
  "amount": "500.00",
  "commission_type": "deal_commission",
  "description": "Commission for Deal #123",
  "related_deal": 1
}
```

## 🔧 Frontend Code Examples

### **Updated API Client Usage**

```typescript
// Using the standardized API client
import { apiClient } from '@/lib/api/client';

// Login
const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login/', {
      email,
      password
    });
    
    // Store token
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get deals
const getDeals = async (filters = {}) => {
  try {
    const response = await apiClient.get('/deals/', filters);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create deal
const createDeal = async (dealData) => {
  try {
    const response = await apiClient.post('/deals/', dealData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### **React Hook Example**

```typescript
// useDeals.js - Updated
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from '@/lib/api/client';

const useDeals = (filters = {}) => {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: async () => {
      const response = await apiClient.get('/deals/', filters);
      return response.data;
    }
  });
};

const useCreateDeal = () => {
  return useMutation({
    mutationFn: async (dealData) => {
      const response = await apiClient.post('/deals/', dealData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch deals
      queryClient.invalidateQueries(['deals']);
    }
  });
};
```

## ⚠️ Important Migration Notes

### **1. Environment Variables**
Update your `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### **2. Authentication Flow**
The login process now:
1. Accepts `email` instead of `username`
2. Returns Django Token format
3. Stores token in localStorage as `authToken`
4. Redirects based on user role

### **3. Error Handling**
Backend errors now follow Django REST framework format:
```typescript
{
  "error": "Error message",
  "details": {...},
  "status": 400
}
```

### **4. Role-Based Access**
The API automatically filters data based on user roles:
- **Super Admin:** Access to all organizations
- **Org Admin:** Access to their organization only
- **Salesperson:** Access to their own deals/clients
- **Verifier:** Access to deals requiring verification
- **Supervisor:** Access to their team's data

## 🧪 Testing the Integration

### **1. Start Backend**
```bash
cd Backend_PRS/backend
python manage.py runserver
```

### **2. Start Frontend**
```bash
cd app
npm run dev
```

### **3. Test Authentication**
1. Navigate to `/login`
2. Use credentials created via Django admin or registration
3. Verify token storage and role-based redirect

### **4. Test API Calls**
1. Create a client
2. Create a deal for that client  
3. Update deal status (if verifier)
4. Check commission calculations

## 🔍 Debugging Tips

### **CORS Issues**
If you encounter CORS errors, ensure backend `CORS_ALLOWED_ORIGINS` includes your frontend URL.

### **Authentication Issues**
1. Check token format in browser DevTools
2. Verify token is being sent with requests
3. Check backend logs for authentication errors

### **API Response Issues**
1. Use browser Network tab to inspect requests/responses
2. Check backend logs for detailed error messages
3. Verify endpoint URLs match backend routing

## 📚 Additional Resources

- **Backend API Documentation:** `/api/v1/swagger/`
- **Backend Admin Panel:** `/admin/`
- **Frontend API Documentation:** `app/API_DOCUMENTATION.md`

---

## 🚀 Next Steps

1. **Test all authentication flows**
2. **Verify deal creation and management**
3. **Test role-based access control**
4. **Implement real-time notifications**
5. **Add comprehensive error handling**
6. **Performance optimization**

This compatibility layer ensures the frontend works seamlessly with the Django backend while maintaining the flexibility to use either nested or flat API structures based on your needs. 