import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders');
            setOrders(data.orders || []);
        } catch (err) {
            setError('Failed to fetch orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': '#fbbf24',
            'Processing': '#60a5fa',
            'Shipped': '#a78bfa',
            'Delivered': '#34d399',
            'Cancelled': '#f87171'
        };
        return colors[status] || '#9ca3af';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container error-container">
                <div className="error-card">
                    <p>⚠ {error}</p>
                    <button className="btn btn-primary" onClick={fetchOrders}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container orders-empty">
                <div className="empty-orders-card">
                    <div className="empty-icon">📦</div>
                    <h2>No Orders Yet</h2>
                    <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/products')}>
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page-new">
            <div className="orders-container">
                <div className="orders-header-new">
                    <h1>My Orders</h1>
                    <p className="orders-subtitle">Track and manage your orders</p>
                </div>

                <div className="orders-grid">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card-new">
                            {/* Order Header */}
                            <div className="order-card-header">
                                <div className="order-info-left">
                                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                                    <p className="order-date-new">{formatDate(order.createdAt)}</p>
                                </div>
                                <div
                                    className="order-status-badge"
                                    style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                                >
                                    {order.orderStatus}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="order-items-section">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item-row">
                                        <div className="item-image-wrapper">
                                            <img
                                                src={item.image || item.product?.images?.[0] || '/placeholder.jpg'}
                                                alt={item.name}
                                                className="item-image-new"
                                            />
                                            <span className="item-quantity-badge">{item.quantity}</span>
                                        </div>
                                        <div className="item-details-new">
                                            <h4>{item.name}</h4>
                                            <p className="item-price-new">₹{item.price.toLocaleString()} × {item.quantity}</p>
                                        </div>
                                        <div className="item-total-new">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Shipping Info */}
                            <div className="shipping-info-section">
                                <div className="info-row">
                                    <span className="info-label">Ship to</span>
                                    <div className="info-value">
                                        <p className="ship-name">{order.shippingAddress.fullName}</p>
                                        <p className="ship-address">
                                            {order.shippingAddress.address}, {order.shippingAddress.city}
                                        </p>
                                        <p className="ship-address">
                                            {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                        </p>
                                    </div>
                                    <button className="change-btn" disabled>View</button>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">Method</span>
                                    <div className="info-value">
                                        <p className="method-text">
                                            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                        </p>
                                        <p className="method-subtext">
                                            {order.paymentStatus === 'paid' ? '✓ Paid' : 'Payment Pending'}
                                        </p>
                                    </div>
                                    <button className="change-btn" disabled>Info</button>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">Payment</span>
                                    <div className="info-value">
                                        <p className="payment-method">
                                            {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 ' + order.paymentMethod}
                                        </p>
                                    </div>
                                    <button className="change-btn" disabled>Details</button>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="order-summary-section">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{order.itemsPrice.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toFixed(2)}`}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax (GST 18%)</span>
                                    <span>₹{order.taxPrice.toFixed(2)}</span>
                                </div>
                                <div className="summary-row total-row">
                                    <span>Total</span>
                                    <span className="total-amount">₹{order.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Order Actions */}
                            <div className="order-actions-section">
                                <button
                                    className="btn-view-details"
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                >
                                    View Order Details
                                </button>
                                {(order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
                                    <button
                                        className="btn-track-order"
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                    >
                                        Track Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;
