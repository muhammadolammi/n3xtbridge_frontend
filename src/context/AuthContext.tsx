import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import api from '../api/axios';
import type { User } from '../models/model';
import axios from 'axios';



interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    googleLoginSuccess: (token: string) => Promise<void>; // <--- Add this
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [bootLoading, setBootLoading] = useState(true); // initial auth check
    const [authLoading, setAuthLoading] = useState(false); // login/logout actions


    // 1. INITIAL REHYDRATION (Silent Login)
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Use a clean axios instance here to avoid the interceptor loop
                // Inside initializeAuth in AuthProvider.tsx
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {}, {
                    withCredentials: true,
                    headers: { "client-api-key": import.meta.env.VITE_CLIENT_API_KEY }
                });
                if (res.status === 200) {
                    const token = res.data.access_token;
                    setAccessToken(token);

                    // Fetch user directly using the token we just got
                    const userRes = await api.get('/auth/user', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (userRes.status === 200) {
                        setUser(userRes.data);
                    }
                }
            } catch (err) {
                console.log("No valid session found on boot.");
                setUser(null);
            } finally {
                // CRITICAL: Only set loading to false AFTER user is fetched or failed
                setBootLoading(false);
            }
        };
        initializeAuth();
    }, []);
    // 2. SIGN IN (The "Chain" Method)
    const login = async (email: string, password: string): Promise<boolean> => {
        setAuthLoading(true);
        try {
            // Step A: Authenticate (Sets Cookies + Returns Access Token)
            const res = await api.post('/auth/signin', { email, password });

            if (res.status === 200) {
                const token = res.data.access_token;
                setAccessToken(token);
                // Step B: Get User Details (Using the token we just got)
                // We pass the token manually here if the interceptor isn't ready yet
                const userRes = await api.get('/auth/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (userRes.status === 200) {
                    setUser(userRes.data);
                    return true;
                }
            }
        } catch (err) {
            console.error("Login sequence failed", err);
        } finally {
            setAuthLoading(false);
        }
        return false;
    };

    // 3. LOGOUT
    const logout = async () => {
        try {
            await api.post('/auth/signout');
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };
    const googleLoginSuccess = async (token: string) => {
        setAuthLoading(true);
        try {
            setAccessToken(token);
            // Fetch user details immediately using the redirected token
            const userRes = await api.get('/auth/user', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (userRes.status === 200) {
                setUser(userRes.data);
            }
        } catch (err) {
            console.error("Failed to sync Google user", err);
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, loading: authLoading, googleLoginSuccess }}>
            {!bootLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};