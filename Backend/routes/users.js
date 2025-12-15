const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Configure multer for avatar upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/avatars';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, avatar } = req.body;

        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (avatar) user.avatar = avatar;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload profile picture
// @access  Private
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user._id);

        // Delete old avatar if exists and not a Google avatar
        if (user.avatar && user.avatar.startsWith('/uploads/')) {
            const oldPath = path.join(__dirname, '..', user.avatar);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new avatar path
        user.avatar = '/uploads/avatars/' + req.file.filename;
        await user.save();

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatar: user.avatar
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading avatar',
            error: error.message
        });
    }
});

// @route   PUT /api/users/password
// @desc    Update password
// @access  Private
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const user = await User.findById(req.user._id);

        // Check if user has password (not Google-only account)
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change password for Google-authenticated accounts'
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating password',
            error: error.message
        });
    }
});

// @route   POST /api/users/address
// @desc    Add address
// @access  Private
router.post('/address', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // If this is the first address or marked as default, set it as default
        if (user.addresses.length === 0 || req.body.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
            req.body.isDefault = true;
        }

        user.addresses.push(req.body);
        await user.save();

        res.json({
            success: true,
            message: 'Address added successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding address',
            error: error.message
        });
    }
});

// @route   PUT /api/users/address/:addressId
// @desc    Update address
// @access  Private
router.put('/address/:addressId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const address = user.addresses.id(req.params.addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        Object.assign(address, req.body);

        if (req.body.isDefault) {
            user.addresses.forEach(addr => {
                if (addr._id.toString() !== req.params.addressId) {
                    addr.isDefault = false;
                }
            });
        }

        await user.save();

        res.json({
            success: true,
            message: 'Address updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating address',
            error: error.message
        });
    }
});

// @route   DELETE /api/users/address/:addressId
// @desc    Delete address
// @access  Private
router.delete('/address/:addressId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== req.params.addressId
        );

        await user.save();

        res.json({
            success: true,
            message: 'Address deleted successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting address',
            error: error.message
        });
    }
});

// @route   POST /api/users/wishlist/:productId
// @desc    Add to wishlist
// @access  Private
router.post('/wishlist/:productId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.wishlist.includes(req.params.productId)) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        user.wishlist.push(req.params.productId);
        await user.save();

        res.json({
            success: true,
            message: 'Added to wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding to wishlist',
            error: error.message
        });
    }
});

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove from wishlist
// @access  Private
router.delete('/wishlist/:productId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.wishlist = user.wishlist.filter(
            id => id.toString() !== req.params.productId
        );

        await user.save();

        res.json({
            success: true,
            message: 'Removed from wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing from wishlist',
            error: error.message
        });
    }
});

// @route   GET /api/users/wishlist
// @desc    Get wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('wishlist');

        res.json({
            success: true,
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching wishlist',
            error: error.message
        });
    }
});

module.exports = router;
