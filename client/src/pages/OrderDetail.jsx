import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import api from '../utils/api';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrderDetails();
    }, [id, isAuthenticated, navigate]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data.order);
        } catch (error) {
            showToast('Failed to fetch order details', 'error');
            console.error(error);
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
                setOrder(prevOrder => ({
                    ...prevOrder,
                    orderStatus: 'Cancelled',
                    cancelledAt: new Date()
                }));
                showToast('✓ Order cancelled successfully', 'success');
            } else {
                showToast(data.message || 'Failed to cancel order', 'error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Failed to cancel order';
            showToast(errorMessage, 'error');
        } finally {
            setCancelling(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusSteps = () => {
        const steps = [
            { key: 'Pending', label: 'Processing', icon: <FiClock /> },
            { key: 'Processing', label: 'Packed', icon: <FiPackage /> },
            { key: 'Shipped', label: 'Shipped', icon: <FiTruck /> },
            { key: 'Delivered', label: 'Delivered', icon: <FiCheckCircle /> }
        ];

        const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        const currentIndex = statusOrder.indexOf(order?.orderStatus);

        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex
        }));
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container error-container">
                <p>Order not found</p>
                <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                    Back to Orders
                </button>
            </div>
        );
    }

    const steps = getStatusSteps();

    return (
        <div className="order-detail-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="order-detail-container">
                {/* Header */}
                <div className="detail-header">
                    <button className="back-button" onClick={() => navigate('/orders')}>
                        <FiArrowLeft /> Back to Orders
                    </button>
                    <h1>Order Details</h1>
                </div>

                {/* Order Status Section */}
                <div className="detail-section">
                    <div className="section-title-row">
                        <h2>Order Status</h2>
                        <span className={`status-badge-large status-${order.orderStatus.toLowerCase()}`}>
                            {order.orderStatus}
                        </span>
                    </div>

                    {/* Progress Tracker */}
                    {order.orderStatus !== 'Cancelled' && (
                        <div className="progress-tracker">
                            {steps.map((step, index) => (
                                <div key={step.key} className="progress-step">
                                    <div className={`step-icon ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                                        {step.icon}
                                    </div>
                                    <div className="step-label">{step.label}</div>
                                    {index < steps.length - 1 && (
                                        <div className={`step-line ${step.completed ? 'completed' : ''}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Order Info Grid */}
                    <div className="order-info-grid">
                        <div className="info-item">
                            <span className="info-label">Order ID:</span>
                            <span className="info-value">#{order._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Order Date:</span>
                            <span className="info-value">{formatDate(order.createdAt)}</span>
                        </div>
                        {order.deliveredAt && (
                            <div className="info-item">
                                <span className="info-label">Delivered Date:</span>
                                <span className="info-value">{formatDate(order.deliveredAt)}</span>
                            </div>
                        )}
                    </div>

                    {/* Cancel Button */}
                    {(order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
                        <button
                            className="cancel-order-btn"
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                    )}
                </div>

                {/* Order Items */}
                <div className="detail-section">
                    <h2>Order Items</h2>
                    <div className="items-table">
                        {order.items.map((item, index) => (
                            <div key={index} className="item-row-detail">
                                <div className="item-image-col">
                                    <img
                                        src={item.image || item.product?.images?.[0] || '/placeholder.jpg'}
                                        alt={item.name}
                                        className="item-image-detail"
                                    />
                                </div>
                                <div className="item-info-col">
                                    <h3>{item.name}</h3>
                                    <p className="item-quantity-detail">Quantity: {item.quantity}</p>
                                </div>
                                <div className="item-price-col">
                                    <div className="price-detail">₹{item.price.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="detail-section">
                    <h2>Shipping Address</h2>
                    <div className="address-box">
                        <p className="address-name">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        <p className="address-phone">📱 {order.shippingAddress.phone}</p>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="detail-section">
                    <h2>Payment Summary</h2>

                    <div className="payment-info-row">
                        <div className="payment-col">
                            <span className="payment-label">Payment Method:</span>
                            <span className="payment-value">
                                {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 ' + order.paymentMethod}
                            </span>
                        </div>
                        <div className="payment-col">
                            <span className="payment-label">Payment Status:</span>
                            <span className={`payment-status ${order.paymentStatus}`}>
                                {order.paymentStatus.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="summary-table">
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
                        <div className="summary-row total-row">
                            <span>Total Amount:</span>
                            <span className="total-amount">₹{order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
