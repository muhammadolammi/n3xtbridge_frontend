import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Service } from '../models/model';
import { useNavigate } from 'react-router-dom';


const Services: React.FC = () => {
    const LIMIT = 6; // How many items per page
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    // Pagination State
    const [offset, setOffset] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                // Fetch with dynamic limit and offset
                const res = await api.get(`/services?limit=${LIMIT}&offset=${offset}`);

                // Expecting {services: [], total: 10 }
                setServices(res.data.services || []);
                setTotalCount(res.data.total || 0);
            } catch (err) {
                console.error("Catalog fetch failed");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
        // Scroll to top on page change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [offset]);

    // Navigation Handlers
    const handleNext = () => {
        if (offset + LIMIT < totalCount) setOffset(prev => prev + LIMIT);
    };

    const handlePrev = () => {
        if (offset > 0) setOffset(prev => prev - LIMIT);
    };

    const isFirstPage = offset === 0;
    const isLastPage = offset + LIMIT >= totalCount;

    return (
        <main className="pt-24 pb-20">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-surface">
                <div className="blueprint-grid absolute inset-0 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-3/5">
                            <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                                Technical Excellence
                            </span>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-on-background mb-8">
                                Our Technical <span className="text-primary">Services</span>
                            </h1>
                            <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed">
                                Engineered for precision. Designed for scale. We provide high-fidelity infrastructure and software solutions that form the backbone of modern enterprise operations.
                            </p>
                        </div>
                        <div className="w-full md:w-2/5 flex justify-end">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary/10 rounded-xl blur-2xl group-hover:bg-primary/20 transition-all"></div>
                                <img alt="Technical engineering" className="relative rounded-xl shadow-2xl w-full max-w-sm object-cover aspect-square border border-outline-variant/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_ZVGiSt2LSNJOLJy3ui4cF0rmyzugmHVHHx2xd9KJ8jcz0Ypc2EdtXC-oB7FSrV6MsshjgGyZfNXiWQ8jnTIiEXOMXEIhk5TVQvlj8dGIj5BwJpmiuEzOkuVSn-OtsgEcEvI7oCcFXZIcB-A3k40EUgms_2mhWJrsuQp2RBjtboQL47TbIrc1-_T7JZfNUEmwxShVoF-ULd4Af1NoDQsRhYXi-anvp4j9ZxrDY8oRxZ5_E5hFG-FhOtJuR4XGMcUj3XSTpilLXLWb" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid Section */}
            <section className="py-24 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-16 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-4 text-on-background">Catalog</h2>
                            <div className="h-1.5 w-20 bg-primary rounded-full"></div>
                        </div>

                        {/* Pagination: < > Style */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrev}
                                disabled={isFirstPage || loading}
                                className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-primary hover:border-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={isLastPage || loading}
                                className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-primary hover:border-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[500px]">
                        {loading ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Syncing Catalog...</p>
                            </div>
                        ) : services.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-gray-400 font-mono text-xs uppercase tracking-widest">
                                No technical specs found in this range.
                            </div>
                        ) : (
                            services.map((service) => {
                                // Check if the service has an active promo linked
                                const hasActivePromo = !!service.promo_ids && service.promo_ids.length > 0;
                                return (
                                    <div key={service.id} className={`group bg-white border rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col ${hasActivePromo ? 'border-primary/30 ring-4 ring-primary/5 shadow-lg shadow-primary/5' : 'border-gray-100'}`}>

                                        {/* Service Image Header */}
                                        <div className="relative h-48 overflow-hidden">
                                            {/* PROMO RIBBON */}
                                            {hasActivePromo && (
                                                <div className="absolute top-4 -right-12 bg-primary text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-12 rotate-45 z-20 shadow-lg border-b border-white/20">
                                                    Active Offer
                                                </div>
                                            )}

                                            <img
                                                src={service.image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b"}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={service.name}
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                            <div className="absolute bottom-4 left-6 flex items-center gap-3 z-10">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border ${hasActivePromo ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/10 border-white/20 text-white'}`}>
                                                    <span className="material-symbols-outlined text-xl">{service.icon}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{service.category}</span>
                                            </div>
                                        </div>

                                        <div className="p-8 flex-grow">
                                            <h3 className="text-2xl font-bold mb-3 text-gray-900 tracking-tight flex items-center gap-2">
                                                {service.name}
                                                {hasActivePromo && <span className="material-symbols-outlined text-primary text-sm animate-pulse">campaign</span>}
                                            </h3>
                                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                                                {service.description}
                                            </p>
                                        </div>

                                        <div className="p-8 pt-0 mt-auto space-y-4">
                                            {/* PROMO SNIPPET BAR */}
                                            {hasActivePromo && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                                                    <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">
                                                        Special Pricing Available
                                                    </p>
                                                </div>
                                            )}

                                            <button

                                                onClick={() => navigate(`/services/${service.id}`, { state: { service: service, } })}
                                                className={`w-full inline-flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all group/btn ${hasActivePromo ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-900 hover:bg-primary hover:text-white'}`}
                                            >
                                                {hasActivePromo ? 'Claim Campaign Offer(s)' : 'View Specifications'}
                                                <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>


        </main>
    );
};

export default Services;