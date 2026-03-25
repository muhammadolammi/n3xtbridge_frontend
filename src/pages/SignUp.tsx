import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const NIGERIA_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
];

export const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 1. Setup Form State
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

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 2. Basic Validation
        if (!formData.email || !formData.password || !formData.first_name) {
            setError("Please fill in all required fields.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            // 3. Call Backend (matching your Go SignupInput struct)
            const response = await api.post('/auth/signup', formData);

            if (response.status === 200) {
                alert("Signup successful! Redirecting...");
                navigate("/signin");
            }
        } catch (err: any) {
            // Handle backend errors (e.g., 409 Conflict or 400 Bad Request)
            const message = err.response?.data?.error || "An error occurred during signup.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen pt-20 bg-gray-50">
            <div className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 overflow-y-auto">
                <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-500">Complete your profile to begin.</p>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">First Name</label>
                                <input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                                    placeholder="Julian"
                                    type="text"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Last Name</label>
                                <input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                                    placeholder="Vance"
                                    type="text"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                                    placeholder="julian@example.com"
                                    type="email"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                                <input
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                                    placeholder="+234 ..."
                                    type="tel"
                                />
                            </div>
                        </div>

                        {/* Password Field Added */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Password</label>
                            <input
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 transition-all"
                                placeholder="••••••••"
                                type="password"
                                required
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-50">
                            <div className="flex items-center space-x-3 mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-primary font-mono">Regional Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Street Address</label>
                                    <input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3"
                                        type="text"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Country</label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 appearance-none"
                                        disabled
                                    >
                                        <option value="Nigeria">Nigeria</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">State</label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 appearance-none"
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {NIGERIA_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <button
                                disabled={loading}
                                className="w-full md:w-auto px-10 py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                <span>{loading ? "Creating..." : "Create Account"}</span>
                                {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                            </button>
                            {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}

                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};