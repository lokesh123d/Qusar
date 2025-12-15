import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiHeart, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Toast from '../components/Toast';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products/${id}`);
            setProduct(data.product);

            // Fetch similar products from same category
            const similarResponse = await api.get(`/products?category=${data.product.category}&limit=4`);
            setSimilarProducts(similarResponse.data.products.filter(p => p._id !== id));
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            setToast({
                message: 'Please login to add items to cart',
                type: 'error'
            });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        const result = await addToCart(product._id, quantity);
        if (result.success) {
            setToast({
                message: `Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart!`,
                type: 'success'
            });
        } else {
            setToast({
                message: result.message || 'Failed to add to cart',
                type: 'error'
            });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Product not found</h2>
                <Link to="/products" className="btn btn-primary">Browse Products</Link>
            </div>
        );
    }

    const discountPercent = product.discount || 0;
    const hasDiscount = discountPercent > 0;

    return (
        <div className="product-detail-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/products">Products</Link>
                    <span>/</span>
                    <Link to={`/products?category=${product.category}`}>{product.category}</Link>
                    <span>/</span>
                    <span>{product.name}</span>
                </div>

                {/* Product Main Section */}
                <div className="product-main">
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img src={product.images[selectedImage]} alt={product.name} />
                            {hasDiscount && (
                                <span className="discount-badge">{discountPercent}% OFF</span>
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="thumbnail-images">
                                {product.images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`${product.name} ${index + 1}`}
                                        className={selectedImage === index ? 'active' : ''}
                                        onClick={() => setSelectedImage(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-brand">Brand: {product.brand}</div>

                        {/* Rating */}
                        <div className="product-rating-section">
                            <div className="rating-stars">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar
                                        key={i}
                                        className={i < Math.floor(product.ratings?.average || 0) ? 'star-filled' : 'star-empty'}
                                    />
                                ))}
                                <span className="rating-number">{product.ratings?.average?.toFixed(1) || '0.0'}</span>
                            </div>
                            <span className="rating-count">({product.ratings?.count || 0} ratings)</span>
                        </div>

                        {/* Price */}
                        <div className="product-price-section">
                            <div className="current-price">₹{product.price.toLocaleString()}</div>
                            {hasDiscount && (
                                <>
                                    <div className="original-price">₹{product.originalPrice.toLocaleString()}</div>
                                    <div className="discount-text">Save ₹{(product.originalPrice - product.price).toLocaleString()} ({discountPercent}%)</div>
                                </>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.stock > 0 ? (
                                <>Yes In Stock ({product.stock} available)</>
                            ) : (
                                <>✗ Out of Stock</>
                            )}
                        </div>

                        {/* Description */}
                        <div className="product-description">
                            <h3>About this item</h3>
                            <p>{product.description}</p>
                        </div>

                        {/* Specifications */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="product-specifications">
                                <h3>Specifications</h3>
                                <table>
                                    <tbody>
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            <tr key={key}>
                                                <td className="spec-label">{key}</td>
                                                <td className="spec-value">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        {product.stock > 0 && (
                            <div className="product-actions">
                                <div className="quantity-selector">
                                    <label>Quantity:</label>
                                    <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                                        {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <button className="btn btn-primary btn-lg add-to-cart" onClick={handleAddToCart}>
                                    <FiShoppingCart /> Add to Cart
                                </button>
                            </div>
                        )}

                        {/* Features */}
                        <div className="product-features">
                            <div className="feature-item">
                                <FiTruck className="feature-icon" />
                                <div>
                                    <strong>Free Delivery</strong>
                                    <p>On orders above ₹500</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <FiShield className="feature-icon" />
                                <div>
                                    <strong>Secure Payment</strong>
                                    <p>100% secure transactions</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <FiRefreshCw className="feature-icon" />
                                <div>
                                    <strong>7 Days Return</strong>
                                    <p>Easy return policy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                {product.reviews && product.reviews.length > 0 && (
                    <div className="reviews-section">
                        <h2>Customer Reviews</h2>
                        <div className="reviews-list">
                            {product.reviews.slice(0, 5).map((review, index) => (
                                <div key={index} className="review-card">
                                    <div className="review-header">
                                        <div className="reviewer-name">{review.name}</div>
                                        <div className="review-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    className={i < review.rating ? 'star-filled' : 'star-empty'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                    <div className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="similar-products-section">
                        <h2>Similar Products</h2>
                        <div className="products-grid grid grid-4">
                            {similarProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default ProductDetail;
