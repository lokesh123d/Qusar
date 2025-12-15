const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        image: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    shippingAddress: {
        name: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Card', 'UPI', 'NetBanking'],
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentDetails: {
        method: String,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        paidAt: Date
    },
    expectedDeliveryDate: {
        type: Date
    },
    itemsPrice: {
        type: Number,
        required: true
    },
    shippingPrice: {
        type: Number,
        default: 0
    },
    taxPrice: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'],
        default: 'Pending'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sellerConfirmed: {
        type: Boolean,
        default: false
    },
    sellerConfirmedAt: Date,
    rejectedBySeller: {
        type: Boolean,
        default: false
    },
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
        estimatedDelivery: Date,
        distance: Number
    },
    deliveredAt: Date,
    cancelledAt: Date
}, {
    timestamps: true
});

// Generate order number and calculate delivery date before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        this.orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    }

    // Calculate expected delivery date (5 days from order date)
    if (!this.expectedDeliveryDate) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        this.expectedDeliveryDate = deliveryDate;
    }

    next();
});

module.exports = mongoose.model('Order', orderSchema);
