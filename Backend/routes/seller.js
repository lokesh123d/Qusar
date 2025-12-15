const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SellerRequest = require('../models/SellerRequest');
const { protect, seller } = require('../middleware/auth');

// Request to become a seller
router.post('/request', protect, async (req, res) => {
    try {
        const { businessName, businessAddress, gstNumber, bankDetails } = req.body;

        const user = await User.findById(req.user._id);

        if (user.role === 'seller') {
            return res.status(400).json({
                success: false,
                message: 'You are already a seller'
            });
        }

        // Check if there's already a pending request
        const existingRequest = await SellerRequest.findOne({
            user: req.user._id,
            status: { $in: ['pending', 'under_review'] }
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending seller request'
            });
        }

        // Create new seller request
        const sellerRequest = await SellerRequest.create({
            user: req.user._id,
            businessName,
            businessAddress,
            gstNumber,
            bankDetails
        });

        res.json({
            success: true,
            message: 'Seller request submitted successfully. Waiting for admin approval.',
            request: sellerRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting seller request',
            error: error.message
        });
    }
});

// Get seller dashboard stats
router.get('/dashboard', protect, seller, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ seller: req.user._id });
        const approvedProducts = await Product.countDocuments({ seller: req.user._id, approved: true });
        const pendingProducts = await Product.countDocuments({ seller: req.user._id, approved: false });

        // Get orders containing seller's products
        const orders = await Order.find({
            'items.product': { $in: await Product.find({ seller: req.user._id }).distinct('_id') }
        });

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        res.json({
            success: true,
            stats: {
                totalProducts,
                approvedProducts,
                pendingProducts,
                totalOrders,
                totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
});

// Get seller's products
router.get('/products', protect, seller, async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id });

        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// Add new product
router.post('/products', protect, seller, async (req, res) => {
    try {
        const productData = {
            ...req.body,
            seller: req.user._id,
            approved: false // Needs admin approval
        };

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: 'Product added successfully. Waiting for admin approval.',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding product',
            error: error.message
        });
    }
});

// Update product
router.put('/products/:id', protect, seller, async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        Object.assign(product, req.body);
        product.approved = false; // Needs re-approval after update

        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully. Waiting for admin approval.',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

// Delete product
router.delete('/products/:id', protect, seller, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
});

// Get seller's orders
router.get('/orders', protect, seller, async (req, res) => {
    try {
        const sellerProducts = await Product.find({ seller: req.user._id }).distinct('_id');

        const orders = await Order.find({
            'items.product': { $in: sellerProducts }
        }).populate('user', 'name email');

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

module.exports = router;
