import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Service } from '../models/model';
import { QuoteRequestModal } from '../components/QuoteRequestModal';

const Services: React.FC = () => {
    const LIMIT = 6;
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    const openQuoteModal = (service: Service) => {
        setSelectedService(service);
        setIsQuoteModalOpen(true);
    };
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/services?limit=${LIMIT}&offset=${offset}`);
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
    }, [offset]);

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
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-[#838383]">Syncing Technical Specs...</p>
            </div>
        );
    }

    return (
        <main className="bg-black text-[#F5F5F5] min-h-screen font-['Inter']">
            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute w-[500px] h-[200px] bg-[#0046FB] blur-[180px] rounded-full opacity-20 -top-10 -left-20 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <span className="inline-block text-[#0046FB] text-xs font-bold tracking-[0.3em] uppercase mb-6">
                        Technical Catalog
                    </span>
                    <h1 className="text-5xl md:text-7xl font-['Manrope'] font-medium tracking-tight mb-8">
                        Our Engineering <span className="text-[#0046FB]">Solutions</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#B5B5B5] max-w-3xl leading-relaxed font-['Manrope']">
                        High-fidelity infrastructure and software ecosystems engineered for precision. We provide the technical backbone for modern enterprise operations in Nigeria and beyond.
                    </p>
                </div>
            </section>

            {/* SERVICES LIST */}
            <section className="py-12 pb-32">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header & Pagination Controls */}
                    <div className="mb-16 flex justify-between items-center border-b border-[#1A1A1A] pb-8">
                        <h2 className="text-xl font-['Manrope'] font-medium uppercase tracking-widest text-[#838383]">
                            Showing {offset + 1} — {Math.min(offset + LIMIT, totalCount)} of {totalCount}
                        </h2>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePrev}
                                disabled={offset === 0 || loading}
                                className="p-4 rounded-full border border-[#2F2F2F] hover:border-[#0046FB] hover:text-[#0046FB] disabled:opacity-20 transition-all active:scale-90"
                            >
                                ← Prev
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={offset + LIMIT >= totalCount || loading}
                                className="p-4 rounded-full border border-[#2F2F2F] hover:border-[#0046FB] hover:text-[#0046FB] disabled:opacity-20 transition-all active:scale-90"
                            >
                                Next →
                            </button>
                        </div>
                    </div>

                    {/* SERVICES DISPLAY */}
                    <div className="flex flex-col gap-20">
                        {services.length === 0 ? (
                            <div className="py-40 text-center text-[#838383] font-mono text-xs uppercase tracking-widest border border-dashed border-[#2F2F2F] rounded-3xl">
                                No technical specs found in this range.
                            </div>
                        ) : (
                            services.map((service, index) => (
                                <div
                                    key={service.id}
                                    className="group grid grid-cols-1 lg:grid-cols-2 items-stretch bg-[#0C0C0C] rounded-3xl overflow-hidden border border-[#1A1A1A] hover:border-[#0046FB]/30 transition-all duration-500"
                                >
                                    {/* IMAGE SIDE */}
                                    <div className="relative min-h-[300px] md:min-h-[450px] overflow-hidden order-first lg:order-none">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent z-10 lg:hidden"></div>
                                        <div className="absolute inset-0 bg-[#0046FB]/5 mix-blend-overlay z-10"></div>
                                        <img
                                            src={service.image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b"}
                                            alt={service.name}
                                            className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                        />
                                    </div>

                                    {/* TEXT SIDE */}
                                    <div className={`p-8 md:p-12 lg:p-20 flex flex-col justify-center ${index % 2 !== 0 ? 'lg:order-first' : 'lg:order-last'}`}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-[1px] bg-[#0046FB]"></div>
                                            <span className="text-[#0046FB] font-bold tracking-widest text-[10px] uppercase">
                                                {service.category || "General ICT"}
                                            </span>
                                        </div>

                                        <h3 className="text-3xl md:text-5xl font-['Manrope'] font-semibold mb-6 text-white leading-tight">
                                            {service.name}
                                        </h3>

                                        <p className="text-[#B5B5B5] text-base md:text-lg leading-relaxed mb-10 max-w-md font-['Manrope']">
                                            {service.description}
                                        </p>

                                        {/* PRICE TAG */}

                                        {service.min_price.trim() !== `''` && service.min_price.trim() !== `""` && service.min_price.trim() !== "" && (<div className="mb-6 flex items-center gap-2">
                                            <span className="text-[#838383] text-sm font-['Manrope'] uppercase tracking-wider">Starting at</span>
                                            <span className="text-white font-bold text-lg font-['Inter']">
                                                ₦{new Intl.NumberFormat('en-NG').format(Number(service.min_price))}
                                            </span>
                                        </div>
                                        )}

                                        {/* BUTTON GROUP */}
                                        <div className="flex flex-wrap gap-4 items-center">

                                            <button
                                                onClick={() => openQuoteModal(service)}
                                                className="bg-[#0046FB] text-white px-6 md:px-8 py-3.5 md:py-4 font-bold text-sm hover:scale-105 transition-transform active:scale-95">
                                                Get a Quote
                                            </button>

                                            {/* WhatsApp Chat Button */}
                                            <a
                                                href={`https://wa.me/2349139971163?text=${encodeURIComponent(`Hello N3xtbridge Sales, I'm interested in ${service.name}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 px-6 py-3.5 md:py-4 font-bold text-sm hover:bg-[#25D366] hover:text-white transition-all active:scale-95"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                </svg>
                                                WhatsApp Chat
                                            </a>

                                            {/* Specifications Link */}
                                            {/* <button className="group/btn flex items-center gap-2 text-[#F5F5F5] font-semibold text-sm">
                                                Full Specifications
                                                <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                            </button> */}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                {/* MODAL RENDERING (AT THE BOTTOM OF MAIN) */}
                {isQuoteModalOpen && selectedService && (
                    <QuoteRequestModal
                        serviceId={selectedService.id}
                        serviceName={selectedService.name}
                        onClose={() => setIsQuoteModalOpen(false)}
                        appliedPromos={null} // Or pass current active promos if you have them
                    />
                )}
            </section>

        </main>
    );
};

export default Services;