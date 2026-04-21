import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignIn = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, login } = useAuth();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user && !authLoading) {
            navigate(decodeURIComponent(redirectTo), { state: location.state });
        }
    }, [user, authLoading, navigate, redirectTo, location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result === true) {
            navigate(decodeURIComponent(redirectTo), { state: location.state });
        } else {
            setError('Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0C0C0C] flex items-center justify-center relative px-6 py-12 overflow-hidden">
            {/* Blueprint Grid Background (Dark Version) */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
            </div>

            {/* Glowing Accent Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0046FB]/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#0046FB]/5 blur-[100px] rounded-full"></div>

            <div className="w-full max-w-[1100px] grid md:grid-cols-2 bg-[#111] rounded-[2.5rem] shadow-2xl relative z-10 border border-[#1A1A1A] overflow-hidden animate-in fade-in zoom-in-95 duration-500">

                {/* Left Side (Visual Sidebar) */}
                <div className="hidden md:flex relative bg-[#0A0A0A] flex-col justify-between p-16 overflow-hidden border-r border-[#1A1A1A]">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-8">
                        <div className="w-24 h-24 border-t-2 border-r-2 border-[#0046FB]/20 rounded-tr-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="w-16 h-1 bg-[#0046FB] mb-10 rounded-full"></div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
                            Secure <br />Infrastructure <br />Access.
                        </h1>
                        <p className="text-gray-500 font-medium leading-relaxed max-w-xs">
                            Manage your deployments, track quote requests, and oversee digital assets from a single endpoint.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-1.5 w-12 bg-[#0046FB] rounded-full"></div>
                            <div className="h-1.5 w-1.5 bg-gray-800 rounded-full"></div>
                            <div className="h-1.5 w-1.5 bg-gray-800 rounded-full"></div>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-600">N3xtbridge Holdings</p>
                    </div>
                </div>

                {/* Right Side (Form) */}
                <div className="flex items-center justify-center p-8 md:p-16 bg-[#111]">
                    <div className="w-full max-w-sm">
                        <header className="mb-12">
                            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Sign In</h2>
                            <p className="text-gray-500 text-sm">Welcome back. Authenticate to continue.</p>
                        </header>

                        {error && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-3">
                                <span className="material-symbols-outlined text-base">error</span>
                                {error}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-1">Email Address</label>
                                <input
                                    className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] focus:ring-0 transition-all placeholder:text-gray-800"
                                    placeholder="name@company.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase">Password</label>
                                    <Link className="text-[11px] font-bold text-[#0046FB] hover:opacity-80" to="/forgot-password">Recovery</Link>
                                </div>
                                <div className='relative'>
                                    <input
                                        className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 pr-12 text-white focus:border-[#0046FB] focus:ring-0 transition-all placeholder:text-gray-800"
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center px-1">
                                <label className="flex items-center group cursor-pointer">
                                    <div className="relative flex items-center">
                                        <input className="peer appearance-none h-5 w-5 border border-white bg-[#141414] rounded-lg checked:bg-[#0046FB] checked:border-[#0046FB] transition-all cursor-pointer" type="checkbox" />
                                        <span className="material-symbols-outlined absolute text-[14px] text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">check</span>
                                    </div>
                                    <span className="ml-3 text-xs text-gray-500 e group-hover:text-gray-300 transition-colors">Keep me signed in</span>
                                </label>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-5 bg-[#0046FB] hover:bg-[#003ccf] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/10 transition-all transform active:scale-[0.98] disabled:opacity-30 flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    "Authenticate"
                                )}
                            </button>
                        </form>

                        <div className="mt-12 pt-8 border-t border-[#1A1A1A] text-center">
                            <p className="text-gray-500 text-sm">
                                New user?
                                <Link className="text-[#0046FB] font-bold ml-2 hover:underline" to="/signup">Create Account</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div >
        </main >
    );
};