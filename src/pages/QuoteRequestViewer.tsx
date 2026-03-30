import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Promotion, QuoteRequest } from '../models/model';
import { QUOTE_REQUEST_STATUS_STYLES } from '../constants/const';

export default function QuoteRequestViewer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    // 1. Initial State: Check in-memory state first
    const [qr, setQr] = useState<QuoteRequest | null>(location.state?.qr || null);
    const [loading, setLoading] = useState<boolean>(!location.state?.qr);
    const [error, setError] = useState<string | null>(null);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const [claimedPromos, setClaimedPromos] = useState<Promotion[]>([]);

    useEffect(() => {
        const fetchClaimed = async () => {
            if (qr?.promo_ids?.length) {
                const reqs = qr.promo_ids.map(id => api.get(`/promotions/${id}`));
                const res = await Promise.all(reqs);
                setClaimedPromos(res.map(r => r.data.promotion));
            }
        };
        fetchClaimed();
    }, [qr?.id]);
    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login'); return; }
        if (qr) {
            setLoading(false);
            setEditValue(qr.description);
            return;
        }

        const fetchQRFromAPI = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/quotes/requests/${id}`);
                setQr(res.data);
                setEditValue(res.data.description);
            } catch (err: any) {
                setError(err.response?.status === 404 ? "Terminal Record Not Found" : "Connection Failure");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchQRFromAPI();
    }, [id, authLoading, user]);

    const handleUpdateDescription = async () => {
        if (!qr) return;
        try {
            await api.patch(`/customer/quote-requests/${qr.id}`, { description: editValue });
            setQr({ ...qr, description: editValue });
            setIsEditing(false);
            alert("Specification synchronized.");
        } catch (err) {
            alert("Update failed. Check terminal permissions.");
        }
    };

    if (authLoading || loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] mt-4 text-gray-400">Loading Request File...</p>
        </div>
    );

    if (error || !qr) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center max-w-sm">
                <span className="material-symbols-outlined text-red-500 text-5xl mb-4">terminal</span>
                <h3 className="text-xl font-bold mb-2">Access Denied</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">{error || "The request file is inaccessible."}</p>
                <button onClick={() => navigate('/dashboard')} className="text-primary font-black text-xs uppercase hover:underline">Return to Hub</button>
            </div>
        </div>
    );

    return (
        <main className="pt-24 pb-12 px-4 md:px-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-md border text-[10px] font-black uppercase tracking-[0.2em] ${QUOTE_REQUEST_STATUS_STYLES[qr.status]}`}>
                            {qr.status}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="h-2 bg-primary w-full"></div>

                    <div className="p-8 md:p-12">
                        {/* Title Section */}
                        <div className="mb-12 border-b border-gray-50 pb-8">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Request Specification</p>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{qr.service_name}</h2>
                            <p className="text-[10px] font-mono text-gray-400 mt-2 uppercase">File ID: {qr.id}</p>
                        </div>

                        {/* Customer & Date Grid */}
                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Created By</h4>
                                <p className="text-sm font-bold text-gray-900">{qr.user_name || user?.first_name}</p>
                                <p className="text-xs text-gray-400">{qr.user_email || user?.email}</p>
                            </div>
                            <div className="text-right">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deployment Date</h4>
                                <p className="text-sm font-bold text-gray-900">{new Date(qr.created_at).toLocaleDateString('en-NG', { dateStyle: 'long' })}</p>
                            </div>
                        </div>

                        {/* Description Section */}
                        {/* Description Section */}
                        <div className="mb-12">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Description of Works
                                </h4>

                                {/* CRITICAL PERMISSION CHECK */}
                                {/* Only the owner can edit, and only if it is still pending */}
                                {user?.id === qr.user_id && qr.status === 'pending' && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-primary text-[10px] font-black uppercase hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit_note</span>
                                        Update Specification
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <textarea
                                        className="w-full bg-gray-50 border border-primary/20 rounded-2xl p-6 text-sm outline-none leading-relaxed min-h-[150px] focus:ring-4 focus:ring-primary/5 transition-all"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdateDescription}
                                            className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                        >
                                            Sync to Registry
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(false); setEditValue(qr.description); }}
                                            className="px-6 py-2 bg-gray-100 text-gray-400 text-[10px] font-black uppercase rounded-lg hover:bg-gray-200 transition-all"
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-8 rounded-2xl border border-gray-100 italic select-all">
                                        "{qr.description}"
                                    </p>
                                    {/* Admin/Staff Hint */}
                                    {(user?.role === 'admin' || user?.role === 'staff') && (
                                        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-amber-600 uppercase">
                                            <span className="material-symbols-outlined text-[12px]">lock</span>
                                            Read-only Archive (Customer Managed)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* promos */}
                        {claimedPromos.length > 0 && (
                            <div className="mb-12">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Claimed Promotions</h4>
                                <div className="flex flex-wrap gap-3">
                                    {claimedPromos.map(p => (
                                        <div key={p.id} className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                                            <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">campaign</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-amber-700 uppercase leading-none">{p.name}</p>
                                                <p className="text-[9px] font-mono text-amber-600/60 mt-1">{p.code}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-2 text-[9px] font-bold text-gray-400 uppercase italic">
                                    * These incentives will be evaluated and applied to the final architectural quote.
                                </p>
                            </div>
                        )}

                        {/* Attachments Section */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Technical Attachments</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {qr.attachments && qr.attachments.length > 0 ? (
                                    qr.attachments.map((img, i) => (
                                        <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-100 group relative">
                                            <img src={img} alt="Attachment" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                <span className="material-symbols-outlined text-white">zoom_in</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300">
                                        <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No Attachments Uploaded</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}