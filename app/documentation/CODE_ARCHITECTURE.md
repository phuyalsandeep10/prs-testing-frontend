# PRS Code Architecture Guide - Made Simple! 🏗️

> **What is this?** This document explains the "blueprint" of how our PRS system is built, like an architect's plan for a house. It shows you the patterns we use and why we use them.

---

## 🎯 Why We Have Architecture Rules

**Simple Answer:** Without rules, our code becomes a mess! 

**Think of it like building a house:**
- Without a blueprint → rooms are random sizes, doors don't align, wiring is messy
- With a blueprint → everything fits together perfectly, easy to maintain

**Our architecture ensures:**
- All developers write code the same way
- New features fit seamlessly with existing ones
- Code is easy to understand and maintain
- Performance stays fast as we grow

---

## 🏗️ Our Building Principles

### 1. **Component-Based Architecture** (Think LEGO Blocks)

**What this means:** Every piece of our UI is a separate, reusable component.

**Why we do this:**
- Build once, use everywhere
- Easy to test individual pieces
- Easy to fix bugs (they're contained)
- Team members can work on different pieces simultaneously

```typescript
// ✅ GOOD: Each component has one job
function UserCard({ user }) {           // Only displays user info
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

function UserList({ users }) {          // Only manages list of users
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// ❌ BAD: One component doing everything
function MegaUserComponent() {
  // 500 lines handling:
  // - User display
  // - User editing
  // - User deletion
  // - API calls
  // - Form validation
  // This is too much!
}
```

### 2. **Performance-First Design** (Speed is King!)

**What this means:** We always think about speed when writing code.

**Why this matters:**
- Slow apps = frustrated users = lost business
- Performance problems are hard to fix later
- Good performance requires thinking ahead

```typescript
// ✅ GOOD: Fast performance patterns
const UserTable = React.memo(function UserTable({ users }) {
  // React.memo prevents re-rendering when users haven't changed
  
  const sortedUsers = useMemo(() => {
    // useMemo only sorts when users array actually changes
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);
  
  const handleUserClick = useCallback((userId) => {
    // useCallback prevents creating new function on every render
    onUserClick(userId);
  }, [onUserClick]);
  
  return (
    <div>
      {sortedUsers.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onClick={handleUserClick}
        />
      ))}
    </div>
  );
});

// ❌ BAD: Slow patterns
function SlowUserTable({ users }) {
  // This sorting happens on EVERY render (very slow!)
  const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div>
      {sortedUsers.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          // New function created every render (causes re-renders!)
          onClick={() => onUserClick(user.id)}
        />
      ))}
    </div>
  );
}
```

### 3. **Type-Safe Development** (Catch Errors Early)

**What this means:** We define the shape of our data so TypeScript can catch errors before they happen.

**Why this matters:**
- Errors caught at development time, not by users
- Better developer experience (autocomplete, hints)
- Code is self-documenting

```typescript
// ✅ GOOD: Clear type definitions
interface User {
  id: string;                        // Must be a string
  name: string;                      // Must be a string
  email: string;                     // Must be a string
  role: 'admin' | 'user' | 'viewer'; // Must be one of these exact values
  isActive: boolean;                 // Must be true or false
  createdAt: Date;                   // Must be a Date object
}

interface UserCardProps {
  user: User;                        // Must be a User object
  onClick: (userId: string) => void; // Must be a function that takes string
  className?: string;                // Optional string
}

function UserCard({ user, onClick, className }: UserCardProps) {
  // TypeScript will warn if we try to access user.invalidProperty
  return (
    <div className={className} onClick={() => onClick(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

// ❌ BAD: No type safety
function BadUserCard(props) {        // No idea what props contains
  return (
    <div onClick={() => props.onClick(props.user.userId)}>  // Typo! Should be 'id'
      <h3>{props.user.firstName}</h3>                       // Typo! Should be 'name'
    </div>
  );
}
```

---

## 📁 How We Organize Files (Our Filing System)

**Think of it like organizing a library** - everything has its proper place!

### Route Organization (The Main Sections)

```
app/src/app/(dashboard)/
├── super-admin/           🔧 System-wide tools and settings
├── org-admin/            🏢 Company management
├── salesperson/          💼 Sales operations  
├── supervisor/           👥 Team management
├── verifier/             ✅ Transaction checking
├── team-member/          📋 Basic user operations
└── settings/             ⚙️ User preferences
```

**Why this organization?**
- **Clear boundaries**: Each role has its own space
- **No conflicts**: Super admin can't accidentally break salesperson code
- **Easy navigation**: Need salesperson features? Look in `salesperson/`
- **Team parallel work**: Different developers can work on different roles

### Component Organization (The Toolbox)

```
components/
├── ui/                   🎨 Basic building blocks (buttons, inputs, cards)
│   ├── button.tsx        ├─ Standard button component
│   ├── input.tsx         ├─ Standard input field
│   └── card.tsx          └─ Standard card container
├── shared/               🔧 Business logic components used everywhere
│   ├── UserCard.tsx      ├─ Display user information
│   ├── DataTable.tsx     ├─ Display data in table format
│   └── Modal.tsx         └─ Popup windows
├── dashboard/            📊 Dashboard-specific components
│   ├── [role]/          ├─ Components for specific roles
│   └── shared/          └─ Components shared across dashboard
├── forms/                📝 Form-related components
└── global-components/    🌐 App-wide components (header, footer, etc.)
```

**The Rule: Most Generic → Most Specific**
1. **ui/**: Can be used in any project (very generic)
2. **shared/**: Used across our PRS app (somewhat generic)
3. **dashboard/**: Only used in dashboard (more specific)
4. **[role]/**: Only used by specific user role (very specific)

---

## 🎨 Our Design System Architecture

**Think of this as our "brand guidelines"** - ensures everything looks consistent and professional.

### Color System (Our Palette)

```typescript
// Our official color system - NEVER deviate from these!
const DESIGN_SYSTEM = {
  // PRIMARY COLORS (Use 90% of the time)
  primary: {
    main: '#4F46E5',           // Our signature blue - use for most things
    hover: '#4338CA',          // Darker blue for hover states
    light: '#A5B4FC',          // Light blue for backgrounds
    lighter: '#E0E7FF'         // Very light blue for subtle backgrounds
  },
  
  // SEMANTIC COLORS (Use only for their specific meaning)
  semantic: {
    success: '#22C55E',        // ONLY for success messages/icons
    error: '#EF4444',          // ONLY for errors and delete actions
    warning: '#F59E0B',        // ONLY for warnings
    info: '#3B82F6'            // ONLY for informational messages
  },
  
  // NEUTRAL COLORS (For text and backgrounds)
  neutral: {
    black: '#0F172A',          // Main text color
    darkGray: '#475569',       // Secondary text  
    mediumGray: '#94A3B8',     // Disabled text
    lightGray: '#E2E8F0',      // Borders
    offWhite: '#F8FAFC',       // Light backgrounds
    white: '#FFFFFF'           // Card backgrounds
  }
};

// ✅ GOOD: Using our color system
<Button className="bg-[#4F46E5] hover:bg-[#4338CA]">  // Our primary colors
  Save Changes
</Button>

<div className="text-[#22C55E]">Success!</div>          // Green only for success

// ❌ BAD: Random colors
<Button className="bg-purple-500">Save</Button>         // Not in our system!
<div className="text-orange-400">Success!</div>         // Wrong color for success!
```

### Typography Scale (Text Hierarchy)

```typescript
// Our text size system - creates visual hierarchy
const TEXT_SIZES = {
  // HEADINGS (For page structure)
  h1: 'text-3xl font-bold',      // 30px - Page titles like "Manage Users"
  h2: 'text-2xl font-semibold',  // 24px - Major section headers  
  h3: 'text-xl font-semibold',   // 20px - Minor section headers
  h4: 'text-lg font-medium',     // 18px - Subsection headers
  
  // BODY TEXT (For content)
  body: 'text-base',             // 16px - Regular paragraph text
  bodySmall: 'text-sm',          // 14px - Secondary information
  
  // UI TEXT (For interface elements)
  label: 'text-sm font-medium',  // 14px - Form labels
  caption: 'text-xs',            // 12px - Helper text, captions
  button: 'text-sm font-medium'  // 14px - Button text
};

// ✅ GOOD: Consistent text hierarchy
<div>
  <h1 className="text-3xl font-bold">Manage Users</h1>           // Clear page title
  <p className="text-base">View and manage all system users</p>  // Regular description
  <span className="text-xs text-gray-500">Last updated: Today</span> // Small caption
</div>

// ❌ BAD: Random text sizes
<div>
  <h1 className="text-4xl">Manage Users</h1>                     // Too big!  
  <p className="text-lg font-bold">Description</p>               // Wrong size/weight
  <span className="text-base">Caption</span>                     // Too big for caption
</div>
```

### Spacing System (Consistent Gaps)

```typescript
// Our spacing scale - creates rhythm and balance
const SPACING = {
  // COMPONENT SPACING (Inside components)
  componentPadding: 'p-6',       // 24px - Standard padding inside cards/containers
  formSpacing: 'space-y-6',      // 24px - Space between form fields
  buttonPadding: 'px-6 py-2',    // 24px horizontal, 8px vertical
  
  // LAYOUT SPACING (Between components)
  sectionSpacing: 'mb-8',        // 32px - Space between major sections
  cardSpacing: 'gap-6',          // 24px - Space between cards in grid
  listSpacing: 'space-y-4',      // 16px - Space between list items
  
  // SIZES (Standard measurements)
  buttonHeight: 'h-[44px]',      // Standard button height
  inputHeight: 'h-[48px]',       // Standard input height
  iconSize: 'h-6 w-6',           // Standard icon size (24px)
};

// ✅ GOOD: Consistent spacing
<div className="p-6 space-y-6">                    // Standard container padding and spacing
  <h1 className="text-3xl font-bold mb-2">Title</h1>
  <p className="text-base mb-8">Description</p>     // Consistent section spacing
  
  <div className="grid gap-6">                      // Consistent grid spacing
    <Card className="p-6">Content</Card>           // Standard card padding
  </div>
</div>

// ❌ BAD: Random spacing
<div className="p-3 space-y-2">                    // Non-standard spacing
  <h1 className="text-3xl font-bold mb-1">Title</h1>
  <p className="text-base mb-5">Description</p>     // Inconsistent spacing
  
  <div className="grid gap-3">                      // Different grid spacing
    <Card className="p-4">Content</Card>           // Different card padding
  </div>
</div>
```

---

## 🧩 Our Component Patterns (The Blueprints)

### 1. **Modal Architecture** (Popup Windows Done Right)

**Why we have this pattern:** 
- Ensures popups always appear above everything else
- Consistent behavior across all modals
- Smooth animations and proper accessibility

```typescript
// THE STANDARD MODAL PATTERN - Copy this exactly!

import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;                    // Is modal currently visible?
  onClose: () => void;               // Function to close modal
  title: string;                     // Modal title
  children: React.ReactNode;         // Modal content
}

function StandardModal({ isOpen, onClose, title, children }: ModalProps) {
  // Don't render anything if modal is closed
  if (!isOpen) return null;

  const modal = (
    // BACKDROP: Dark overlay that covers entire screen
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex z-[99999]"
      onClick={onClose}  // Click backdrop to close
    >
      {/* MODAL CONTAINER: The actual popup */}
      <div 
        className="ml-auto w-full max-w-md bg-white shadow-xl flex flex-col h-full"
        onClick={(e) => e.stopPropagation()}  // Don't close when clicking inside
      >
        {/* HEADER: Fixed at top */}
        <div className="px-6 py-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#4F46E5]">{title}</h2>
            <button onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* CONTENT: Scrollable middle section */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* FOOTER: Fixed at bottom (optional) */}
        <div className="px-6 py-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex justify-end gap-3">
            <Button onClick={onClose} variant="outline">Cancel</Button>
            <Button className="bg-[#4F46E5]">Save</Button>
          </div>
        </div>
      </div>
    </div>
  );

  // PORTAL: Render at document root (above everything else)
  return createPortal(modal, document.body);
}

// WHY EACH PART MATTERS:
// - createPortal: Ensures modal appears above everything
// - z-[99999]: Highest priority in stacking order
// - flex-shrink-0: Header/footer stay fixed size
// - flex-1: Content area takes remaining space
// - overflow-y-auto: Content scrolls if too long
// - stopPropagation: Prevents closing when clicking inside modal
```

### 2. **Table Architecture** (Data Display Done Right)

**Why we have this pattern:**
- Handles large amounts of data efficiently
- Consistent look and behavior
- Performance optimizations built-in

```typescript
// THE STANDARD TABLE PATTERN - Copy this for all data display!

interface TableItem {
  id: string;                        // Must have unique ID
  [key: string]: any;                // Can have any other properties
}

interface TableProps<T extends TableItem> {
  data: T[];                         // Array of data to display
  columns: ColumnDef<T>[];           // How to display each column
  loading?: boolean;                 // Show loading state
  error?: string;                    // Show error state
  onRowClick?: (item: T) => void;    // Optional click handler
}

// React.memo prevents unnecessary re-renders
const StandardTable = React.memo(function StandardTable<T extends TableItem>({
  data,
  columns,
  loading = false,
  error,
  onRowClick
}: TableProps<T>) {
  
  // Memoize columns to prevent re-processing
  const memoizedColumns = useMemo(() => columns, [columns]);
  
  // Memoized click handler
  const handleRowClick = useCallback((item: T) => {
    onRowClick?.(item);
  }, [onRowClick]);

  // LOADING STATE
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg">
        <div className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg">
        <div className="p-6 text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg">
        <div className="p-6 text-center text-gray-500">
          <p>No data found</p>
        </div>
      </div>
    );
  }

  // MAIN TABLE
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg overflow-hidden">
      {/* TABLE HEADER */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
        <h2 className="text-lg font-semibold text-gray-800">
          Data ({data.length} items)
        </h2>
      </div>
      
      {/* TABLE CONTENT */}
      <div className="divide-y divide-gray-100">
        {data.map((item) => (
          <div 
            key={item.id}  // Always use unique ID as key
            onClick={() => handleRowClick(item)}
            className={`p-4 hover:bg-gray-50 transition-colors ${
              onRowClick ? 'cursor-pointer' : ''
            }`}
          >
            {/* Render columns based on configuration */}
            <div className="grid grid-cols-3 gap-4">
              {memoizedColumns.map((column, idx) => (
                <div key={idx}>
                  <span className="text-sm font-medium text-gray-600">
                    {column.header}:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {column.cell(item)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// USAGE EXAMPLE:
const userColumns = [
  {
    header: 'Name',
    cell: (user) => user.name
  },
  {
    header: 'Email', 
    cell: (user) => user.email
  },
  {
    header: 'Status',
    cell: (user) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {user.isActive ? 'Active' : 'Inactive'}
      </span>
    )
  }
];

// WHY EACH PART MATTERS:
// - React.memo: Prevents re-renders when props haven't changed
// - useMemo: Prevents re-processing columns on every render
// - useCallback: Prevents creating new functions on every render
// - Unique keys: Helps React track items efficiently
// - Loading/error/empty states: Better user experience
// - Memoized columns: Better performance for complex cell rendering
```

### 3. **Form Architecture** (User Input Done Right)

**Why we have this pattern:**
- Consistent validation across all forms
- Better user experience with proper error handling
- Accessibility built-in

```typescript
// THE STANDARD FORM PATTERN - Copy this for all forms!

interface FormField {
  name: string;                      // Field identifier
  label: string;                     // Display label
  type: 'text' | 'email' | 'password' | 'select';
  required?: boolean;                // Is field required?
  options?: { value: string; label: string }[]; // For select fields
  validation?: (value: string) => string | null; // Custom validation
}

interface FormProps {
  fields: FormField[];               // Fields to render
  initialData?: Record<string, any>; // Initial form values
  onSubmit: (data: Record<string, any>) => Promise<void>;
  loading?: boolean;                 // Show loading state
}

function StandardForm({ fields, initialData = {}, onSubmit, loading = false }: FormProps) {
  // Form state
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle input changes
  const handleChange = useCallback((fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  }, [errors]);

  // Handle field blur (when user leaves field)
  const handleBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate field on blur
    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, formData[fieldName]);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    }
  }, [fields, formData]);

  // Validate individual field
  const validateField = (field: FormField, value: string): string | null => {
    // Required field validation
    if (field.required && (!value || value.trim() === '')) {
      return `${field.label} is required`;
    }
    
    // Email validation
    if (field.type === 'email' && value && !isValidEmail(value)) {
      return 'Please enter a valid email address';
    }
    
    // Custom validation
    if (field.validation && value) {
      return field.validation(value);
    }
    
    return null;
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map(field => (
        <div key={field.name}>
          {/* FIELD LABEL */}
          <label className="text-sm font-medium text-[#4F46E5] mb-2 block">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {/* FIELD INPUT */}
          {field.type === 'select' ? (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              disabled={loading}
              className={`h-[48px] w-full border-2 rounded-lg px-3 ${
                errors[field.name] && touched[field.name]
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#4F46E5] focus:border-[#4F46E5]'
              }`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              disabled={loading}
              className={`h-[48px] w-full border-2 rounded-lg px-3 ${
                errors[field.name] && touched[field.name]
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#4F46E5] focus:border-[#4F46E5]'
              }`}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}
          
          {/* ERROR MESSAGE */}
          {errors[field.name] && touched[field.name] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}
      
      {/* SUBMIT BUTTON */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-2 h-[44px]"
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

// HELPER FUNCTION
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// WHY EACH PART MATTERS:
// - useState for form state: Keeps track of user input
// - useCallback: Prevents unnecessary re-renders
// - Validation on blur: Better user experience than on every keystroke
// - Error states: Clear feedback to user
// - Loading states: Shows form is processing
// - Consistent styling: Matches our design system
```

---

## 📏 Performance Architecture (Making Things Fast)

### Memory Management Patterns

```typescript
// ✅ GOOD: Efficient memory usage
const UserList = React.memo(function UserList({ users, onUserClick }) {
  // Only re-sort when users array changes
  const sortedUsers = useMemo(() => {
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);
  
  // Only create new function when onUserClick changes
  const handleClick = useCallback((userId: string) => {
    onUserClick(userId);
  }, [onUserClick]);
  
  return (
    <div>
      {sortedUsers.map(user => (
        <UserCard 
          key={user.id}           // Stable key
          user={user}
          onClick={handleClick}   // Same function reference
        />
      ))}
    </div>
  );
});

// ❌ BAD: Memory leaks and performance issues
function BadUserList({ users, onUserClick }) {
  // Re-sorts on EVERY render (expensive!)
  const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div>
      {sortedUsers.map((user, index) => (
        <UserCard 
          key={index}                              // Unstable key (causes issues)
          user={user}
          onClick={() => onUserClick(user.id)}     // New function every render
          style={{ padding: '10px' }}              // New object every render
        />
      ))}
    </div>
  );
}
```

### Bundle Size Optimization

```typescript
// ✅ GOOD: Lazy loading for better performance
import { lazy, Suspense } from 'react';

// Only load these components when needed
const UserManagement = lazy(() => import('./UserManagement'));
const ReportsPage = lazy(() => import('./ReportsPage'));

function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  return (
    <div>
      <nav>
        <button onClick={() => setCurrentPage('users')}>Users</button>
        <button onClick={() => setCurrentPage('reports')}>Reports</button>
      </nav>
      
      <Suspense fallback={<div>Loading...</div>}>
        {currentPage === 'users' && <UserManagement />}
        {currentPage === 'reports' && <ReportsPage />}
      </Suspense>
    </div>
  );
}

// ❌ BAD: Loading everything upfront
import UserManagement from './UserManagement';      // Loaded immediately
import ReportsPage from './ReportsPage';            // Loaded immediately  
import AnalyticsPage from './AnalyticsPage';        // Loaded immediately
import SettingsPage from './SettingsPage';          // Loaded immediately
// This makes the initial bundle huge!
```

---

## 🎯 Key Principles Summary

### ✅ **Always Do These Things**

1. **Use React.memo** for components that receive props
2. **Use useMemo** for expensive calculations  
3. **Use useCallback** for event handlers
4. **Define TypeScript interfaces** for all data shapes
5. **Follow our color system** - only use approved colors
6. **Use consistent spacing** - stick to our spacing scale
7. **Portal rendering** for all modals
8. **Proper error handling** in all components

### ❌ **Never Do These Things**

1. **Don't create objects/arrays in render** - causes performance issues
2. **Don't use array index as key** for dynamic lists
3. **Don't use random colors** - stick to our design system
4. **Don't ignore TypeScript errors** - fix them properly
5. **Don't create giant components** - break them down
6. **Don't skip loading states** - always show user feedback
7. **Don't use inline styles** - use Tailwind classes
8. **Don't forget mobile responsiveness** - test on small screens

---

**Remember: Architecture is like a house foundation - it's invisible but critical. Follow these patterns and your code will be solid, maintainable, and fast! 🏠✨**
