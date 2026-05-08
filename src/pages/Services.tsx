import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Service, ServiceCategory } from '../models/model';
import { QuoteRequestModal } from '../components/QuoteRequestModal';
import { ICON_MAP } from '../components/resusable';
import { Briefcase } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';

const Services: React.FC = () => {
    const LIMIT = 6;

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const location = useLocation();

    const [activeCategoryID, setActiveCategoryID] = useState<string>(location.state?.category_id || "all");
    const [_, setSearchParams] = useSearchParams();

    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    const openQuoteModal = (service: Service) => {
        setSelectedService(service);
        setIsQuoteModalOpen(true);
    };

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories/services');
                setCategories(res.data.service_categories || []);
            } catch (err) {
                console.error("Failed to load categories");
            }
        };

        fetchCategories();
    }, []);

    // Fetch services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);

                const url =
                    activeCategoryID === "all"
                        ? `/services?limit=${LIMIT}&offset=${offset}`
                        : `/services?limit=${LIMIT}&offset=${offset}&category=${activeCategoryID}`;

                const res = await api.get(url);

                setServices(res.data.services || []);
                setTotalCount(res.data.total || 0);
            } catch (err) {
                console.error("Catalog fetch failed");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [offset, activeCategoryID]);

    const handleNext = () => {
        if (offset + LIMIT < totalCount) setOffset(prev => prev + LIMIT);
    };

    const handlePrev = () => {
        if (offset > 0) setOffset(prev => prev - LIMIT);
    };

    if (loading && offset === 0) {
        return (
            <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#0046FB] blur-[40px] rounded-full opacity-20 animate-pulse"></div>
                    <div className="relative font-['Inter'] font-semibold text-3xl tracking-tighter text-white animate-bounce">
                        N3xtbridge
                    </div>
                </div>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-[#838383]">
                    Fetching...
                </p>
            </div>
        );
    }

    return (
        <main className="bg-background min-h-screen">

            {/* HERO */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute w-[500px] h-[200px] bg-[#0046FB] blur-[180px] rounded-full opacity-20 -top-10 -left-20 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-8">
                        Our Engineering <span className="text-primary">Solutions</span>
                    </h1>
                    <p className="text-lg md:text-xl text-text max-w-3xl leading-relaxed">
                        High-fidelity infrastructure and software ecosystems engineered for precision. We provide the technical backbone for modern enterprise operations in Nigeria and beyond.                    </p>
                </div>
            </section>

            {/* MAIN GRID */}
            <section className="py-10 pb-32">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* SIDEBAR */}
                    <aside className="lg:col-span-3">

                        <div className="sticky top-28 space-y-2">

                            {/* ALL */}
                            <button
                                disabled={activeCategoryID === "all"}
                                onClick={() => {
                                    setSearchParams({ category: "all" });

                                    setActiveCategoryID("all");
                                    setOffset(0);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition ${activeCategoryID === "all"
                                    ? "bg-primary text-white border-primary"
                                    : "border-[#2F2F2F] text-[#838383] hover:border-primary"
                                    }`}
                            >
                                All Services
                            </button>

                            {/* CATEGORIES */}
                            {categories.map((cat) => {
                                const Icon =
                                    ICON_MAP[cat.icon] || Briefcase;
                                return <button
                                    key={cat.id}
                                    disabled={activeCategoryID === cat.id}

                                    onClick={() => {
                                        setSearchParams({ category: cat.slug });
                                        setActiveCategoryID(cat.id);
                                        setOffset(0);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl border transition flex items-center gap-2 ${activeCategoryID === cat.id
                                        ? "bg-primary text-white border-primary"
                                        : "border-[#2F2F2F] text-[#838383] hover:border-primary"
                                        }`}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <span className="truncate">{cat.name}</span>
                                </button>
                            })}
                        </div>
                    </aside>

                    {/* CONTENT */}
                    <div className="lg:col-span-9">

                        {/* HEADER */}
                        <div className="mb-10 flex justify-between items-center border-b border-[#1A1A1A] pb-6">
                            <h2 className="text-sm uppercase tracking-widest text-[#838383]">
                                Showing {offset + 1} — {Math.min(offset + LIMIT, totalCount)} of {totalCount}
                            </h2>

                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrev}
                                    disabled={offset === 0 || loading}
                                    className="px-4 py-2 border border-[#2F2F2F] rounded-full disabled:opacity-30"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={offset + LIMIT >= totalCount || loading}
                                    className="px-4 py-2 border border-[#2F2F2F] rounded-full disabled:opacity-30"
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        {/* SERVICES */}

                        <div className="flex flex-col gap-16">

                            {services.length === 0 ? (
                                <div className="py-32 text-center text-[#838383] border border-dashed border-[#2F2F2F] rounded-2xl">
                                    No services found.
                                </div>
                            ) : (
                                services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="grid grid-cols-1 md:grid-cols-2  border border-[#1A1A1A] rounded-3xl overflow-hidden hover:border-[#0046FB]/30 transition"
                                    >

                                        {/* IMAGE */}
                                        <div className="relative min-h-[300px]">
                                            <img
                                                src={service.image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b"}
                                                alt={service.name}
                                                className="w-full h-full object-cover grayscale-[20%]"
                                            />
                                        </div>

                                        {/* TEXT */}
                                        <div className="p-8 flex flex-col justify-center">


                                            <h3 className="text-3xl font-semibold  mb-4 text-secondary">
                                                {service.name}
                                            </h3>

                                            <p className="text-[#64748B] mb-6">
                                                {service.description}
                                            </p>


                                            {service.min_price.trim() !== `''` && service.min_price.trim() !== `""` && service.min_price.trim() !== "" && (
                                                <div className="mb-8 flex items-center gap-2">
                                                    <span className="text-[#94A3B8] text-sm uppercase tracking-wide">
                                                        Starting at
                                                    </span>
                                                    <span className="text-secondary font-bold text-lg">
                                                        ₦{new Intl.NumberFormat('en-NG').format(Number(service.min_price))}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex gap-3 flex-wrap">

                                                <button
                                                    onClick={() => openQuoteModal(service)}
                                                    className="bg-primary text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-secondary transition-all duration-300 hover:scale-[1.02] active:scale-95"
                                                >
                                                    Get Quote
                                                </button>

                                                <a
                                                    href={`https://wa.me/2349139971163?text=${encodeURIComponent(
                                                        `Hello, I'm interested in ${service.name}`
                                                    )}`}
                                                    className="px-5 py-3 border border-[#25D366] text-[#25D366] rounded-lg"
                                                    target="_blank"
                                                >
                                                    WhatsApp
                                                </a>

                                            </div>
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* MODAL */}
            {isQuoteModalOpen && selectedService && (
                <QuoteRequestModal
                    serviceId={selectedService.id}
                    serviceName={selectedService.name}
                    onClose={() => setIsQuoteModalOpen(false)}
                    appliedPromos={null}
                />
            )}
        </main>
    );
};

export default Services;