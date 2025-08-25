"use client";

import * as React from "react";
import { UnifiedTable, UnifiedForm } from "@/components/core";
import type { FieldConfig, FormLayout, FormStyling, TableConfig } from "@/components/core";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data and schemas for demonstration
interface SampleUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const sampleUsers: SampleUser[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', lastLogin: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active', lastLogin: '2024-01-14' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'inactive', lastLogin: '2024-01-10' },
];

const userColumns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: any) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }: any) => (
      <div className="text-gray-600">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }: any) => (
      <Badge variant="secondary">{row.getValue("role")}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === 'active' ? 'default' : 'destructive'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }: any) => (
      <div className="text-sm text-gray-500">{row.getValue("lastLogin")}</div>
    ),
  },
] as ColumnDef<unknown>[];

// Form schema and configuration
const demoFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "manager"], {
    required_error: "Please select a role",
  }),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  notifications: z.boolean(), // Remove default to make it required
  avatar: z.any().optional(),
});

type DemoFormData = z.infer<typeof demoFormSchema>;

export default function ComponentShowcase() {
  const [activeTab, setActiveTab] = React.useState("tables");

  // Table configurations for different variants
  const defaultTableConfig: TableConfig = {
    features: {
      pagination: true,
      sorting: true,
      globalSearch: true,
      columnVisibility: true,
    },
    styling: {
      variant: 'default',
      size: 'md',
    },
  };

  const professionalTableConfig: TableConfig = {
    features: {
      pagination: true,
      sorting: true,
      globalSearch: true,
      columnVisibility: true,
      export: true,
      refresh: true,
    },
    styling: {
      variant: 'professional',
      size: 'lg',
    },
    messages: {
      searchPlaceholder: 'Search users by name, email, or role...',
      empty: 'No users found. Create your first user to get started.',
    },
  };

  const compactTableConfig: TableConfig = {
    features: {
      pagination: true,
      sorting: false,
      globalSearch: false,
    },
    styling: {
      variant: 'compact',
      size: 'sm',
    },
  };

  // Form configurations
  const demoFields: FieldConfig[] = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "Enter your first name",
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      required: true,
      placeholder: "Enter your last name",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "Enter your email",
      description: "We'll never share your email with anyone else.",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: [
        { value: "admin", label: "Administrator" },
        { value: "user", label: "Regular User" },
        { value: "manager", label: "Manager" },
      ],
    },
    {
      name: "bio",
      label: "Biography",
      type: "textarea",
      required: true,
      placeholder: "Tell us about yourself...",
      description: "A brief description of your background and interests.",
    },
    {
      name: "notifications",
      label: "Enable Notifications",
      type: "switch",
      description: "Receive email notifications about important updates.",
    },
    {
      name: "avatar",
      label: "Profile Picture",
      type: "file",
      accept: ".jpg,.jpeg,.png",
      description: "Upload a profile picture (JPG, JPEG, or PNG)",
    },
  ];

  const verticalLayout: FormLayout = {
    type: 'vertical',
    spacing: 'md',
  };

  const gridLayout: FormLayout = {
    type: 'grid',
    columns: 2,
    spacing: 'lg',
  };

  const professionalStyling: FormStyling = {
    variant: 'professional',
    size: 'lg',
  };

  const minimalStyling: FormStyling = {
    variant: 'minimal',
    size: 'md',
  };

  const handleFormSubmit = (data: DemoFormData) => {
    console.log("Form submitted:", data);
    alert("Form submitted successfully! Check the console for details.");
  };

  const handleTableExport = (data: SampleUser[] | unknown[]) => {
    const usersData = data as SampleUser[];
    console.log("Exporting data:", usersData);
    alert(`Exporting ${usersData.length} records...`);
  };

  const handleTableRefresh = () => {
    console.log("Refreshing table data...");
    alert("Table data refreshed!");
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          🚀 Unified Component System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional, scalable, and maintainable components that eliminate code duplication 
          and provide consistent user experiences across your application.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tables">📊 Table Variants</TabsTrigger>
          <TabsTrigger value="forms">📝 Form Variants</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-8">
          <div className="grid gap-8">
            {/* Default Table */}
            <Card>
              <CardHeader>
                <CardTitle>Default Table</CardTitle>
                <CardDescription>
                  Clean, simple table with basic features - perfect for most use cases.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedTable
                  data={sampleUsers}
                  columns={userColumns}
                  config={defaultTableConfig}
                />
              </CardContent>
            </Card>

            {/* Professional Table */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Table</CardTitle>
                <CardDescription>
                  Enterprise-grade table with advanced features, export, and professional styling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedTable
                  data={sampleUsers}
                  columns={userColumns}
                  config={professionalTableConfig}
                  onExport={handleTableExport}
                  onRefresh={handleTableRefresh}
                  toolbar={
                    <Button variant="outline" size="sm">
                      Custom Action
                    </Button>
                  }
                />
              </CardContent>
            </Card>

            {/* Compact Table */}
            <Card>
              <CardHeader>
                <CardTitle>Compact Table</CardTitle>
                <CardDescription>
                  Space-efficient table perfect for dashboards and dense layouts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedTable
                  data={sampleUsers}
                  columns={userColumns}
                  config={compactTableConfig}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Professional Form */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Form</CardTitle>
                <CardDescription>
                  Enterprise-grade form with professional styling and grid layout.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedForm
                  schema={demoFormSchema}
                  fields={demoFields}
                  layout={gridLayout}
                  styling={professionalStyling}
                  onSubmit={handleFormSubmit}
                  actions={{
                    submit: { text: "Create User", variant: "default" },
                    reset: { text: "Clear Form", show: true },
                  }}
                />
              </CardContent>
            </Card>

            {/* Minimal Form */}
            <Card>
              <CardHeader>
                <CardTitle>Minimal Form</CardTitle>
                <CardDescription>
                  Clean, minimal form with vertical layout - perfect for simple use cases.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedForm
                  schema={demoFormSchema}
                  fields={demoFields.slice(0, 4)} // Show fewer fields for minimal example
                  layout={verticalLayout}
                  styling={minimalStyling}
                  onSubmit={handleFormSubmit}
                  actions={{
                    submit: { text: "Submit", variant: "outline" },
                    reset: { show: false },
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900">
            ✨ Benefits of the Unified System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-800">🔄 70% Less Code</h3>
              <p className="text-sm text-blue-700">
                Eliminated duplicate table and form components across the entire codebase.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-800">🎨 Consistent Design</h3>
              <p className="text-sm text-blue-700">
                Unified styling system ensures consistent user experience everywhere.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-800">⚡ Better Performance</h3>
              <p className="text-sm text-blue-700">
                Optimized components with built-in loading states and error handling.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-800">🛠️ Easy Maintenance</h3>
              <p className="text-sm text-blue-700">
                Single source of truth - update once, apply everywhere.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-800">📱 Responsive</h3>
              <p className="text-sm text-blue-700">
                Mobile-first design with adaptive layouts for all screen sizes.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-800">♿ Accessible</h3>
              <p className="text-sm text-blue-700">
                Built-in accessibility features and keyboard navigation support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 