import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrderDetail();
    }, [id, isAuthenticated, navigate]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data.order);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            setCancelling(true);
            const { data } = await api.put(`/orders/${id}/cancel`);
            if (data.success) {
                setOrder({ ...order, orderStatus: 'Cancelled' });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'warning',
            'Processing': 'info',
            'Shipped': 'primary',
            'Delivered': 'success',
            'Cancelled': 'error'
        };
        return colors[status] || 'secondary';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Pending': '⏳',
            'Processing': '📦',
            'Shipped': '🚚',
            'Delivered': '',
            'Cancelled': ''
        };
        return icons[status] || '📋';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOrderProgress = (status) => {
        const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        const currentIndex = steps.indexOf(status);
        return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container error-container">
                <div className="error-card">
                    <p>Warning: {error || 'Order not found'}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container order-detail-page">
            <div className="page-header">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/orders')}>
                    ← Back to Orders
                </button>
                <h1>Order Details</h1>
            </div>

            <div className="order-detail-layout">
                {/* Order Status Section */}
                <div className="detail-card status-card">
                    <div className="card-header">
                        <h3>Order Status</h3>
                        <span className={`badge badge-${getStatusColor(order.orderStatus)}`}>
                            {getStatusIcon(order.orderStatus)} {order.orderStatus}
                        </span>
                    </div>

                    {order.orderStatus !== 'Cancelled' && (
                        <div className="progress-tracker">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${getOrderProgress(order.orderStatus)}%` }}
                                ></div>
                            </div>
                            <div className="progress-steps">
                                <div className={`step ${['Pending', 'Processing', 'Shipped', 'Delivered'].includes(order.orderStatus) ? 'active' : ''}`}>
                                    <div className="step-icon">📝</div>
                                    <p>Pending</p>
                                </div>
                                <div className={`step ${['Processing', 'Shipped', 'Delivered'].includes(order.orderStatus) ? 'active' : ''}`}>
                                    <div className="step-icon">📦</div>
                                    <p>Processing</p>
                                </div>
                                <div className={`step ${['Shipped', 'Delivered'].includes(order.orderStatus) ? 'active' : ''}`}>
                                    <div className="step-icon">🚚</div>
                                    <p>Shipped</p>
                                </div>
                                <div className={`step ${order.orderStatus === 'Delivered' ? 'active' : ''}`}>
                                    <div className="step-icon"></div>
                                    <p>Delivered</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="order-meta">
                        <div className="meta-item">
                            <span className="meta-label">Order ID:</span>
                            <span className="meta-value">#{order._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Order Date:</span>
                            <span className="meta-value">{formatDate(order.createdAt)}</span>
                        </div>
                        {order.deliveredAt && (
                            <div className="meta-item">
                                <span className="meta-label">Delivered On:</span>
                                <span className="meta-value">{formatDate(order.deliveredAt)}</span>
                            </div>
                        )}
                    </div>

                    {(order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
                        <button
                            className="btn btn-outline cancel-order-btn"
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                    )}
                </div>

                {/* Order Items */}
                <div className="detail-card">
                    <h3>Order Items</h3>
                    <div className="order-items-list">
                        {order.items.map((item, index) => (
                            <div key={index} className="order-detail-item">
                                <img
                                    src={item.image || item.product?.images?.[0] || '/placeholder.jpg'}
                                    alt={item.name}
                                />
                                <div className="item-info">
                                    <h4>{item.name}</h4>
                                    <p className="item-qty">Quantity: {item.quantity}</p>
                                    <p className="item-price">₹{item.price.toFixed(2)} each</p>
                                </div>
                                <div className="item-total">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="detail-card">
                    <h3>Shipping Address</h3>
                    <div className="address-info">
                        <p className="address-name">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        <p className="address-phone">📞 {order.shippingAddress.phone}</p>
                    </div>
                </div>

                {/* Payment & Price Summary */}
                <div className="detail-card">
                    <h3>Payment Summary</h3>
                    <div className="payment-info">
                        <div className="payment-method">
                            <span>Payment Method:</span>
                            <span className="method-badge">{order.paymentMethod}</span>
                        </div>
                        <div className="payment-status">
                            <span>Payment Status:</span>
                            <span className={`badge badge-${order.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                                {order.paymentStatus}
                            </span>
                        </div>
                    </div>

                    <div className="price-summary">
                        <div className="summary-row">
                            <span>Items Price:</span>
                            <span>₹{order.itemsPrice.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping:</span>
                            <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toFixed(2)}`}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (18%):</span>
                            <span>₹{order.taxPrice.toFixed(2)}</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total-row">
                            <span>Total Amount:</span>
                            <span>₹{order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
