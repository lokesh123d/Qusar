import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import api from '../utils/api';
import './Checkout.css';

// Load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [toast, setToast] = useState(null);
    const [paymentSettings, setPaymentSettings] = useState(null);

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

        // Fetch payment settings
        fetchPaymentSettings();

        // Fetch user's saved location and auto-fill form
        fetchUserLocation();
    }, [isAuthenticated, cart.items, navigate]);

    const fetchPaymentSettings = async () => {
        try {
            const { data } = await api.get('/payment/settings');
            setPaymentSettings(data.settings);
        } catch (error) {
            console.error('Failed to fetch payment settings:', error);
        }
    };

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

    const handleRazorpayPayment = async (orderData) => {
        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load Razorpay SDK');
            }

            // Create Razorpay order
            const { data } = await api.post('/payment/create-order', {
                amount: orderData.totalPrice,
                orderId: orderData._id
            });

            const options = {
                key: data.keyId,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'Qusar',
                description: 'Order Payment',
                order_id: data.order.id,
                handler: async function (response) {
                    try {
                        // Verify payment
                        const verifyResponse = await api.post('/payment/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: orderData._id
                        });

                        if (verifyResponse.data.success) {
                            setSuccess(true);
                            // Cart already cleared by backend after payment verification
                            setTimeout(() => {
                                navigate(`/orders/${orderData._id}`);
                            }, 2000);
                        }
                    } catch (error) {
                        setError('Payment verification failed. Please contact support.');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: formData.fullName,
                    contact: formData.phone
                },
                theme: {
                    color: '#6366f1'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setError('Payment cancelled');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Razorpay error:', error);
            setError(error.message || 'Payment failed. Please try again.');
            setLoading(false);
        }
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
                const orderData = response.data.order;

                // If payment method is online (Card/UPI), initiate Razorpay
                if (formData.paymentMethod !== 'COD') {
                    await handleRazorpayPayment(orderData);
                } else {
                    // For COD, directly show success (cart already cleared by backend)
                    setSuccess(true);
                    setTimeout(() => {
                        navigate(`/orders/${orderData._id}`);
                    }, 2000);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
            setLoading(false);
        }
    };

    const calculateSubtotal = () => {
        return cart.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
    };

    const subtotal = calculateSubtotal();
    const shipping = paymentSettings?.freeShippingAbove && subtotal > paymentSettings.freeShippingAbove
        ? 0
        : (paymentSettings?.shippingCharges || 40);
    const taxRate = (paymentSettings?.taxPercentage || 0) / 100;
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    // Check if payment method is available
    const isCODAvailable = paymentSettings?.codEnabled &&
        total >= (paymentSettings?.codMinAmount || 0) &&
        total <= (paymentSettings?.codMaxAmount || 999999);

    const isOnlinePaymentAvailable = paymentSettings?.razorpayEnabled;

    if (success) {
        return (
            <div className="container checkout-success">
                <div className="success-card">
                    <div className="success-icon">✓</div>
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
                                {isCODAvailable && (
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={formData.paymentMethod === 'COD'}
                                            onChange={handleChange}
                                        />
                                        <div className="payment-option-content">
                                            <span className="payment-icon">💵</span>
                                            <div>
                                                <strong>Cash on Delivery</strong>
                                                <p>Pay when you receive</p>
                                            </div>
                                        </div>
                                    </label>
                                )}

                                {isOnlinePaymentAvailable && (
                                    <>
                                        <label className="payment-option">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="Card"
                                                checked={formData.paymentMethod === 'Card'}
                                                onChange={handleChange}
                                            />
                                            <div className="payment-option-content">
                                                <span className="payment-icon">💳</span>
                                                <div>
                                                    <strong>Credit/Debit Card</strong>
                                                    <p>Secure payment via Razorpay</p>
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
                                                <span className="payment-icon">📱</span>
                                                <div>
                                                    <strong>UPI Payment</strong>
                                                    <p>Pay via UPI apps</p>
                                                </div>
                                            </div>
                                        </label>
                                    </>
                                )}

                                {!isCODAvailable && !isOnlinePaymentAvailable && (
                                    <div className="no-payment-methods">
                                        <p>⚠️ No payment methods available. Please contact support.</p>
                                    </div>
                                )}
                            </div>

                            {!isCODAvailable && formData.paymentMethod === 'COD' && (
                                <div className="payment-warning">
                                    ⚠️ COD not available for this order amount
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="error-message">
                                ⚠️ {error}
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
                            disabled={loading || (!isCODAvailable && !isOnlinePaymentAvailable)}
                        >
                            {loading ? 'Processing...' :
                                formData.paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
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
                        {taxRate > 0 && (
                            <div className="summary-row">
                                <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                        )}

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
