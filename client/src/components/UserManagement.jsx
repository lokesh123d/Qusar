import { useState, useEffect } from 'react';
import { FiUsers, FiShield, FiUserCheck, FiUserX } from 'react-icons/fi';
import api from '../utils/api';
import Toast from '../components/Toast';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('admins'); // 'admins' or 'sellers'
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, sellersRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/sellers')
            ]);
            setUsers(usersRes.data.users || []);
            setSellers(sellersRes.data.sellers || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleMakeAdmin = async (userId) => {
        if (!window.confirm('Are you sure you want to make this user an admin?')) return;

        try {
            await api.post('/admin/create-admin', { userId });
            showToast('User promoted to admin successfully', 'success');
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create admin', 'error');
        }
    };

    const handleMakeSuperAdmin = async (userId) => {
        if (!window.confirm('Are you sure you want to make this user a super admin? This is a powerful role!')) return;

        try {
            await api.post('/admin/create-superadmin', { userId });
            showToast('User promoted to super admin successfully', 'success');
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create super admin', 'error');
        }
    };

    const handleRemoveSeller = async (sellerId) => {
        if (!window.confirm('Are you sure you want to remove seller status? This will revoke their selling privileges.')) return;

        try {
            await api.post('/admin/remove-seller', { userId: sellerId });
            showToast('Seller status removed successfully', 'success');
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to remove seller', 'error');
        }
    };

    const handleOpenMessageModal = (seller) => {
        setSelectedSeller(seller);
        setShowMessageModal(true);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            await api.post(`/admin/message-seller/${selectedSeller._id}`, {
                message: message.trim()
            });

            showToast('Message sent successfully', 'success');
            setShowMessageModal(false);
            setMessage('');
            setSelectedSeller(null);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to send message', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="user-management-section">
            {toast && <Toast message={toast.message} type={toast.type} />}

            <div className="section-header">
                <h2>User Management</h2>
            </div>

            {/* Tabs */}
            <div className="tabs-header">
                <button
                    className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admins')}
                >
                    <FiShield /> Admins ({users.filter(u => u.role === 'admin' || u.role === 'superadmin').length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'sellers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sellers')}
                >
                    <FiUserCheck /> Sellers ({sellers.length})
                </button>
            </div>

            {/* Admins Tab */}
            {activeTab === 'admins' && (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => u.role === 'admin' || u.role === 'superadmin').map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-cell">
                                            <img
                                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                                                alt={user.name}
                                                className="user-avatar"
                                            />
                                            <span className="user-name">{user.name}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || 'N/A'}</td>
                                    <td>
                                        <span className={`role-badge ${user.role}`}>
                                            {user.role === 'superadmin' && <FiShield />}
                                            {user.role === 'admin' && <FiShield />}
                                            {user.role === 'seller' && <FiUserCheck />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {user.role === 'user' && (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleMakeAdmin(user._id)}
                                                    >
                                                        Make Admin
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => handleMakeSuperAdmin(user._id)}
                                                    >
                                                        Make Super Admin
                                                    </button>
                                                </>
                                            )}
                                            {user.role === 'admin' && (
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleMakeSuperAdmin(user._id)}
                                                >
                                                    Make Super Admin
                                                </button>
                                            )}
                                            {(user.role === 'superadmin' || user.role === 'admin') && (
                                                <span className="text-muted">No actions</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Sellers Tab */}
            {activeTab === 'sellers' && (
                <div className="sellers-grid">
                    {sellers.length === 0 ? (
                        <div className="empty-state">
                            <FiUserCheck size={48} />
                            <p>No approved sellers yet</p>
                        </div>
                    ) : (
                        sellers.map((seller) => (
                            <div key={seller._id} className="seller-card">
                                <div className="seller-header">
                                    <img
                                        src={seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=10b981&color=fff`}
                                        alt={seller.name}
                                        className="seller-avatar"
                                    />
                                    <div>
                                        <h3>{seller.name}</h3>
                                        <p className="seller-email">{seller.email}</p>
                                    </div>
                                </div>
                                <div className="seller-details">
                                    <div className="detail-row">
                                        <span className="label">Business:</span>
                                        <span className="value">{seller.sellerInfo?.businessName || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">GST:</span>
                                        <span className="value">{seller.sellerInfo?.gstNumber || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Approved:</span>
                                        <span className="value">
                                            {seller.sellerInfo?.approvedAt
                                                ? new Date(seller.sellerInfo.approvedAt).toLocaleDateString()
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="seller-actions">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleOpenMessageModal(seller)}
                                    >
                                        💬 Message Seller
                                    </button>
                                    <button
                                        className="btn btn-error btn-sm"
                                        onClick={() => handleRemoveSeller(seller._id)}
                                    >
                                        ❌ Remove Seller
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && selectedSeller && (
                <div className="modal-overlay" onClick={() => {
                    setShowMessageModal(false);
                    setSelectedSeller(null);
                    setMessage('');
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Send Message to {selectedSeller.name}</h2>
                            <button className="modal-close" onClick={() => {
                                setShowMessageModal(false);
                                setSelectedSeller(null);
                                setMessage('');
                            }}>×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSendMessage}>
                                <div className="form-group">
                                    <label className="form-label">Your Message</label>
                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        placeholder="Type your message to the seller..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">
                                        Send Message
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowMessageModal(false);
                                            setSelectedSeller(null);
                                            setMessage('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default UserManagement;
