const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Admin only access
exports.admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
};

// Super Admin only access
exports.superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin only.'
        });
    }
};

// Seller only access (approved sellers)
exports.seller = (req, res, next) => {
    if (req.user && req.user.role === 'seller' && req.user.sellerInfo && req.user.sellerInfo.approved) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Approved seller only.'
        });
    }
};

// Admin or Seller access
exports.adminOrSeller = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin' ||
        (req.user.role === 'seller' && req.user.sellerInfo && req.user.sellerInfo.approved))) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin or approved seller only.'
        });
    }
};

// Generate JWT Token
exports.generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};
