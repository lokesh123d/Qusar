const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const PaymentSettings = require('../models/PaymentSettings');
const { protect, admin } = require('../middleware/auth');

// Get payment settings (public - only non-sensitive data)
router.get('/settings', async (req, res) => {
    try {
        let settings = await PaymentSettings.findOne();

        if (!settings) {
            // Create default settings
            settings = await PaymentSettings.create({});
        }

        res.json({
            success: true,
            settings: {
                razorpayEnabled: settings.razorpayEnabled,
                razorpayTestMode: settings.razorpayTestMode,
                razorpayKeyId: settings.razorpayKeyId, // Public key is safe to share
                codEnabled: settings.codEnabled,
                codMinAmount: settings.codMinAmount,
                codMaxAmount: settings.codMaxAmount,
                currency: settings.currency,
                shippingCharges: settings.shippingCharges,
                freeShippingAbove: settings.freeShippingAbove,
                taxPercentage: settings.taxPercentage
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payment settings',
            error: error.message
        });
    }
});

// Update payment settings (admin only)
router.put('/settings', protect, admin, async (req, res) => {
    try {
        let settings = await PaymentSettings.findOne();

        if (!settings) {
            settings = new PaymentSettings();
        }

        // Update fields
        const allowedFields = [
            'razorpayKeyId',
            'razorpayKeySecret',
            'razorpayEnabled',
            'razorpayTestMode',
            'codEnabled',
            'codMinAmount',
            'codMaxAmount',
            'currency',
            'shippingCharges',
            'freeShippingAbove',
            'taxPercentage'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        settings.updatedBy = req.user._id;
        await settings.save();

        res.json({
            success: true,
            message: 'Payment settings updated successfully',
            settings: {
                razorpayEnabled: settings.razorpayEnabled,
                razorpayTestMode: settings.razorpayTestMode,
                razorpayKeyId: settings.razorpayKeyId,
                codEnabled: settings.codEnabled,
                codMinAmount: settings.codMinAmount,
                codMaxAmount: settings.codMaxAmount,
                currency: settings.currency,
                shippingCharges: settings.shippingCharges,
                freeShippingAbove: settings.freeShippingAbove,
                taxPercentage: settings.taxPercentage
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating payment settings',
            error: error.message
        });
    }
});

// Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        // Get payment settings
        const settings = await PaymentSettings.findOne();

        if (!settings || !settings.razorpayEnabled) {
            return res.status(400).json({
                success: false,
                message: 'Razorpay payment is not enabled'
            });
        }

        if (!settings.razorpayKeyId || !settings.razorpayKeySecret) {
            return res.status(400).json({
                success: false,
                message: 'Razorpay keys not configured'
            });
        }

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: settings.razorpayKeyId,
            key_secret: settings.getDecryptedSecret()
        });

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: settings.currency,
            receipt: `order_${orderId}`,
            notes: {
                orderId: orderId
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: razorpayOrder,
            keyId: settings.razorpayKeyId
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating Razorpay order',
            error: error.message
        });
    }
});

// Verify Razorpay payment
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        // Get payment settings
        const settings = await PaymentSettings.findOne();

        if (!settings) {
            return res.status(400).json({
                success: false,
                message: 'Payment settings not found'
            });
        }

        // Verify signature
        const secret = settings.getDecryptedSecret();
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            // Update order status
            const order = await Order.findById(orderId);
            if (order) {
                order.paymentStatus = 'paid';
                order.paymentDetails = {
                    method: 'razorpay',
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    paidAt: Date.now()
                };
                await order.save();

                // Clear cart after successful payment
                await Cart.findOneAndDelete({ user: order.user });
            }

            res.json({
                success: true,
                message: 'Payment verified successfully',
                order
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
});

module.exports = router;
