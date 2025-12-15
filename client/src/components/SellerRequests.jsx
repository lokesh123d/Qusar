import { useState, useEffect } from 'react';
import { FiMessageSquare, FiCheck, FiX, FiClock, FiSend } from 'react-icons/fi';
import api from '../utils/api';
import Toast from '../components/Toast';
import './SellerRequests.css';

const SellerRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/seller-requests');
            setRequests(data.requests || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg, type) => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setShowModal(true);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            await api.post(`/admin/seller-requests/${selectedRequest._id}/message`, {
                message: message.trim()
            });

            showToast('Message sent successfully', 'success');
            setMessage('');

            // Refresh the request
            const { data } = await api.get(`/admin/seller-requests/${selectedRequest._id}`);
            setSelectedRequest(data.request);
            fetchRequests();
        } catch (error) {
            showToast('Failed to send message', 'error');
        }
    };

    const handleApprove = async (requestId) => {
        if (!window.confirm('Are you sure you want to approve this seller request?')) return;

        try {
            setActionLoading(true);
            await api.post(`/admin/seller-requests/${requestId}/approve`);
            showToast('Seller request approved successfully', 'success');
            setShowModal(false);
            fetchRequests();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to approve request', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (requestId) => {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (!reason) return;

        try {
            setActionLoading(true);
            await api.post(`/admin/seller-requests/${requestId}/reject`, { reason });
            showToast('Seller request rejected', 'success');
            setShowModal(false);
            fetchRequests();
        } catch (error) {
            showToast('Failed to reject request', 'error');
        } finally {
            setActionLoading(false);
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
        <div className="seller-requests-section">
            {toast && <Toast message={toast.message} type={toast.type} />}

            <div className="section-header">
                <h2>Seller Requests ({requests.length})</h2>
            </div>

            {requests.length === 0 ? (
                <div className="empty-state">
                    <FiClock size={48} />
                    <p>No seller requests at the moment</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {requests.map((request) => (
                        <div key={request._id} className="request-card">
                            <div className="request-header">
                                <div>
                                    <h3>{request.user?.name || 'Unknown User'}</h3>
                                    <p className="request-email">{request.user?.email}</p>
                                </div>
                                <span className={`status-badge ${request.status}`}>
                                    {request.status === 'pending' && <FiClock />}
                                    {request.status === 'approved' && <FiCheck />}
                                    {request.status === 'rejected' && <FiX />}
                                    {request.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="request-details">
                                <div className="detail-row">
                                    <span className="label">Business:</span>
                                    <span className="value">{request.businessName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">GST:</span>
                                    <span className="value">{request.gstNumber || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Messages:</span>
                                    <span className="value">
                                        {request.conversation?.length || 0}
                                        {request.conversation?.length > 0 && (
                                            <FiMessageSquare style={{ marginLeft: '0.5rem' }} />
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="request-actions">
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleViewRequest(request)}
                                >
                                    View Details
                                </button>
                                {request.status === 'pending' && (
                                    <>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleApprove(request._id)}
                                            disabled={actionLoading}
                                        >
                                            <FiCheck /> Approve
                                        </button>
                                        <button
                                            className="btn btn-error btn-sm"
                                            onClick={() => handleReject(request._id)}
                                            disabled={actionLoading}
                                        >
                                            <FiX /> Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Request Detail Modal */}
            {showModal && selectedRequest && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Seller Request Details</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="request-detail-grid">
                                {/* Left: Request Info */}
                                <div className="request-info-section">
                                    <h3>Business Information</h3>
                                    <div className="info-group">
                                        <label>Business Name:</label>
                                        <p>{selectedRequest.businessName}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Business Address:</label>
                                        <p>{selectedRequest.businessAddress}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>GST Number:</label>
                                        <p>{selectedRequest.gstNumber || 'Not provided'}</p>
                                    </div>

                                    <h3>Bank Details</h3>
                                    <div className="info-group">
                                        <label>Account Holder:</label>
                                        <p>{selectedRequest.bankDetails?.accountHolderName}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Account Number:</label>
                                        <p>{selectedRequest.bankDetails?.accountNumber}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>IFSC Code:</label>
                                        <p>{selectedRequest.bankDetails?.ifscCode}</p>
                                    </div>

                                    <h3>User Information</h3>
                                    <div className="info-group">
                                        <label>Name:</label>
                                        <p>{selectedRequest.user?.name}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Email:</label>
                                        <p>{selectedRequest.user?.email}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Phone:</label>
                                        <p>{selectedRequest.user?.phone || 'Not provided'}</p>
                                    </div>

                                    {selectedRequest.status === 'pending' && (
                                        <div className="modal-actions">
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleApprove(selectedRequest._id)}
                                                disabled={actionLoading}
                                            >
                                                <FiCheck /> Approve Request
                                            </button>
                                            <button
                                                className="btn btn-error"
                                                onClick={() => handleReject(selectedRequest._id)}
                                                disabled={actionLoading}
                                            >
                                                <FiX /> Reject Request
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Conversation */}
                                <div className="conversation-section">
                                    <h3>Communication</h3>
                                    <div className="conversation-box">
                                        {selectedRequest.conversation && selectedRequest.conversation.length > 0 ? (
                                            selectedRequest.conversation.map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`message ${msg.sender === 'admin' ? 'admin-message' : 'seller-message'}`}
                                                >
                                                    <div className="message-header">
                                                        <span className="sender">
                                                            {msg.sender === 'admin' ? 'Admin' : 'Seller'}
                                                        </span>
                                                        <span className="timestamp">
                                                            {new Date(msg.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="message-content">{msg.message}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-messages">
                                                <FiMessageSquare size={32} />
                                                <p>No messages yet</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <form onSubmit={handleSendMessage} className="message-form">
                                        <textarea
                                            className="message-input"
                                            placeholder="Type your message to the seller..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows="3"
                                        />
                                        <button type="submit" className="btn btn-primary" disabled={!message.trim()}>
                                            <FiSend /> Send Message
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerRequests;
