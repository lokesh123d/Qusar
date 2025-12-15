import { useState, useEffect } from 'react';
import api from '../utils/api';
import Toast from './Toast';
import './PaymentSettings.css';

const PaymentSettings = () => {
    const [settings, setSettings] = useState({
        razorpayKeyId: '',
        razorpayKeySecret: '',
        razorpayEnabled: false,
        razorpayTestMode: true,
        codEnabled: true,
        codMinAmount: 0,
        codMaxAmount: 50000,
        currency: 'INR',
        shippingCharges: 0,
        freeShippingAbove: 500,
        taxPercentage: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [showSecret, setShowSecret] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/payment/settings');
            // Ensure all values are defined to avoid controlled/uncontrolled input warning
            setSettings({
                razorpayKeyId: data.settings.razorpayKeyId || '',
                razorpayKeySecret: data.settings.razorpayKeySecret || '',
                razorpayEnabled: data.settings.razorpayEnabled || false,
                razorpayTestMode: data.settings.razorpayTestMode !== undefined ? data.settings.razorpayTestMode : true,
                codEnabled: data.settings.codEnabled !== undefined ? data.settings.codEnabled : true,
                codMinAmount: data.settings.codMinAmount || 0,
                codMaxAmount: data.settings.codMaxAmount || 50000,
                currency: data.settings.currency || 'INR',
                shippingCharges: data.settings.shippingCharges || 0,
                freeShippingAbove: data.settings.freeShippingAbove || 500,
                taxPercentage: data.settings.taxPercentage || 0
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            showToast('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/payment/settings', settings);
            showToast('Payment settings updated successfully!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="payment-settings">
            {toast.show && <Toast message={toast.message} type={toast.type} />}

            <div className="settings-header">
                <h2>💳 Payment Settings</h2>
                <p>Configure payment methods and settings for your store</p>
            </div>

            <form onSubmit={handleSubmit} className="settings-form">
                {/* Razorpay Settings */}
                <div className="settings-section">
                    <div className="section-header">
                        <h3>Razorpay Configuration</h3>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                name="razorpayEnabled"
                                checked={settings.razorpayEnabled}
                                onChange={handleChange}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Razorpay Key ID</label>
                            <input
                                type="text"
                                name="razorpayKeyId"
                                value={settings.razorpayKeyId}
                                onChange={handleChange}
                                placeholder="rzp_test_xxxxxxxxxxxxx"
                                disabled={!settings.razorpayEnabled}
                            />
                            <small>Your Razorpay public key (safe to share)</small>
                        </div>

                        <div className="form-group">
                            <label>Razorpay Key Secret</label>
                            <div className="password-input">
                                <input
                                    type={showSecret ? 'text' : 'password'}
                                    name="razorpayKeySecret"
                                    value={settings.razorpayKeySecret}
                                    onChange={handleChange}
                                    placeholder="Enter secret key"
                                    disabled={!settings.razorpayEnabled}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="toggle-visibility"
                                >
                                    {showSecret ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <small>Keep this secret! Never share publicly</small>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="razorpayTestMode"
                                    checked={settings.razorpayTestMode}
                                    onChange={handleChange}
                                    disabled={!settings.razorpayEnabled}
                                />
                                <span>Test Mode (use test keys)</span>
                            </label>
                            <small>Enable for testing, disable for live payments</small>
                        </div>
                    </div>
                </div>

                {/* COD Settings */}
                <div className="settings-section">
                    <div className="section-header">
                        <h3>Cash on Delivery (COD)</h3>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                name="codEnabled"
                                checked={settings.codEnabled}
                                onChange={handleChange}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Minimum Order Amount (₹)</label>
                            <input
                                type="number"
                                name="codMinAmount"
                                value={settings.codMinAmount}
                                onChange={handleChange}
                                min="0"
                                disabled={!settings.codEnabled}
                            />
                        </div>

                        <div className="form-group">
                            <label>Maximum Order Amount (₹)</label>
                            <input
                                type="number"
                                name="codMaxAmount"
                                value={settings.codMaxAmount}
                                onChange={handleChange}
                                min="0"
                                disabled={!settings.codEnabled}
                            />
                        </div>
                    </div>
                </div>

                {/* General Settings */}
                <div className="settings-section">
                    <div className="section-header">
                        <h3>General Settings</h3>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Currency</label>
                            <select
                                name="currency"
                                value={settings.currency}
                                onChange={handleChange}
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Shipping Charges (₹)</label>
                            <input
                                type="number"
                                name="shippingCharges"
                                value={settings.shippingCharges}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Free Shipping Above (₹)</label>
                            <input
                                type="number"
                                name="freeShippingAbove"
                                value={settings.freeShippingAbove}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tax Percentage (%)</label>
                            <input
                                type="number"
                                name="taxPercentage"
                                value={settings.taxPercentage}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                step="0.1"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>

            {/* Help Section */}
            <div className="help-section">
                <h4>📚 How to get Razorpay Keys:</h4>
                <ol>
                    <li>Go to <a href="https://dashboard.razorpay.com/" target="_blank" rel="noopener noreferrer">Razorpay Dashboard</a></li>
                    <li>Sign up or login to your account</li>
                    <li>Go to Settings → API Keys</li>
                    <li>Generate keys (Test mode for testing, Live mode for production)</li>
                    <li>Copy Key ID and Key Secret and paste above</li>
                </ol>
            </div>
        </div>
    );
};

export default PaymentSettings;
