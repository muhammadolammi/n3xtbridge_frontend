import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // Changed to an array for flexibility
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 1. If we are still "syncing" (refreshing token/fetching profile), STAY HERE.

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Verifying Credentials...</p>
                </div>
            </div>
        );
    }

    // 2. Not logged in?
    if (!user) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // 3. Check if role is missing (data not fully loaded yet)
    // If user exists but role doesn't, we should wait or handle it.
    if (allowedRoles && !user.role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="font-mono text-xs text-gray-400">Authorizing Role...</p>
            </div>
        );
    }

    // 4. Role check
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.warn(`Access denied for role: ${user.role}.`);
        // Only redirect if we are NOT already on the dashboard to prevent loops
        if (location.pathname !== '/dashboard') {
            return <Navigate to="/dashboard" replace />;
        }
    }


    return <>{children}</>;
};
export default ProtectedRoute;