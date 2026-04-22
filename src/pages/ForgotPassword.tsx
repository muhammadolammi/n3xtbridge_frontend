import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Placeholder for your future backend endpoint
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err: any) {
            setError(err.response?.data?.error || "We couldn't find an account with that email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0C0C0C] flex items-center justify-center px-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#0046FB]/5 blur-[100px] rounded-full"></div>

            <div className="w-full max-w-md bg-[#111] rounded-[2.5rem] border border-[#1A1A1A] p-8 md:p-12 relative z-10 shadow-2xl">
                <header className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#0046FB]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-[#0046FB] text-3xl">lock_reset</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Forgot Password?</h2>
                    <p className="text-gray-500 text-sm">No worries, we'll send you instructions to get back in.</p>
                </header>

                {sent ? (
                    <div className="text-center animate-in fade-in zoom-in-95">
                        <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-3xl mb-8">
                            <p className="text-green-400 text-sm leading-relaxed">
                                We've sent a recovery link to <br />
                                <strong className="text-white">{email}</strong>
                            </p>
                        </div>
                        <Link to="/signin" className="text-[#0046FB] font-bold hover:underline">Return to Sign In</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-1">Email Address</label>
                            <input
                                className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                        <button
                            disabled={loading}
                            className="w-full py-5 bg-[#0046FB] hover:bg-[#003ccf] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/10 transition-all disabled:opacity-30 flex items-center justify-center"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Send Reset Link"}
                        </button>

                        <div className="text-center pt-4">
                            <Link to="/signin" className="text-gray-500 text-sm hover:text-white transition-colors">Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
};