const mongoose = require('mongoose');
const crypto = require('crypto');

const paymentSettingsSchema = new mongoose.Schema({
    // Razorpay Settings
    razorpayKeyId: {
        type: String,
        default: ''
    },
    razorpayKeySecret: {
        type: String,
        default: ''
    },
    razorpayEnabled: {
        type: Boolean,
        default: false
    },
    razorpayTestMode: {
        type: Boolean,
        default: true
    },

    // COD Settings
    codEnabled: {
        type: Boolean,
        default: true
    },
    codMinAmount: {
        type: Number,
        default: 0
    },
    codMaxAmount: {
        type: Number,
        default: 50000
    },

    // General Settings
    currency: {
        type: String,
        default: 'INR'
    },
    shippingCharges: {
        type: Number,
        default: 0
    },
    freeShippingAbove: {
        type: Number,
        default: 500
    },
    taxPercentage: {
        type: Number,
        default: 0
    },

    // Metadata
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Encrypt Razorpay Secret before saving
paymentSettingsSchema.pre('save', function (next) {
    if (this.isModified('razorpayKeySecret') && this.razorpayKeySecret) {
        try {
            // Use modern encryption with AES-256-CBC
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync(process.env.JWT_SECRET || 'default-secret', 'salt', 32);
            const iv = crypto.randomBytes(16);

            const cipher = crypto.createCipheriv(algorithm, key, iv);
            let encrypted = cipher.update(this.razorpayKeySecret, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Store IV with encrypted data (separated by :)
            this.razorpayKeySecret = iv.toString('hex') + ':' + encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
        }
    }
    next();
});

// Decrypt Razorpay Secret
paymentSettingsSchema.methods.getDecryptedSecret = function () {
    if (!this.razorpayKeySecret) return '';
    try {
        const parts = this.razorpayKeySecret.split(':');
        if (parts.length !== 2) return this.razorpayKeySecret; // Not encrypted, return as is

        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.JWT_SECRET || 'default-secret', 'salt', 32);
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return '';
    }
};

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
