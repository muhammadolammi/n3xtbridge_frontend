import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Promotion, QuoteRequest, Service } from '../models/model';
import { useAuth } from '../context/AuthContext';

const QuoteRequestModal = ({
    serviceName,
    serviceId,
    onClose,
    appliedPromos
}: {
    serviceName: string,
    serviceId: string,
    onClose: () => void,
    appliedPromos?: Promotion[] | null
}) => {
    const { user } = useAuth();
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()


    const handleSendQuoteRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const promo_ids = appliedPromos?.map(p => p.id) ?? []


        try {
            const payload = {
                user_id: user?.id,
                service_id: serviceId,
                service_name: serviceName,
                description: description,
                promo_ids: promo_ids,
                attachments: []
            };

            const res = await api.post("/customer/quotes/requests", payload);
            if (res.status === 201 || res.status === 200) {

                alert(`Quote request for ${serviceName} dispatched successfully.`);
                const qr: QuoteRequest = res.data.quote_request
                navigate(`/dashboard/view-qr/${qr.id}`, { state: { qr: qr, } })

                onClose();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to dispatch request to terminal.");
        } finally {
            setLoading(false);
        }
    };
    if (!user) {
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

                    <div className="p-8 space-y-6">

                        <div className="space-y-4">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => {
                                    const currentPath = window.location.pathname + window.location.search;
                                    const redirectUrl = encodeURIComponent(currentPath);

                                    navigate(`/signin?redirect=${redirectUrl}`, {
                                        state: { promos: appliedPromos }
                                    });

                                }
                                }
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                    <><span>Sign In & Send</span><span className="material-symbols-outlined text-sm">send</span></>
                                )}
                            </button>
                            {error && <p className="mt-4 text-xs font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                        </div>



                    </div>

                </div >
            </div >
        );
    }

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

                <form onSubmit={handleSendQuoteRequest} className="p-8 space-y-6">

                    <div className="space-y-4">


                    </div>


                    {appliedPromos && appliedPromos.length > 0 && (
                        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-4 animate-in zoom-in duration-300">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <span className="material-symbols-outlined text-sm">campaign</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Promotions Active</p>
                                    {/* {
                                        appliedPromos.map((appliedPromo) => <>
                                            <p key={appliedPromo.id} className="text-xs font-bold text-gray-900">{appliedPromo.name}</p>

                                        </>)
                                    } */}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-amber-200/50">
                                {
                                    appliedPromos.map((appliedPromo) => {
                                        return (
                                            <div key={appliedPromo.id}>
                                                {appliedPromo.breakdown?.map((discount, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-[10px] font-bold uppercase">
                                                        <span className="text-gray-500">{discount.name}</span>
                                                        <span className="text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-100">
                                                            {discount.type === 'item_match' ? "" : discount.type === 'percentage' ? `-${discount.amount}%` : `-₦${Number(discount.amount).toLocaleString()}`}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )

                                    }

                                    )
                                }

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
                            {appliedPromos && appliedPromos.length > 0 ? "Campaign ID logged for automatic discounting" : "Standard registry response within 24h"}
                        </p>
                    </div>
                    {error && <p className="mt-4 text-xs font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                </form>

            </div>
        </div>
    );
};

export default function ServiceDetail() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [service, setService] = useState<Service | null>(location.state?.service || null);
    const [promos, setPromos] = useState<Promotion[]>(
        []
    );


    const [loading, setLoading] = useState<boolean>(!location.state?.service);
    const [error, setError] = useState<string | null>(null);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const handleAddPromo = (promoToAdd: Promotion) => {
        setPromos(prev => {
            const exists = prev.find(p => p.id === promoToAdd.id);
            if (exists) return prev; // Don't add if already there
            return [...prev, promoToAdd];
        });
    };

    const handleRemovePromo = (promoId: string) => {
        setPromos(prev => prev.filter(p => p.id !== promoId));
    };

    useEffect(() => {
        const fetchTerminalData = async () => {
            try {
                setLoading(true);
                let currentService = service;

                if (!currentService) {
                    const res = await api.get(`/services/${id}`);
                    currentService = res.data.service || res.data;
                    setService(currentService);
                }

                if (currentService && currentService.promo_ids?.length > 0) {
                    const promoRequests = currentService.promo_ids.map((pId: string) =>
                        api.get(`/promotions/${pId}`)
                    );
                    const promoResponses = await Promise.all(promoRequests);
                    const fetchedPromos: Promotion[] = promoResponses.map(r => r.data.promotion);

                    setService(prev => prev ? { ...prev, active_promotions: fetchedPromos } : null);

                    const memPromos: Promotion[] = location.state?.promos || [];

                    if (memPromos.length > 0) {
                        // Filter memory promos against the official fetched list
                        const validPromosFromMemory = memPromos.filter(m =>
                            fetchedPromos.some(f => f.id === m.id)
                        );

                        if (validPromosFromMemory.length > 0) {
                            setPromos(validPromosFromMemory);
                        }
                    }
                }
            } catch (err: any) {
                setError(`Registry Sync Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchTerminalData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-mono">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <main className="pt-24 pb-20 bg-gray-50 min-h-screen">

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Side */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <Link to="/services" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 group w-fit">
                                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                Back to Catalog
                            </Link>
                            {/* Promo Selection List */}
                            <div className="space-y-4 pt-6 border-t border-gray-100">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">
                                    Apply Technical Incentives ({promos.length})
                                </label>

                                {/* The Dropdown: Only shows promos NOT already selected */}
                                <div className="relative">
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            const found = service?.active_promotions?.find(p => p.id === e.target.value);
                                            if (found) handleAddPromo(found);
                                        }}
                                        className="w-full appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none hover:border-primary/30 transition-all cursor-pointer"
                                    >
                                        <option value="" disabled>Add a promotion...</option>
                                        {service?.active_promotions
                                            ?.filter(p => !promos.some(selected => selected.id === p.id))
                                            .map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))
                                        }
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <span className="material-symbols-outlined">add_circle</span>
                                    </div>
                                </div>

                                {/* The "Selected Chips" List */}
                                <div className="flex flex-wrap gap-2">
                                    {promos.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl animate-in zoom-in duration-200"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-primary leading-none uppercase">{p.code}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemovePromo(p.id)}
                                                className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-white transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

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
                        <div className={`sticky top-32 rounded-[3rem] p-10 md:p-12 shadow-2xl overflow-hidden border transition-all duration-500 ${promos.length > 0 ? 'bg-white border-primary/20 ring-4 ring-primary/5' : 'bg-secondary-dark text-white border-white/5'}`}>

                            {/* Visual cue if promo is active */}
                            {promos.length > 0 && (
                                <div className="absolute top-0 right-0 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl">
                                    Promo Applied
                                </div>
                            )}

                            <div className="relative z-10 space-y-8">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${promos.length > 0 ? 'bg-primary/10 text-primary' : 'bg-white/5 text-primary'}`}>
                                    <span className="material-symbols-outlined text-4xl">{service?.icon || 'terminal'}</span>
                                </div>

                                <div className="space-y-4">
                                    <h3 className={`text-3xl font-black tracking-tight leading-tight ${promos.length > 0 ? 'text-gray-900' : 'text-white'}`}>Start Your Integration</h3>
                                    <p className={`${promos.length > 0 ? 'text-gray-500' : 'text-gray-400'} text-sm leading-relaxed font-medium`}>
                                        {`Request a technical breakdown for ${service?.name}.`}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setIsQuoteModalOpen(true)}
                                    className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                                >
                                    Get Technical Quote
                                    <span className="material-symbols-outlined text-sm">request_quote</span>
                                </button>

                                <p className={`text-center text-[9px] font-bold uppercase tracking-widest ${promos.length > 0 ? 'text-primary' : 'text-gray-500'}`}>
                                    {promos.length > 0 ? 'Campaign validation token included' : 'Secure terminal enabled'}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {isQuoteModalOpen && service && (
                <QuoteRequestModal
                    serviceId={service.id}
                    serviceName={service.name}
                    appliedPromos={promos}
                    onClose={() => setIsQuoteModalOpen(false)}
                />
            )}
            {error && <p className="mt-4 text-xs font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

        </main>
    );
}