import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { QuoteRequestModal } from '../components/QuoteRequestModal';
import type { Promotion, Service } from '../models/model';
import { getFileUrl } from '../helpers/helpers';

export default function PromotionPage() {
    const { promo_code } = useParams<{ promo_code: string }>();
    const navigate = useNavigate();

    const [promo, setPromo] = useState<Promotion | null>(null);
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🔥 carousel state
    const [currentIndex, setCurrentIndex] = useState(0);



    useEffect(() => {
        const fetchPromoData = async () => {
            try {
                setLoading(true);

                const pRes = await api.get(`/promotions/verify/${promo_code}`);
                const promoData = pRes.data.promotion;

                if (!promoData?.service_id) throw new Error();

                setPromo(promoData);

                const sRes = await api.get(`/services/${promoData.service_id}`);
                setService(sRes.data.service || sRes.data);

            } catch {
                setError("This offer is no longer available");
            } finally {
                setLoading(false);
            }
        };

        if (promo_code) fetchPromoData();
    }, [promo_code]);

    if (loading) return (
        <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !promo || !service) return (
        <div className="min-h-screen bg-[#0C0C0C] flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-white text-2xl font-semibold">Offer not available</h2>
            <p className="text-gray-500 mt-2">This link may have expired.</p>
            <button onClick={() => navigate('/services')} className="mt-6 text-primary">
                Browse services
            </button>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0C0C0C] text-white pt-24 pb-20">

            <div className="max-w-6xl mx-auto px-6">

                {/* BACK */}
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-400 mb-8 hover:text-white"
                >
                    ← Back
                </button>

                <div className="grid lg:grid-cols-12 gap-12">

                    {/* LEFT */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* 🔥 IMAGE CAROUSEL */}
                        {promo.attachments?.length > 0 && (
                            <div className="relative">

                                <div className="w-full h-[260px] md:h-[420px] rounded-2xl overflow-hidden bg-[#111] relative">
                                    <img
                                        src={getFileUrl(promo.attachments[currentIndex], "public")}
                                        className="w-full h-full object-cover transition duration-500 hover:scale-105"
                                    />

                                    {/* gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                </div>

                                {/* arrows */}
                                {promo.attachments.length > 1 && (
                                    <>
                                        <button
                                            onClick={() =>
                                                setCurrentIndex((prev) =>
                                                    prev === 0 ? promo.attachments.length - 1 : prev - 1
                                                )
                                            }
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 px-3 py-2 rounded-full"
                                        >
                                            ‹
                                        </button>

                                        <button
                                            onClick={() =>
                                                setCurrentIndex((prev) =>
                                                    prev === promo.attachments.length - 1 ? 0 : prev + 1
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 px-3 py-2 rounded-full"
                                        >
                                            ›
                                        </button>
                                    </>
                                )}

                                {/* dots */}
                                <div className="flex justify-center gap-2 mt-4">
                                    {promo.attachments.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentIndex(i)}
                                            className={`h-2 rounded-full transition-all ${i === currentIndex ? "bg-primary w-5" : "bg-gray-600 w-2"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* thumbnails */}
                                <div className="flex gap-2 mt-4 overflow-x-auto">
                                    {promo.attachments.map((img, i) => (
                                        <img
                                            key={i}
                                            src={getFileUrl(img, "public")}
                                            onClick={() => setCurrentIndex(i)}
                                            className={`w-20 h-16 object-cover rounded cursor-pointer border ${i === currentIndex
                                                ? "border-primary"
                                                : "border-transparent"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TITLE */}
                        <div>
                            <p className="text-sm text-primary mb-2">
                                Limited Offer
                            </p>

                            <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-4">
                                {promo.name}
                            </h1>

                            <p className="text-gray-400 text-lg leading-relaxed">
                                {promo.description?.String ||
                                    "We’ve put together a simple offer to help you get started."}
                            </p>
                        </div>

                        {/* BENEFITS */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {promo.breakdown.map((item, idx) => (
                                <div key={idx} className="bg-[#141414] p-5 rounded-xl border border-[#1A1A1A]">
                                    <p className="text-lg font-semibold">
                                        {item.type === 'percentage'
                                            ? `${item.amount}% off`
                                            : item.type === 'fixed'
                                                ? item.amount === "0"
                                                    ? 'FREE'
                                                    : `₦${item.amount.toLocaleString()} off`
                                                : 'Included'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-5">

                        <div className="bg-[#111] rounded-2xl p-8 border border-[#1A1A1A] sticky top-28">

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold">{service.name}</h3>
                                <p className="text-sm text-gray-400">{service.category}</p>
                            </div>

                            <p className="text-sm text-gray-400 mb-6">
                                Tell us what you need and we’ll send you a price.
                                This offer will be applied automatically.
                            </p>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-primary py-4 rounded-xl font-semibold hover:opacity-90"
                            >
                                Get a Quote
                            </button>

                            {promo.expires_at && (
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Ends {new Date(promo.expires_at).toLocaleDateString()}
                                </p>
                            )}

                            {/* trust line */}
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                No payment required • Fast response
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <QuoteRequestModal
                    serviceId={service.id}
                    serviceName={service.name}
                    appliedPromos={[promo]}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </main>
    );
}