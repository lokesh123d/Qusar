const express = require('express');
const router = express.Router();
const { createNotification } = require('./notifications');
const { protect } = require('../middleware/auth');

// Test endpoint to create a notification
router.post('/test-notification', protect, async (req, res) => {
    try {
        const notification = await createNotification(
            req.user._id,
            'order_placed',
            'Test Notification',
            'This is a test notification to check if the system is working',
            null
        );

        res.json({
            success: true,
            message: 'Test notification created',
            notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating test notification',
            error: error.message
        });
    }
});

module.exports = router;
