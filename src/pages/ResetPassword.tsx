import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const ValidationItem = ({ label, fulfilled }: { label: string; fulfilled: boolean }) => (
    <div className={`flex items-center space-x-2 ${fulfilled ? 'text-green-400' : 'text-gray-600'}`}>
        <span className="material-symbols-outlined text-[14px]">{fulfilled ? 'check_circle' : 'circle'}</span>
        <span className="text-[11px] font-medium">{label}</span>
    </div>
);

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const requirements = useMemo(() => ({
        length: password.length >= 10,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        match: password === confirmPassword && password !== ''
    }), [password, confirmPassword]);

    const isValid = Object.values(requirements).every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return setError("Invalid or expired token.");

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, password });
            alert("Password updated successfully!");
            navigate('/signin');
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <main className="min-h-screen bg-[#0C0C0C] flex items-center justify-center text-white px-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
                    <Link to="/forgot-password" title="Return to reset" className="text-[#0046FB]">Request a new link</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0C0C0C] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md bg-[#111] rounded-[2.5rem] border border-[#1A1A1A] p-8 md:p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <header className="mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">New Password</h2>
                    <p className="text-gray-500 text-sm">Secure your account with a strong password.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-1">New Password</label>
                        <input
                            className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-1">Confirm Password</label>
                        <input
                            className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="p-4 bg-[#0a0a0a] rounded-2xl border border-[#1A1A1A] grid grid-cols-2 gap-y-2">
                        <ValidationItem label="10+ Characters" fulfilled={requirements.length} />
                        <ValidationItem label="Uppercase" fulfilled={requirements.hasUpper} />
                        <ValidationItem label="Lowercase" fulfilled={requirements.hasLower} />
                        <ValidationItem label="Symbol" fulfilled={requirements.hasSymbol} />
                        <div className="col-span-2 pt-1 border-t border-[#1A1A1A] mt-1">
                            <ValidationItem label="Passwords Match" fulfilled={requirements.match} />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                    <button
                        disabled={loading || !isValid}
                        className="w-full py-5 bg-[#0046FB] hover:bg-[#003ccf] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/10 transition-all disabled:opacity-30"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </main>
    );
};