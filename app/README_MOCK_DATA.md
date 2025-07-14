# Org Admin Dashboard - Mock Data System

## Overview

The org admin dashboard is currently set up to use comprehensive mock data while the backend API endpoints are being developed. This allows for full frontend development and testing without waiting for the backend.

## How It Works

### Automatic Fallback
- The dashboard automatically falls back to mock data when:
  - API endpoints are not available (404, 500, network errors)
  - Environment is set to development mode
  - `NEXT_PUBLIC_USE_MOCK_DATA=true` is set

### Environment Variables

You can control mock data usage with these environment variables:

```bash
# Force mock data usage (even in production)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Use real API (when available)
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Default Behavior
- **Development**: Uses mock data by default
- **Production**: Tries real API first, falls back to mock data if API fails

## Mock Data Structure

The mock data includes realistic data for all dashboard components:

### Overview Metrics
- Total Revenue: ₹2,45,67,890
- Active Deals: 156
- Team Performance: 94.2%
- Conversion Rate: 23.8%
- Monthly Growth: 12.5%
- Total Users: 42
- Pending Approvals: 8
- System Alerts: 2
- Data Usage: 78%

### Team Members
- 5 team members with different roles (Supervisor, Salesperson, Verifier)
- Realistic performance metrics (87-98%)
- Online/offline status indicators
- Deal counts and revenue per member

### Deal Pipeline
- 5 stages: Prospecting, Qualification, Proposal, Negotiation, Closed Won
- Realistic deal counts and values
- Progress indicators for each stage

### Analytics
- Monthly performance chart data (6 months)
- Revenue distribution by category
- Key insights and metrics

### Recent Activities
- 6 recent activities with different types and statuses
- Realistic timestamps and user information

### System Status
- Database: Healthy
- API Services: Online
- Storage: 78% Used
- Last Backup: 2 hours ago

## API Endpoints Expected

When the backend is ready, these endpoints should be implemented:

```
GET /org-admin/dashboard/
GET /org-admin/team-performance/
GET /org-admin/deal-pipeline/
GET /org-admin/analytics/
GET /org-admin/activities/
GET /org-admin/system-status/
```

## Switching to Real API

1. **Set environment variable**:
   ```bash
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

2. **Implement backend endpoints** with the expected response structure

3. **Test API integration** - the dashboard will automatically use real data

## Benefits

- **No blocking**: Frontend development can continue without backend
- **Realistic data**: Mock data closely matches expected API responses
- **Smooth transition**: Easy switch from mock to real data
- **Testing**: Can test all UI components with realistic scenarios
- **Demo ready**: Dashboard works immediately for demos and presentations

## Console Logs

When using mock data, you'll see console logs like:
```
Using mock data for org admin dashboard
Using mock data for team performance
Using mock data for deal pipeline
```

This helps identify when mock data is being used vs real API calls.

## Demo Mode Indicator

The dashboard shows a blue notification banner when in demo mode:
> **Demo Mode:** This dashboard is currently using mock data. Backend integration will be available once the API endpoints are ready.

This clearly indicates to users that they're seeing demo data. 