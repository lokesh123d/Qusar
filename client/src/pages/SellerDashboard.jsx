import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Toast from '../components/Toast';
import SellerOrders from '../components/SellerOrders';
import './SellerDashboard.css';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: 'Electronics',
        brand: '',
        stock: '',
        images: ['']
    });

    const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Grocery', 'Mobile', 'Computers'];

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'seller') {
            navigate('/');
            return;
        }
        fetchProducts();
    }, [isAuthenticated, user, navigate]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/seller/products');
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const addImageField = () => {
        setFormData({ ...formData, images: [...formData.images, ''] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price),
                stock: parseInt(formData.stock),
                images: formData.images.filter(img => img.trim() !== '')
            };

            await api.post('/seller/products', productData);
            showToast('Product added! Waiting for admin approval.', 'success');
            setShowAddForm(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            showToast('Failed to add product', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            originalPrice: '',
            category: 'Electronics',
            brand: '',
            stock: '',
            images: ['']
        });
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await api.delete(`/seller/products/${productId}`);
            showToast('Product deleted successfully', 'success');
            setProducts(products.filter(p => p._id !== productId));
        } catch (error) {
            showToast('Failed to delete product', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container seller-dashboard">
            {toast.show && <Toast message={toast.message} type={toast.type} />}

            <div className="dashboard-header">
                <h1>Seller Dashboard</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : '+ Add Product'}
                </button>
            </div>

            {showAddForm && (
                <div className="add-product-form">
                    <h2>Add New Product</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    className="form-control"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-control"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    name="category"
                                    className="form-control"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    className="form-control"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="form-control"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Original Price (Optional)</label>
                                <input
                                    type="number"
                                    name="originalPrice"
                                    className="form-control"
                                    value={formData.originalPrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Product Images (URLs)</label>
                            {formData.images.map((image, index) => (
                                <input
                                    key={index}
                                    type="url"
                                    className="form-control"
                                    value={image}
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                    placeholder="Enter image URL"
                                    style={{ marginBottom: '0.5rem' }}
                                />
                            ))}
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={addImageField}
                            >
                                + Add Another Image
                            </button>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                Add Product
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="products-section">
                <h2>My Products ({products.length})</h2>

                {products.length === 0 ? (
                    <div className="empty-state">
                        <p>No products yet. Add your first product!</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <div key={product._id} className="product-card">
                                <img
                                    src={product.images[0] || '/placeholder.jpg'}
                                    alt={product.name}
                                    className="product-image"
                                />
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="product-price">Rs. {product.price}</p>
                                    <p className="product-stock">Stock: {product.stock}</p>
                                    <div className="product-status">
                                        {product.approved ? (
                                            <span className="status-badge approved">Approved</span>
                                        ) : (
                                            <span className="status-badge pending">Pending Approval</span>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleDeleteProduct(product._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Orders Section */}
                <div style={{ marginTop: '3rem' }}>
                    <SellerOrders />
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
