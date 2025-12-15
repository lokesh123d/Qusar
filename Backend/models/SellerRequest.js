const mongoose = require('mongoose');

const sellerRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessAddress: {
        type: String,
        required: true
    },
    gstNumber: {
        type: String,
        trim: true
    },
    bankDetails: {
        accountNumber: {
            type: String,
            required: true
        },
        ifscCode: {
            type: String,
            required: true
        },
        accountHolderName: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'under_review'],
        default: 'pending'
    },
    // Admin-Seller Communication
    conversation: [{
        sender: {
            type: String,
            enum: ['admin', 'seller'],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    // Admin notes (private)
    adminNotes: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    rejectionReason: String
}, {
    timestamps: true
});

module.exports = mongoose.model('SellerRequest', sellerRequestSchema);
