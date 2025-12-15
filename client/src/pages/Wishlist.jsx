import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import api from '../utils/api';
import './Wishlist.css';

const Wishlist = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchWishlist();
    }, [isAuthenticated, navigate]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/wishlist');
            setWishlist(data.wishlist || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        try {
            const { data } = await api.delete(`/users/wishlist/${productId}`);
            if (data.success) {
                setWishlist(wishlist.filter(item => item._id !== productId));
                showToast('✓ Removed from wishlist', 'success');
            }
        } catch (error) {
            showToast('Failed to remove from wishlist', 'error');
        }
    };

    const handleAddToCart = async (product) => {
        const result = await addToCart(product._id);
        if (result.success) {
            showToast('✓ Added to cart!', 'success');
        } else {
            showToast(result.message, 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="wishlist-empty">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <div className="empty-wishlist-card">
                    <div className="empty-icon">
                        <FiHeart />
                    </div>
                    <h2>Your Wishlist is Empty</h2>
                    <p>Save your favorite items here to buy them later!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/products')}>
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="wishlist-container">
                <div className="wishlist-header">
                    <h1>My Wishlist</h1>
                    <p className="wishlist-count">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
                </div>

                <div className="wishlist-grid">
                    {wishlist.map((product) => (
                        <div key={product._id} className="wishlist-item">
                            <button
                                className="remove-btn"
                                onClick={() => handleRemoveFromWishlist(product._id)}
                            >
                                <FiTrash2 />
                            </button>

                            <div className="wishlist-image" onClick={() => navigate(`/products/${product._id}`)}>
                                <img src={product.images[0]} alt={product.name} />
                            </div>

                            <div className="wishlist-details">
                                <h3 onClick={() => navigate(`/products/${product._id}`)}>{product.name}</h3>
                                <p className="wishlist-price">₹{product.price.toLocaleString()}</p>

                                {product.stock > 0 ? (
                                    <button
                                        className="add-to-cart-btn"
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        <FiShoppingCart /> Add to Cart
                                    </button>
                                ) : (
                                    <button className="out-of-stock-btn" disabled>
                                        Out of Stock
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

export default Wishlist;
