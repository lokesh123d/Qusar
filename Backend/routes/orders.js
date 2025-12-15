const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const { createNotification } = require('./notifications');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Validate stock for all items
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.product.name}`
                });
            }
        }

        // Calculate prices
        const itemsPrice = cart.totalAmount;
        const shippingPrice = itemsPrice > 500 ? 0 : 40;
        const taxPrice = Number((itemsPrice * 0.18).toFixed(2));
        const totalPrice = itemsPrice + shippingPrice + taxPrice;

        // Create order items and get seller from first product
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.images[0],
            quantity: item.quantity,
            price: item.price
        }));

        // Get seller from first product (assuming all products from same seller for now)
        let seller = null;
        try {
            const firstProductId = cart.items[0].product._id || cart.items[0].product;
            console.log('Fetching seller for product:', firstProductId);
            const firstProduct = await Product.findById(firstProductId).populate('seller');
            if (firstProduct && firstProduct.seller) {
                seller = firstProduct.seller;
                console.log('Seller found:', seller._id, seller.name);
            } else {
                console.log('Product has no seller assigned');
            }
        } catch (sellerError) {
            console.error('Error fetching seller:', sellerError);
        }

        // Create order
        const order = new Order({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            seller: seller?._id,
            orderStatus: 'Pending',
            paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
            trackingInfo: {
                sellerLocation: {
                    lat: 29.3803, // Nainital coordinates
                    lng: 79.4636,
                    address: 'Nainital, Uttarakhand'
                }
            }
        });

        await order.save();

        // Send notification to seller or admin
        try {
            if (seller) {
                console.log('Sending notification to seller:', seller._id);
                await createNotification(
                    seller._id,
                    'order_placed',
                    'New Order Received!',
                    `You have received a new order #${order.orderNumber} worth ₹${totalPrice.toFixed(2)}`,
                    order._id
                );
                console.log('Notification sent successfully to seller');
            } else {
                console.log('No seller found for product, finding admin...');
                // If no seller, send to admin
                const User = require('../models/User');
                const admin = await User.findOne({ role: 'admin' });
                if (admin) {
                    console.log('Sending notification to admin:', admin._id);
                    await createNotification(
                        admin._id,
                        'order_placed',
                        'New Order Received!',
                        `New order #${order.orderNumber} worth ₹${totalPrice.toFixed(2)} (No seller assigned)`,
                        order._id
                    );
                    console.log('Notification sent to admin');
                }
            }
        } catch (notifError) {
            console.error('Error sending notification:', notifError);
            // Don't fail the order if notification fails
        }

        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear cart only for COD
        if (paymentMethod === 'COD') {
            await Cart.findOneAndDelete({ user: req.user._id });
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name images');

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

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Can only cancel if not shipped
        if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel shipped or delivered orders'
            });
        }

        order.orderStatus = 'Cancelled';
        order.cancelledAt = Date.now();

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        await order.save();

        // Notify seller if order was assigned to one
        if (order.seller) {
            await createNotification(
                order.seller,
                'order_cancelled',
                'Order Cancelled',
                `Order #${order.orderNumber} has been cancelled by the customer.`,
                order._id
            );
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling order',
            error: error.message
        });
    }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .populate('items.product', 'name');

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

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.orderStatus = orderStatus;
        if (orderStatus === 'Delivered') {
            order.deliveredAt = Date.now();
            order.paymentStatus = 'paid';
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

// @route   PUT /api/orders/:id/confirm
// @desc    Seller confirms order
// @access  Private (Seller only)
router.put('/:id/confirm', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is the seller
        if (order.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to confirm this order'
            });
        }

        if (order.sellerConfirmed) {
            return res.status(400).json({
                success: false,
                message: 'Order already confirmed'
            });
        }

        order.sellerConfirmed = true;
        order.sellerConfirmedAt = Date.now();
        order.orderStatus = 'Processing';
        await order.save();

        // Notify user
        await createNotification(
            order.user._id,
            'order_confirmed',
            'Order Confirmed!',
            `Your order #${order.orderNumber} has been confirmed by the seller and is being processed.`,
            order._id
        );

        res.json({
            success: true,
            message: 'Order confirmed successfully',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error confirming order',
            error: error.message
        });
    }
});

// @route   PUT /api/orders/:id/reject
// @desc    Seller rejects order
// @access  Private (Seller only)
router.put('/:id/reject', protect, async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id).populate('user');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is the seller
        if (order.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reject this order'
            });
        }

        if (order.sellerConfirmed) {
            return res.status(400).json({
                success: false,
                message: 'Cannot reject confirmed order'
            });
        }

        order.rejectedBySeller = true;
        order.rejectionReason = reason || 'No reason provided';
        order.orderStatus = 'Rejected';
        await order.save();

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        // Notify user
        await createNotification(
            order.user._id,
            'order_rejected',
            'Order Rejected',
            `Your order #${order.orderNumber} has been rejected by the seller. Reason: ${order.rejectionReason}`,
            order._id
        );

        res.json({
            success: true,
            message: 'Order rejected',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting order',
            error: error.message
        });
    }
});

module.exports = router;
