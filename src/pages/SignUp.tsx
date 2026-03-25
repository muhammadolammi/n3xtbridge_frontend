import React, { useState } from 'react';

// --- Configuration Data ---
const NIGERIA_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
];

// --- Sub-Components ---

// const BlueprintSidePanel = ({ title, subtitle, version }: { title: string, subtitle: string, version: string }) => (
//     <div className="hidden md:flex w-1/3 bg-gray-900 relative overflow-hidden flex-col justify-end p-12 border-r border-white/5">
//         {/* CSS-only Blueprint Grid Background */}
//         <div className="absolute inset-0 opacity-20 pointer-events-none s-40"
//             style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
//         </div>
//         <div className="relative z-10">
//             <div className="mb-8">
//                 <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase rounded-full mb-4 border border-primary/30">
//                     Infrastructure & Development
//                 </span>
//                 <h1 className="text-white text-4xl font-extrabold tracking-tight leading-none mb-6">
//                     {title}
//                 </h1>
//                 <p className="text-gray-400 text-lg leading-relaxed max-w-xs">
//                     {subtitle}
//                 </p>
//             </div>
//             <div className="flex items-center space-x-4 opacity-50">
//                 <div className="h-px w-12 bg-gray-500"></div>
//                 <span className="text-xs text-gray-500 tracking-widest font-mono uppercase">{version}</span>
//             </div>
//         </div>
//     </div >
// );

// --- Main Pages ---

export const SignUp = () => {
    return (
        <main className="flex min-h-screen pt-20 bg-gray-50">
            {/* <BlueprintSidePanel
                title="<>Building the <br />Systems of Tomorrow.</>"
                subtitle="Join the network powering high-end architectural IT installations."
                version="v2.4.0"
            /> */}

            <div className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 overflow-y-auto">
                <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-500">Complete your architectural profile to begin.</p>
                    </div>

                    <form className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">First Name</label>
                                <input className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 transition-all" placeholder="Julian" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Last Name</label>
                                <input className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 transition-all" placeholder="Vance" type="text" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                                <input className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 transition-all" placeholder="julian@n3xtbridge.com" type="email" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                                <input className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 transition-all" placeholder="+234 ..." type="tel" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50">
                            <div className="flex items-center space-x-3 mb-6">
                                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-primary font-mono">Regional Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Street Address</label>
                                    <input className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3" type="text" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Country</label>
                                    <select className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 appearance-none cursor-not-allowed" disabled>
                                        <option>Nigeria</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">State</label>
                                    <select className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-primary px-0 py-3 appearance-none">
                                        <option value="">Select State</option>
                                        {NIGERIA_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <label className="flex items-start space-x-3 max-w-sm cursor-pointer">
                                <input className="mt-1 rounded-sm border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                                <span className="text-[11px] leading-tight text-gray-500">
                                    By creating an account, you agree to our <a className="underline hover:text-primary" href="#">Terms</a> and <a className="underline hover:text-primary" href="#">Privacy Policy</a>.
                                </span>
                            </label>
                            <button className="w-full md:w-auto px-10 py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center space-x-2">
                                <span>Create Account</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};


