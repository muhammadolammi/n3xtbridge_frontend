import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleButton, handleGoogleLogin } from '../components/resusable';

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
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        if (user && !authLoading) {
            navigate(decodeURIComponent(redirectTo), {
                state: location.state,
                replace: true,
            });
        }
    }, [user, authLoading, navigate, redirectTo, location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;

        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result === true) {
                navigate(decodeURIComponent(redirectTo), {
                    state: location.state,
                    replace: true,
                });
            } else {
                setError('Invalid email or password. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('Unable to sign in. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background flex items-center justify-center relative px-6 py-12 overflow-hidden">
            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Glow Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#22D3EE]/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#22D3EE]/5 blur-[100px] rounded-full" />

            <div className="w-full max-w-[1100px] grid rounded-[2.5rem] shadow-2xl relative z-10 border border-[#22D3EE]/20 overflow-hidden animate-in fade-in zoom-in-95 duration-500 bg-background">

                {/* Left Panel */}
                {/* <div className="hidden md:flex relative bg-background flex-col justify-between p-16 overflow-hidden border-r border-[#22D3EE]/10">

                    <div className="absolute top-0 right-0 p-8">
                        <div className="w-24 h-24 border-t-2 border-r-2 border-[#22D3EE]/20 rounded-tr-3xl" />
                    </div>

                    <div className="relative z-10">
                        <div className="w-16 h-1 bg-[#22D3EE] mb-10 rounded-full" />

                        <h1 className="text-4xl lg:text-5xl font-bold text-primary tracking-tight leading-tight mb-6">
                            Secure <br />
                            Infrastructure <br />
                            Access.
                        </h1>

                        <p className="text-text font-medium leading-relaxed max-w-xs">
                            Manage deployments, track quote requests, monitor
                            services, and oversee digital infrastructure from a
                            unified dashboard.
                        </p>

                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-1.5 w-12 bg-[#22D3EE] rounded-full" />
                            <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                            <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                        </div>

                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">
                            N3xtbridge Holdings
                        </p>
                    </div>
                </div> */}

                {/* Right Panel */}
                <div className="flex items-center justify-center p-8 md:p-16 bg-background">
                    <div className="w-full max-w-sm">

                        {/* Header */}
                        <header className="mb-12">


                            <h2 className="text-3xl font-bold tracking-tight text-primary mb-3">
                                Sign In
                            </h2>

                            <p className="text-text text-sm">
                                Welcome back. Sign in to continue to your dashboard.
                            </p>
                        </header>

                        {/* Error */}
                        {error && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-3">
                                <span className="material-symbols-outlined text-base">
                                    error
                                </span>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form className="space-y-6" onSubmit={handleSubmit}>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold tracking-widest text-primary uppercase ml-1">
                                    Email Address
                                </label>

                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
                                        mail
                                    </span>

                                    <input
                                        className="w-full border border-[#22D3EE]/20 rounded-2xl pl-12 pr-5 py-4 text-text bg-transparent focus:border-[#22D3EE] focus:outline-none transition-all placeholder:text-gray-500"
                                        placeholder="name@company.com"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-[10px] font-bold tracking-widest text-primary uppercase">
                                        Password
                                    </label>

                                    <Link
                                        className="text-[11px] font-bold text-[#22D3EE] hover:opacity-80 transition-opacity"
                                        to="/forgot-password"
                                    >
                                        Recovery
                                    </Link>
                                </div>

                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
                                        lock
                                    </span>

                                    <input
                                        className="w-full border border-[#22D3EE]/20 rounded-2xl pl-12 pr-12 py-4 text-text bg-transparent focus:border-[#22D3EE] focus:outline-none transition-all placeholder:text-gray-500"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#22D3EE] transition-colors"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword
                                                ? 'visibility_off'
                                                : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) =>
                                                setRememberMe(e.target.checked)
                                            }
                                            className="peer appearance-none h-5 w-5 border border-[#22D3EE]/40 rounded-lg checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                        />

                                        <span className="material-symbols-outlined absolute text-[14px] text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                            check
                                        </span>
                                    </div>

                                    <span className="text-xs text-text group-hover:text-[#22D3EE] transition-colors">
                                        Keep me signed in
                                    </span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-primary hover:bg-[#22D3EE] text-white font-bold rounded-2xl shadow-xl shadow-cyan-900/10 transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">
                                            login
                                        </span>
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>
                        <div className='flex items-center justify-center pt-5'>
                            <GoogleButton onClick={handleGoogleLogin} text={'Sign In with Google'} />
                        </div>

                        {/* Divider */}
                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#22D3EE]/10" />
                            </div>


                        </div>


                        {/* Footer */}
                        <div className="text-center">

                            <p className="text-text text-sm">
                                New user?
                                <Link
                                    className="text-[#22D3EE] font-bold ml-2 hover:underline"
                                    to="/signup"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};