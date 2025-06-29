# Quick Start Guide for New Developers 🚀

> **What is this?** This is your "cheat sheet" for getting started with PRS development. Bookmark this page - you'll use it often!

---

## 🛠️ First Things First - Get Your Environment Ready

### Step 1: Clone and Setup
```bash
# 1. Download the project to your computer
git clone [repository-url]
cd PRS/app

# 2. Install all the packages we need (using Bun - it's faster!)
bun install

# 3. Start the development server (this runs the website locally)
bun run dev

# 4. Open your browser and go to:
# http://localhost:3000
# You should see the PRS login page!
```

### Step 2: IDE Setup (Make Your Life Easier!)
**Install these VS Code extensions:**
- `TypeScript` - Helps catch errors before you run code
- `Tailwind CSS IntelliSense` - Shows you CSS classes as you type
- `ES7+ React/Redux/React-Native snippets` - Shortcuts for React code

**Enable these settings:**
- Format on save ✅ (Auto-formats your code when you save)
- TypeScript strict mode ✅ (Catches more potential bugs)

---

## 📁 Where to Find Everything

**Think of our project like a well-organized library:**

```
app/src/
├── app/(dashboard)/           📚 The main "books" (pages users see)
│   ├── super-admin/          👑 Super admin pages
│   ├── org-admin/            🏢 Organization admin pages  
│   ├── salesperson/          💼 Salesperson pages
│   └── layout.tsx            🏗️ Shared layout for all pages
├── components/               🧩 Reusable "building blocks"
│   ├── ui/                   🎨 Basic components (buttons, inputs)
│   ├── dashboard/            📊 Dashboard-specific components
│   └── forms/                📝 Form-related components
├── hooks/                    🎣 Custom React functionality
└── lib/                      🔧 Helper functions and utilities
```

**Quick Navigation Tips:**
- Need a salesperson page? → Look in `salesperson/`
- Need a reusable button? → Look in `components/ui/`
- Need to add a new form? → Look in `components/forms/` for examples

---

## 🎨 Design Rules (FOLLOW THESE RELIGIOUSLY!)

### Colors (NEVER Use Any Other Colors!)

```typescript
// ✅ ALWAYS USE THESE COLORS:
const APPROVED_COLORS = {
  // Main color - use for most buttons, links, borders
  primaryBlue: '#4F46E5',      // This is our signature color!
  primaryBlueHover: '#4338CA', // When user hovers over blue things
  
  // Special situation colors - use ONLY when needed
  successGreen: '#22C55E',     // ONLY for success messages ✅
  errorRed: '#EF4444',         // ONLY for error messages and delete buttons ❌
  warningAmber: '#F59E0B',     // ONLY for warning messages ⚠️
};

// ❌ NEVER USE: Random colors like #FF6B6B, #9C27B0, etc.
```

### Text Sizes (Keep Everything Consistent!)

```css
/* Copy these exact classes: */
.page-title     { font-size: 30px; font-weight: bold; }      /* "Manage Users" */
.section-header { font-size: 20px; font-weight: 600; }       /* "User Information" */
.body-text      { font-size: 16px; }                         /* Regular descriptions */
.form-label     { font-size: 14px; font-weight: 500; }       /* "Email Address:" */
.caption-text   { font-size: 12px; }                         /* Small helper text */
```

### Spacing (No Random Numbers!)

```css
/* Standard spacing we use everywhere: */
.page-container  { padding: 24px; }           /* p-6 in Tailwind */
.card-padding    { padding: 16px; }           /* p-4 in Tailwind */
.form-spacing    { margin-bottom: 24px; }     /* space-y-6 in Tailwind */
.button-height   { height: 44px; }            /* h-[44px] in Tailwind */
.input-height    { height: 48px; }            /* h-[48px] in Tailwind */
```

---

## 📝 Copy-Paste Patterns (Your New Best Friends!)

### 1. Standard Page Layout Pattern

**When to use:** Every time you create a new page
**Copy this exact structure:**

```typescript
export default function MyNewPage() {
  return (
    <div className="p-6">
      {/* 
        HEADER SECTION - Every page needs this!
        Explains what the page does
      */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Title Here</h1>
        <p className="text-gray-600">Brief description of what this page does</p>
      </div>

      {/* 
        STATISTICS CARDS - Show important numbers (ALWAYS use blue theme!)
        Grid automatically adjusts: 1 column on mobile, 3 columns on desktop
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-700">123</p>
            </div>
            {/* Icon container - always blue background */}
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        {/* Add more cards by copying the above div */}
      </div>

      {/* 
        MAIN CONTENT AREA - Your actual page content goes here
        Always wrap in this white card container for consistency
      */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg">
        <div className="p-6">
          {/* Your page content here */}
          <p>This is where your main content goes!</p>
        </div>
      </div>
    </div>
  );
}
```

### 2. Modal/Popup Form Pattern

**When to use:** Any time you need a popup form (Add User, Edit Client, etc.)
**Copy this entire structure:**

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from 'lucide-react';

interface MyModalProps {
  isOpen: boolean;                    // Is the modal currently visible?
  onClose: () => void;               // Function to call when closing modal
  onSave: (data: any) => void;       // Function to call when saving data
}

export default function MyModal({ isOpen, onClose, onSave }: MyModalProps) {
  // Controls the slide-in animation
  const [isVisible, setIsVisible] = useState(false);
  
  // Shows spinner when saving
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data - add fields as needed
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: ''
  });

  // Animation: Make modal slide in smoothly
  useEffect(() => {
    if (isOpen) {
      // Small delay makes animation smoother
      const timer = setTimeout(() => setIsVisible(true), 16);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Close modal with animation
  const handleClose = useCallback(() => {
    setIsVisible(false);           // Start slide-out animation
    setTimeout(onClose, 300);      // Actually close after animation
  }, [onClose]);

  // Close modal when clicking outside (on dark background)
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {  // Only if clicking background
      handleClose();
    }
  }, [handleClose]);

  // Update form data when user types
  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(previousData => ({ 
      ...previousData,        // Keep all existing data
      [fieldName]: value      // Update just this field
    }));
  };

  // Save the form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();                // Don't refresh the page
    setIsLoading(true);               // Show loading spinner
    
    try {
      await onSave(formData);         // Call the save function
      handleClose();                  // Close modal on success
    } catch (error) {
      console.error('Error saving:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);            // Hide loading spinner
    }
  };

  // Clear form data
  const handleClear = () => {
    setFormData({ name: '', email: '', description: '' });
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // THE MAGIC: Portal renders modal at document root (above everything else)
  const modal = (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex z-[99999]"
      style={{ 
        position: 'fixed',    // Force positioning
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99999         // Above everything else
      }}
    >
      <div 
        className="ml-auto w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[100000] flex flex-col"
        style={{ 
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',  // Slide animation
          height: '100vh'     // Full height
        }}
        onClick={(e) => e.stopPropagation()}  // Don't close when clicking inside modal
      >
        {/* HEADER - Fixed at top */}
        <div className="px-6 py-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#4F46E5]">Add New Item</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* FORM BODY - Scrollable middle section */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Name Field */}
            <div>
              <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input 
                className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] text-[16px] rounded-lg" 
                placeholder="Enter name" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                Email<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input 
                type="email"
                className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] text-[16px] rounded-lg" 
                placeholder="Enter email" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Add more fields by copying the above pattern */}
          </form>
        </div>

        {/* FOOTER - Fixed at bottom */}
        <div className="px-6 py-6 bg-gradient-to-r from-[#4F46E5] via-[#7C8FE8] to-[#A8B5EB] flex-shrink-0">
          <div className="flex justify-end gap-3">
            <Button 
              type="button"
              onClick={handleClear}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-8 py-2 h-[44px]"
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button 
              type="submit"
              onClick={handleSave}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-2 h-[44px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal at document root (above everything else)
  return typeof window !== 'undefined' ? createPortal(modal, document.body) : null;
}
```

### 3. Optimized Table/List Pattern

**When to use:** Displaying lists of data (users, clients, deals, etc.)
**Copy this pattern for better performance:**

```typescript
import React, { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';

// Define the shape of your data
interface TableItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

interface OptimizedTableProps {
  data: TableItem[];                    // Array of data to display
  onEdit?: (id: string) => void;       // Optional: function to call when editing
  onDelete?: (id: string) => void;     // Optional: function to call when deleting
  loading?: boolean;                   // Optional: show loading state
}

// React.memo prevents re-rendering when props haven't changed
const OptimizedTable = React.memo(function OptimizedTable({ 
  data, 
  onEdit, 
  onDelete, 
  loading = false 
}: OptimizedTableProps) {
  
  // useCallback prevents creating new functions on every render
  // This stops child components from re-rendering unnecessarily
  const handleEdit = useCallback((id: string) => {
    console.log('Editing item:', id);
    onEdit?.(id);  // Only call if onEdit function was provided
  }, [onEdit]);    // Only recreate function if onEdit changes

  const handleDelete = useCallback((id: string) => {
    console.log('Deleting item:', id);
    onDelete?.(id);
  }, [onDelete]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg">
        <div className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg">
        <div className="p-6 text-center">
          <p className="text-gray-500">No data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg">
      {/* TABLE HEADER */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
        <h2 className="text-lg font-semibold text-gray-800">
          Data Table ({data.length} items)
        </h2>
      </div>
      
      {/* TABLE CONTENT */}
      <div className="p-6">
        <div className="space-y-4">
          {data.map((item) => (
            <div 
              key={item.id}  // Always use unique ID as key
              className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              {/* ITEM INFO */}
              <div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  item.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.status}
                </span>
              </div>
              
              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3">
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(item.id)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default OptimizedTable;
```

---

## 🚀 How to Use These Patterns

### Example: Creating a User Management Page

```typescript
'use client';

import { useState } from 'react';
import OptimizedTable from '@/components/shared/OptimizedTable';
import UserModal from '@/components/modals/UserModal';

export default function UsersPage() {
  // State for the data
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', description: 'Sales Manager', status: 'active' },
    { id: '2', name: 'Jane Smith', description: 'Developer', status: 'inactive' }
  ]);
  
  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle adding new user
  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  // Handle saving user from modal
  const handleSaveUser = (userData: any) => {
    console.log('Saving user:', userData);
    // TODO: API call to save user
    setIsModalOpen(false);
  };

  // Handle editing user
  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
    // TODO: Open edit modal
  };

  // Handle deleting user
  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="p-6">
      {/* Use the page layout pattern */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Users</h1>
        <p className="text-gray-600">View and manage all system users</p>
      </div>

      {/* Add New User Button */}
      <div className="mb-6">
        <Button 
          onClick={handleAddUser}
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2 h-[44px]"
        >
          Add New User
        </Button>
      </div>

      {/* Use the table pattern */}
      <OptimizedTable 
        data={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        loading={loading}
      />

      {/* Use the modal pattern */}
      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
}
```

---

## ✅ Checklist Before Submitting Code

**Print this out and check each item before submitting your code:**

### ✅ **Styling & Design**
- [ ] Used ONLY our approved colors (`#4F46E5` blue theme)
- [ ] Followed consistent spacing (p-6, space-y-6, etc.)
- [ ] Responsive design works on mobile
- [ ] No inline styles (used Tailwind classes)
- [ ] Buttons have correct height (h-[44px])
- [ ] Inputs have correct height (h-[48px])

### ✅ **Code Quality**
- [ ] Followed established patterns (copied from existing code)
- [ ] Used proper TypeScript types
- [ ] Event handlers are memoized (`useCallback`)
- [ ] Expensive calculations use `useMemo`
- [ ] Components wrapped in `React.memo` if needed

### ✅ **Functionality**
- [ ] Loading states handled properly
- [ ] Error states handled gracefully
- [ ] Forms have proper validation
- [ ] Modals use portal rendering (`createPortal`)
- [ ] Escape key closes modals

### ✅ **Performance**
- [ ] No objects/arrays created in render functions
- [ ] Stable keys for list items (use IDs, not array indexes)
- [ ] No unnecessary re-renders
- [ ] Images optimized if any

---

## ❌ Common Mistakes to Avoid

### **Color Mistakes**
```typescript
// ❌ DON'T DO THIS:
<Button className="bg-purple-500">Save</Button>     // Wrong color!
<div className="bg-green-400">Success</div>         // Wrong color!

// ✅ DO THIS:
<Button className="bg-[#4F46E5]">Save</Button>      // Our blue!
<div className="bg-[#22C55E]">Success</div>         // Our green (only for success)
```

### **Performance Mistakes**
```typescript
// ❌ DON'T DO THIS:
function BadComponent({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} style={{color: 'red'}}>  {/* New object every render! */}
          {item.name}
        </div>
      ))}
    </div>
  );
}

// ✅ DO THIS:
function GoodComponent({ items }) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.id} className="text-red-500">  {/* Stable key, CSS class */}
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### **Styling Mistakes**
```typescript
// ❌ DON'T DO THIS:
<div style={{padding: '20px', margin: '10px'}}>    // Inline styles!
  Content
</div>

<div className="p-3 mb-5 space-y-2">             // Inconsistent spacing!
  Content  
</div>

// ✅ DO THIS:
<div className="p-6 mb-6 space-y-6">             // Consistent spacing!
  Content
</div>
```

---

## 🎯 Key Things to Remember (Write These Down!)

1. **Always use the blue theme** (`#4F46E5`) for consistency
2. **Portal rendering** for all modals (`createPortal`)
3. **Memoization** for performance (`useMemo`, `useCallback`, `React.memo`)
4. **Proper TypeScript types** for everything
5. **Follow existing patterns** - don't reinvent the wheel!
6. **Copy-paste is OK** - use these templates as starting points
7. **Test on mobile** - make sure it looks good on phones
8. **Ask for help** - when in doubt, look at existing code or ask a teammate

---

## 📚 Useful Resources

- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com) - For styling classes
- **Lucide Icons**: [lucide.dev](https://lucide.dev) - For icons
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com) - For UI components
- **TypeScript**: [typescriptlang.org](https://typescriptlang.org) - For type information
- **React Docs**: [react.dev](https://react.dev) - For React concepts

---

**Remember: This is your cheat sheet! Bookmark it and refer back whenever you're building something new. Copy the patterns, adapt them to your needs, and you'll be productive quickly! 🎉**
