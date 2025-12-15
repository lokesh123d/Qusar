import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Toast from '../components/Toast';
import SellerRequests from '../components/SellerRequests';
import UserManagement from '../components/UserManagement';
import PaymentSettings from '../components/PaymentSettings';
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

        // Initial fetch
        fetchSellerRequests();

        // Auto-refresh every 10 seconds to sync across multiple admins
        const interval = setInterval(() => {
            fetchSellerRequests(false); // Pass false to prevent showing loading state during auto-refresh
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [isAuthenticated, user, navigate]);

    const fetchSellerRequests = async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            // Use the new endpoint that works with SellerRequest model
            const { data } = await api.get('/admin/seller-requests-new');
            console.log('Seller requests:', data.requests);
            setSellerRequests(data.requests || []);
        } catch (error) {
            console.error('Error fetching seller requests:', error);
            setSellerRequests([]);
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleApproveSeller = async (requestId) => {
        try {
            // Use the new endpoint for SellerRequest model
            await api.post(`/admin/seller-requests/${requestId}/approve`);
            showToast('Seller approved successfully!', 'success');
            // Remove from list immediately
            setSellerRequests(sellerRequests.filter(r => r._id !== requestId));
        } catch (error) {
            console.error('Approve error:', error);
            showToast(error.response?.data?.message || 'Failed to approve seller', 'error');
        }
    };

    const handleRejectSeller = async (requestId) => {
        if (!rejectionReason.trim()) {
            showToast('Please enter rejection reason', 'error');
            return;
        }

        try {
            // Use the new endpoint for SellerRequest model
            await api.post(`/admin/seller-requests/${requestId}/reject`, { reason: rejectionReason });
            showToast('Seller request rejected', 'success');
            // Remove from list immediately
            setSellerRequests(sellerRequests.filter(r => r._id !== requestId));
            setShowRejectForm(null);
            setRejectionReason('');
        } catch (error) {
            console.error('Reject error:', error);
            showToast(error.response?.data?.message || 'Failed to reject seller', 'error');
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
                        {sellerRequests.map((request) => (
                            <div key={request._id} className="seller-request-card">
                                <div className="card-header">
                                    <div className="seller-info">
                                        <img
                                            src={request.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.user?.name || 'User')}&background=6366f1&color=fff`}
                                            alt={request.user?.name}
                                            className="seller-avatar"
                                        />
                                        <div>
                                            <h3>{request.user?.name}</h3>
                                            <p className="seller-email">{request.user?.email}</p>
                                        </div>
                                    </div>
                                    <span className="request-date">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="label">Business Name:</span>
                                        <span className="value">{request.businessName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Business Address:</span>
                                        <span className="value">{request.businessAddress}</span>
                                    </div>
                                    {request.gstNumber && (
                                        <div className="info-row">
                                            <span className="label">GST Number:</span>
                                            <span className="value">{request.gstNumber}</span>
                                        </div>
                                    )}
                                    <div className="info-row">
                                        <span className="label">Account Holder:</span>
                                        <span className="value">{request.bankDetails?.accountHolderName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Account Number:</span>
                                        <span className="value">****{request.bankDetails?.accountNumber?.slice(-4)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">IFSC Code:</span>
                                        <span className="value">{request.bankDetails?.ifscCode}</span>
                                    </div>
                                </div>

                                {showRejectForm === request._id ? (
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
                                                onClick={() => handleRejectSeller(request._id)}
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
                                            onClick={() => handleApproveSeller(request._id)}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setShowRejectForm(request._id)}
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

            {/* Payment Settings */}
            <div className="dashboard-content">
                <PaymentSettings />
            </div>
        </div>
    );
};

export default AdminDashboard;
