# PRS Developer Guide - Made Simple! 🚀

> **What is this?** This document explains how our Payment Receiving System (PRS) works and how to write code that fits with our existing patterns.

## Table of Contents
1. [What is PRS?](#what-is-prs) - Understanding our system
2. [How Files are Organized](#how-files-are-organized) - Where to find things
3. [How We Build Components](#how-we-build-components) - Common patterns we use
4. [Colors and Design Rules](#colors-and-design-rules) - Making things look consistent
5. [How to Write Components](#how-to-write-components) - Step-by-step guide
6. [Making Things Fast](#making-things-fast) - Performance tips
7. [Code Rules We Follow](#code-rules-we-follow) - Standards and conventions
8. [Do's and Don'ts](#dos-and-donts) - Best practices

---

## What is PRS?

**Simple Explanation:** PRS is a web application that helps businesses manage payments, clients, and sales teams.

### Who Uses It?
Our system has 7 different types of users:
- **Super Admin**: The boss who controls everything
- **Org Admin**: Manages a company's users and settings  
- **Salesperson**: Handles clients and deals
- **Supervisor**: Oversees sales teams
- **Verifier**: Checks if payments are correct
- **Team Member**: Basic user with limited access
- **Guest**: Can only view certain things

### What Technology We Use
- **Next.js 15**: The main framework (like the foundation of a house)
- **TypeScript**: JavaScript with extra safety features
- **Tailwind CSS**: For styling (making things look pretty)
- **Bun**: Faster than Node.js for running our code

---

## How Files are Organized

**Think of it like organizing your closet** - everything has its place!

```
app/
├── src/                              # Main source code folder
│   ├── app/                          # Website pages (Next.js style)
│   │   ├── (auth)/                   # Login pages
│   │   │   └── login/                # The actual login page
│   │   ├── (dashboard)/              # Main app pages after login
│   │   │   ├── layout.tsx            # Shared layout for all dashboard pages
│   │   │   ├── org-admin/            # Pages only organization admins see
│   │   │   ├── salesperson/          # Pages only salespeople see
│   │   │   ├── supervisor/           # Pages only supervisors see
│   │   │   ├── verifier/             # Pages only verifiers see
│   │   │   ├── team-member/          # Pages only team members see
│   │   │   ├── super-admin/          # Pages only super admins see
│   │   │   └── settings/             # Settings pages everyone can see
│   │   └── api/                      # Backend code (handles data)
│   ├── components/                   # Reusable pieces of UI
│   │   ├── ui/                       # Basic components (buttons, inputs)
│   │   ├── dashboard/                # Dashboard-specific components
│   │   ├── forms/                    # Form-related components
│   │   └── shared/                   # Components used everywhere
│   ├── hooks/                        # Custom React functionality
│   ├── lib/                          # Helper functions
│   ├── services/                     # Code that talks to databases/APIs
│   └── types/                        # TypeScript type definitions
```

### **Why This Organization?**

1. **Easy to Find**: If you need a salesperson page, look in `salesperson/`
2. **No Conflicts**: Each user type has their own folder
3. **Reusability**: Common components go in `shared/` so everyone can use them
4. **Scalability**: Easy to add new features without breaking existing ones

### **File Naming Rules**
- **Components**: `PascalCase.tsx` (Example: `UserTable.tsx`)
- **Pages**: `kebab-case/` (Example: `manage-users/`)
- **Utilities**: `camelCase.ts` (Example: `formatDate.ts`)

---

## How We Build Components

**Think of components like LEGO blocks** - we have standard ways to build them so they fit together perfectly.

### 1. **Modal Pattern** (Popup Windows)

**What is this?** When you click "Add User" and a form slides in from the right - that's a modal.

**Why we do it this way?** To make sure popups always appear on top of everything else.

```typescript
// This is how we create ALL popups in our app
// Don't worry about understanding every line - just copy this pattern!

import { createPortal } from 'react-dom';

const modal = (
  {/* This creates a dark background that covers the whole screen */}
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex z-[99999]">
    {/* This is the actual popup that slides in from the right */}
    <div className="ml-auto w-full max-w-md bg-white shadow-xl">
      {/* Your form content goes here */}
      <h2>Add New User</h2>
      <form>
        {/* Form fields */}
      </form>
    </div>
  </div>
);

// This magic line makes the popup appear above everything else
return typeof window !== 'undefined' ? createPortal(modal, document.body) : null;
```

**Simple Translation:**
- `createPortal` = "Put this popup at the very top level of the page"
- `z-[99999]` = "Make sure this appears above everything else"
- `ml-auto` = "Push the popup to the right side"

### 2. **Form Pattern** (How We Handle User Input)

**What is this?** Every form (login, add user, edit client) follows the same pattern.

```typescript
// This is the standard way we handle forms
const [formData, setFormData] = useState({
  name: '',      // User's name starts empty
  email: ''      // User's email starts empty
});

// This function runs whenever user types in any field
const handleInputChange = (fieldName: string, newValue: string) => {
  setFormData(previousData => ({ 
    ...previousData,           // Keep all existing data
    [fieldName]: newValue      // Update only the field that changed
  }));
};

// Example: When user types in the name field
// handleInputChange('name', 'John Doe') gets called
```

**Simple Translation:**
- `useState` = "Remember this data between renders"
- `setFormData` = "Update the form data"
- `...previousData` = "Keep everything else the same"
- `[fieldName]: newValue` = "Change just this one field"

### 3. **Performance Pattern** (Making Things Fast)

**What is this?** Ways to make our app faster by not doing unnecessary work.

```typescript
// DON'T recalculate expensive things on every render
// DO use useMemo to remember the result
const expensiveCalculation = useMemo(() => {
  // This only runs when 'data' actually changes
  return processLargeDataSet(data);
}, [data]); // <- This tells React when to recalculate

// DON'T create new functions on every render  
// DO use useCallback to remember the function
const handleClick = useCallback((id: string) => {
  // This function only gets recreated if 'someValue' changes
  doSomethingWith(id, someValue);
}, [someValue]); // <- This tells React when to recreate the function

// DON'T re-render components unnecessarily
// DO use React.memo to skip renders when props haven't changed
const MyComponent = React.memo(function MyComponent({ data }) {
  return <div>{data.name}</div>;
});
```

**Simple Translation:**
- `useMemo` = "Remember this calculation result unless the input changes"
- `useCallback` = "Remember this function unless its dependencies change"
- `React.memo` = "Only re-render this component if its props actually changed"

---

## Colors and Design Rules

**Why do we have rules?** So everything looks consistent and professional!

### **Our Color Palette** (ALWAYS use these!)

```css
/* PRIMARY COLORS - Use these for most things */
--primary-blue: #4F46E5;        /* Main color for buttons, links, borders */
--primary-blue-hover: #4338CA;  /* When user hovers over blue things */

/* SECONDARY COLORS - Use sparingly */
--success-green: #22C55E;       /* Only for success messages */
--error-red: #EF4444;          /* Only for error messages and delete buttons */
--warning-amber: #F59E0B;      /* Only for warning messages */

/* NEUTRAL COLORS - For backgrounds and text */
--gray-50: #F8FAFC;           /* Light backgrounds */
--gray-600: #475569;          /* Secondary text */
--gray-900: #0F172A;          /* Main text color */
```

**How to use these colors:**
```css
/* Good Examples */
.my-button {
  background-color: #4F46E5;     /* Use our primary blue */
  color: white;
}

.error-message {
  color: #EF4444;                /* Use our error red */
}

/* Bad Examples - DON'T DO THIS */
.my-button {
  background-color: #FF6B6B;     /* Random red - don't use! */
}
```

### **Text Sizes** (Keep it consistent!)

```css
/* Page titles - like "Manage Users" */
.page-title {
  font-size: 30px;              /* text-3xl in Tailwind */
  font-weight: bold;
}

/* Section headings - like "User Information" */
.section-heading {
  font-size: 20px;              /* text-xl in Tailwind */
  font-weight: 600;             /* font-semibold */
}

/* Regular text - like descriptions */
.body-text {
  font-size: 16px;              /* text-base in Tailwind */
}

/* Form labels - like "Email Address:" */
.form-label {
  font-size: 14px;              /* text-sm in Tailwind */
  font-weight: 500;             /* font-medium */
}

/* Small text - like captions */
.caption-text {
  font-size: 12px;              /* text-xs in Tailwind */
}
```

### **Spacing Rules** (Consistent gaps and padding)

```css
/* Page containers - space around entire page content */
.page-container {
  padding: 24px;                /* p-6 in Tailwind */
}

/* Card containers - space inside cards */
.card-padding {
  padding: 16px;                /* p-4 in Tailwind */
}

/* Form spacing - space between form fields */
.form-spacing {
  margin-bottom: 24px;          /* space-y-6 in Tailwind */
}

/* Button sizes - consistent button heights */
.button-height {
  height: 44px;                 /* h-[44px] in Tailwind */
  padding: 0 24px;              /* px-6 in Tailwind */
}
```

### **Common Component Styles**

#### **Buttons** (How buttons should look)
```css
/* Primary button - for main actions like "Save" */
.btn-primary {
  background-color: #4F46E5;    /* Our primary blue */
  color: white;
  padding: 8px 24px;            /* Top/bottom: 8px, Left/right: 24px */
  height: 44px;
  border-radius: 8px;           /* Rounded corners */
  font-weight: 500;             /* Medium font weight */
}

.btn-primary:hover {
  background-color: #4338CA;    /* Darker blue on hover */
}

/* Danger button - for destructive actions like "Delete" */
.btn-danger {
  background-color: #EF4444;    /* Our error red */
  color: white;
  /* Same spacing as primary */
}
```

#### **Form Inputs** (How input fields should look)
```css
/* All input fields (text, email, password, etc.) */
.form-input {
  height: 48px;                 /* Slightly taller than buttons */
  border: 2px solid #4F46E5;    /* Blue border */
  border-radius: 8px;           /* Rounded corners */
  padding: 0 16px;              /* Horizontal padding */
  font-size: 16px;              /* Readable text size */
}

.form-input:focus {
  border-color: #4F46E5;        /* Keep blue border when focused */
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); /* Subtle glow */
}
```

#### **Cards** (Containers for content)
```css
/* Standard card container */
.card-container {
  background-color: white;
  border-radius: 16px;          /* More rounded than buttons */
  border: 2px solid #F1F5F9;    /* Light gray border */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  overflow: hidden;             /* Clip content to card bounds */
}

/* Card header */
.card-header {
  padding: 16px 24px;           /* More horizontal padding */
  border-bottom: 1px solid #F1F5F9;
  background: linear-gradient(to right, #F8FAFC, #F1F5F9); /* Subtle gradient */
}
```

---

## How to Write Components

**This is your step-by-step guide** to creating new components that fit our system.

### **Standard Component Template**

**Copy this template** for every new component you create:

```typescript
'use client'; // <- This tells Next.js this runs in the browser

// 1. Import React functionality we need
import { useState, useEffect, useCallback } from 'react';

// 2. Import UI components we'll use
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 3. Define what data this component expects
interface MyComponentProps {
  title: string;                    // Required: component must have a title
  data: Array<any>;                // Required: component needs some data
  onSave?: (data: any) => void;    // Optional: function to call when saving
  isLoading?: boolean;             // Optional: whether component is loading
}

// 4. Create the component function
export default function MyComponent({ 
  title, 
  data, 
  onSave, 
  isLoading = false    // Default to not loading
}: MyComponentProps) {
  
  // 5. Set up state (data that can change)
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // 6. Create event handlers (functions that respond to user actions)
  const handleItemClick = useCallback((item: any) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []); // Empty dependency array means this function never changes
  
  const handleSave = useCallback(() => {
    if (onSave) {              // Only call if onSave function was provided
      onSave(selectedItem);
    }
    setIsOpen(false);          // Close the modal
  }, [onSave, selectedItem]);  // Recreate function if these values change
  
  // 7. Render the component
  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">Component description goes here</p>
      </div>
      
      {/* Main content */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg">
        {/* Show loading spinner if loading */}
        {isLoading && (
          <div className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}
        
        {/* Show data if not loading */}
        {!isLoading && (
          <div className="p-6">
            {data.map((item, index) => (
              <div 
                key={item.id || index}     // Unique key for each item
                onClick={() => handleItemClick(item)}
                className="p-4 border border-gray-200 rounded-lg mb-4 cursor-pointer hover:bg-gray-50"
              >
                {/* Display item data here */}
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal (popup) for selected item */}
      {isOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit {selectedItem.name}</h2>
            
            {/* Form fields would go here */}
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                onClick={() => setIsOpen(false)}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**What Each Part Does:**

1. **`'use client'`**: Tells Next.js this component runs in the browser (not on the server)

2. **Imports**: Bring in the functionality and components we need

3. **Interface**: Defines what data this component expects to receive

4. **Component Function**: The main function that creates our component

5. **State**: Data that can change (like whether a modal is open)

6. **Event Handlers**: Functions that run when user does something (clicks, types, etc.)

7. **Render**: The JSX that creates the actual HTML

---

## Making Things Fast

**Why care about performance?** Slow apps = unhappy users = lost business!

### **React Performance Tips**

#### **1. useMemo - Remember Expensive Calculations**

```typescript
// BAD: This calculation runs on EVERY render (slow!)
function ExpensiveComponent({ data }) {
  const processedData = data
    .filter(item => item.active)
    .map(item => ({ ...item, calculated: item.value * 1.2 }))
    .sort((a, b) => a.name.localeCompare(b.name));
    
  return <div>{/* render processedData */}</div>;
}

// GOOD: This calculation only runs when 'data' changes (fast!)
function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return data
      .filter(item => item.active)
      .map(item => ({ ...item, calculated: item.value * 1.2 }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]); // <- Only recalculate when 'data' changes
    
  return <div>{/* render processedData */}</div>;
}
```

#### **2. useCallback - Remember Functions**

```typescript
// BAD: New function created on every render (causes child re-renders!)
function ParentComponent({ items }) {
  const handleItemClick = (id: string) => {
    console.log('Clicked item:', id);
  };
  
  return (
    <div>
      {items.map(item => (
        <ChildComponent 
          key={item.id} 
          item={item} 
          onClick={handleItemClick} // <- New function every time!
        />
      ))}
    </div>
  );
}

// GOOD: Same function reference unless dependencies change
function ParentComponent({ items }) {
  const handleItemClick = useCallback((id: string) => {
    console.log('Clicked item:', id);
  }, []); // <- Function never changes (no dependencies)
  
  return (
    <div>
      {items.map(item => (
        <ChildComponent 
          key={item.id} 
          item={item} 
          onClick={handleItemClick} // <- Same function every time!
        />
      ))}
    </div>
  );
}
```

#### **3. React.memo - Skip Unnecessary Renders**

```typescript
// BAD: Component re-renders even when props haven't changed
function UserCard({ user }) {
  return (
    <div className="p-4 border rounded">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

// GOOD: Component only re-renders when 'user' prop actually changes
const UserCard = React.memo(function UserCard({ user }) {
  return (
    <div className="p-4 border rounded">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});
```

### **CSS Performance**

```css
/* These CSS classes make animations smooth and fast */

/* Hardware acceleration - uses GPU instead of CPU */
.smooth-transition {
  transform: translateZ(0);           /* Triggers hardware acceleration */
  backface-visibility: hidden;       /* Prevents flicker */
  will-change: transform;             /* Hints to browser about changes */
}

/* Smooth animations with optimized timing */
.modal-enter {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Optimized table rendering */
.table-optimized {
  table-layout: fixed;               /* Faster table rendering */
  width: 100%;
}

/* Smooth scrolling */
.smooth-scroll {
  scroll-behavior: smooth;
}
```

---

## Code Rules We Follow

**Why have rules?** So all our code looks similar and is easy to understand!

### **TypeScript Guidelines**

#### **Always Define Types**

```typescript
// BAD: No type information
function createUser(name, email, role) {
  return { name, email, role };
}

// GOOD: Clear type information
interface CreateUserInput {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';    // Limited to specific values
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
}

function createUser(input: CreateUserInput): User {
  return {
    id: generateId(),
    name: input.name,
    email: input.email,
    role: input.role,
    createdAt: new Date()
  };
}
```

#### **Component Props Types**

```typescript
// Define props interface for every component
interface ButtonProps {
  children: React.ReactNode;          // What goes inside the button
  onClick: () => void;                // Function to call when clicked
  disabled?: boolean;                 // Optional: whether button is disabled
  variant?: 'primary' | 'secondary'; // Optional: button style
}

function Button({ children, onClick, disabled = false, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
    >
      {children}
    </button>
  );
}
```

### **Naming Conventions**

```typescript
// File Names
UserTable.tsx          // Components: PascalCase
useUserData.ts         // Hooks: camelCase starting with 'use'
formatDate.ts          // Utilities: camelCase
userTypes.ts           // Types: camelCase

// Variable Names
const MAX_RETRY_ATTEMPTS = 3;        // Constants: UPPER_SNAKE_CASE
const apiBaseUrl = 'https://...';    // Regular variables: camelCase
const isLoading = false;             // Booleans: start with 'is', 'has', 'can', etc.

// Function Names
const getUserData = async (id: string) => {};      // Functions: camelCase, descriptive
const handleFormSubmit = (data: FormData) => {};   // Event handlers: start with 'handle'

// Component Names
const UserProfile = () => {};        // Components: PascalCase
const DataTable = () => {};
```

### **Import Organization**

**Always organize imports in this order:**

```typescript
// 1. React imports first
import React, { useState, useEffect } from 'react';

// 2. Next.js imports
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// 3. Third-party library imports
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

// 4. Internal service/utility imports
import { UserService } from '@/services/userService';
import { formatCurrency } from '@/lib/utils';

// 5. Type imports (keep separate)
import type { User, UserRole } from '@/types/user';

// 6. Relative imports (same folder)
import './Component.css';
```

---

## Do's and Don'ts

### ✅ **DO These Things**

#### **Performance**
```typescript
// ✅ DO: Memoize expensive computations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

// ✅ DO: Memoize event handlers
const handleClick = useCallback((id: string) => {
  onClick(id);
}, [onClick]);

// ✅ DO: Use React.memo for expensive components
const ExpensiveTable = React.memo(function ExpensiveTable({ data }) {
  return <table>{/* complex table rendering */}</table>;
});
```

#### **Code Organization**
```typescript
// ✅ DO: Keep components small and focused
function UserCard({ user }) {        // Does one thing: displays a user
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

// ✅ DO: Use descriptive variable names
const activeUsers = users.filter(user => user.status === 'active');
const hasAdminPermission = user.role === 'admin';
```

#### **Styling**
```typescript
// ✅ DO: Use our design system colors
<Button className="bg-[#4F46E5] hover:bg-[#4338CA]">
  Save Changes
</Button>

// ✅ DO: Use consistent spacing
<div className="p-6 space-y-6">
  {/* Content with consistent spacing */}
</div>
```

### ❌ **DON'T Do These Things**

#### **Performance**
```typescript
// ❌ DON'T: Create objects/arrays in render
function BadComponent({ users }) {
  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user}
          style={{color: 'red'}}    // ❌ New object every render!
          actions={['edit', 'delete']} // ❌ New array every render!
        />
      ))}
    </div>
  );
}

// ❌ DON'T: Use array index as key for dynamic lists
{items.map((item, index) => (
  <div key={index}>{item.name}</div>  // ❌ Causes React confusion!
))}
```

#### **Code Organization**
```typescript
// ❌ DON'T: Create giant components that do everything
function MegaComponent() {
  // 500 lines of code that handles:
  // - User management
  // - Data fetching  
  // - Form handling
  // - Modal logic
  // - Table rendering
  // This is too much for one component!
}

// ❌ DON'T: Use unclear variable names
const d = new Date();           // ❌ What is 'd'?
const u = getUsers();          // ❌ What is 'u'?
const handleClick = () => {};  // ❌ Click on what?
```

#### **Styling**
```typescript
// ❌ DON'T: Use random colors
<Button className="bg-purple-500">   {/* ❌ Not in our design system! */}
  Save
</Button>

// ❌ DON'T: Use inline styles
<div style={{padding: '20px', margin: '10px'}}>  {/* ❌ Use Tailwind classes! */}
  Content
</div>

// ❌ DON'T: Mix different spacing systems
<div className="p-3 mb-5 space-y-4">  {/* ❌ Inconsistent spacing! */}
  {/* Use p-6, mb-6, space-y-6 instead */}
</div>
```

#### **TypeScript**
```typescript
// ❌ DON'T: Use 'any' type everywhere
function handleData(data: any): any {    // ❌ TypeScript can't help you!
  return data.someProperty.nested.value;
}

// ❌ DON'T: Ignore TypeScript errors
// @ts-ignore                            // ❌ This hides real problems!
const result = riskyFunction();
```

---

## Quick Reference Checklist

**Before submitting your code, check these:**

### ✅ **Code Quality**
- [ ] Component follows our standard template
- [ ] All props have proper TypeScript types
- [ ] Event handlers are memoized with `useCallback`
- [ ] Expensive calculations use `useMemo`
- [ ] Component is wrapped in `React.memo` if it's complex

### ✅ **Styling**
- [ ] Uses our primary blue color (`#4F46E5`)
- [ ] Follows consistent spacing (p-6, space-y-6, etc.)
- [ ] Responsive design works on mobile
- [ ] No inline styles (uses Tailwind classes)

### ✅ **Functionality**
- [ ] Loading states are handled properly
- [ ] Error states are handled gracefully
- [ ] Forms have proper validation
- [ ] Modals use portal rendering

### ✅ **Performance**
- [ ] No objects/arrays created in render
- [ ] Keys are stable for list items
- [ ] No unnecessary re-renders
- [ ] Images are optimized

---

**Remember: When in doubt, look at existing components and copy their patterns!**

*This guide is your friend - refer back to it whenever you're unsure about how to implement something.*
