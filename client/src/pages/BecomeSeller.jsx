import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './BecomeSeller.css';

const BecomeSeller = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        businessName: '',
        businessAddress: '',
        gstNumber: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const requestData = {
                businessName: formData.businessName,
                businessAddress: formData.businessAddress,
                gstNumber: formData.gstNumber,
                bankDetails: {
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode,
                    accountHolderName: formData.accountHolderName
                }
            };

            const { data } = await api.post('/seller/request', requestData);

            setMessage({
                type: 'success',
                text: 'Seller request submitted successfully! Please wait for admin approval.'
            });

            setTimeout(() => {
                navigate('/profile');
            }, 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to submit seller request'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container become-seller-page">
                <div className="auth-required">
                    <h2>Login Required</h2>
                    <p>Please login to become a seller</p>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container become-seller-page">
            <div className="seller-header">
                <h1>Become a Seller</h1>
                <p>Start selling your products on Qusar</p>
            </div>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="seller-content">
                <div className="seller-benefits">
                    <h2>Why Sell With Us?</h2>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon">1</div>
                            <h3>Reach Millions</h3>
                            <p>Connect with customers across the country</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">2</div>
                            <h3>Easy Management</h3>
                            <p>Simple dashboard to manage your products</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">3</div>
                            <h3>Secure Payments</h3>
                            <p>Get paid on time, every time</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">4</div>
                            <h3>24/7 Support</h3>
                            <p>We're here to help you succeed</p>
                        </div>
                    </div>
                </div>

                <div className="seller-form-container">
                    <h2>Seller Application</h2>
                    <form onSubmit={handleSubmit} className="seller-form">
                        <div className="form-section">
                            <h3>Business Information</h3>

                            <div className="form-group">
                                <label className="form-label">Business Name</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    className="form-control"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    placeholder="Enter your business name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Business Address</label>
                                <textarea
                                    name="businessAddress"
                                    className="form-control"
                                    value={formData.businessAddress}
                                    onChange={handleChange}
                                    placeholder="Enter your business address"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">GST Number (Optional)</label>
                                <input
                                    type="text"
                                    name="gstNumber"
                                    className="form-control"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                    placeholder="Enter GST number if available"
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Bank Details</h3>

                            <div className="form-group">
                                <label className="form-label">Account Holder Name</label>
                                <input
                                    type="text"
                                    name="accountHolderName"
                                    className="form-control"
                                    value={formData.accountHolderName}
                                    onChange={handleChange}
                                    placeholder="Enter account holder name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Account Number</label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    className="form-control"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    placeholder="Enter bank account number"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">IFSC Code</label>
                                <input
                                    type="text"
                                    name="ifscCode"
                                    className="form-control"
                                    value={formData.ifscCode}
                                    onChange={handleChange}
                                    placeholder="Enter IFSC code"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-lg"
                                onClick={() => navigate('/')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BecomeSeller;
