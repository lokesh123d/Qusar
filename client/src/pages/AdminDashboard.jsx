import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Toast from '../components/Toast';
import SellerRequests from '../components/SellerRequests';
import UserManagement from '../components/UserManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [sellerRequests, setSellerRequests] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [showRejectForm, setShowRejectForm] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin')) {
            navigate('/');
            return;
        }
        fetchSellerRequests();
    }, [isAuthenticated, user, navigate]);

    const fetchSellerRequests = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/seller-requests');
            setSellerRequests(data.sellers || []);
        } catch (error) {
            console.error('Error fetching seller requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleApproveSeller = async (sellerId) => {
        try {
            await api.put(`/admin/approve-seller/${sellerId}`);
            showToast('Seller approved successfully!', 'success');
            // Remove from list immediately
            setSellerRequests(sellerRequests.filter(s => s._id !== sellerId));
        } catch (error) {
            showToast('Failed to approve seller', 'error');
        }
    };

    const handleRejectSeller = async (sellerId) => {
        if (!rejectionReason.trim()) {
            showToast('Please enter rejection reason', 'error');
            return;
        }

        try {
            await api.put(`/admin/reject-seller/${sellerId}`, { reason: rejectionReason });
            showToast('Seller request rejected', 'success');
            // Remove from list immediately
            setSellerRequests(sellerRequests.filter(s => s._id !== sellerId));
            setShowRejectForm(null);
            setRejectionReason('');
        } catch (error) {
            showToast('Failed to reject seller', 'error');
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
        <div className="container admin-dashboard">
            {toast.show && <Toast message={toast.message} type={toast.type} />}

            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                {user?.role === 'superadmin' && (
                    <span className="super-admin-badge">Super Admin</span>
                )}
            </div>

            <div className="dashboard-content">
                <div className="section-header">
                    <h2>Pending Seller Requests</h2>
                    <span className="count-badge">{sellerRequests.length} pending</span>
                </div>

                {sellerRequests.length === 0 ? (
                    <div className="empty-state">
                        <p>No pending seller requests</p>
                    </div>
                ) : (
                    <div className="requests-grid">
                        {sellerRequests.map((seller) => (
                            <div key={seller._id} className="seller-request-card">
                                <div className="card-header">
                                    <div className="seller-info">
                                        <img
                                            src={seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=6366f1&color=fff`}
                                            alt={seller.name}
                                            className="seller-avatar"
                                        />
                                        <div>
                                            <h3>{seller.name}</h3>
                                            <p className="seller-email">{seller.email}</p>
                                        </div>
                                    </div>
                                    <span className="request-date">
                                        {new Date(seller.sellerInfo?.requestedAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="label">Business Name:</span>
                                        <span className="value">{seller.sellerInfo?.businessName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Business Address:</span>
                                        <span className="value">{seller.sellerInfo?.businessAddress}</span>
                                    </div>
                                    {seller.sellerInfo?.gstNumber && (
                                        <div className="info-row">
                                            <span className="label">GST Number:</span>
                                            <span className="value">{seller.sellerInfo.gstNumber}</span>
                                        </div>
                                    )}
                                    <div className="info-row">
                                        <span className="label">Account Holder:</span>
                                        <span className="value">{seller.sellerInfo?.bankDetails?.accountHolderName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Account Number:</span>
                                        <span className="value">****{seller.sellerInfo?.bankDetails?.accountNumber?.slice(-4)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">IFSC Code:</span>
                                        <span className="value">{seller.sellerInfo?.bankDetails?.ifscCode}</span>
                                    </div>
                                </div>

                                {showRejectForm === seller._id ? (
                                    <div className="reject-form">
                                        <textarea
                                            className="form-control"
                                            placeholder="Enter rejection reason..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows="3"
                                        />
                                        <div className="reject-actions">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleRejectSeller(seller._id)}
                                            >
                                                Confirm Reject
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setShowRejectForm(null);
                                                    setRejectionReason('');
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="card-actions">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleApproveSeller(seller._id)}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setShowRejectForm(seller._id)}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Enhanced Seller Requests with Communication */}
            <div className="dashboard-content">
                <SellerRequests />
            </div>

            {/* User Management */}
            <div className="dashboard-content">
                <UserManagement />
            </div>
        </div>
    );
};

export default AdminDashboard;
