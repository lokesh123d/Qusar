import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
            <h2>Page Not Found</h2>
            <p style={{ marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
            <Link to="/" className="btn btn-primary">
                Go Home
            </Link>
        </div>
    );
};

export default NotFound;
