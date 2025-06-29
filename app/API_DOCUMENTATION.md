# PRS API Guide - Made Simple! 🚀

> **What is this?** This document explains how to talk to our backend (the part that handles data). Think of APIs like a waiter at a restaurant - you tell them what you want, and they bring it back to you!

---

## 🎯 Understanding Our API

**Simple Explanation:** Our API is like a bridge between the frontend (what users see) and the database (where we store data).

**What you can do with our API:**
- Get lists of users, clients, deals, etc.
- Create new users, clients, deals
- Update existing information
- Delete things you no longer need

**Think of it like this:**
```
Frontend (React) → API (Our Backend) → Database (Data Storage)
     ↑                    ↓
   User clicks      Returns the data
    "Get Users"     they requested
```

---

## 🔐 Authentication (How to Prove You're Allowed)

**What is authentication?** It's like showing your ID card to prove you're allowed to use the system.

### How Our Authentication Works

```typescript
// Step 1: User logs in with email/password
// Step 2: System gives them a "token" (like a temporary ID badge)
// Step 3: Include this token in every API request

// Example: How to include authentication in requests
const headers = {
  'Authorization': 'Bearer YOUR_TOKEN_HERE',  // Your "ID badge"
  'Content-Type': 'application/json'          // Tell server we're sending JSON
};
```

### Login Process (Step-by-Step)

```typescript
// 1. LOGIN - Get your access token
async function loginUser(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,          // User's email
        password: password     // User's password
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Save the token for future requests
      localStorage.setItem('authToken', result.token);
      console.log('Login successful!');
    }
    
    return result;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// 2. LOGOUT - Invalidate your token
async function logoutUser() {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Remove token from storage
    localStorage.removeItem('authToken');
    console.log('Logout successful!');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// 3. CHECK SESSION - See if you're still logged in
async function checkUserSession() {
  try {
    const response = await fetch('/api/auth/session', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Session check failed:', error);
    return null;
  }
}
```

---

## 👥 Users API (Managing People in the System)

**Base URL:** `/api/users`

**What you can do:**
- Get a list of all users
- Get details about one specific user
- Create a new user
- Update user information
- Delete a user
- Change user status (active/inactive)

### Get All Users (With Filtering and Pagination)

```typescript
// WHAT THIS DOES: Gets a list of users, with options to filter and paginate
// WHY USE THIS: When you want to show a table of users, search for users, etc.

async function getAllUsers(options = {}) {
  // Build the query string from options
  const params = new URLSearchParams();
  
  // Add pagination parameters
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  
  // Add search parameters
  if (options.search) params.append('search', options.search);
  if (options.role) params.append('role', options.role);
  
  try {
    const response = await fetch(`/api/users?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to get users:', error);
    throw error;
  }
}

// EXAMPLE USAGE:
// Get first page of users
const firstPageUsers = await getAllUsers({ page: 1, limit: 10 });

// Search for users named "john"
const johnUsers = await getAllUsers({ search: 'john' });

// Get only salesperson users
const salespeople = await getAllUsers({ role: 'salesperson' });

// Complex example: Search for salespeople named "john", page 2, 20 per page
const specificUsers = await getAllUsers({
  search: 'john',
  role: 'salesperson',
  page: 2,
  limit: 20
});
```

**What You Get Back:**
```typescript
{
  "data": [                          // Array of user objects
    {
      "id": "user_123",              // Unique user ID
      "name": "John Doe",            // User's full name
      "email": "john@example.com",   // User's email address
      "phoneNumber": "+1234567890",  // User's phone number
      "role": "salesperson",         // User's role in system
      "assignedTeam": "team_456",    // Which team they belong to
      "status": "active",            // active, inactive, suspended
      "avatar": "https://...",       // Profile picture URL
      "permissions": [               // What they're allowed to do
        {
          "resource": "clients",     // What they can access
          "actions": ["create", "read", "update"]  // What actions allowed
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",  // When account was created
      "updatedAt": "2024-01-01T00:00:00Z"   // When last updated
    }
  ],
  "pagination": {                    // Information about pagination
    "page": 1,                       // Current page number
    "limit": 10,                     // How many items per page
    "total": 50,                     // Total number of users
    "totalPages": 5                  // Total number of pages
  }
}
```

### Get One Specific User

```typescript
// WHAT THIS DOES: Gets detailed information about one user
// WHY USE THIS: When user clicks on a user to see their profile

async function getUserById(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;  // Returns the user object
  } catch (error) {
    console.error('Failed to get user:', error);
    throw error;
  }
}

// EXAMPLE USAGE:
const user = await getUserById('user_123');
console.log(`User name: ${user.name}`);
console.log(`User email: ${user.email}`);
```

### Create a New User

```typescript
// WHAT THIS DOES: Creates a brand new user in the system
// WHY USE THIS: When admin wants to add a new team member

interface CreateUserData {
  name: string;                      // Required: User's full name
  email: string;                     // Required: User's email (must be unique)
  phoneNumber?: string;              // Optional: User's phone number
  role: string;                      // Required: User's role (admin, salesperson, etc.)
  assignedTeam?: string;             // Optional: Which team they join
}

async function createUser(userData: CreateUserData) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',                // POST = create new
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)  // Convert object to JSON string
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }
    
    const result = await response.json();
    console.log('User created successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

// EXAMPLE USAGE:
const newUserData = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  phoneNumber: '+1234567890',
  role: 'salesperson',
  assignedTeam: 'team_456'
};

const createdUser = await createUser(newUserData);
console.log(`Created user with ID: ${createdUser.id}`);
```

### Update Existing User

```typescript
// WHAT THIS DOES: Updates information for an existing user
// WHY USE THIS: When user wants to change their profile, or admin updates user info

interface UpdateUserData {
  name?: string;                     // Optional: New name
  phoneNumber?: string;              // Optional: New phone number
  assignedTeam?: string;             // Optional: Move to different team
  // Note: Can't change email or role through this endpoint (security)
}

async function updateUser(userId: string, updates: UpdateUserData) {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',                 // PUT = update existing
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }
    
    const result = await response.json();
    console.log('User updated successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
}

// EXAMPLE USAGE:
const updates = {
  name: 'Jane Smith-Johnson',        // She got married!
  phoneNumber: '+1987654321'         // New phone number
};

const updatedUser = await updateUser('user_124', updates);
console.log(`Updated user: ${updatedUser.name}`);
```

### Delete a User

```typescript
// WHAT THIS DOES: Permanently removes a user from the system
// WHY USE THIS: When someone leaves the company (use carefully!)

async function deleteUser(userId: string) {
  // Always confirm before deleting!
  const confirmed = confirm('Are you sure you want to delete this user? This cannot be undone!');
  if (!confirmed) {
    return;
  }
  
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',              // DELETE = remove permanently
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete user');
    }
    
    const result = await response.json();
    console.log('User deleted successfully');
    return result;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
}

// EXAMPLE USAGE:
await deleteUser('user_124');
console.log('User has been removed from the system');
```

### Change User Status

```typescript
// WHAT THIS DOES: Changes whether a user is active, inactive, or suspended
// WHY USE THIS: Temporarily disable users without deleting them

type UserStatus = 'active' | 'inactive' | 'suspended';

async function changeUserStatus(userId: string, newStatus: UserStatus) {
  try {
    const response = await fetch(`/api/users/${userId}/status`, {
      method: 'PATCH',               // PATCH = partial update
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change user status');
    }
    
    const result = await response.json();
    console.log(`User status changed to: ${newStatus}`);
    return result;
  } catch (error) {
    console.error('Failed to change user status:', error);
    throw error;
  }
}

// EXAMPLE USAGE:
// Suspend a user temporarily
await changeUserStatus('user_123', 'suspended');

// Reactivate a user
await changeUserStatus('user_123', 'active');

// Deactivate a user (softer than deleting)
await changeUserStatus('user_123', 'inactive');
```

---

## 🏢 Clients API (Managing Your Customers)

**Base URL:** `/api/clients`

**What you can do:**
- Get a list of all clients
- Get details about one specific client
- Create a new client
- Update client information
- Delete a client

### Get All Clients

```typescript
// WHAT THIS DOES: Gets a list of clients with filtering options
// WHY USE THIS: To show client tables, search for clients, filter by status

interface ClientFilters {
  page?: number;                     // Which page to get (default: 1)
  limit?: number;                    // How many per page (default: 10, max: 100)
  search?: string;                   // Search in client names
  category?: 'loyal' | 'inconsistent' | 'occasional';  // Client category
  status?: 'clear' | 'pending' | 'bad-depth';          // Payment status
}

async function getAllClients(filters: ClientFilters = {}) {
  const params = new URLSearchParams();
  
  // Add all filter parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  try {
    const response = await fetch(`/api/clients?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to get clients:', error);
    throw error;
  }
}

// EXAMPLE USAGE:
// Get all loyal clients
const loyalClients = await getAllClients({ category: 'loyal' });

// Search for clients with "acme" in the name
const acmeClients = await getAllClients({ search: 'acme' });

// Get clients with payment issues
const problemClients = await getAllClients({ status: 'bad-depth' });
```

**What You Get Back:**
```typescript
{
  "data": [
    {
      "id": "client_123",                    // Unique client ID
      "name": "Acme Corporation",            // Company name
      "email": "contact@acme.com",           // Main contact email
      "category": "loyal",                   // loyal, inconsistent, occasional
      "salesperson": "John Doe",             // Who manages this client
      "lastContact": "2024-01-15",           // Last time we contacted them
      "expectedClose": "2024-02-01",         // When we expect to close deal
      "value": 50000,                        // Deal value in dollars
      "status": "clear",                     // Payment status
      "satisfaction": "positive",            // How happy they are
      "remarks": "Great client, always pays on time",  // Notes about client
      "primaryContactName": "Alice Johnson", // Main person to talk to
      "primaryContactPhone": "+1234567890",  // Their phone number
      "address": "123 Business St, City, State 12345",  // Company address
      "activeDate": "2023-06-01",           // When they became our client
      "activities": [                        // Recent interactions
        {
          "timestamp": "2024-01-15T10:30:00Z",
          "description": "Follow-up call completed",
          "type": "call"
        }
      ],
      "createdAt": "2023-06-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Create a New Client

```typescript
// WHAT THIS DOES: Adds a new client to the system
// WHY USE THIS: When salesperson finds a new potential customer

interface CreateClientData {
  name: string;                      // Required: Company name
  email: string;                     // Required: Contact email
  category: 'loyal' | 'inconsistent' | 'occasional';  // Required: Client type
  primaryContactName: string;        // Required: Main contact person
  primaryContactPhone?: string;      // Optional: Contact phone
  address?: string;                  // Optional: Company address
  expectedValue?: number;            // Optional: Expected deal value
  remarks?: string;                  // Optional: Notes about client
}

async function createClient(clientData: CreateClientData) {
  try {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clientData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create client');
    }
    
    const result = await response.json();
    console.log('Client created successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Failed to create client:', error);
    throw error;
  }
}

// EXAMPLE USAGE:
const newClient = {
  name: 'TechStart Inc',
  email: 'hello@techstart.com',
  category: 'occasional',
  primaryContactName: 'Sarah Johnson',
  primaryContactPhone: '+1555123456',
  address: '456 Innovation Blvd, Tech City, CA 90210',
  expectedValue: 75000,
  remarks: 'Interested in our premium package'
};

const createdClient = await createClient(newClient);
console.log(`Created client: ${createdClient.name} with ID: ${createdClient.id}`);
```

---

## 🤝 Deals API (Managing Sales Opportunities)

**Base URL:** `/api/deals`

### Get All Deals

```typescript
// WHAT THIS DOES: Gets a list of deals/sales opportunities
// WHY USE THIS: To show sales pipeline, track deal progress

interface DealFilters {
  page?: number;
  limit?: number;
  status?: 'open' | 'closed' | 'pending' | 'cancelled';
  salesperson?: string;              // Filter by who's handling the deal
  minValue?: number;                 // Filter by minimum deal value
  maxValue?: number;                 // Filter by maximum deal value
}

async function getAllDeals(filters: DealFilters = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  try {
    const response = await fetch(`/api/deals?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to get deals:', error);
    throw error;
  }
}

// EXAMPLE USAGE:
// Get all open deals
const openDeals = await getAllDeals({ status: 'open' });

// Get deals worth more than $10,000
const bigDeals = await getAllDeals({ minValue: 10000 });

// Get deals for specific salesperson
const johnDeals = await getAllDeals({ salesperson: 'john@company.com' });
```

### Create a New Deal

```typescript
// WHAT THIS DOES: Creates a new sales opportunity
// WHY USE THIS: When salesperson identifies a potential sale

interface CreateDealData {
  clientId: string;                  // Required: Which client this deal is for
  title: string;                     // Required: Deal name/description
  value: number;                     // Required: Deal value in dollars
  expectedCloseDate: string;         // Required: When we expect to close (YYYY-MM-DD)
  status: 'open' | 'pending';        // Required: Current deal status
  description?: string;              // Optional: Detailed description
  probability?: number;              // Optional: Chance of closing (0-100)
}

async function createDeal(dealData: CreateDealData) {
  try {
    const response = await fetch('/api/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dealData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create deal');
    }
    
    const result = await response.json();
    console.log('Deal created successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Failed to create deal:', error);
    throw error;
  }
}

// EXAMPLE USAGE:
const newDeal = {
  clientId: 'client_123',
  title: 'Q1 Software License Renewal',
  value: 25000,
  expectedCloseDate: '2024-03-31',
  status: 'open',
  description: 'Annual software license renewal with 20% discount',
  probability: 85
};

const createdDeal = await createDeal(newDeal);
console.log(`Created deal: ${createdDeal.title} worth $${createdDeal.value}`);
```

---

## 🔧 Practical Usage Examples

### Complete User Management Component

```typescript
// EXAMPLE: How to build a user management page using our API

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load users when component mounts
  useEffect(() => {
    loadUsers();
  }, [searchTerm]);
  
  // Function to load users from API
  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers({ 
        search: searchTerm,
        limit: 20 
      });
      setUsers(result.data);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      // Remove user from local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      alert('Failed to delete user');
    }
  };
  
  // Function to handle status change
  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await changeUserStatus(userId, newStatus as any);
      // Update user in local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      ));
    } catch (err) {
      alert('Failed to change user status');
    }
  };
  
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>User Management</h1>
      
      {/* Search input */}
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {/* Users table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <select
                  value={user.status}
                  onChange={(e) => handleStatusChange(user.id, e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleDeleteUser(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Error Handling Helper

```typescript
// HELPER: Reusable function for handling API errors

async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  errorMessage: string = 'An error occurred'
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(errorMessage, error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        // Unauthorized - redirect to login
        window.location.href = '/login';
        return null;
      } else if (error.message.includes('403')) {
        // Forbidden - show permission error
        alert('You do not have permission to perform this action');
        return null;
      } else if (error.message.includes('404')) {
        // Not found
        alert('The requested resource was not found');
        return null;
      } else if (error.message.includes('500')) {
        // Server error
        alert('Server error. Please try again later.');
        return null;
      }
    }
    
    // Generic error
    alert(errorMessage);
    return null;
  }
}

// USAGE EXAMPLE:
const users = await handleApiCall(
  () => getAllUsers({ page: 1 }),
  'Failed to load users'
);

if (users) {
  // Success - do something with users
  console.log('Loaded users:', users);
}
```

---

## 📝 API Response Patterns

### Success Response Format

```typescript
// All successful API responses follow this pattern:
{
  "success": true,                   // Always true for successful responses
  "data": { /* actual data */ },     // The data you requested
  "message": "Operation completed",  // Human-readable success message
  "timestamp": "2024-01-01T00:00:00Z"  // When the response was sent
}
```

### Error Response Format

```typitten
// All error responses follow this pattern:
{
  "success": false,                  // Always false for errors
  "error": {
    "code": "VALIDATION_ERROR",      // Error type code
    "message": "Email is required",  // Human-readable error message
    "details": {                     // Additional error details
      "field": "email",              // Which field caused the error
      "value": ""                    // The invalid value
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Common Error Codes

```typescript
// These are the error codes you might encounter:
const ERROR_CODES = {
  VALIDATION_ERROR: 'Required fields missing or invalid',
  UNAUTHORIZED: 'Not logged in or invalid token',
  FORBIDDEN: 'Not allowed to perform this action',
  NOT_FOUND: 'Resource does not exist',
  CONFLICT: 'Resource already exists (e.g., duplicate email)',
  RATE_LIMITED: 'Too many requests, try again later',
  SERVER_ERROR: 'Something went wrong on our end'
};
```

---

## 🎯 Best Practices & Tips

### 1. Always Handle Errors

```typescript
// ✅ GOOD: Proper error handling
async function safeApiCall() {
  try {
    const result = await getAllUsers();
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    // Show user-friendly error message
    alert('Failed to load data. Please try again.');
    return null;
  }
}

// ❌ BAD: No error handling
async function unsafeApiCall() {
  const result = await getAllUsers();  // Will crash if API fails
  return result;
}
```

### 2. Use Loading States

```typescript
// ✅ GOOD: Show loading states
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadUsers = async () => {
    setLoading(true);              // Show loading spinner
    try {
      const result = await getAllUsers();
      setUsers(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);           // Hide loading spinner
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return <div>{/* Render users */}</div>;
}
```

### 3. Cache Data When Possible

```typescript
// ✅ GOOD: Cache data to avoid unnecessary API calls
const userCache = new Map();

async function getCachedUser(userId: string) {
  // Check cache first
  if (userCache.has(userId)) {
    console.log('Using cached user data');
    return userCache.get(userId);
  }
  
  // If not in cache, fetch from API
  const user = await getUserById(userId);
  
  // Store in cache for next time
  userCache.set(userId, user);
  
  return user;
}
```

### 4. Use TypeScript for Type Safety

```typescript
// ✅ GOOD: Define types for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// This gives you autocomplete and catches errors at compile time
async function getTypedUser(id: string): Promise<User | null> {
  try {
    const response: ApiResponse<User> = await getUserById(id);
    return response.data;
  } catch (error) {
    return null;
  }
}
```

---

## 🔍 Testing Your API Calls

### Using Browser DevTools

```typescript
// You can test API calls directly in your browser console:

// 1. Open browser DevTools (F12)
// 2. Go to Console tab
// 3. Paste this code and run it:

// Test getting users
fetch('/api/users', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('Users:', data))
.catch(error => console.error('Error:', error));

// Test creating a user
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  })
})
.then(response => response.json())
.then(data => console.log('Created user:', data))
.catch(error => console.error('Error:', error));
```

---

## 📚 Quick Reference

### Most Common API Calls

```typescript
// These are the API calls you'll use most often:

// 1. Get list of users
const users = await getAllUsers();

// 2. Get one user
const user = await getUserById('user_123');

// 3. Create new user
const newUser = await createUser({ name: 'John', email: 'john@example.com', role: 'user' });

// 4. Update user
const updatedUser = await updateUser('user_123', { name: 'John Doe' });

// 5. Delete user
await deleteUser('user_123');

// 6. Get list of clients
const clients = await getAllClients();

// 7. Create new client
const newClient = await createClient({ 
  name: 'Acme Corp', 
  email: 'contact@acme.com', 
  category: 'loyal',
  primaryContactName: 'John Smith'
});
```

---

**Remember: APIs are just tools to get and send data. Start with the basics (getting a list of users) and build up to more complex operations. When in doubt, check the browser console for errors! 🐛** 