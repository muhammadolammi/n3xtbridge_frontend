import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { NIGERIA_STATES } from '../constants/const';
import { Mail } from 'lucide-react';
import { GoogleButton, handleGoogleLogin } from '../components/resusable';

const ValidationItem = ({ label, fulfilled }: { label: string; fulfilled: boolean }) => (
    <div className={`flex items-center space-x-2 transition-colors ${fulfilled ? 'text-secondary' : 'text-gray-600'}`}>
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
    const [isManualSignUp, setIsManualSignUp] = useState(false);

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

    if (isManualSignUp) {
        return (
            <main className="min-h-screen bg-background text-text pt-24 pb-12 px-6 flex flex-col items-center">
                <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Header Area */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-primary">Get Started</h2>
                        <p className="text-text">Create your account to enjoy our services and offers.</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-background border border-[#22D3EE] rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
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
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">First Name</label>
                                    <input
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full  border border-[#22D3EE] rounded-2xl px-5 py-4 text-text focus:border-[#0046FB] outline-none transition-all placeholder:text-gray-700"
                                        placeholder="Julian"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Last Name</label>
                                    <input
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full  border border-[#22D3EE] rounded-2xl px-5 py-4 text-text focus:border-[#0046FB] outline-none transition-all placeholder:text-gray-700"
                                        placeholder="Vance"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Email</label>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full  border border-[#22D3EE] rounded-2xl px-5 py-4 text-text focus:border-[#0046FB] outline-none transition-all placeholder:text-gray-700"
                                        placeholder="julian@example.com"
                                        type="email"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Phone</label>
                                    <input
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className="w-full border border-[#22D3EE] rounded-2xl px-5 py-4 text-text focus:border-[#0046FB] outline-none transition-all placeholder:text-gray-700"
                                        placeholder="+234..."
                                        type="tel"
                                    />
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full  border border-[#22D3EE] rounded-2xl px-5 py-4 pr-12 text-text focus:border-[#0046FB] outline-none transition-all placeholder:text-gray-700"
                                        placeholder="Create password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#22D3EE]"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>

                                <div className="mt-4 p-4  rounded-2xl border border-[#22D3EE] grid grid-cols-2 gap-y-2">
                                    <ValidationItem label="10+ Characters" fulfilled={passwordRequirements.length} />
                                    <ValidationItem label="Uppercase" fulfilled={passwordRequirements.hasUpper} />
                                    <ValidationItem label="Lowercase" fulfilled={passwordRequirements.hasLower} />
                                    <ValidationItem label="Symbol" fulfilled={passwordRequirements.hasSymbol} />
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="pt-6 border-t border-[#22D3EE]">
                                <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-6">Regional Details</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-Primary ml-1">Street Address</label>
                                        <input
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full  border border-[#22D3EE] rounded-2xl px-5 py-4 text-text focus:border-[#0046FB] outline-none transition-all"
                                            type="text"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Country</label>
                                        <div className="relative">
                                            <select
                                                name="country"
                                                value={formData.country}
                                                className="w-full  border border-[#22D3EE] rounded-2xl px-5 py-4 text-text appearance-none outline-none opacity-60"
                                                disabled
                                            >
                                                <option value="Nigeria">Nigeria</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">lock</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">State</label>
                                        <div className="relative">
                                            <select
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full  border border-[#22D3EE] rounded-2xl px-5 py-4 text-text appearance-none focus:border-[#0046FB] outline-none transition-all"
                                                required
                                            >
                                                <option value="">Select State</option>
                                                {NIGERIA_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-8 flex flex-col items-center gap-6">
                                <button
                                    type="submit"
                                    disabled={loading || !isFormValid}
                                    className="w-full bg-primary hover:bg-[#22D3EE] text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-900/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
                                >
                                    <span>{loading ? "Initializing..." : "Create Account"}</span>
                                    {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                                </button>
                                <div className='flex items-center justify-center'>
                                    <GoogleButton onClick={handleGoogleLogin} text={'Join with Google'} />
                                </div>

                                <p className="text-text text-sm">
                                    Already have an account? <Link to="/signin" className="text-[#22D3EE] font-bold hover:underline">Sign In</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        );
    }
    return (
        <div className="min-h-screen bg-background text-text pt-24 pb-12 px-6 flex flex-col items-center">
            {/* two buttons that shows enter enail and details or signup with google */}
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Area */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-primary">Get Started</h2>
                    <p className="text-text">Create your account to enjoy our services and offers.</p>
                </div>

                <div className="space-y-4">

                    <div className='flex items-center justify-center'>

                        <button
                            onClick={() => setIsManualSignUp(true)}

                            className="group relative flex h-10 w-auto min-w-max max-w-[400px] items-center justify-between overflow-hidden rounded-md border border-[#747775] bg-white px-3 text-center font-['Roboto',_arial,_sans-serif] text-sm tracking-[0.25px] text-[#1f1f1f] transition-all duration-[218ms] hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.30),0_1px_3px_1px_rgba(60,64,67,0.15)] focus:outline-none active:bg-white disabled:cursor-default disabled:bg-white/40 disabled:border-[#1f1f1f1f]"
                        >
                            {/* State Overlay (Hover/Focus effect) */}
                            <div className="absolute inset-0 bg-[#303030] opacity-0 transition-opacity duration-[218ms] group-hover:opacity-[0.08] group-focus:opacity-[0.12] group-active:opacity-[0.12]" />

                            <div className="relative flex w-full items-center justify-between">
                                {/* Google Icon */}
                                <span className="material-symbols-outlined mr-2.5 h-5 w-5 min-w-[20px] group-disabled:opacity-40">
                                    <Mail />
                                </span>

                                {/* Button Text */}
                                <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap font-medium group-disabled:opacity-40">
                                    Join  with Email & Password

                                </span>
                            </div>
                        </button>
                    </div>
                    <div className='flex items-center justify-center'>
                        <GoogleButton onClick={handleGoogleLogin} text={'Join with Google'} />
                    </div>

                </div>
            </div>
        </div>
    )

};