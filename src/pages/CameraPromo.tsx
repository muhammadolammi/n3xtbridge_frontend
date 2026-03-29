

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import type { Promotion } from '../models/model';

export default function CameraPromo() {
    const [searchParams] = useSearchParams();
    const [promo, setPromo] = useState<Promotion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Hardcoded Service ID for the Camera Installation
    const CAMERA_SERVICE_ID = "your-camera-service-uuid-here";
    const defaultCode = "VISION-ZERO";

    useEffect(() => {
        const fetchPromo = async () => {
            const code = searchParams.get('code') || defaultCode;
            try {
                setLoading(true);
                const res = await api.get(`/promotions/verify/${code}`);
                setPromo(res.data.promotion);
            } catch (err) {
                console.error("Promo Registry Error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPromo();
    }, [searchParams]);

    if (loading) return (
        <div className="min-h-screen bg-secondary-dark flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Syncing Campaign Node</p>
            </div>
        </div>
    );

    if (error || !promo || !promo.is_active) return (
        <div className="min-h-screen bg-secondary-dark flex items-center justify-center px-6">
            <div className="text-center space-y-8 max-w-lg">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                    <span className="material-symbols-outlined text-gray-500 text-4xl">event_busy</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Campaign Offline</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                    The requested promotion has reached its terminal date or is no longer active in the registry.
                    Explore our standard catalog for current technical specifications.
                </p>
                <Link to="/services" className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
                    Return to Catalog
                </Link>
            </div>
        </div>
    );

    // Dynamic benefit calculation for the UI
    const totalBenefit = promo.breakdown.reduce((acc, curr) => {
        if (curr.type === 'fixed') return acc + `₦${(curr?.amount ?? 0).toLocaleString()} + `;
        return acc + `${curr.amount}% + `;
    }, "").slice(0, -3);

    return (
        <main className="bg-secondary-dark min-h-screen text-white pt-32 pb-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -mr-80 -mt-80"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center mb-24">
                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                            Active Campaign: {promo.code}
                        </span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
                        {promo.name.split(' ')[0]} <br />
                        <span className="text-primary">{promo.name.split(' ').slice(1).join(' ')}</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        {promo.description.String} <br />
                        Deploy professional-grade security infrastructure with <span className="text-white">bundled discount benefits.</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {[
                        { icon: 'videocam', title: '4K Optics', desc: 'Ultra-HD surveillance with AI human detection and night vision.' },
                        { icon: 'router', title: 'Edge Storage', desc: 'Local NVR deployment ensuring your data never leaves your perimeter.' },
                        {
                            icon: 'campaign',
                            title: 'Bundle Value',
                            desc: `Stacked Discounts: ${totalBenefit || "Service optimization applied."}`
                        }
                    ].map((item, i) => (
                        <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/[0.07] transition-all group">
                            <span className="material-symbols-outlined text-primary text-4xl mb-6 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </span>
                            <h4 className="text-xl font-bold mb-3 uppercase tracking-tight text-white">{item.title}</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[3.5rem] p-12 md:p-20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-8 text-center uppercase leading-none">
                            Secure your <br /> perimeter now.
                        </h2>

                        <Link
                            to={`/services/${CAMERA_SERVICE_ID}?promo=${promo.code}`}
                            state={{ promo: promo }}
                            className="inline-flex items-center gap-6 bg-primary text-white px-16 py-7 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-[1.03] active:scale-95 transition-all group"
                        >
                            Get Technical Breakdown
                            <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                        </Link>

                        <div className="mt-12 flex gap-12 border-t border-gray-100 pt-12 w-full max-w-md justify-center">
                            {promo.breakdown.slice(0, 2).map((d, idx) => (
                                <div key={idx} className="text-center">
                                    <p className="text-2xl font-black text-gray-900">
                                        {d.type === 'percentage' ? `${d.amount}%` : `₦${(d?.amount ?? 0).toLocaleString()}`}
                                    </p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                                        {d.name.length > 15 ? "Discount" : d.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}