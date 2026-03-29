import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import type { Promotion, Service } from '../models/model';
import { useAuth } from '../context/AuthContext';

const QuoteModal = ({
    serviceName,
    serviceId,
    onClose,
    appliedPromo
}: {
    serviceName: string,
    serviceId: string,
    onClose: () => void,
    appliedPromo?: Promotion | null
}) => {
    const { user } = useAuth();
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Keep your existing unauthenticated check here...

    const handleSendQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const payload = {
                user_id: user?.id,
                service_id: serviceId,
                service_name: serviceName,
                description: description,
                // Critical: Sending the promo_id to the Quote Request
                promo_id: appliedPromo?.id || null,
                attachments: []
            };

            const res = await api.post("/customer/quotes/requests", payload);
            if (res.status === 201 || res.status === 200) {
                alert(`Quote request for ${serviceName} dispatched successfully.`);
                onClose();
            }
        } catch (err: any) {
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
                        <p className="text-[10px] font-mono text-primary font-bold uppercase mt-1">Registry Ref: {serviceName}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-gray-400">close</span>
                    </button>
                </div>

                <form onSubmit={handleSendQuote} className="p-8 space-y-6">
                    {appliedPromo && (
                        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-4 animate-in zoom-in duration-300">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <span className="material-symbols-outlined text-sm">campaign</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Promotion Active</p>
                                    <p className="text-xs font-bold text-gray-900">{appliedPromo.name}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-amber-200/50">
                                {appliedPromo.breakdown?.map((discount, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-[10px] font-bold uppercase">
                                        <span className="text-gray-500">{discount.name}</span>
                                        <span className="text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-100">
                                            {discount.type === 'percentage' ? `-${discount.amount}%` : `-₦${Number(discount.amount).toLocaleString()}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Project Requirements</label>
                        <textarea
                            required
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={`Detail your specific requirements for ${serviceName}...`}
                            className="w-full border-2 border-gray-100 focus:border-primary rounded-xl p-4 text-sm outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-4">
                        <button
                            disabled={loading || !description.trim()}
                            className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                <><span>Dispatch Request</span><span className="material-symbols-outlined text-sm">send</span></>
                            )}
                        </button>
                        <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {appliedPromo ? "Campaign ID logged for automatic discounting" : "Standard registry response within 24h"}
                        </p>
                    </div>
                </form>
                {error && <p className="mt-4 text-xs font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            </div>
        </div>
    );
};

export default function ServiceDetail() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [service, setService] = useState<Service | null>(location.state?.service || null);
    const [promo, setPromo] = useState<Promotion | null>(location.state?.promo || null);
    const [loading, setLoading] = useState<boolean>(!location.state?.service);
    const [error, setError] = useState<string | null>(null);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    useEffect(() => {
        const promoCode = searchParams.get('promo');
        const fetchTerminalData = async () => {
            try {
                setLoading(true);
                if (!service) {
                    const res = await api.get(`/services/${id}`);
                    setService(res.data.service || res.data);
                }
                if (promoCode && !promo) {
                    const promoRes = await api.get(`/promotions/verify/${promoCode}`);
                    setPromo(promoRes.data.promotion);
                }
            } catch (err: any) {
                setError(`Registry Sync Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchTerminalData();
    }, [id, searchParams, !!service]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-mono">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <main className="pt-24 pb-20 bg-gray-50 min-h-screen">
            {/* STYLED PROMO BANNER: Only shows if promo is active */}
            {promo && (
                <div className="max-w-7xl mx-auto px-6 mb-8">
                    <div className="relative overflow-hidden bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/20 border border-white/10 animate-in slide-in-from-top duration-700">
                        {/* Decorative Circle */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-4xl animate-pulse">campaign</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Campaign Active</span>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase">{promo.name}</h2>
                                    <p className="text-xs font-medium opacity-90 max-w-lg mt-1">{promo.description.String}</p>
                                </div>
                            </div>
                            <div className="flex flex-col md:items-end gap-2">
                                <div className="text-[10px] font-mono font-bold bg-white/10 px-4 py-2 rounded-full border border-white/20">
                                    AUTH_CODE: {promo.code}
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary-container bg-white px-3 py-1 rounded-full">
                                    Discount applied at check-out
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Side */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <Link to="/services" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 group w-fit">
                                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                Back to Catalog
                            </Link>

                            <div className="space-y-2">
                                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Registry / {service?.category}</span>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-[0.9]">{service?.name}</h1>
                            </div>
                            <p className="text-xl text-gray-500 leading-relaxed font-medium max-w-2xl">{service?.description}</p>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {service?.tags?.map((tag) => (
                                <div key={tag} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <span className="material-symbols-outlined text-primary">verified</span>
                                    <span className="text-sm font-bold text-gray-700">{tag}</span>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-[3rem] overflow-hidden border border-gray-200 shadow-2xl h-[450px]">
                            <img src={service?.image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa"} alt={service?.name} className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Right Side Sticky Card */}
                    <div className="lg:col-span-5">
                        <div className={`sticky top-32 rounded-[3rem] p-10 md:p-12 shadow-2xl overflow-hidden border transition-all duration-500 ${promo ? 'bg-white border-primary/20 ring-4 ring-primary/5' : 'bg-secondary-dark text-white border-white/5'}`}>

                            {/* Visual cue if promo is active */}
                            {promo && (
                                <div className="absolute top-0 right-0 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl">
                                    Promo Applied
                                </div>
                            )}

                            <div className="relative z-10 space-y-8">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${promo ? 'bg-primary/10 text-primary' : 'bg-white/5 text-primary'}`}>
                                    <span className="material-symbols-outlined text-4xl">{service?.icon || 'terminal'}</span>
                                </div>

                                <div className="space-y-4">
                                    <h3 className={`text-3xl font-black tracking-tight leading-tight ${promo ? 'text-gray-900' : 'text-white'}`}>Start Your Integration</h3>
                                    <p className={`${promo ? 'text-gray-500' : 'text-gray-400'} text-sm leading-relaxed font-medium`}>
                                        {promo ? `Claim your special ${promo.name} benefits now.` : `Request a technical breakdown for ${service?.name}.`}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setIsQuoteModalOpen(true)}
                                    className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                                >
                                    Get Technical Quote
                                    <span className="material-symbols-outlined text-sm">request_quote</span>
                                </button>

                                <p className={`text-center text-[9px] font-bold uppercase tracking-widest ${promo ? 'text-primary' : 'text-gray-500'}`}>
                                    {promo ? 'Campaign validation token included' : 'Secure terminal enabled'}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {isQuoteModalOpen && service && (
                <QuoteModal
                    serviceId={service.id}
                    serviceName={service.name}
                    appliedPromo={promo}
                    onClose={() => setIsQuoteModalOpen(false)}
                />
            )}
            {error && <p className="mt-4 text-xs font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

        </main>
    );
}