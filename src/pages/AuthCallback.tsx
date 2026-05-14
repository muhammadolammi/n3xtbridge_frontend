import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const { googleLoginSuccess } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            googleLoginSuccess(token).then(() => {
                navigate('/dashboard');
            });
        } else {
            navigate('/login?error=oauth_failed');
        }
    }, [searchParams, googleLoginSuccess, navigate]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Authenticating with Google...</p>
        </div>
    );
};