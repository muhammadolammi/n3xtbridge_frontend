import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Service } from '../models/model';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

const QuoteModal = ({ serviceName, serviceId, onClose }: { serviceName: string, serviceId: string, onClose: () => void }) => {
    const { user } = useAuth();
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    if (!user) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                        <div>
                            <h3 className="font-black uppercase tracking-tighter text-xl text-gray-900">Request Technical Quote</h3>
                            <p className="text-[10px] font-mono text-primary font-bold uppercase mt-1">Ref: {serviceName}</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-gray-400">close</span>
                        </button>
                    </div>

                    <div className="p-12 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-amber-500 text-3xl">lock</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Authentication Required</h4>
                        <p className="text-sm text-gray-500 mb-8 max-w-xs">
                            Please sign in to send a technical quote request.
                        </p>
                        <Link
                            to={`/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all text-center text-sm flex items-center justify-center gap-2"
                        >
                            Sign In to Continue
                            <span className="material-symbols-outlined text-sm">login</span>
                        </Link>
                        <button
                            onClick={onClose}
                            className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Cancel Request
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    const handleSendQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Matching your backend struct precisely
            const payload = {
                user_id: user.id,
                service_id: serviceId,
                description: description,
                attachments: [] // Will be implemented later
            };

            const res = await api.post("/quotes/request", payload);

            if (res.status === 201 || res.status === 200) {
                alert(`Quote request for ${serviceName} dispatched successfully.`);
                onClose();
            }
        } catch (err: any) {
            console.error("Quote Dispatch Error:", err);
            setError(err.response?.data?.error || "Failed to dispatch request to terminal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-black uppercase tracking-tighter text-xl text-gray-900">Request Technical Quote</h3>
                        <p className="text-[10px] font-mono text-primary font-bold uppercase mt-1">Ref: {serviceName}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-gray-400">close</span>
                    </button>
                </div>

                <form onSubmit={handleSendQuote} className="p-8 space-y-6">

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Project Description</label>
                        <textarea
                            required
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={`Tell us about your ${serviceName} requirements...`}
                            className="w-full border-2 border-gray-100 focus:border-primary rounded-xl p-4 text-sm outline-none transition-all"
                        />
                    </div>

                    <button
                        disabled={loading || !description.trim()}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Dispatch Request</span>
                                <span className="material-symbols-outlined text-sm">send</span>
                            </>
                        )}
                    </button>
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{error}</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};


const Services: React.FC = () => {
    const LIMIT = 6; // How many items per page
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();

    // Pagination State
    const [offset, setOffset] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const quoteRequest = searchParams.get('quote');
        if (quoteRequest) {
            setSelectedService(quoteRequest);
        }
    }, [searchParams]);
    const handleCloseModal = () => {
        setSelectedService(null);
        setSelectedServiceId(null)
        // Clear the query param so the modal doesn't re-open on refresh/navigation
        setSearchParams({}, { replace: true });
    };

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
                console.error("Catalog fetch failed", err);
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
                            <h2 className="text-3xl font-bold tracking-tight mb-4 text-on-background">Precision Catalog</h2>
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
                            services.map((service) => (
                                <div key={service.id} className="group bg-surface-container-lowest border border-transparent hover:border-primary/20 p-8 rounded-2xl flex flex-col h-full hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                                    <div className="w-14 h-14 bg-secondary-container rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary text-3xl">
                                            {service.icon || 'settings'}
                                        </span>
                                    </div>

                                    <div className="flex-grow">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">
                                            {service.category}
                                        </span>
                                        <h3 className="text-2xl font-bold mb-4 text-on-background tracking-tight">
                                            {service.name}
                                        </h3>
                                        <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                                            {service.description}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedServiceId(service.id)
                                            setSearchParams({ quote: service.name })
                                        }}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-surface-container-highest/50 text-on-surface font-bold py-4 rounded-xl hover:bg-primary hover:text-white transition-all group/btn active:scale-95"
                                    >
                                        Get Quote
                                        <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">
                                            request_quote
                                        </span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Quote Modal Overlay */}
            {selectedService && selectedServiceId && (
                <QuoteModal
                    serviceId={selectedServiceId}
                    serviceName={selectedService}
                    onClose={handleCloseModal}
                />
            )}
        </main>
    );
};

export default Services;