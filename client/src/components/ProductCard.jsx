import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [toast, setToast] = useState(null);

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            showToast('Please login to add items to cart', 'error');
            return;
        }

        const result = await addToCart(product._id);
        if (result.success) {
            showToast('✓ Added to cart!', 'success');
        } else {
            showToast(result.message, 'error');
        }
    };

    const discountPercent = product.discount || 0;
    const hasDiscount = discountPercent > 0;

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <Link to={`/products/${product._id}`} className="product-card">
                <div className="product-image-wrapper">
                    {hasDiscount && (
                        <span className="discount-badge">{discountPercent}% OFF</span>
                    )}
                    <img
                        src={product.images[0] || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="product-image"
                    />
                </div>

                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-brand">{product.brand}</p>

                    <div className="product-rating">
                        <FiStar className="star-icon" />
                        <span>{product.ratings?.average?.toFixed(1) || '0.0'}</span>
                        <span className="rating-count">({product.ratings?.count || 0})</span>
                    </div>

                    <div className="product-price">
                        <span className="current-price">₹{product.price.toLocaleString()}</span>
                        {hasDiscount && (
                            <>
                                <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                                <div className="discount-text">Save ₹{(product.originalPrice - product.price).toLocaleString()}</div>
                            </>
                        )}
                    </div>

                    <button
                        className="btn btn-primary btn-sm add-to-cart-btn"
                        onClick={handleAddToCart}
                    >
                        <FiShoppingCart /> Add to Cart
                    </button>
                </div>
            </Link>
        </>
    );
};

export default ProductCard;
