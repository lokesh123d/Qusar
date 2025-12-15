import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiPackage, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { user, logout, isAuthenticated, refreshUser } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchQuery.length > 1) {
            fetchSearchSuggestions();
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    const fetchSearchSuggestions = async () => {
        try {
            const { data } = await api.get(`/products?search=${searchQuery}&limit=5`);
            setSearchSuggestions(data.products);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${searchQuery}`);
            setSearchQuery('');
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (productId) => {
        navigate(`/products/${productId}`);
        setSearchQuery('');
        setShowSuggestions(false);
    };

    const handleProfileToggle = async () => {
        if (!isProfileOpen && refreshUser) {
            // Refresh user data when opening dropdown
            await refreshUser();
        }
        setIsProfileOpen(!isProfileOpen);
    };

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <img src="/qusar-logo.png" alt="Qusar" className="logo-image" />
                    <span className="logo-text">Qusar</span>
                </Link>

                {/* Search Bar */}
                <div className="search-wrapper">
                    <form className="navbar-search" onSubmit={handleSearch}>
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for products, brands and more..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className="search-input"
                        />
                    </form>
                    {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="search-suggestions">
                            {searchSuggestions.map((product) => (
                                <div
                                    key={product._id}
                                    className="suggestion-item"
                                    onClick={() => handleSuggestionClick(product._id)}
                                >
                                    <img src={product.images[0]} alt={product.name} />
                                    <div className="suggestion-info">
                                        <p className="suggestion-name">{product.name}</p>
                                        <p className="suggestion-price">₹{product.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop Navigation */}
                <div className="navbar-menu">
                    <Link to="/products" className="nav-link">
                        Products
                    </Link>

                    {isAuthenticated ? (
                        <>
                            {/* Become a Seller Button (for users only) */}
                            {user?.role === 'user' && (
                                <Link to="/become-seller" className="nav-link become-seller-btn">
                                    Become a Seller
                                </Link>
                            )}

                            <Link to="/cart" className="nav-link cart-link">
                                <FiShoppingCart />
                                <span>Cart</span>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>

                            <div className="profile-dropdown">
                                <button
                                    className="nav-link profile-btn"
                                    onClick={handleProfileToggle}
                                >
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="profile-avatar"
                                        />
                                    ) : (
                                        <FiUser />
                                    )}
                                    <span>{user?.name}</span>
                                    {user?.role === 'superadmin' && (
                                        <span className="role-badge superadmin">Super Admin</span>
                                    )}
                                    {user?.role === 'admin' && (
                                        <span className="role-badge admin">Admin</span>
                                    )}
                                    {user?.role === 'seller' && (
                                        <span className="role-badge seller">Seller</span>
                                    )}
                                </button>

                                {isProfileOpen && (
                                    <div className="dropdown-menu">
                                        <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                            <FiUser /> My Profile
                                        </Link>
                                        <Link to="/orders" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                            <FiPackage /> My Orders
                                        </Link>

                                        {/* Admin Dashboard Link */}
                                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                            <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                                <FiUser /> Admin Dashboard
                                            </Link>
                                        )}

                                        {/* Seller Dashboard Link */}
                                        {user?.role === 'seller' && (
                                            <Link to="/seller/dashboard" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                                <FiPackage /> Seller Dashboard
                                            </Link>
                                        )}

                                        <button className="dropdown-item" onClick={handleLogout}>
                                            <FiLogOut /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline btn-sm">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <form className="mobile-search" onSubmit={handleSearch}>
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </form>

                    <Link to="/products" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                        Products
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/cart" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                <FiShoppingCart /> Cart {cartCount > 0 && `(${cartCount})`}
                            </Link>
                            <Link to="/profile" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                <FiUser /> Profile
                            </Link>
                            <Link to="/orders" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                <FiPackage /> Orders
                            </Link>
                            <button className="mobile-link" onClick={handleLogout}>
                                <FiLogOut /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                Login
                            </Link>
                            <Link to="/register" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
