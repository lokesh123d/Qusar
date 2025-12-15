const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const SellerRequest = require('../models/SellerRequest');
const { protect, admin, superAdmin } = require('../middleware/auth');

// Get all seller requests (pending approval)
router.get('/seller-requests', protect, admin, async (req, res) => {
    try {
        const sellers = await User.find({
            'sellerInfo.requestedAt': { $exists: true },
            'sellerInfo.approved': false,
            'sellerInfo.rejectedAt': { $exists: false }
        }).select('-password');

        res.json({
            success: true,
            sellers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching seller requests',
            error: error.message
        });
    }
});

// Approve seller
router.put('/approve-seller/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.role = 'seller';
        user.sellerInfo.approved = true;
        user.sellerInfo.approvedBy = req.user._id;
        user.sellerInfo.approvedAt = Date.now();

        await user.save();

        res.json({
            success: true,
            message: 'Seller approved successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error approving seller',
            error: error.message
        });
    }
});

// Reject seller
router.put('/reject-seller/:id', protect, admin, async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.sellerInfo.rejectedAt = Date.now();
        user.sellerInfo.rejectionReason = reason || 'Not specified';

        await user.save();

        res.json({
            success: true,
            message: 'Seller request rejected',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting seller',
            error: error.message
        });
    }
});

// Create admin (superadmin only)
router.post('/create-admin', protect, superAdmin, async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.role = 'admin';
        await user.save();

        res.json({
            success: true,
            message: 'Admin created successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating admin',
            error: error.message
        });
    }
});

// Create superadmin (superadmin only)
router.post('/create-superadmin', protect, superAdmin, async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.role = 'superadmin';
        await user.save();

        res.json({
            success: true,
            message: 'Super admin created successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating super admin',
            error: error.message
        });
    }
});

// Get all users
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Get all sellers
router.get('/sellers', protect, admin, async (req, res) => {
    try {
        const sellers = await User.find({
            role: 'seller',
            'sellerInfo.approved': true
        }).select('-password');

        res.json({
            success: true,
            sellers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sellers',
            error: error.message
        });
    }
});

// Get pending products (for approval)
router.get('/pending-products', protect, admin, async (req, res) => {
    try {
        const products = await Product.find({
            approved: false
        }).populate('seller', 'name email sellerInfo.businessName');

        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pending products',
            error: error.message
        });
    }
});

// Approve product
router.put('/approve-product/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.approved = true;
        product.approvedBy = req.user._id;
        product.approvedAt = Date.now();

        await product.save();

        res.json({
            success: true,
            message: 'Product approved successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error approving product',
            error: error.message
        });
    }
});

// Reject/Delete product
router.delete('/reject-product/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product rejected and deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting product',
            error: error.message
        });
    }
});

// ==================== NEW SELLER REQUEST ROUTES ====================

// Get all seller requests (with SellerRequest model)
router.get('/seller-requests-new', protect, admin, async (req, res) => {
    try {
        const requests = await SellerRequest.find()
            .populate('user', 'name email phone avatar')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching seller requests',
            error: error.message
        });
    }
});

// Get single seller request
router.get('/seller-requests/:id', protect, admin, async (req, res) => {
    try {
        const request = await SellerRequest.findById(req.params.id)
            .populate('user', 'name email phone avatar')
            .populate('reviewedBy', 'name');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Seller request not found'
            });
        }

        res.json({
            success: true,
            request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching seller request',
            error: error.message
        });
    }
});

// Send message to seller
router.post('/seller-requests/:id/message', protect, admin, async (req, res) => {
    try {
        const { message } = req.body;
        const request = await SellerRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Seller request not found'
            });
        }

        request.conversation.push({
            sender: 'admin',
            message,
            timestamp: Date.now()
        });

        await request.save();

        res.json({
            success: true,
            message: 'Message sent successfully',
            request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
});

// Approve seller request
router.post('/seller-requests/:id/approve', protect, admin, async (req, res) => {
    try {
        const request = await SellerRequest.findById(req.params.id).populate('user');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Seller request not found'
            });
        }

        if (request.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Request already approved'
            });
        }

        // Update request status
        request.status = 'approved';
        request.reviewedBy = req.user._id;
        request.reviewedAt = Date.now();
        await request.save();

        // Update user role to seller
        const user = await User.findById(request.user._id);
        if (user) {
            user.role = 'seller';
            user.sellerInfo = {
                businessName: request.businessName,
                businessAddress: request.businessAddress,
                gstNumber: request.gstNumber,
                bankDetails: request.bankDetails,
                approved: true,
                approvedBy: req.user._id,
                approvedAt: Date.now()
            };
            await user.save();
        }

        res.json({
            success: true,
            message: 'Seller request approved successfully',
            request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error approving seller request',
            error: error.message
        });
    }
});

// Reject seller request
router.post('/seller-requests/:id/reject', protect, admin, async (req, res) => {
    try {
        const { reason } = req.body;
        const request = await SellerRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Seller request not found'
            });
        }

        request.status = 'rejected';
        request.rejectionReason = reason || 'Not specified';
        request.reviewedBy = req.user._id;
        request.reviewedAt = Date.now();
        await request.save();

        res.json({
            success: true,
            message: 'Seller request rejected',
            request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting seller request',
            error: error.message
        });
    }
});

// Remove seller status
router.post('/remove-seller', protect, admin, async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'seller') {
            return res.status(400).json({
                success: false,
                message: 'User is not a seller'
            });
        }

        // Change role back to user
        user.role = 'user';
        user.sellerInfo = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Seller status removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing seller status',
            error: error.message
        });
    }
});

// Get seller request by user ID
router.get('/seller-request-by-user/:userId', protect, admin, async (req, res) => {
    try {
        const request = await SellerRequest.findOne({ user: req.params.userId })
            .populate('user', 'name email phone avatar')
            .populate('reviewedBy', 'name');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Seller request not found'
            });
        }

        res.json({
            success: true,
            request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching seller request',
            error: error.message
        });
    }
});

// Send message to seller by user ID
router.post('/message-seller/:userId', protect, admin, async (req, res) => {
    try {
        const { message } = req.body;
        const request = await SellerRequest.findOne({ user: req.params.userId });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Seller request not found for this user'
            });
        }

        request.conversation.push({
            sender: 'admin',
            message,
            timestamp: Date.now()
        });

        await request.save();

        res.json({
            success: true,
            message: 'Message sent successfully',
            request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
});

module.exports = router;
