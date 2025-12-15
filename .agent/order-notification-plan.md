# Order Management & Notification System Implementation Plan

## Overview
Implement a comprehensive order management system with seller notifications, order confirmation workflow, live tracking, and seller details display.

## Features to Implement

### 1. Order Workflow Changes
- **Current**: Order placed → Directly goes to "Processing"
- **New**: Order placed → "Pending" → Seller confirms → "Processing" → "Shipped" → "Delivered"

### 2. Notification System
**For Sellers:**
- New order placed notification
- Order cancelled by user notification

**For Users:**
- Order confirmed by seller
- Order rejected by seller
- Order status updates

### 3. Seller Details in Order
- Business name
- Mobile number
- Business address
- Email
- Store location (for tracking)

### 4. Live Order Tracking
- Dynamic map showing route from seller location to user address
- Real-time status updates
- Distance and estimated delivery time

### 5. Database Schema Updates

**Order Model:**
```javascript
{
  // Existing fields...
  seller: { type: ObjectId, ref: 'User' },
  sellerConfirmed: { type: Boolean, default: false },
  sellerConfirmedAt: Date,
  rejectedBySeller: { type: Boolean, default: false },
  rejectionReason: String,
  trackingInfo: {
    sellerLocation: {
      lat: Number,
      lng: Number,
      address: String
    },
    currentLocation: {
      lat: Number,
      lng: Number
    },
    estimatedDelivery: Date
  }
}
```

**Notification Model (New):**
```javascript
{
  user: { type: ObjectId, ref: 'User' },
  type: String, // 'order_placed', 'order_confirmed', 'order_rejected', 'order_cancelled'
  title: String,
  message: String,
  orderId: { type: ObjectId, ref: 'Order' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

## Implementation Steps

### Phase 1: Backend Setup
1. ✅ Create Notification model
2. ✅ Update Order model with new fields
3. ✅ Create notification routes
4. ✅ Update order creation to set status as "Pending"
5. ✅ Add seller confirmation endpoint
6. ✅ Add seller rejection endpoint
7. ✅ Update order cancellation to notify seller

### Phase 2: Seller Dashboard
1. ✅ Create notifications panel
2. ✅ Show pending orders
3. ✅ Add confirm/reject buttons
4. ✅ Update order status on confirmation

### Phase 3: User Interface
1. ✅ Show seller details in order
2. ✅ Display order status correctly
3. ✅ Add notifications dropdown in navbar
4. ✅ Show tracking map

### Phase 4: Live Tracking
1. ✅ Integrate map library (Leaflet/Google Maps)
2. ✅ Show route from seller to user
3. ✅ Update tracking info dynamically
4. ✅ Calculate distance and ETA

### Phase 5: Testing
1. ✅ Test order placement
2. ✅ Test seller confirmation
3. ✅ Test seller rejection
4. ✅ Test order cancellation
5. ✅ Test notifications
6. ✅ Test tracking

## Technical Stack
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, React Router
- **Maps**: Leaflet.js (open source)
- **Real-time**: Polling (can upgrade to WebSocket later)

## Notes
- Start with basic notification system
- Maps can be added progressively
- Focus on core workflow first
- Add real-time updates later if needed
