import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Promotion, QuoteRequest } from '../models/model';
import { QUOTE_REQUEST_STATUS_STYLES } from '../constants/const';
import { fetchSignedUrl } from '../api/presign';

export default function QuoteRequestViewer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    const [qr, setQr] = useState<QuoteRequest | null>(location.state?.qr || null);
    const [loading, setLoading] = useState<boolean>(!location.state?.qr);
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const [claimedPromos, setClaimedPromos] = useState<Promotion[]>([]);

    // 🔥 NEW: media states
    const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

    const [vnUrl, setVnUrl] = useState<string>("");

    const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch promotions
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

    // Fetch quote request
    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login'); return; }

        if (qr) {
            setLoading(false);
            setEditValue(qr.description);
            return;
        }

        const fetchQR = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/quotes/requests/${id}`);
                setQr(res.data);
                setEditValue(res.data.description);
            } catch {
                setError("Unable to load request");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchQR();
    }, [id, authLoading, user]);

    // 🔥 Fetch signed URLs
    useEffect(() => {
        const fetchAssets = async () => {
            if (!qr) return;

            try {
                if (qr.attachments?.length) {
                    const urls = await Promise.all(
                        qr.attachments.map(async (key) => {
                            const res = await fetchSignedUrl(key);
                            return res.data.url;
                        })
                    );
                    setAttachmentUrls(urls);
                }

                if (qr.vn_key) {
                    const res = await fetchSignedUrl(qr.vn_key);

                    setVnUrl(res.data.url);
                }

            } catch {
                console.error("Failed to load assets");
            }
        };

        fetchAssets();
    }, [qr?.id]);

    const handleUpdateDescription = async () => {
        if (!qr) return;
        try {
            // /customer/quotes / requests / { id } / description"
            await api.patch(`/customer/quotes/requests/${qr.id}/description`, { description: editValue });
            setQr({ ...qr, description: editValue });
            setIsEditing(false);
        } catch {
            alert("Update failed");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0C0C0C]">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !qr) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0C0C0C] text-white">
                <div className="text-center">
                    <h2 className="text-xl mb-2">Request not found</h2>
                    <button onClick={() => navigate('/dashboard')} className="text-primary">
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0C0C0C] text-white pt-24 pb-16">

            <div className="max-w-5xl mx-auto px-6">

                {/* Back */}
                {/* <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-400 mb-8 hover:text-white"
                >
                    ← Back
                </button> */}

                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-semibold mb-2">
                            {qr.service_name}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Created {new Date(qr.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${QUOTE_REQUEST_STATUS_STYLES[qr.status]}`}>
                        {qr.status}
                    </span>
                </div>

                {/* 🔥 IMAGE CAROUSEL */}

                {attachmentUrls.length > 0 && (
                    <div className="mb-12">
                        <div className="relative">

                            <div className="w-full h-[260px] md:h-[450px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">

                                <img
                                    src={attachmentUrls[currentIndex]}
                                    onClick={() => setFullscreenImg(attachmentUrls[currentIndex])}

                                    className="w-full h-full object-cover bg-black "
                                />
                            </div>

                            {attachmentUrls.length > 1 && (
                                <>
                                    <button
                                        onClick={() =>
                                            setCurrentIndex(prev =>
                                                prev === 0 ? attachmentUrls.length - 1 : prev - 1
                                            )
                                        }
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 px-3 py-2 rounded-full"
                                    >
                                        ‹
                                    </button>

                                    <button
                                        onClick={() =>
                                            setCurrentIndex(prev =>
                                                prev === attachmentUrls.length - 1 ? 0 : prev + 1
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 px-3 py-2 rounded-full"
                                    >
                                        ›
                                    </button>
                                </>
                            )}

                            <div className="flex justify-center gap-2 mt-4">
                                {attachmentUrls.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`h-2 rounded-full ${i === currentIndex ? "bg-primary w-5" : "bg-gray-600 w-2"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div className="text-[10px] text-gray-500 mt-2 text-center">
                    Tap image to view full screen
                </div>
                {/* Description */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Description</h3>

                        {user?.id === qr.user_id && qr.status === 'pending' && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-primary text-sm"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <textarea
                                className="w-full bg-[#111] border border-[#1A1A1A] rounded-xl p-4"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button onClick={handleUpdateDescription} className="bg-primary px-5 py-2 rounded-lg">
                                    Save
                                </button>
                                <button onClick={() => setIsEditing(false)} className="text-gray-400">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400 leading-relaxed bg-[#111] p-6 rounded-xl">
                            {qr.description}
                        </p>
                    )}
                </div>

                {/* 🎧 VOICE NOTE */}
                {vnUrl !== "" && (
                    <div className="mb-12">
                        <h3 className="text-sm font-semibold mb-3 text-gray-300">
                            Voice Note
                        </h3>

                        <div className="bg-[#111] rounded-2xl p-5 border border-[#1A1A1A] flex items-center gap-4">

                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">
                                    graphic_eq
                                </span>
                            </div>

                            <audio controls className="w-full">
                                <source src={vnUrl} />
                            </audio>
                        </div>
                    </div>
                )}

                {/* Promotions */}
                {claimedPromos.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-lg font-semibold mb-4">Applied offers</h3>
                        <div className="flex flex-wrap gap-3">
                            {claimedPromos.map(p => (
                                <div key={p.id} className="bg-[#111] px-4 py-3 rounded-xl border border-[#1A1A1A]">
                                    <p className="font-semibold">{p.name}</p>
                                    <p className="text-xs text-gray-500">{p.code}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {fullscreenImg && (
                    <div
                        onClick={() => setFullscreenImg(null)}
                        className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999]"
                    >
                        <img
                            src={fullscreenImg}
                            className="max-h-[90vh] max-w-[90vw] object-contain"
                        />
                    </div>
                )}

            </div>
        </main>
    );
}