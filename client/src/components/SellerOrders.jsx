import { useState, useEffect } from 'react';
import { FiShoppingBag, FiUser, FiMapPin, FiPhone, FiMail, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import api from '../utils/api';
import Toast from '../components/Toast';
import './SellerOrders.css';

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/seller/orders');
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'pending', icon: <FiClock />, text: 'Pending' },
            processing: { class: 'processing', icon: <FiPackage />, text: 'Processing' },
            shipped: { class: 'shipped', icon: <FiTruck />, text: 'Shipped' },
            delivered: { class: 'delivered', icon: <FiCheckCircle />, text: 'Delivered' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`status-badge ${config.class}`}>
                {config.icon} {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="seller-orders-section">
            {toast && <Toast message={toast.message} type={toast.type} />}

            <div className="section-header">
                <h2><FiShoppingBag /> Customer Orders ({orders.length})</h2>
                <p>Manage and fulfill customer orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <FiShoppingBag size={64} />
                    <h3>No Orders Yet</h3>
                    <p>When customers buy your products, orders will appear here</p>
                </div>
            ) : (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                                    <p className="order-date">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>

                            <div className="order-customer">
                                <div className="customer-info">
                                    <FiUser className="info-icon" />
                                    <div>
                                        <strong>{order.user?.name || 'Customer'}</strong>
                                        <p>{order.user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="order-items">
                                <h4>Items ({order.items.length})</h4>
                                {order.items.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="order-item">
                                        <img
                                            src={item.product?.images?.[0] || '/placeholder.jpg'}
                                            alt={item.product?.name || 'Product'}
                                        />
                                        <div className="item-details">
                                            <p className="item-name">{item.product?.name || 'Product'}</p>
                                            <p className="item-qty">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="item-price">₹{item.price.toLocaleString()}</p>
                                    </div>
                                ))}
                                {order.items.length > 2 && (
                                    <p className="more-items">+{order.items.length - 2} more items</p>
                                )}
                            </div>

                            <div className="order-footer">
                                <div className="order-total">
                                    <span>Total:</span>
                                    <strong>₹{order.totalPrice.toLocaleString()}</strong>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleViewOrder(order)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            {showOrderModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details - #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                            <button className="modal-close" onClick={() => setShowOrderModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-detail-grid">
                                {/* Customer Information */}
                                <div className="detail-section">
                                    <h3><FiUser /> Customer Information</h3>
                                    <div className="info-group">
                                        <label>Name:</label>
                                        <p>{selectedOrder.user?.name || 'N/A'}</p>
                                    </div>
                                    <div className="info-group">
                                        <label><FiMail /> Email:</label>
                                        <p>{selectedOrder.user?.email || 'N/A'}</p>
                                    </div>
                                    <div className="info-group">
                                        <label><FiPhone /> Phone:</label>
                                        <p>{selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="detail-section">
                                    <h3><FiMapPin /> Shipping Address</h3>
                                    <div className="address-box">
                                        <p><strong>{selectedOrder.shippingAddress?.fullName}</strong></p>
                                        <p>{selectedOrder.shippingAddress?.address}</p>
                                        <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                        <p>PIN: {selectedOrder.shippingAddress?.pincode}</p>
                                        <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="detail-section full-width">
                                <h3><FiPackage /> Order Items</h3>
                                <div className="items-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <div className="product-cell">
                                                            <img
                                                                src={item.product?.images?.[0] || '/placeholder.jpg'}
                                                                alt={item.product?.name}
                                                            />
                                                            <span>{item.product?.name || 'Product'}</span>
                                                        </div>
                                                    </td>
                                                    <td>₹{item.price.toLocaleString()}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{(item.price * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="detail-section full-width">
                                <h3>Order Summary</h3>
                                <div className="summary-box">
                                    <div className="summary-row">
                                        <span>Status:</span>
                                        <span>{getStatusBadge(selectedOrder.status)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Payment Method:</span>
                                        <span>{selectedOrder.paymentMethod || 'COD'}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Order Date:</span>
                                        <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total Amount:</span>
                                        <strong>₹{selectedOrder.totalPrice.toLocaleString()}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn btn-primary">
                                    <FiTruck /> Mark as Shipped
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerOrders;
