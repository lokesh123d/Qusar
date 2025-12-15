import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Please login to add items to cart');
            return;
        }

        const result = await addToCart(product._id);
        if (result.success) {
            alert('Added to cart!');
        } else {
            alert(result.message);
        }
    };

    const discountPercent = product.discount || 0;
    const hasDiscount = discountPercent > 0;

    return (
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
                        <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
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
    );
};

export default ProductCard;
