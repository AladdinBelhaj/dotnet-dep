import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { jwtDecode } from "jwt-decode";
import { api } from '../api/axios';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setUser({
                    id: 0,
                    username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.sub || "User",
                    role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "Comptable",
                    token: token
                });
            } catch (e) {
                console.error("Invalid token", e);
                localStorage.removeItem('token');
            }
        }
    }, []);

    const login = async (username: string, password: string) => {
        const response = await api.post('/auth/login', { username, password });
        const token = response.data;

        localStorage.setItem('token', token);
        const decoded: any = jwtDecode(token);
        setUser({
            id: 0,
            username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.sub || "User",
            role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "Comptable",
            token: token
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
