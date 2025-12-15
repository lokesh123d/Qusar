import { useState, useEffect } from 'react';
import { FiBell, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const [show, setShow] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            // Silently fail if not authenticated or other errors
            if (error.response?.status !== 401) {
                console.error('Error fetching notifications:', error);
            }
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification._id);
        if (notification.orderId) {
            navigate(`/orders/${notification.orderId._id || notification.orderId}`);
        }
        setShow(false);
    };

    return (
        <div className="notification-dropdown">
            <button className="notification-btn" onClick={() => setShow(!show)}>
                <FiBell />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {show && (
                <>
                    <div className="notification-overlay" onClick={() => setShow(false)} />
                    <div className="notification-panel">
                        <div className="notification-header">
                            <h3>Notifications</h3>
                            <button onClick={() => setShow(false)}><FiX /></button>
                        </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="no-notifications">
                                    <FiBell />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <div className="notification-content">
                                            <h4>{notif.title}</h4>
                                            <p>{notif.message}</p>
                                            <span className="notification-time">
                                                {new Date(notif.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        {!notif.read && <div className="unread-dot" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
