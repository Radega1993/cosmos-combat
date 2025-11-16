import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api.service';

export interface User {
    _id?: string;
    username: string;
    email?: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            apiService.setAuthToken(storedToken);
            // Verify token is still valid
            refreshUser().catch(() => {
                // Token invalid, clear storage
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                setToken(null);
                setUser(null);
            });
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        const response = await apiService.login(username, password);
        const { user: userData, token: authToken } = response;

        setUser(userData);
        setToken(authToken);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        apiService.setAuthToken(authToken);
    };

    const register = async (username: string, email: string, password: string) => {
        const response = await apiService.register(username, email, password);
        const { user: userData, token: authToken } = response;

        setUser(userData);
        setToken(authToken);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        apiService.setAuthToken(authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        apiService.setAuthToken(null);
    };

    const refreshUser = async () => {
        if (!token) return;
        const userData = await apiService.getCurrentUser();
        const user: User = {
            username: userData.username,
            role: userData.role as 'user' | 'admin',
        };
        setUser(user);
        localStorage.setItem('auth_user', JSON.stringify(user));
    };

    const isAuthenticated = !!user && !!token;
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                isAdmin,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

