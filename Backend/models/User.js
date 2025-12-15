const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password required only if not Google auth
        },
        minlength: [6, 'Password must be at least 6 characters']
    },
    googleId: {
        type: String,
        sparse: true
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    role: {
        type: String,
        enum: ['user', 'seller', 'admin', 'superadmin'],
        default: 'user'
    },
    phone: {
        type: String,
        default: ''
    },
    sellerInfo: {
        businessName: {
            type: String,
            default: ''
        },
        businessAddress: {
            type: String,
            default: ''
        },
        gstNumber: {
            type: String,
            default: ''
        },
        bankDetails: {
            accountNumber: String,
            ifscCode: String,
            accountHolderName: String
        },
        approved: {
            type: Boolean,
            default: false
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: Date,
        requestedAt: Date,
        rejectedAt: Date,
        rejectionReason: String
    },
    addresses: [{
        name: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        street: String,
        zipCode: String,
        country: String,
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
