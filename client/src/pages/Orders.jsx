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
    const [cancellingOrder, setCancellingOrder] = useState(null);

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

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            setCancellingOrder(orderId);
            const { data } = await api.put(`/orders/${orderId}/cancel`);
            if (data.success) {
                // Update the order in the list
                setOrders(orders.map(order =>
                    order._id === orderId ? { ...order, orderStatus: 'Cancelled' } : order
                ));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancellingOrder(null);
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                    <p>Warning: {error}</p>
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
        <div className="container orders-page">
            <div className="orders-header">
                <h1>My Orders</h1>
                <p className="orders-count">Total Orders: {orders.length}</p>
            </div>

            <div className="orders-list">
                {orders.map((order) => (
                    <div key={order._id} className="order-card">
                        <div className="order-header">
                            <div className="order-info">
                                <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                                <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                            </div>
                            <div className="order-status">
                                <span className={`badge badge-${getStatusColor(order.orderStatus)}`}>
                                    {getStatusIcon(order.orderStatus)} {order.orderStatus}
                                </span>
                            </div>
                        </div>

                        <div className="order-items">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item">
                                    <img
                                        src={item.image || item.product?.images?.[0] || '/placeholder.jpg'}
                                        alt={item.name}
                                    />
                                    <div className="order-item-details">
                                        <p className="item-name">{item.name}</p>
                                        <p className="item-qty">Quantity: {item.quantity}</p>
                                        <p className="item-price">₹{item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-footer">
                            <div className="order-total">
                                <span>Total Amount:</span>
                                <span className="total-price">₹{order.totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="order-actions">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                >
                                    View Details
                                </button>
                                {(order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
                                    <button
                                        className="btn btn-outline btn-sm cancel-btn"
                                        onClick={() => handleCancelOrder(order._id)}
                                        disabled={cancellingOrder === order._id}
                                    >
                                        {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
