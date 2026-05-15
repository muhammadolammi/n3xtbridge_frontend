import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Promotion, QuoteRequest } from '../models/model';
import { ENV } from '../constants/const';
import { fetchSignedUrl } from '../api/presign';
import { STATUS_STYLES } from '../components/QuoteRequestTable';


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

    // Media states
    const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
    const [vnUrl, setVnUrl] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState<string>("");

    const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch promotions
    useEffect(() => {
        const fetchClaimed = async () => {
            if (qr?.promo_ids?.length) {
                try {
                    const reqs = qr.promo_ids.map(id => api.get(`/promotions/${id}`));
                    const res = await Promise.all(reqs);
                    setClaimedPromos(res.map(r => r.data.promotion));
                } catch (err) {
                    console.error("Promos fetch failed", err);
                }
            }
        };
        fetchClaimed();
    }, [qr?.id]);

    // Fetch quote request core data
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

    // Fetch signed URLs for all assets
    useEffect(() => {
        const fetchAssets = async () => {
            if (!qr) return;

            try {
                // 1. Handle Images
                if (qr.attachments?.length) {
                    const urls = await Promise.all(
                        qr.attachments.map(async (key) => {
                            const res = await fetchSignedUrl(key);
                            return res.data.url;
                        })
                    );
                    setAttachmentUrls(urls);
                }

                // 2. Handle Voice Note
                if (qr.vn_key) {
                    const res = await fetchSignedUrl(qr.vn_key);
                    setVnUrl(res.data.url);
                }

                // 3. Handle Video
                if (qr.video_key) {
                    const res = await fetchSignedUrl(qr.video_key);
                    setVideoUrl(res.data.url);
                }

            } catch (err) {
                console.error("Failed to load assets", err);
            }
        };

        fetchAssets();
    }, [qr?.id, qr?.attachments, qr?.vn_key, qr?.video_key]);

    const handleUpdateDescription = async () => {
        if (!qr) return;
        try {
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
                    <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0C0C0C] text-white pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-6">
                <div className='h-10'></div>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    {user?.role === "admin" && ENV == "developmet" && (
                        <button
                            onClick={() => {
                                console.log(qr)
                            }}>
                            Test log
                        </button>
                    )}

                    <div>
                        <h1 className="text-3xl md:text-5xl font-semibold mb-2">
                            {qr.service_name}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Created {new Date(qr.created_at).toLocaleDateString()} • ID: {qr.id.slice(-6).toUpperCase()}
                        </p>
                    </div>

                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[qr.status]}`}>
                        {qr.status}
                    </span>
                </div>

                {/* IMAGE CAROUSEL SECTION */}
                {attachmentUrls.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-widest">Images</h3>
                        <div className="relative group">
                            <div className="w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden bg-[#111] border border-[#1A1A1A] flex items-center justify-center">
                                <img
                                    src={attachmentUrls[currentIndex]}
                                    onClick={() => setFullscreenImg(attachmentUrls[currentIndex])}
                                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 hover:scale-[1.02]"
                                    alt={`Attachment ${currentIndex + 1}`}
                                />
                            </div>

                            {attachmentUrls.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentIndex(prev => prev === 0 ? attachmentUrls.length - 1 : prev - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-primary p-3 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>

                                    <button
                                        onClick={() => setCurrentIndex(prev => prev === attachmentUrls.length - 1 ? 0 : prev + 1)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-primary p-3 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </>
                            )}

                            <div className="flex justify-center gap-2 mt-4">
                                {attachmentUrls.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-primary w-8" : "bg-gray-700 w-2"}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIDEO SECTION */}
                {videoUrl && (
                    <div className="mb-12">
                        <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-widest">Video Overview</h3>
                        <div className="rounded-3xl overflow-hidden border border-[#1A1A1A] bg-black aspect-video max-h-[500px]">
                            <video
                                controls
                                className="w-full h-full"
                                preload="metadata"
                            >
                                <source src={videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Request Details</h3>

                        {user?.id === qr.user_id && qr.status === 'pending' && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 text-primary text-sm font-bold hover:opacity-80"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Edit Details
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <textarea
                                className="w-full bg-[#111] border border-[#1A1A1A] rounded-2xl p-6 text-white focus:border-primary outline-none transition-all min-h-[150px]"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button onClick={handleUpdateDescription} className="bg-primary hover:bg-primary/90 px-6 py-2.5 rounded-xl font-bold transition-all">
                                    Save Changes
                                </button>
                                <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold hover:text-white transition-all">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#111] p-8 rounded-3xl border border-[#1A1A1A] relative group">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {qr.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* VOICE NOTE */}
                {vnUrl && (
                    <div className="mb-12">
                        <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-widest">
                            Voice Brief
                        </h3>
                        <div className="bg-[#111] rounded-2xl p-6 border border-[#1A1A1A] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary text-3xl">
                                    graphic_eq
                                </span>
                            </div>
                            <div className="flex-1">
                                <audio controls className="w-full h-10">
                                    <source src={vnUrl} />
                                </audio>
                            </div>
                        </div>
                    </div>
                )}

                {/* Applied Promotions */}
                {claimedPromos.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-widest">Applied Offers</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {claimedPromos.map(p => (
                                <div key={p.id} className="bg-primary/5 px-6 py-4 rounded-2xl border border-primary/20 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-primary">{p.name}</p>
                                        <p className="text-xs text-primary/60">{p.code}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary">sell</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Fullscreen Overlay */}
                {fullscreenImg && (
                    <div
                        onClick={() => setFullscreenImg(null)}
                        className="fixed inset-0 bg-black/95 flex items-center justify-center z-[999] backdrop-blur-sm p-4"
                    >
                        <button className="absolute top-8 right-8 text-white text-4xl">&times;</button>
                        <img
                            src={fullscreenImg}
                            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95"
                            alt="Fullscreen view"
                        />
                    </div>
                )}

            </div>
        </main>
    );
}