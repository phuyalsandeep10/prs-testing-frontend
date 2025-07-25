# PRS Component Library Documentation

## Overview

The PRS frontend application features a comprehensive component library built on modern React patterns, TypeScript, and Shadcn/ui. This document provides detailed information about the available components, their usage patterns, and customization options.

## Component Architecture

### 1. Component Hierarchy

```
components/
├── core/                 # Framework components (UnifiedTable, UnifiedForm)
├── ui/                  # Design system components (Button, Input, etc.)
├── dashboard/           # Role-specific dashboard components
├── forms/              # Form-related components
├── shared/             # Shared utility components
└── global-components/  # App-wide components
```

### 2. Design System Foundation

The component library is built on:
- **Shadcn/ui** - Base component library
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Consistent iconography
- **Class Variance Authority** - Type-safe styling variants

## Core Components

### UnifiedTable

A powerful, feature-rich data table component with built-in sorting, filtering, pagination, and export capabilities.

#### Usage

```typescript
import { UnifiedTable } from '@/components/core/UnifiedTable'

interface Deal {
  id: string
  client_name: string
  amount: number
  status: 'pending' | 'verified' | 'approved'
  created_at: string
}

const columns: TableColumn<Deal>[] = [
  {
    id: 'client_name',
    header: 'Client',
    accessorKey: 'client_name',
    sortable: true,
    filterable: true,
  },
  {
    id: 'amount',
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ row }) => `$${row.original.amount.toLocaleString()}`,
    sortable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
    filterable: true,
    filterOptions: [
      { label: 'Pending', value: 'pending' },
      { label: 'Verified', value: 'verified' },
      { label: 'Approved', value: 'approved' },
    ],
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => editDeal(row.original.id)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => deleteDeal(row.original.id)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DealsTable() {
  const { data, isLoading } = useDeals()
  
  return (
    <UnifiedTable
      data={data || []}
      columns={columns}
      loading={isLoading}
      searchable
      filterable
      exportable
      pagination
      onRowClick={(deal) => router.push(`/deals/${deal.id}`)}
      emptyState={{
        title: 'No deals found',
        description: 'Create your first deal to get started',
        action: (
          <Button onClick={() => router.push('/deals/new')}>
            Create Deal
          </Button>
        ),
      }}
    />
  )
}
```

#### Props

```typescript
interface UnifiedTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  searchable?: boolean
  filterable?: boolean
  exportable?: boolean
  pagination?: boolean
  pageSize?: number
  onRowClick?: (row: T) => void
  emptyState?: {
    title: string
    description?: string
    action?: React.ReactNode
  }
  className?: string
}
```

#### Features

- **Sorting**: Click column headers to sort
- **Filtering**: Per-column filters with custom options
- **Search**: Global search across all columns
- **Pagination**: Built-in pagination with customizable page size
- **Export**: CSV/Excel export functionality
- **Row Selection**: Multi-row selection with bulk actions
- **Empty States**: Customizable empty state displays
- **Loading States**: Built-in skeleton loading
- **Responsive**: Mobile-friendly design

### UnifiedForm

A dynamic form builder with validation, field types, and submission handling.

#### Usage

```typescript
import { UnifiedForm } from '@/components/core/UnifiedForm'
import { z } from 'zod'

const dealSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1).max(500),
  payment_method: z.enum(['bank', 'wallet', 'cash', 'cheque']),
  due_date: z.string().refine((date) => new Date(date) > new Date()),
})

const dealFields: FormField[] = [
  {
    name: 'client_id',
    label: 'Client',
    type: 'select',
    required: true,
    options: clients.map(client => ({
      label: client.name,
      value: client.id
    })),
    placeholder: 'Select a client',
  },
  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    required: true,
    placeholder: 'Enter amount',
    prefix: '$',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Deal description',
    rows: 3,
  },
  {
    name: 'payment_method',
    label: 'Payment Method',
    type: 'select',
    required: true,
    options: [
      { label: 'Bank Transfer', value: 'bank' },
      { label: 'Digital Wallet', value: 'wallet' },
      { label: 'Cash', value: 'cash' },
      { label: 'Cheque', value: 'cheque' },
    ],
  },
  {
    name: 'due_date',
    label: 'Due Date',
    type: 'date',
    required: true,
  },
]

function CreateDealForm() {
  const createDeal = useCreateDeal()
  
  const handleSubmit = (data: z.infer<typeof dealSchema>) => {
    createDeal.mutate(data)
  }
  
  return (
    <UnifiedForm
      schema={dealSchema}
      fields={dealFields}
      onSubmit={handleSubmit}
      submitText="Create Deal"
      loading={createDeal.isLoading}
      defaultValues={{
        payment_method: 'bank',
        due_date: new Date().toISOString().split('T')[0],
      }}
    />
  )
}
```

#### Field Types

```typescript
type FieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'datetime'
  | 'file'
  | 'currency'
  | 'phone'
  | 'url'

interface FormField {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  description?: string
  options?: Array<{ label: string; value: string }>
  validation?: z.ZodSchema
  disabled?: boolean
  hidden?: boolean
  prefix?: string
  suffix?: string
  rows?: number // for textarea
  accept?: string // for file inputs
  multiple?: boolean // for file/select inputs
}
```

## UI Components

### Button

```typescript
import { Button } from '@/components/ui/button'

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// With icons
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Loading state
<Button disabled loading>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Processing...
</Button>
```

### Input

```typescript
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Basic input
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>

// With validation state
<Input
  type="text"
  placeholder="Username"
  className={cn(
    "border-input",
    error && "border-destructive focus-visible:ring-destructive"
  )}
/>
{error && (
  <p className="text-sm text-destructive">{error.message}</p>
)}
```

### Select

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pending">Pending</SelectItem>
    <SelectItem value="approved">Approved</SelectItem>
    <SelectItem value="rejected">Rejected</SelectItem>
  </SelectContent>
</Select>
```

### Dialog

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Are you sure?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleConfirm}>
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Card

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Deal Information</CardTitle>
    <CardDescription>
      Manage your deal details and status
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <Label>Client</Label>
        <p className="text-sm">{deal.client_name}</p>
      </div>
      <div>
        <Label>Amount</Label>
        <p className="text-sm font-semibold">${deal.amount}</p>
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Edit Deal</Button>
  </CardFooter>
</Card>
```

## Dashboard Components

### StatsCard

```typescript
import { StatsCard } from '@/components/dashboard/StatsCard'

<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <StatsCard
    title="Total Deals"
    value="1,234"
    change="+12%"
    changeType="positive"
    icon={<TrendingUp className="h-4 w-4" />}
  />
  <StatsCard
    title="Revenue"
    value="$45,678"
    change="+5.2%"
    changeType="positive"
    icon={<DollarSign className="h-4 w-4" />}
  />
  <StatsCard
    title="Pending Verification"
    value="23"
    change="-8%"
    changeType="negative"
    icon={<Clock className="h-4 w-4" />}
  />
  <StatsCard
    title="Success Rate"
    value="94.5%"
    change="+2.1%"
    changeType="positive"
    icon={<CheckCircle className="h-4 w-4" />}
  />
</div>
```

### Sidebar

```typescript
import { Sidebar } from '@/components/dashboard/Sidebar'

const sidebarItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: 'Deals',
    href: '/deals',
    icon: <FileText className="h-4 w-4" />,
    badge: '12',
  },
  {
    label: 'Clients',
    href: '/clients',
    icon: <Users className="h-4 w-4" />,
  },
]

<Sidebar items={sidebarItems} />
```

### Header

```typescript
import { Header } from '@/components/dashboard/Header'

<Header
  title="Dashboard"
  subtitle="Welcome back, John Doe"
  actions={
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm">
        Export
      </Button>
      <Button size="sm">
        New Deal
      </Button>
    </div>
  }
/>
```

## Form Components

### DynamicForm

Advanced form component with conditional fields and validation.

```typescript
import { DynamicForm } from '@/components/forms/DynamicForm'

const formConfig = {
  sections: [
    {
      title: 'Basic Information',
      fields: [
        {
          name: 'client_type',
          label: 'Client Type',
          type: 'select',
          options: [
            { label: 'Individual', value: 'individual' },
            { label: 'Business', value: 'business' },
          ],
        },
        {
          name: 'business_name',
          label: 'Business Name',
          type: 'text',
          condition: (values) => values.client_type === 'business',
        },
      ],
    },
    {
      title: 'Contact Information',
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
        },
        {
          name: 'phone',
          label: 'Phone',
          type: 'phone',
        },
      ],
    },
  ],
}

<DynamicForm
  config={formConfig}
  onSubmit={handleSubmit}
  loading={isSubmitting}
/>
```

### FormFieldRenderer

Renders individual form fields with consistent styling.

```typescript
import { FormFieldRenderer } from '@/components/forms/FormFieldRenderer'

<FormFieldRenderer
  field={{
    name: 'amount',
    label: 'Amount',
    type: 'currency',
    required: true,
    prefix: '$',
  }}
  value={amount}
  onChange={setAmount}
  error={errors.amount}
/>
```

## Shared Components

### ConfirmationDialog

```typescript
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog'

<ConfirmationDialog
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
  title="Delete Deal"
  description="Are you sure you want to delete this deal? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="destructive"
  onConfirm={handleDelete}
/>
```

### ExpandButton

```typescript
import { ExpandButton } from '@/components/shared/ExpandButton'

<ExpandButton
  expanded={isExpanded}
  onToggle={setIsExpanded}
  size="sm"
/>
```

### Loading Components

```typescript
import { TableSkeleton } from '@/components/core/TableSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

// Table loading state
<TableSkeleton rows={5} columns={4} />

// Custom loading states
<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-4 w-[300px]" />
</div>
```

## Global Components

### Notification

```typescript
import { Notification } from '@/components/global-components/Notification'

// Programmatic notifications
import { toast } from 'sonner'

toast.success('Deal created successfully')
toast.error('Failed to update deal')
toast.info('New notification received')
toast.warning('Please verify your email')

// Custom notification component
<Notification
  type="success"
  title="Success"
  message="Deal has been approved"
  onClose={() => {}}
/>
```

### UserInfo

```typescript
import { UserInfo } from '@/components/global-components/UserInfo'

<UserInfo
  user={currentUser}
  showRole
  showStatus
  avatarSize="md"
/>
```

### CompanyInformation

```typescript
import { CompanyInformation } from '@/components/global-components/CompanyInformation'

<CompanyInformation
  organization={currentOrganization}
  showAddress
  showContact
/>
```

## Styling and Theming

### Theme Configuration

```typescript
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
    },
  },
}
```

### Custom Variants

```typescript
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

## Best Practices

### 1. Component Composition

```typescript
// ✅ Good - Composable components
function DealCard({ deal }: { deal: Deal }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{deal.title}</CardTitle>
        <CardDescription>
          <Badge variant={getStatusVariant(deal.status)}>
            {deal.status}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DealDetails deal={deal} />
      </CardContent>
      <CardFooter>
        <DealActions deal={deal} />
      </CardFooter>
    </Card>
  )
}

// ❌ Avoid - Monolithic components
function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="border rounded p-4">
      {/* All logic and UI in one component */}
    </div>
  )
}
```

### 2. Prop Interfaces

```typescript
// ✅ Define clear prop interfaces
interface DealCardProps {
  deal: Deal
  onEdit?: (deal: Deal) => void
  onDelete?: (dealId: string) => void
  showActions?: boolean
  className?: string
}

function DealCard({ 
  deal, 
  onEdit, 
  onDelete, 
  showActions = true,
  className 
}: DealCardProps) {
  // Component implementation
}
```

### 3. Forward Refs

```typescript
// ✅ Forward refs for component composition
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'
```

### 4. Accessibility

```typescript
// ✅ Include accessibility attributes
function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      role="button"
      aria-pressed={props.pressed}
      aria-disabled={props.disabled}
      tabIndex={props.disabled ? -1 : 0}
    >
      {children}
    </button>
  )
}
```

### 5. Performance

```typescript
// ✅ Memoize expensive components
const DealChart = React.memo(({ data }: { data: ChartData[] }) => {
  const chartConfig = useMemo(() => 
    generateChartConfig(data), [data]
  )
  
  return <Chart config={chartConfig} />
})

// ✅ Use callback hooks for event handlers
function DealList({ deals }: { deals: Deal[] }) {
  const handleDealClick = useCallback((deal: Deal) => {
    router.push(`/deals/${deal.id}`)
  }, [router])
  
  return (
    <div>
      {deals.map(deal => (
        <DealCard 
          key={deal.id} 
          deal={deal} 
          onClick={handleDealClick}
        />
      ))}
    </div>
  )
}
```

This component library provides a comprehensive set of reusable, accessible, and performant components for building the PRS frontend application.