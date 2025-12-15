import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, loading, updateQuantity, removeFromCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdating(itemId);
        await updateQuantity(itemId, newQuantity);
        setUpdating(null);
    };

    const handleRemove = async (itemId) => {
        if (window.confirm('Are you sure you want to remove this item?')) {
            setUpdating(itemId);
            await removeFromCart(itemId);
            setUpdating(null);
        }
    };

    const calculateSubtotal = () => {
        return cart.items?.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0) || 0;
    };

    const subtotal = calculateSubtotal();
    const shipping = subtotal > 500 ? 0 : 40;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="container cart-empty">
                <div className="empty-cart-card">
                    <div className="empty-cart-icon"></div>
                    <h2>Your Cart is Empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/products')}>
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container cart-page">
            <h1 className="page-title">Shopping Cart</h1>
            <div className="cart-layout">
                <div className="cart-items">
                    {cart.items.map((item) => (
                        <div key={item._id} className={`cart-item ${updating === item._id ? 'updating' : ''}`}>
                            <div className="item-image">
                                <img
                                    src={item.product?.images?.[0] || '/placeholder.jpg'}
                                    alt={item.product?.name || 'Product'}
                                />
                            </div>
                            <div className="item-details">
                                <h3>{item.product?.name || 'Product'}</h3>
                                <p className="item-price">₹{item.price?.toFixed(2) || '0.00'}</p>
                                {item.product?.stock < 10 && item.product?.stock > 0 && (
                                    <p className="stock-warning">Only {item.product.stock} left in stock!</p>
                                )}
                            </div>
                            <div className="item-actions">
                                <div className="quantity-controls">
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                        disabled={item.quantity <= 1 || updating === item._id}
                                    >
                                        -
                                    </button>
                                    <span className="quantity">{item.quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                        disabled={item.quantity >= item.product?.stock || updating === item._id}
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="item-total">₹{(item.price * item.quantity).toFixed(2)}</p>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemove(item._id)}
                                    disabled={updating === item._id}
                                >
                                     Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <div className="summary-card">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal ({cart.items.length} items)</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                        </div>
                        {shipping === 0 && (
                            <p className="free-shipping-msg"> You got free shipping!</p>
                        )}
                        {subtotal < 500 && subtotal > 0 && (
                            <p className="shipping-info">Add ₹{(500 - subtotal).toFixed(2)} more for free shipping</p>
                        )}
                        <div className="summary-row">
                            <span>Tax (18%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <button
                            className="btn btn-primary btn-checkout"
                            onClick={() => navigate('/checkout')}
                        >
                            Proceed to Checkout
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/products')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
