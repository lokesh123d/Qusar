import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content container">
                <div className="footer-section">
                    <h3 className="footer-title">Qusar</h3>
                    <p className="footer-text">
                        Your one-stop destination for all your shopping needs. Quality products, great prices, and excellent service.
                    </p>
                    <div className="social-links">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link"><FiTwitter /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link"><FiInstagram /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Quick Links</h4>
                    <ul className="footer-links">
                        <li><Link to="/products">All Products</Link></li>
                        <li><Link to="/products?category=Electronics">Electronics</Link></li>
                        <li><Link to="/products?category=Fashion">Fashion</Link></li>
                        <li><Link to="/products?category=Home & Kitchen">Home & Kitchen</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Customer Service</h4>
                    <ul className="footer-links">
                        <li><Link to="/orders">Track Order</Link></li>
                        <li><a href="#">Returns & Refunds</a></li>
                        <li><a href="#">Shipping Info</a></li>
                        <li><a href="#">FAQs</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Contact Us</h4>
                    <ul className="contact-info">
                        <li>
                            <FiMail />
                            <span>qusar5057@gmail.com</span>
                        </li>
                        <li>
                            <FiPhone />
                            <span>+91 8091780737</span>
                        </li>
                        <li>
                            <FiMapPin />
                            <span>Nainital, Uttarakhand</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Qusar. All rights reserved. | Created by <strong>Lokesh</strong></p>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
