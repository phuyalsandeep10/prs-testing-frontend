# Real-Time Notification System - Sequence Diagram

## Overview
This sequence diagram illustrates the complete flow of the real-time notification system, from the initial trigger event to the final UI update.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend UI
    participant WS as WebSocket Client
    participant API as REST API
    participant DB as Database
    participant Signal as Django Signal
    participant Service as NotificationService
    participant Redis as Redis Channel Layer
    participant Consumer as WebSocket Consumer
    participant Context as React Context

    Note over U,Context: 1. INITIAL CONNECTION SETUP
    U->>UI: User logs in
    UI->>API: POST /auth/login
    API->>DB: Validate credentials
    DB-->>API: User data + token
    API-->>UI: Authentication response
    UI->>UI: Store token in localStorage
    
    UI->>WS: Connect with token
    WS->>Consumer: WebSocket connection request
    Consumer->>DB: Validate token
    DB-->>Consumer: User authenticated
    Consumer->>Redis: Add user to group (notifications_{user_id})
    Consumer-->>WS: Connection accepted
    WS-->>UI: WebSocket connected
    
    Note over U,Context: 2. INITIAL DATA LOAD
    Consumer->>DB: Fetch unread notifications
    DB-->>Consumer: Unread notifications
    Consumer->>WS: Send notification batch
    WS->>UI: Receive notification batch
    UI->>Context: Update notification state
    UI->>UI: Display notification count

    Note over U,Context: 3. NOTIFICATION TRIGGER EVENT
    U->>UI: Create new deal
    UI->>API: POST /deals/
    API->>DB: Save deal record
    DB-->>API: Deal created successfully
    API-->>UI: Deal creation response
    
    Note over U,Context: 4. SIGNAL-BASED NOTIFICATION CREATION
    DB->>Signal: post_save signal triggered
    Signal->>Service: Create notification
    Service->>DB: Save notification record
    DB-->>Service: Notification saved
    Service-->>Signal: Notification created
    
    Note over U,Context: 5. REAL-TIME BROADCAST
    Signal->>Redis: Send to user group
    Redis->>Consumer: Route message to user
    Consumer->>WS: Send notification
    WS->>UI: Receive real-time notification
    
    Note over U,Context: 6. FRONTEND PROCESSING
    UI->>Context: Update notification state
    UI->>UI: Invalidate React Query cache
    UI->>UI: Show toast notification
    UI->>UI: Update notification count
    
    Note over U,Context: 7. CROSS-TAB SYNCHRONIZATION
    UI->>UI: Broadcast to other tabs
    UI->>UI: Update all tab states
    
    Note over U,Context: 8. USER INTERACTION
    U->>UI: Click notification
    UI->>API: Mark as read
    API->>DB: Update notification status
    DB-->>API: Status updated
    API-->>UI: Success response
    UI->>Context: Update unread count
    UI->>UI: Navigate to action URL

    Note over U,Context: 9. CONNECTION RECOVERY
    Note over WS,Consumer: WebSocket disconnection
    WS->>WS: Detect disconnection
    WS->>WS: Exponential backoff retry
    WS->>Consumer: Reconnect attempt
    Consumer->>DB: Re-authenticate
    DB-->>Consumer: User still valid
    Consumer->>Redis: Re-add to user group
    Consumer-->>WS: Reconnection successful
    WS-->>UI: Connection restored
```

## Detailed Component Interactions

### 1. **Initial Connection Setup**
- User authentication triggers WebSocket connection
- Token-based authentication ensures secure connections
- User-specific groups created for targeted messaging

### 2. **Initial Data Load**
- On connection, backend sends existing unread notifications
- Frontend populates notification state immediately
- No additional API calls needed for initial data

### 3. **Notification Trigger Event**
- Any database operation can trigger notifications
- Examples: deal creation, payment received, user actions
- REST API handles the primary operation

### 4. **Signal-Based Notification Creation**
- Django signals automatically detect database changes
- NotificationService creates appropriate notifications
- Supports templates, user preferences, and role-based targeting

### 5. **Real-Time Broadcast**
- Redis channel layer routes messages efficiently
- User-specific groups ensure targeted delivery
- WebSocket consumer handles message formatting

### 6. **Frontend Processing**
- React Query cache invalidation ensures UI consistency
- Toast notifications provide immediate user feedback
- Context updates maintain global state

### 7. **Cross-Tab Synchronization**
- BroadcastChannel API synchronizes across browser tabs
- All tabs receive the same notification updates
- Consistent user experience across multiple tabs

### 8. **User Interaction**
- Click handlers navigate to relevant pages
- Mark-as-read operations update backend state
- Real-time updates reflect user actions

### 9. **Connection Recovery**
- Automatic reconnection with exponential backoff
- Graceful handling of network interruptions
- Seamless user experience during connectivity issues

## Key Features Highlighted

### **Real-Time Delivery**
- WebSocket-based instant messaging
- Redis channel layer for scalability
- User-specific message routing

### **Reliability**
- Automatic reconnection strategies
- Fallback to REST API when needed
- Error handling and recovery

### **Performance**
- Efficient cache invalidation
- Batch notification processing
- Optimized database queries

### **User Experience**
- Immediate visual feedback
- Cross-tab synchronization
- Priority-based notification styling

### **Security**
- Token-based authentication
- User-specific message groups
- Secure WebSocket connections

## Error Handling Scenarios

```mermaid
sequenceDiagram
    participant WS as WebSocket Client
    participant Consumer as WebSocket Consumer
    participant API as REST API
    participant UI as Frontend UI

    Note over WS,UI: WebSocket Connection Failure
    WS->>Consumer: Connection attempt
    Consumer-->>WS: Connection failed
    WS->>WS: Fallback to REST API
    WS->>API: Poll for notifications
    API-->>WS: Notification data
    WS->>UI: Update via REST

    Note over WS,UI: Authentication Failure
    WS->>Consumer: Connect with invalid token
    Consumer->>Consumer: Token validation failed
    Consumer-->>WS: Connection rejected
    WS->>UI: Show authentication error
    UI->>UI: Redirect to login

    Note over WS,UI: Network Interruption
    WS->>Consumer: Connection lost
    WS->>WS: Start reconnection timer
    WS->>Consumer: Reconnection attempt
    Consumer-->>WS: Connection restored
    WS->>UI: Resume real-time updates
```

This sequence diagram provides a comprehensive view of how the real-time notification system works, from initial setup through various interaction scenarios and error handling. 