import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { NIGERIA_STATES } from '../constants/const';

const ValidationItem = ({ label, fulfilled }: { label: string; fulfilled: boolean }) => (
    <div className={`flex items-center space-x-2 transition-colors ${fulfilled ? 'text-green-400' : 'text-gray-600'}`}>
        <span className="material-symbols-outlined text-[14px]">
            {fulfilled ? 'check_circle' : 'circle'}
        </span>
        <span className="text-[11px] font-medium tracking-wide">{label}</span>
    </div>
);

export const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        address: '',
        country: 'Nigeria',
        state: '',
        password: '',
    });

    const passwordRequirements = {
        length: formData.password.length >= 10,
        hasUpper: /[A-Z]/.test(formData.password),
        hasLower: /[a-z]/.test(formData.password),
        hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    };

    const [showPassword, setShowPassword] = useState(false);
    const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
    const isFormValid = isPasswordValid && formData.email && formData.first_name && formData.state;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!isFormValid) {
            setError("Ensure all required fields are filled and password meets requirements.");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/signup', formData);
            if (response.status === 200) {
                navigate("/signin");
            }
        } catch (err: any) {
            const message = err.response?.data?.error || "An error occurred during signup.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0C0C0C] text-white pt-24 pb-12 px-6 flex flex-col items-center">
            <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header Area */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">Get Started</h2>
                    <p className="text-gray-500">Create your account to request quotes and track projects.</p>
                </div>

                {/* Form Card */}
                <div className="bg-[#111] border border-[#1A1A1A] rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-center gap-3">
                            <span className="material-symbols-outlined text-base">error</span>
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Identity Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">First Name</label>
                                <input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all placeholder:text-gray-700"
                                    placeholder="Julian"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Last Name</label>
                                <input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all placeholder:text-gray-700"
                                    placeholder="Vance"
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all placeholder:text-gray-700"
                                    placeholder="julian@example.com"
                                    type="email"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Phone</label>
                                <input
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all placeholder:text-gray-700"
                                    placeholder="+234..."
                                    type="tel"
                                />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Security</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 pr-12 text-white focus:border-[#0046FB] outline-none transition-all placeholder:text-gray-700"
                                    placeholder="Create password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>

                            <div className="mt-4 p-4 bg-[#0a0a0a] rounded-2xl border border-[#1A1A1A] grid grid-cols-2 gap-y-2">
                                <ValidationItem label="10+ Characters" fulfilled={passwordRequirements.length} />
                                <ValidationItem label="Uppercase" fulfilled={passwordRequirements.hasUpper} />
                                <ValidationItem label="Lowercase" fulfilled={passwordRequirements.hasLower} />
                                <ValidationItem label="Symbol" fulfilled={passwordRequirements.hasSymbol} />
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="pt-6 border-t border-[#1A1A1A]">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-6">Regional Details</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Street Address</label>
                                    <input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all"
                                        type="text"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Country</label>
                                    <div className="relative">
                                        <select
                                            name="country"
                                            value={formData.country}
                                            className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white appearance-none outline-none opacity-60"
                                            disabled
                                        >
                                            <option value="Nigeria">Nigeria</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">lock</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">State</label>
                                    <div className="relative">
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white appearance-none focus:border-[#0046FB] outline-none transition-all"
                                            required
                                        >
                                            <option value="">Select State</option>
                                            {NIGERIA_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-8 flex flex-col items-center gap-6">
                            <button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className="w-full bg-[#0046FB] hover:bg-[#003ccf] text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-900/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-30"
                            >
                                <span>{loading ? "Initializing..." : "Create Account"}</span>
                                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                            </button>

                            <p className="text-gray-500 text-sm">
                                Already have an account? <Link to="/signin" className="text-[#0046FB] font-bold hover:underline">Sign In</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};