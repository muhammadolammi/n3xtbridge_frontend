import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import type { Promotion } from '../models/model';

export default function ViewPromotion() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [promo, setPromo] = useState<Promotion | null>(location.state?.promo || null);
    const [loading, setLoading] = useState(!location.state?.promo);

    useEffect(() => {
        if (!promo) {
            const fetchPromo = async () => {
                try {
                    const res = await api.get(`/admin/promotions/${id}`);
                    setPromo(res.data.promotion);
                } catch (err) {
                    console.error("Failed to fetch promo from registry");
                } finally {
                    setLoading(false);
                }
            };
            fetchPromo();
        }
    }, [id, promo]);

    const handleToggleStatus = async () => {
        if (!promo) return;
        try {
            const newStatus = !promo.is_active;
            await api.patch(`/admin/promotions/${promo.id}/status`, { is_active: newStatus });
            setPromo({ ...promo, is_active: newStatus });
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="p-20 text-center font-mono text-xs uppercase animate-pulse">Syncing Campaign Node...</div>;
    if (!promo) return <div className="p-20 text-center font-bold text-red-500">PROMO_NOT_FOUND_IN_REGISTRY</div>;

    const isExpired = promo.expires_at?.Valid && new Date(promo.expires_at.Time) < new Date();

    return (
        <main className="max-w-4xl mx-auto pt-32 pb-20 px-6">
            <header className="flex justify-between items-start mb-12">
                <div className="space-y-2">
                    <Link to="/dashboard" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 group">
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Back to Terminal
                    </Link>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{promo.name}</h1>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-mono font-bold rounded tracking-widest uppercase">
                            CODE: {promo.code}
                        </span>
                        <span className={`px-3 py-1 rounded text-[10px] font-black uppercase border ${promo.is_active && !isExpired ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {isExpired ? 'Status: Expired' : promo.is_active ? 'Status: Active' : 'Status: Offline'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleToggleStatus}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${promo.is_active ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-green-600 text-white shadow-green-600/20'}`}
                >
                    {promo.is_active ? 'Deactivate Campaign' : 'Reactivate Campaign'}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Metadata */}
                <div className="md:col-span-1 space-y-6">
                    <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Campaign Timeline</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Started At</p>
                                <p className="text-sm font-bold">{new Date(promo.starts_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Expires At</p>
                                <p className="text-sm font-bold">
                                    {promo.expires_at?.Valid ? new Date(promo.expires_at.Time).toLocaleDateString() : 'Indefinite'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Breakdown & Logic */}
                <div className="md:col-span-2 space-y-6">
                    <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Benefit Logic (Breakdown)</h4>
                        <div className="space-y-4">
                            {(promo.breakdown || []).map((discount, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{discount.name}</p>
                                        <p className="text-[9px] font-bold text-amber-600 uppercase mt-0.5">
                                            {discount.type === 'item_match' ? `Target: ${discount.item_name}` : `Type: ${discount.type}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-amber-700 bg-white px-3 py-1 rounded-lg border border-amber-200">
                                            {discount.type === 'percentage' ? `-${discount.amount}%` :
                                                discount.type === 'item_match' ? 'FREE' : `-₦${Number(discount.amount).toLocaleString()}`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Public Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed italic">
                            "{promo.description.String || 'No public description registered for this campaign.'}"
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}