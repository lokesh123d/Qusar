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
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [activeTab, setActiveTab] = useState('details'); // details, reviews, discussion
    const [isInWishlist, setIsInWishlist] = useState(false);

    // Review submission state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        fetchProductDetails();
        checkWishlistStatus();
    }, [id, isAuthenticated]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products/${id}`);
            setProduct(data.product);

            // Set default color and size if available
            if (data.product.colors && data.product.colors.length > 0) {
                setSelectedColor(data.product.colors[0]);
            }
            if (data.product.sizes && data.product.sizes.length > 0) {
                setSelectedSize(data.product.sizes[0]);
            }

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

    const checkWishlistStatus = async () => {
        if (!isAuthenticated) return;

        try {
            const { data } = await api.get('/users/wishlist');
            const inWishlist = data.wishlist?.some(item => item._id === id);
            setIsInWishlist(inWishlist);
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            setToast({
                message: 'Please login to add items to wishlist',
                type: 'error'
            });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        try {
            if (isInWishlist) {
                await api.delete(`/users/wishlist/${product._id}`);
                setIsInWishlist(false);
                setToast({
                    message: '✓ Removed from wishlist',
                    type: 'success'
                });
            } else {
                await api.post(`/users/wishlist/${product._id}`);
                setIsInWishlist(true);
                setToast({
                    message: '✓ Added to wishlist',
                    type: 'success'
                });
            }
        } catch (error) {
            setToast({
                message: error.response?.data?.message || 'Failed to update wishlist',
                type: 'error'
            });
        }
    };

    const calculateRatingDistribution = () => {
        if (!product?.reviews || product.reviews.length === 0) {
            return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        }

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        product.reviews.forEach(review => {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        });

        return distribution;
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setToast({
                message: 'Please login to submit a review',
                type: 'error'
            });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        if (!reviewComment.trim()) {
            setToast({
                message: 'Please write a comment',
                type: 'error'
            });
            return;
        }

        try {
            setReviewLoading(true);
            const { data } = await api.post(`/products/${id}/review`, {
                rating: reviewRating,
                comment: reviewComment
            });

            setToast({
                message: 'Review submitted successfully!',
                type: 'success'
            });

            // Reset form
            setReviewComment('');
            setReviewRating(5);
            setShowReviewForm(false);

            // Refresh product data to show new review
            fetchProductDetails();
        } catch (error) {
            setToast({
                message: error.response?.data?.message || 'Failed to submit review',
                type: 'error'
            });
        } finally {
            setReviewLoading(false);
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
    const ratingDistribution = calculateRatingDistribution();
    const totalReviews = product.reviews?.length || 0;

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
                        <div className="product-brand">Brand: {product.brand}</div>
                        <h1 className="product-title">{product.name}</h1>

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

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="product-options">
                                <label className="option-label">Color:</label>
                                <div className="color-options">
                                    {product.colors.map((color, index) => (
                                        <button
                                            key={index}
                                            className={`color-option ${selectedColor === color ? 'active' : ''}`}
                                            onClick={() => setSelectedColor(color)}
                                            style={{ backgroundColor: color.toLowerCase() }}
                                            title={color}
                                        >
                                            {selectedColor === color && <span className="check-mark">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="product-options">
                                <label className="option-label">Size:</label>
                                <div className="size-options">
                                    {product.sizes.map((size, index) => (
                                        <button
                                            key={index}
                                            className={`size-option ${selectedSize === size ? 'active' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock Status */}
                        <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.stock > 0 ? (
                                <>✓ In Stock ({product.stock} available)</>
                            ) : (
                                <>✗ Out of Stock</>
                            )}
                        </div>

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
                                <button
                                    className={`btn btn-outline btn-icon wishlist-btn ${isInWishlist ? 'active' : ''}`}
                                    onClick={handleToggleWishlist}
                                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                    <FiHeart className={isInWishlist ? 'filled' : ''} />
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

                {/* Tabs Section */}
                <div className="product-tabs-section">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Details
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({totalReviews})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'discussion' ? 'active' : ''}`}
                            onClick={() => setActiveTab('discussion')}
                        >
                            Discussion
                        </button>
                    </div>

                    <div className="tabs-content">
                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div className="tab-panel">
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
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="tab-panel">
                                <div className="reviews-summary">
                                    <div className="reviews-overview">
                                        <div className="overall-rating">
                                            <div className="rating-number-large">{product.ratings?.average?.toFixed(1) || '0.0'}</div>
                                            <div className="rating-stars-large">
                                                {[...Array(5)].map((_, i) => (
                                                    <FiStar
                                                        key={i}
                                                        className={i < Math.floor(product.ratings?.average || 0) ? 'star-filled' : 'star-empty'}
                                                    />
                                                ))}
                                            </div>
                                            <div className="total-reviews">{totalReviews} reviews</div>
                                        </div>

                                        <div className="rating-bars">
                                            {[5, 4, 3, 2, 1].map(rating => {
                                                const count = ratingDistribution[rating] || 0;
                                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                                return (
                                                    <div key={rating} className="rating-bar-row">
                                                        <span className="rating-label">{rating}</span>
                                                        <FiStar className="star-icon" />
                                                        <div className="rating-bar">
                                                            <div
                                                                className="rating-bar-fill"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="rating-count">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Reviews List */}
                                {product.reviews && product.reviews.length > 0 && (
                                    <div className="reviews-list">
                                        {product.reviews.map((review, index) => (
                                            <div key={index} className="review-card">
                                                <div className="review-header">
                                                    <div className="reviewer-info">
                                                        <div className="reviewer-avatar">
                                                            {review.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="reviewer-name">{review.name}</div>
                                                            <div className="review-date">
                                                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
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
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {(!product.reviews || product.reviews.length === 0) && (
                                    <div className="no-reviews">
                                        <p>No reviews yet. Be the first to review this product!</p>
                                    </div>
                                )}

                                {/* Write Review Button/Form */}
                                <div className="write-review-section">
                                    {!showReviewForm ? (
                                        <button
                                            className="btn btn-primary write-review-btn"
                                            onClick={() => setShowReviewForm(true)}
                                        >
                                            ✍️ Write a Review
                                        </button>
                                    ) : (
                                        <div className="review-form-card">
                                            <h3>Write Your Review</h3>
                                            <form onSubmit={handleSubmitReview}>
                                                {/* Star Rating Selector */}
                                                <div className="form-group">
                                                    <label className="form-label">Your Rating *</label>
                                                    <div className="star-rating-selector">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                className={`star-btn ${star <= reviewRating ? 'active' : ''}`}
                                                                onClick={() => setReviewRating(star)}
                                                            >
                                                                <FiStar />
                                                            </button>
                                                        ))}
                                                        <span className="rating-text">({reviewRating} star{reviewRating !== 1 ? 's' : ''})</span>
                                                    </div>
                                                </div>

                                                {/* Comment */}
                                                <div className="form-group">
                                                    <label className="form-label">Your Review *</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="5"
                                                        placeholder="Share your experience with this product..."
                                                        value={reviewComment}
                                                        onChange={(e) => setReviewComment(e.target.value)}
                                                        required
                                                    ></textarea>
                                                </div>

                                                {/* Form Actions */}
                                                <div className="form-actions">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary"
                                                        disabled={reviewLoading}
                                                    >
                                                        {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        onClick={() => {
                                                            setShowReviewForm(false);
                                                            setReviewComment('');
                                                            setReviewRating(5);
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Discussion Tab */}
                        {activeTab === 'discussion' && (
                            <div className="tab-panel">
                                <div className="discussion-placeholder">
                                    <h3>Product Discussion</h3>
                                    <p>Ask questions and discuss this product with other customers.</p>
                                    <p className="coming-soon">Coming soon...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

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
