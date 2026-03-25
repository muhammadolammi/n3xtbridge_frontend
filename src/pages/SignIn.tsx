import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignIn = () => {
    const navigate = useNavigate();

    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (user && !authLoading) {
            navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);
    // 1. Grab what we need from AuthContext
    const { login } = useAuth();

    // 2. Local state for form and UI
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Call context login
        const result = await login(email, password);

        // If result is a string (error message) or false
        if (result === true) {
            navigate('/dashboard');
        } else {
            // If login returns false, show a generic error
            setError('Invalid email or password. Please try again.');
            setLoading(false); // Make sure to stop loading so button works again
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center relative px-6 py-12 bg-gray-50">
            {/* Blueprint Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-white overflow-hidden rounded-2xl shadow-xl relative z-10 border border-gray-100">
                {/* Left Side (Visual Sidebar) */}
                <div className="hidden md:flex relative bg-gray-900 flex-col justify-between p-12 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 border border-white/5 rounded-full"></div>
                    <div className="absolute bottom-[20%] left-[-5%] w-32 h-32 bg-primary/20 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-1 bg-primary mb-8"></div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                            Architecting the <br />future of infrastructure.
                        </h1>
                        <p className="text-gray-400 font-light leading-relaxed">
                            Secure access to your enterprise dashboard and asset management systems.
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-2">
                        <div className="h-1 w-12 bg-white rounded-full"></div>
                        <div className="h-1 w-4 bg-white/20 rounded-full"></div>
                        <div className="h-1 w-4 bg-white/20 rounded-full"></div>
                    </div>
                </div>

                {/* Right Side (Form) */}
                <div className="flex items-center justify-center p-8 md:p-16">
                    <div className="w-full max-w-sm">
                        <header className="mb-10">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Sign In</h2>
                            <p className="text-gray-500 text-sm">Enter your credentials to access your account.</p>

                        </header>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* 4. Link inputs to state */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase">Email Address</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-primary focus:ring-0 transition-all px-0 py-3 text-gray-900 placeholder:text-gray-300"
                                    placeholder="name@n3xtbridge.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase">Password</label>
                                </div>
                                <input
                                    className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-primary focus:ring-0 transition-all px-0 py-3 text-gray-900 placeholder:text-gray-300"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center group cursor-pointer">
                                    <input className="rounded-sm border-gray-300 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                                    <span className="ml-2 text-xs text-gray-500 group-hover:text-gray-900 transition-colors">Remember Me</span>
                                </label>
                                <Link className="text-xs font-bold text-primary hover:underline" to="/forgot-password">Forgot Password?</Link>
                            </div>

                            {/* 5. Handle Loading State */}
                            <button
                                disabled={loading}
                                className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {loading ? "Authenticating..." : "Sign In"}
                            </button>
                            {error && <p className="mt-4 text-xs font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                        </form>

                        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                            <p className="text-gray-500 text-xs">
                                New to N3xtbridge?
                                <Link className="text-primary font-bold ml-1 hover:underline" to="/signup">Create Account</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};