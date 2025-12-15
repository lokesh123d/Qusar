import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            // Auto-detect and save location
            detectAndSaveLocation();
        }
        setLoading(false);
    }, []);

    const detectAndSaveLocation = async () => {
        // Silently skip location detection - it's optional
        if (!('geolocation' in navigator)) {
            return;
        }

        try {
            // Set a timeout for geolocation request
            const position = await Promise.race([
                new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 5000,
                        enableHighAccuracy: false
                    });
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                )
            ]);

            const { latitude, longitude } = position.coords;

            // Try to get address from OpenStreetMap (with error handling)
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                    {
                        headers: { 'User-Agent': 'Qusar-Ecommerce' },
                        signal: AbortSignal.timeout(5000)
                    }
                );

                if (!response.ok) {
                    throw new Error('Geocoding failed');
                }

                const data = await response.json();

                const locationData = {
                    street: data.address?.road || '',
                    city: data.address?.city || data.address?.town || data.address?.village || '',
                    state: data.address?.state || '',
                    zipCode: data.address?.postcode || '',
                    country: data.address?.country || 'India',
                    coordinates: { latitude, longitude }
                };

                // Try to save to backend (silently fail if endpoint doesn't exist)
                try {
                    await api.post('/users/address', locationData);
                } catch (err) {
                    // Silently ignore if endpoint doesn't exist
                }
            } catch (geoError) {
                // Silently ignore geocoding errors
            }
        } catch (error) {
            // Silently ignore all location detection errors
            // This is optional functionality, no need to show errors
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const googleLogin = async (credential) => {
        try {
            const { data } = await api.post('/auth/google', { token: credential });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Google login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const refreshUser = async () => {
        try {
            const { data } = await api.get('/users/profile');
            const updatedUser = data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { success: true };
        } catch (error) {
            console.error('Failed to refresh user:', error);
            return { success: false };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
