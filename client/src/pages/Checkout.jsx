import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import api from '../utils/api';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'COD'
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!cart.items || cart.items.length === 0) {
            navigate('/cart');
            return;
        }

        // Fetch user's saved location and auto-fill form
        const fetchUserLocation = async () => {
            try {
                const response = await api.get('/users/profile');
                const userProfile = response.data.user;

                if (userProfile.addresses && userProfile.addresses.length > 0) {
                    const savedAddress = userProfile.addresses[0];
                    setFormData(prev => ({
                        ...prev,
                        fullName: userProfile.name || prev.fullName,
                        address: savedAddress.street || prev.address,
                        city: savedAddress.city || prev.city,
                        state: savedAddress.state || prev.state,
                        pincode: savedAddress.zipCode || prev.pincode
                    }));

                    setToast({
                        message: 'Address auto-filled from your location!',
                        type: 'info'
                    });
                }
            } catch (err) {
                console.log('Could not fetch location:', err.message);
            }
        };

        fetchUserLocation();
    }, [isAuthenticated, cart.items, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) return 'Full name is required';
        if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) return 'Valid 10-digit phone number is required';
        if (!formData.address.trim()) return 'Address is required';
        if (!formData.city.trim()) return 'City is required';
        if (!formData.state.trim()) return 'State is required';
        if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) return 'Valid 6-digit pincode is required';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const shippingAddress = {
                fullName: formData.fullName,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
            };

            const response = await api.post('/orders', {
                shippingAddress,
                paymentMethod: formData.paymentMethod
            });

            if (response.data.success) {
                setSuccess(true);
                await clearCart();
                setTimeout(() => {
                    navigate(`/orders/${response.data.order._id}`);
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateSubtotal = () => {
        return cart.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
    };

    const subtotal = calculateSubtotal();
    const shipping = subtotal > 500 ? 0 : 40;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    if (success) {
        return (
            <div className="container checkout-success">
                <div className="success-card">
                    <div className="success-icon"></div>
                    <h2>Order Placed Successfully!</h2>
                    <p>Thank you for your order. You will be redirected to order details...</p>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container checkout-page">
            <h1 className="page-title">Checkout</h1>

            <div className="checkout-layout">
                <div className="checkout-form-section">
                    <form onSubmit={handleSubmit} className="checkout-form">
                        <div className="form-section">
                            <h3>Shipping Information</h3>

                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className="form-control"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    maxLength="10"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address *</label>
                                <textarea
                                    name="address"
                                    className="form-control"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="House No., Street, Area"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-control"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        className="form-control"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Pincode *</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    className="form-control"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="6-digit pincode"
                                    maxLength="6"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Payment Method</h3>

                            <div className="payment-options">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={formData.paymentMethod === 'COD'}
                                        onChange={handleChange}
                                    />
                                    <div className="payment-option-content">
                                        <span className="payment-icon">COD</span>
                                        <div>
                                            <strong>Cash on Delivery</strong>
                                            <p>Pay when you receive</p>
                                        </div>
                                    </div>
                                </label>

                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Card"
                                        checked={formData.paymentMethod === 'Card'}
                                        onChange={handleChange}
                                    />
                                    <div className="payment-option-content">
                                        <span className="payment-icon">Card</span>
                                        <div>
                                            <strong>Credit/Debit Card</strong>
                                            <p>Secure payment</p>
                                        </div>
                                    </div>
                                </label>

                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="UPI"
                                        checked={formData.paymentMethod === 'UPI'}
                                        onChange={handleChange}
                                    />
                                    <div className="payment-option-content">
                                        <span className="payment-icon">UPI</span>
                                        <div>
                                            <strong>UPI Payment</strong>
                                            <p>Pay via UPI apps</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                Warning: {error}
                            </div>
                        )}

                        {toast && (
                            <Toast
                                message={toast.message}
                                type={toast.type}
                                onClose={() => setToast(null)}
                            />
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-place-order"
                            disabled={loading}
                        >
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </form>
                </div>

                <div className="order-summary-section">
                    <div className="summary-card">
                        <h3>Order Summary</h3>

                        <div className="order-items">
                            {cart.items?.map((item) => (
                                <div key={item._id} className="summary-item">
                                    <img src={item.product?.images?.[0]} alt={item.product?.name} />
                                    <div className="summary-item-details">
                                        <p className="item-name">{item.product?.name}</p>
                                        <p className="item-qty">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (18%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
