import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="container notfound-page">
            <div className="notfound-content">
                <div className="notfound-icon">404</div>
                <h1>Page Not Found</h1>
                <p>Oops! The page you're looking for doesn't exist.</p>
                <div className="notfound-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Go Home
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
