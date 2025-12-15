import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user: authUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile state
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: ''
    });

    // Address state
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    // Wishlist state
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchUserData();
    }, [isAuthenticated, navigate]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/profile');
            const userData = data.user;

            setProfileData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                avatar: userData.avatar || '' // Add avatar to profileData
            });
            setAddresses(userData.addresses || []);

            // Fetch wishlist
            const wishlistRes = await api.get('/users/wishlist');
            setWishlist(wishlistRes.data.wishlist || []);
        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await api.put('/users/profile', profileData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingAddress) {
                await api.put(`/users/address/${editingAddress}`, addressForm);
                setMessage({ type: 'success', text: 'Address updated successfully!' });
            } else {
                await api.post('/users/address', addressForm);
                setMessage({ type: 'success', text: 'Address added successfully!' });
            }

            fetchUserData();
            setShowAddressForm(false);
            setEditingAddress(null);
            resetAddressForm();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save address' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            await api.delete(`/users/address/${addressId}`);
            setMessage({ type: 'success', text: 'Address deleted successfully!' });
            fetchUserData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete address' });
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address._id);
        setAddressForm({
            fullName: address.fullName,
            phone: address.phone,
            address: address.address,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: address.isDefault
        });
        setShowAddressForm(true);
    };

    const resetAddressForm = () => {
        setAddressForm({
            fullName: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false
        });
    };

    const handleRemoveFromWishlist = async (productId) => {
        try {
            await api.delete(`/users/wishlist/${productId}`);
            setWishlist(wishlist.filter(item => item._id !== productId));
            setMessage({ type: 'success', text: 'Removed from wishlist!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to remove from wishlist' });
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image size should be less than 2MB' });
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setLoading(true);
            const { data } = await api.post('/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ type: 'success', text: 'Profile picture updated!' });

            // Refresh user data to get new avatar
            await fetchUserData();

            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profileData.email) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container profile-page">
            <h1 className="page-title">My Profile</h1>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.type === 'success' ? '' : 'Warning:'} {message.text}
                </div>
            )}

            <div className="profile-layout">
                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="profile-avatar">
                        <div className="avatar-image-container">
                            <img
                                src={profileData.avatar || authUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=6366f1&color=fff&size=150`}
                                alt="Profile"
                                className="avatar-img"
                            />
                            <label htmlFor="avatar-upload" className="avatar-upload-btn" title="Change profile picture">
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleAvatarChange}
                                />
                                Change Photo
                            </label>
                        </div>
                        <h3>{profileData.name || 'User'}</h3>
                        <p>{profileData.email}</p>
                    </div>

                    <nav className="profile-nav">
                        <button
                            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            👤 Personal Information
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                            onClick={() => setActiveTab('addresses')}
                        >
                            Addresses
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                            onClick={() => setActiveTab('wishlist')}
                        >
                            Wishlist ({wishlist.length})
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="profile-content">
                    {/* Personal Information Tab */}
                    {activeTab === 'profile' && (
                        <div className="content-card">
                            <h2>Personal Information</h2>
                            <form onSubmit={handleProfileUpdate} className="profile-form">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={profileData.email}
                                        disabled
                                    />
                                    <small className="form-hint">Email cannot be changed</small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Addresses Tab */}
                    {activeTab === 'addresses' && (
                        <div className="content-card">
                            <div className="card-header-flex">
                                <h2>Saved Addresses</h2>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setShowAddressForm(true);
                                        setEditingAddress(null);
                                        resetAddressForm();
                                    }}
                                >
                                    + Add New Address
                                </button>
                            </div>

                            {showAddressForm && (
                                <form onSubmit={handleAddressSubmit} className="address-form">
                                    <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={addressForm.fullName}
                                                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={addressForm.phone}
                                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                maxLength="10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Address</label>
                                        <textarea
                                            className="form-control"
                                            value={addressForm.address}
                                            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                            rows="3"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">City</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">State</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Pincode</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={addressForm.pincode}
                                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                maxLength="6"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={addressForm.isDefault}
                                                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                            />
                                            Set as default address
                                        </label>
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save Address'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowAddressForm(false);
                                                setEditingAddress(null);
                                                resetAddressForm();
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="addresses-list">
                                {addresses.length === 0 ? (
                                    <div className="empty-state">
                                        <p> No saved addresses yet</p>
                                    </div>
                                ) : (
                                    addresses.map((addr) => (
                                        <div key={addr._id} className="address-card">
                                            {addr.isDefault && <span className="default-badge">Default</span>}
                                            <h4>{addr.fullName}</h4>
                                            <p>{addr.address}</p>
                                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                            <p className="address-phone">📞 {addr.phone}</p>
                                            <div className="address-actions">
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEditAddress(addr)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleDeleteAddress(addr._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Wishlist Tab */}
                    {activeTab === 'wishlist' && (
                        <div className="content-card">
                            <h2>My Wishlist</h2>
                            {wishlist.length === 0 ? (
                                <div className="empty-state">
                                    <p> Your wishlist is empty</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/products')}>
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                <div className="wishlist-grid">
                                    {wishlist.map((product) => (
                                        <div key={product._id} className="wishlist-item">
                                            <img
                                                src={product.images?.[0] || '/placeholder.jpg'}
                                                alt={product.name}
                                                onClick={() => navigate(`/products/${product._id}`)}
                                            />
                                            <div className="wishlist-item-info">
                                                <h4 onClick={() => navigate(`/products/${product._id}`)}>
                                                    {product.name}
                                                </h4>
                                                <p className="wishlist-price">₹{product.price?.toFixed(2)}</p>
                                                <div className="wishlist-actions">
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => navigate(`/products/${product._id}`)}
                                                    >
                                                        View Product
                                                    </button>
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => handleRemoveFromWishlist(product._id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
