import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTruck, FiShield, FiHeadphones, FiArrowRight } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedProducts();

        // Auto-slide hero banner every 3 seconds
        const slideInterval = setInterval(() => {
            const slides = document.querySelectorAll('.slide');
            const dots = document.querySelectorAll('.dot');
            const active = document.querySelector('.slide.active');
            if (active) {
                const activeIndex = Array.from(slides).indexOf(active);
                const nextIndex = activeIndex === slides.length - 1 ? 0 : activeIndex + 1;
                active.classList.remove('active');
                slides[nextIndex].classList.add('active');
                dots.forEach(dot => dot.classList.remove('active'));
                dots[nextIndex].classList.add('active');
            }
        }, 3000);

        return () => clearInterval(slideInterval);
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            const { data } = await api.get('/products?limit=8');
            setFeaturedProducts(data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { name: 'Electronics', color: '#6366f1' },
        { name: 'Fashion', color: '#ec4899' },
        { name: 'Home & Kitchen', color: '#10b981' },
        { name: 'Books', color: '#f59e0b' },
        { name: 'Sports', color: '#3b82f6' },
        { name: 'Beauty', color: '#a855f7' },
    ];

    const features = [
        {
            title: 'Free Shipping',
            description: 'On orders above ₹500'
        },
        {
            title: 'Secure Payment',
            description: '100% secure transactions'
        },
        {
            title: '24/7 Support',
            description: 'Dedicated customer service'
        },
        {
            title: 'Easy Returns',
            description: '7-day return policy'
        }
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-slider">
                    <div className="slider-container">
                        <div className="slide active">
                            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&h=600&fit=crop" alt="Electronics Sale" />
                            <div className="slide-overlay">
                                <div className="container">
                                    <div className="hero-content">
                                        <h1 className="hero-title">Premium Electronics</h1>
                                        <p className="hero-description">Discover the latest gadgets and tech accessories at unbeatable prices</p>
                                        <div className="hero-buttons">
                                            <Link to="/products?category=Electronics" className="btn btn-primary btn-lg">
                                                Shop Electronics <FiArrowRight />
                                            </Link>
                                            <Link to="/products" className="btn btn-outline btn-lg">
                                                Browse All
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="slide">
                            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=600&fit=crop" alt="Fashion Collection" />
                            <div className="slide-overlay">
                                <div className="container">
                                    <div className="hero-content">
                                        <h1 className="hero-title">Fashion Forward</h1>
                                        <p className="hero-description">Elevate your style with our curated collection of trendy apparel</p>
                                        <div className="hero-buttons">
                                            <Link to="/products?category=Fashion" className="btn btn-primary btn-lg">
                                                Shop Fashion <FiArrowRight />
                                            </Link>
                                            <Link to="/products" className="btn btn-outline btn-lg">
                                                Browse All
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="slide">
                            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=600&fit=crop" alt="Home Decor" />
                            <div className="slide-overlay">
                                <div className="container">
                                    <div className="hero-content">
                                        <h1 className="hero-title">Transform Your Space</h1>
                                        <p className="hero-description">Beautiful home decor and kitchen essentials for modern living</p>
                                        <div className="hero-buttons">
                                            <Link to="/products?category=Home & Kitchen" className="btn btn-primary btn-lg">
                                                Shop Home <FiArrowRight />
                                            </Link>
                                            <Link to="/products" className="btn btn-outline btn-lg">
                                                Browse All
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="slide">
                            <img src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&h=600&fit=crop" alt="Gadgets & Tech" />
                            <div className="slide-overlay">
                                <div className="container">
                                    <div className="hero-content">
                                        <h1 className="hero-title">Tech Innovation</h1>
                                        <p className="hero-description">Stay ahead with cutting-edge gadgets and smart devices</p>
                                        <div className="hero-buttons">
                                            <Link to="/products?category=Electronics" className="btn btn-primary btn-lg">
                                                Shop Gadgets <FiArrowRight />
                                            </Link>
                                            <Link to="/products" className="btn btn-outline btn-lg">
                                                Browse All
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="slide">
                            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=600&fit=crop" alt="Lifestyle Products" />
                            <div className="slide-overlay">
                                <div className="container">
                                    <div className="hero-content">
                                        <h1 className="hero-title">Lifestyle Essentials</h1>
                                        <p className="hero-description">Everything you need for a stylish and comfortable lifestyle</p>
                                        <div className="hero-buttons">
                                            <Link to="/products" className="btn btn-primary btn-lg">
                                                Shop Now <FiArrowRight />
                                            </Link>
                                            <Link to="/products?category=Beauty" className="btn btn-outline btn-lg">
                                                View Beauty
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="slider-btn prev" onClick={() => {
                        const slides = document.querySelectorAll('.slide');
                        const dots = document.querySelectorAll('.dot');
                        const active = document.querySelector('.slide.active');
                        const activeIndex = Array.from(slides).indexOf(active);
                        const prevIndex = activeIndex === 0 ? slides.length - 1 : activeIndex - 1;
                        active.classList.remove('active');
                        slides[prevIndex].classList.add('active');
                        dots.forEach(dot => dot.classList.remove('active'));
                        dots[prevIndex].classList.add('active');
                    }}>‹</button>
                    <button className="slider-btn next" onClick={() => {
                        const slides = document.querySelectorAll('.slide');
                        const dots = document.querySelectorAll('.dot');
                        const active = document.querySelector('.slide.active');
                        const activeIndex = Array.from(slides).indexOf(active);
                        const nextIndex = activeIndex === slides.length - 1 ? 0 : activeIndex + 1;
                        active.classList.remove('active');
                        slides[nextIndex].classList.add('active');
                        dots.forEach(dot => dot.classList.remove('active'));
                        dots[nextIndex].classList.add('active');
                    }}>›</button>
                    <div className="slider-dots">
                        <span className="dot active"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="categories-section">
                <div className="container">
                    <h2 className="section-title text-center">Shop by Category</h2>
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                to={`/products?category=${category.name}`}
                                className="category-card"
                                style={{ '--category-color': category.color }}
                            >
                                <h3 className="category-name">{category.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Products</h2>
                        <Link to="/products" className="view-all-link">
                            View All <FiArrowRight />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="products-grid grid grid-4">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Start Shopping?</h2>
                        <p className="cta-description">
                            Join thousands of happy customers and discover amazing deals today!
                        </p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create Account <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
