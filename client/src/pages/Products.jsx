import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

    const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Grocery', 'Mobile', 'Computers'];

    useEffect(() => {
        fetchProducts();
    }, [filters, pagination.page]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (filters.category) params.append('category', filters.category);
            if (filters.search) params.append('search', filters.search);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.sort) params.append('sort', filters.sort);
            params.append('page', pagination.page);
            params.append('limit', 12);

            const { data } = await api.get(`/products?${params.toString()}`);
            setProducts(data.products);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, page: 1 });
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            search: '',
            minPrice: '',
            maxPrice: '',
            sort: 'newest'
        });
        setSearchParams({});
    };

    return (
        <div className="products-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1>All Products</h1>
                        <p className="results-count">
                            Showing {products.length} of {pagination.total} products
                        </p>
                    </div>
                    <button
                        className="btn btn-outline mobile-filter-btn"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter /> Filters
                    </button>
                </div>

                <div className="products-layout">
                    {/* Filters Sidebar */}
                    <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
                        <div className="filters-header">
                            <h3>Filters</h3>
                            <button className="close-filters" onClick={() => setShowFilters(false)}>
                                <FiX />
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="filter-section">
                            <h4>Category</h4>
                            <div className="filter-options">
                                <label className="filter-option">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={filters.category === ''}
                                        onChange={() => handleFilterChange('category', '')}
                                    />
                                    <span>All Categories</span>
                                </label>
                                {categories.map((cat) => (
                                    <label key={cat} className="filter-option">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={filters.category === cat}
                                            onChange={() => handleFilterChange('category', cat)}
                                        />
                                        <span>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="filter-section">
                            <h4>Price Range</h4>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    className="form-control"
                                />
                                <span>to</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <button className="btn btn-secondary" onClick={clearFilters}>
                            Clear All Filters
                        </button>
                    </aside>

                    {/* Products Grid */}
                    <div className="products-content">
                        {/* Sort Options */}
                        <div className="sort-section">
                            <label>Sort by:</label>
                            <select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="form-control"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="products-grid grid grid-3">
                                    {products.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="btn btn-secondary"
                                            disabled={pagination.page === 1}
                                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                        >
                                            Previous
                                        </button>
                                        <span className="page-info">
                                            Page {pagination.page} of {pagination.pages}
                                        </span>
                                        <button
                                            className="btn btn-secondary"
                                            disabled={pagination.page === pagination.pages}
                                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-products">
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or search terms</p>
                                <button className="btn btn-primary" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
