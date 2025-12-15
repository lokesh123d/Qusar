import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPackage, FiHeart, FiCreditCard, FiSettings, FiLogOut, FiEdit2, FiMapPin, FiLock, FiBell, FiDollarSign, FiShoppingBag, FiAward, FiX, FiCamera } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import api from '../utils/api';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [toast, setToast] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        activeOrders: 0,
        rewardsPoints: 0
    });

    // Edit modals state
    const [editModal, setEditModal] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [isAuthenticated, navigate, user]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data.orders || []);

            // Calculate real stats
            const totalOrders = data.orders.length;
            const totalSpent = data.orders.reduce((sum, order) => sum + order.totalPrice, 0);
            const activeOrders = data.orders.filter(o =>
                o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
            ).length;

            setStats({
                totalOrders,
                totalSpent,
                activeOrders,
                rewardsPoints: Math.floor(totalSpent / 100)
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const { data } = await api.put('/users/profile', {
                name: formData.name,
                phone: formData.phone
            });

            if (data.success) {
                await refreshUser();
                showToast('✓ Profile updated successfully!', 'success');
                setEditModal(null);
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (formData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.put('/users/password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (data.success) {
                showToast('✓ Password updated successfully!', 'success');
                setEditModal(null);
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusIcon = (status) => {
        if (status === 'Delivered') return '✓';
        if (status === 'Cancelled') return '✗';
        if (status === 'Shipped') return '🚚';
        return '⏱';
    };

    const getLastMonthOrders = () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return orders.filter(o => new Date(o.createdAt) >= lastMonth).length;
    };

    const getLastMonthSpent = () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return orders
            .filter(o => new Date(o.createdAt) >= lastMonth)
            .reduce((sum, order) => sum + order.totalPrice, 0);
    };

    const calculateGrowth = (current, previous) => {
        if (previous === 0) return 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    const renderOverview = () => {
        const lastMonthOrders = getLastMonthOrders();
        const lastMonthSpent = getLastMonthSpent();
        const ordersGrowth = calculateGrowth(stats.totalOrders, stats.totalOrders - lastMonthOrders);
        const spentGrowth = calculateGrowth(stats.totalSpent, stats.totalSpent - lastMonthSpent);

        return (
            <div className="profile-overview">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiShoppingBag />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalOrders}</div>
                            <div className="stat-label">Total Orders</div>
                            <div className="stat-change">
                                {ordersGrowth > 0 ? '+' : ''}{ordersGrowth}% from last month
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiDollarSign />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">₹{stats.totalSpent.toLocaleString()}</div>
                            <div className="stat-label">Total Spent</div>
                            <div className="stat-change">
                                {spentGrowth > 0 ? '+' : ''}{spentGrowth}% from last month
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiPackage />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.activeOrders}</div>
                            <div className="stat-label">Active Orders</div>
                            <div className="stat-change">In transit</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiAward />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.rewardsPoints.toLocaleString()}</div>
                            <div className="stat-label">Rewards Points</div>
                            <div className="stat-change">
                                {Math.max(0, 250 - (stats.rewardsPoints % 250))} points to next tier
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="recent-orders-section">
                    <div className="section-header">
                        <h3>Recent Orders</h3>
                        <button className="view-all-btn" onClick={() => setActiveTab('orders')}>
                            View All →
                        </button>
                    </div>

                    <div className="orders-list">
                        {orders.length === 0 ? (
                            <p className="empty-message">No orders yet</p>
                        ) : (
                            orders.slice(0, 3).map((order) => (
                                <div key={order._id} className="order-item">
                                    <div className="order-icon">
                                        <FiPackage />
                                    </div>
                                    <div className="order-details">
                                        <div className="order-id">#{order._id.slice(-8).toUpperCase()}</div>
                                        <div className="order-date">{formatDate(order.createdAt)}</div>
                                        <div className="order-products">
                                            {order.items.slice(0, 2).map(item => item.name).join(', ')}
                                            {order.items.length > 2 && ` +${order.items.length - 2} more`}
                                        </div>
                                        <div className={`order-status status-${order.orderStatus.toLowerCase()}`}>
                                            {getStatusIcon(order.orderStatus)} {order.orderStatus}
                                        </div>
                                    </div>
                                    <div className="order-price">
                                        ₹{order.totalPrice.toFixed(2)}
                                    </div>
                                    <button className="track-btn" onClick={() => navigate(`/orders/${order._id}`)}>
                                        Track Order
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderOrders = () => (
        <div className="orders-section">
            <h2>My Orders</h2>
            <div className="orders-list">
                {orders.length === 0 ? (
                    <p className="empty-message">No orders yet. Start shopping!</p>
                ) : (
                    orders.map((order) => (
                        <div key={order._id} className="order-item">
                            <div className="order-icon">
                                <FiPackage />
                            </div>
                            <div className="order-details">
                                <div className="order-id">#{order._id.slice(-8).toUpperCase()}</div>
                                <div className="order-date">{formatDate(order.createdAt)}</div>
                                <div className="order-products">
                                    {order.items.map(item => item.name).join(', ')}
                                </div>
                                <div className={`order-status status-${order.orderStatus.toLowerCase()}`}>
                                    {getStatusIcon(order.orderStatus)} {order.orderStatus}
                                </div>
                            </div>
                            <div className="order-price">
                                ₹{order.totalPrice.toFixed(2)}
                            </div>
                            <button className="track-btn" onClick={() => navigate(`/orders/${order._id}`)}>
                                Track Order
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="settings-section">
            <h2>Account Settings</h2>

            {/* Personal Information */}
            <div className="settings-card">
                <div className="card-header">
                    <FiUser />
                    <h3>Personal Information</h3>
                </div>
                <div className="settings-row">
                    <span className="label">Full Name</span>
                    <span className="value">{user?.name}</span>
                    <button className="edit-btn" onClick={() => setEditModal('name')}>Edit</button>
                </div>
                <div className="settings-row">
                    <span className="label">Email Address</span>
                    <span className="value">{user?.email}</span>
                    <button className="edit-btn" disabled style={{ opacity: 0.5 }}>Verified</button>
                </div>
                <div className="settings-row">
                    <span className="label">Phone Number</span>
                    <span className="value">{user?.phone || 'Not set'}</span>
                    <button className="edit-btn" onClick={() => setEditModal('phone')}>Edit</button>
                </div>
            </div>

            {/* Security */}
            <div className="settings-card">
                <div className="card-header">
                    <FiLock />
                    <h3>Security</h3>
                </div>
                <div className="settings-row">
                    <span className="label">Password</span>
                    <span className="value">••••••••</span>
                    <button className="edit-btn" onClick={() => setEditModal('password')}>Change</button>
                </div>
                {user?.googleId && (
                    <div className="settings-row">
                        <span className="label">Google Account</span>
                        <span className="value enabled">Connected</span>
                        <button className="edit-btn" disabled style={{ opacity: 0.5 }}>Active</button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="profile-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="profile-container">
                {/* Sidebar */}
                <aside className="profile-sidebar">
                    <div className="sidebar-header">Dashboard</div>

                    <nav className="sidebar-nav">
                        <button
                            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <FiUser /> Overview
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <FiPackage /> My Orders
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                            onClick={() => navigate('/wishlist')}
                        >
                            <FiHeart /> Wishlist
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <FiSettings /> Settings
                        </button>
                        <button className="nav-item logout-btn" onClick={handleLogout}>
                            <FiLogOut /> Logout
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="profile-main">
                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-info">
                            <div className="profile-avatar-large">
                                {user?.avatar && user.avatar !== 'https://via.placeholder.com/150' ? (
                                    <img src={user.avatar} alt={user?.name} />
                                ) : (
                                    <FiUser />
                                )}
                            </div>
                            <div className="profile-details">
                                <h1>{user?.name}</h1>
                                <div className="profile-meta">
                                    <span>✉ {user?.email}</span>
                                    {user?.phone && <span>📱 {user.phone}</span>}
                                </div>
                            </div>
                        </div>
                        <button className="edit-profile-btn" onClick={() => setEditModal('profile')}>
                            <FiEdit2 /> Edit Profile
                        </button>
                    </div>

                    {/* Content based on active tab */}
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'orders' && renderOrders()}
                    {activeTab === 'settings' && renderSettings()}
                </main>
            </div>

            {/* Edit Modals */}
            {editModal && (
                <div className="modal-overlay" onClick={() => setEditModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {editModal === 'name' && 'Edit Name'}
                                {editModal === 'phone' && 'Edit Phone Number'}
                                {editModal === 'password' && 'Change Password'}
                                {editModal === 'profile' && 'Edit Profile'}
                            </h3>
                            <button className="modal-close" onClick={() => setEditModal(null)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-body">
                            {(editModal === 'name' || editModal === 'profile') && (
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            )}

                            {(editModal === 'phone' || editModal === 'profile') && (
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        placeholder="Enter your phone number"
                                        maxLength="10"
                                    />
                                </div>
                            )}

                            {editModal === 'password' && (
                                <>
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setEditModal(null)}>
                                Cancel
                            </button>
                            <button
                                className="btn-save"
                                onClick={editModal === 'password' ? handleUpdatePassword : handleUpdateProfile}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
