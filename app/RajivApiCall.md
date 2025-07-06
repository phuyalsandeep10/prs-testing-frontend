Reusable API Call Implementation with Zustand and TypeScript
This project provides a robust, reusable API call mechanism using Zustand for state management, TypeScript for type safety, and Axios for HTTP requests. It is designed for React/Next.js applications, supporting features like pagination, query parameters, retries with exponential backoff, and request cancellation. This README explains how to use the API store, integrate it with components like Acheve, and extend it for various use cases.
Table of Contents

Overview
Prerequisites
Setup
API Store Implementation
Key Features
State Structure
API Call Function
Retry Mechanism
Cancellation

Type Definitions
Using the API Store in a Component
Acheve Component Example

Example Usage
Error Handling
Environment Variables
Extending the Implementation
Troubleshooting
Production Readiness

Overview
The reusable API call implementation uses Zustand with the Immer middleware to manage API state and Axios for HTTP requests. It supports fetching paginated data, handling query parameters, retrying failed requests with exponential backoff, and canceling requests to prevent memory leaks. The Acheve component demonstrates its usage by fetching and displaying sales progress data with query parameters in a Next.js application.
Prerequisites

Node.js: Version 14 or higher
React: Version 17 or higher
Next.js: For components like Acheve
TypeScript: For type safety
Dependencies:
zustand: State management
immer: Immutable state updates
axios: HTTP requests
lucide-react: For icons (optional, used in components)
next: For Next.js components

A backend API that provides JSON data (e.g., Django REST Framework with pagination)

Install dependencies using:
npm install zustand immer axios lucide-react next

Setup

Create the API Store:Place the API store implementation in src/store/apiStore.ts.

Define Types:Define TypeScript interfaces for API responses in src/types/Dashboard.ts.

Create Components:Implement components (e.g., Acheve.tsx) in src/components.

Environment Variables:Set the API base URL in .env.local:
NEXT_PUBLIC_API_URL=https://your-api-base-url.com

Authentication:Ensure an authentication token is available (e.g., in localStorage under authToken or via a custom getAuthToken function).

API Store Implementation
The createApiStore function in apiStore.ts creates a reusable Zustand store for API calls. Below is an overview of its structure and functionality.
Key Features

Type Safety: Uses generics (<T>) for type-safe responses.
Pagination Support: Handles Django-style pagination (results and next fields).
Query Parameters: Supports query parameters via a params object.
Retry Mechanism: Retries failed requests up to three times with exponential backoff (1s, 2s, 4s delays).
Cancellation: Supports canceling requests to prevent memory leaks.
Immutable State: Uses Immer for safe state updates.
Flexible Authentication: Allows custom token retrieval via getAuthToken.

State Structure
The store maintains the following state:

data: API response data (type T or null).
loading: Object mapping endpoints to boolean loading states (e.g., { "/dashboard/": true }).
error: Error details (ApiError or null).
retryCount: Number of retry attempts (up to 3).
lastRequest: Stores parameters of the last request for retries.

API Call Function
The sendRequest function initiates an API call with the following parameters:

method: HTTP method (e.g., GET, POST).
endpoint: API endpoint URL (relative to NEXT_PUBLIC_API_URL).
body: Optional request body (e.g., JSON or FormData).
params: Optional query parameters (e.g., { period: "Q1", userId: 123 }).
config: Optional Axios configuration, including a getAuthToken function.
transformResponse: Optional function to transform the raw response.

Example:
store.sendRequest(
Delphi
System: "GET",
"/dashboard/",
undefined,
{ period: "Q1", userId: 123 },
{ getAuthToken: () => localStorage.getItem("authToken") },
(raw) => ({
sales_progress: raw.sales_progress,
// ... map other fields
})
);

Retry Mechanism
The retry function attempts to re-execute the last failed request up to three times, with exponential backoff delays (1s, 2s, 4s).
Example:
store.retry();

Cancellation
The cancel function cancels an ongoing request for a specific endpoint, preventing memory leaks.
Example:
store.cancel("/dashboard/");

Type Definitions
The DashboardResponse interface defines the structure of the API response for the /dashboard/ endpoint, used in the Acheve component:
export interface DashboardResponse {
user_info: UserInfo;
sales_progress: SalesProgress;
streak_info: StreakInfo;
outstanding_deals: Deal[];
recent_payments: unknown[];
verification_status: VerificationStatus;
chart_data: ChartData;
}

export interface SalesProgress {
current_sales: string;
target: string;
percentage: number;
deals_closed: number;
deals_pending: number;
period: string;
}

Using the API Store in a Component
Acheve Component Example
The Acheve component fetches sales progress data and displays it with a dynamic UI based on the progress percentage. It demonstrates usage of the API store with query parameters.
"use client";
import { useEffect, useMemo } from "react";
import { useDashboardStore } from "@/store/apiCall/Achieve";

const Acheve = () => {
const { data, loading, error, sendRequest, cancel } = useDashboardStore();
const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/`;

useEffect(() => {
sendRequest("GET", endpoint, undefined, { period: "Q1", userId: 123 });
return () => cancel(endpoint);
}, [sendRequest, cancel, endpoint]);

const { currentAmount, targetAmount, percentage } = useMemo(() => {
const current = parseFloat(data?.sales_progress?.current_sales || "0") || 0;
const target = parseFloat(data?.sales_progress?.target || "1") || 1;
const percent = (current / target) \* 100;
return { currentAmount: current, targetAmount: target, percentage: percent };
}, [data?.sales_progress]);

if (error) return <div>Error: {error.message} {error.status && `(${error.status})`}</div>;
if (loading[endpoint]) return <div>Loading...</div>;
if (!data) return <div>No data available</div>;

// Render UI based on percentage
};

Example Usage

Basic GET Request:
const { sendRequest } = useDashboardStore();
sendRequest("GET", "/dashboard/");

GET with Query Parameters:
sendRequest("GET", "/dashboard/", undefined, { period: "Q2", status: "active" });

POST with Body and Custom Auth:
sendRequest(
"POST",
"/create/",
{ name: "Test" },
undefined,
{ getAuthToken: () => document.cookie.match(/authToken=([^;]+)/)?.[1] || null }
);

Retry on Failure:
const { error, retry } = useDashboardStore();
if (error) retry();

Cancel Request:
useEffect(() => {
return () => cancel("/dashboard/");
}, [cancel]);

Error Handling
The store handles errors gracefully:

Axios Errors: Captures status codes and response data.
Generic Errors: Captures error messages.
Cancellation: Ignores canceled requests to avoid error states.

Display errors in a component:
const { error } = useDashboardStore();
if (error) {
return (

<div className="text-red-500">
Error: {error.message} {error.status && `(${error.status})`}
{error.details && <pre>{JSON.stringify(error.details, null, 2)}</pre>}
</div>
);
}

Environment Variables
Set the API base URL in .env.local:
NEXT_PUBLIC_API_URL=https://your-api-base-url.com

The store validates this variable and sets an error if undefined.
Extending the Implementation

Create a New Store:
import { createApiStore } from "../apiStore";
import type { OtherResponse } from "../types/Other";

export const useOtherStore = createApiStore<OtherResponse>();

Custom Transformation:
sendRequest("GET", "/endpoint/", undefined, undefined, {}, (raw) => ({
customField: raw.data.custom_field,
}));

Complex Query Parameters:
sendRequest("GET", "/dashboard/", undefined, { filters: JSON.stringify({ status: "active" }) });

Troubleshooting

No Response:
Check NEXT_PUBLIC_API_URL in .env.local.
Verify the endpoint and response structure match DashboardResponse.
Ensure authToken is set in localStorage or provide a getAuthToken function.

Pagination Issues:
Confirm the API uses Django-style pagination (results and next).
Log the raw response to debug: console.log(response.data).

Retry Not Working:
Ensure retryCount is less than 3 and lastRequest is set.
Check for cancellation errors in the console.

Query Parameters:
Verify parameters are correctly formatted (e.g., { key: value }).
Check the Network tab for the request URL (e.g., /dashboard/?period=Q1).

Console Logs:
Enable debug logging in components (e.g., Acheve) to inspect data, loading, and error.

Production Readiness
The API store is production-ready for most use cases, with the following considerations:

Strengths:
Robust error handling, pagination, and retry mechanism.
Type-safe with TypeScript generics.
Supports query parameters and cancellation.
Efficient state management with Immer.

Recommendations:
Add Unit Tests: Use Jest and axios-mock-adapter to test success, failure, pagination, retries, and cancellation.
Secure Authentication: Replace localStorage with HTTP-only cookies or a secure context to mitigate XSS risks.
Caching: Add an in-memory cache to reduce redundant API calls:interface ApiState<T> {
cache: Record<string, { data: T; timestamp: number }>;
cacheTTL: number;
}

Logging: Integrate with a monitoring service (e.g., Sentry) for error tracking.
Configurable Retries: Allow customization of retry count and status codes.

With these additions, the store is suitable for large-scale, critical applications.
