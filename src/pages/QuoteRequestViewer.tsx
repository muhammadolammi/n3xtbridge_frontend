import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { Promotion, QuoteRequest } from "../models/model";
// import { ENV } from '../constants/const';
import { fetchSignedUrl } from "../api/presign";
import { STATUS_STYLES } from "../components/QuoteRequestTable";

export default function QuoteRequestViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [qr, setQr] = useState<QuoteRequest | null>(location.state?.qr || null);
  const [loading, setLoading] = useState<boolean>(!location.state?.qr);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    location.state?.qr?.description || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [claimedPromos, setClaimedPromos] = useState<Promotion[]>([]);

  // Media states
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  const [vnUrl, setVnUrl] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");

  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch promotions with subscription cleanup
  useEffect(() => {
    let isSubscribed = true;

    const fetchClaimed = async () => {
      if (qr?.promo_ids?.length) {
        try {
          const reqs = qr.promo_ids.map((promoId) =>
            api.get(`/promotions/${promoId}`),
          );
          const res = await Promise.all(reqs);
          if (isSubscribed) {
            setClaimedPromos(res.map((r) => r.data.promotion));
          }
        } catch (err) {
          console.error("Promos fetch failed", err);
        }
      }
    };

    fetchClaimed();

    return () => {
      isSubscribed = false;
    };
  }, [qr?.id]);

  // Fetch quote request core data
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (qr) {
      setLoading(false);
      setEditValue(qr.description || "");
      return;
    }

    let isSubscribed = true;

    const fetchQR = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/quotes/requests/${id}`);
        if (isSubscribed) {
          setQr(res.data);
          setEditValue(res.data.description || "");
        }
      } catch {
        if (isSubscribed) setError("Unable to load request");
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    if (id) fetchQR();

    return () => {
      isSubscribed = false;
    };
  }, [id, authLoading, user]);

  // Fetch signed URLs for all assets with subscription cleanup
  useEffect(() => {
    let isSubscribed = true;

    const fetchAssets = async () => {
      if (!qr) return;

      try {
        // 1. Handle Images
        if (qr.attachments?.length) {
          const urls = await Promise.all(
            qr.attachments.map(async (key) => {
              const res = await fetchSignedUrl(key);
              return res.data.url;
            }),
          );
          if (isSubscribed) setAttachmentUrls(urls);
        }

        // 2. Handle Voice Note
        if (qr.vn_key) {
          const res = await fetchSignedUrl(qr.vn_key);
          if (isSubscribed) setVnUrl(res.data.url);
        }

        // 3. Handle Video
        if (qr.video_key) {
          const res = await fetchSignedUrl(qr.video_key);
          if (isSubscribed) setVideoUrl(res.data.url);
        }
      } catch (err) {
        console.error("Failed to load assets", err);
      }
    };

    fetchAssets();

    return () => {
      isSubscribed = false;
    };
  }, [qr?.id, qr?.attachments, qr?.vn_key, qr?.video_key]);

  const handleUpdateDescription = async () => {
    if (!qr || isSaving) return;
    try {
      setIsSaving(true);
      await api.patch(`/customer/quotes/requests/${qr.id}/description`, {
        description: editValue,
      });
      setQr((prev) => (prev ? { ...prev, description: editValue } : null));
      setIsEditing(false);
    } catch {
      alert("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !qr) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text">
        <div className="text-center">
          <h2 className="text-xl mb-2">Request not found</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-text pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP NAV */}
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back
          </button>

          <span
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${STATUS_STYLES[qr.status] || "bg-gray-100 text-gray-700"}`}
          >
            {qr.status}
          </span>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-br from-secondary to-[#13385a] rounded-[32px] overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#22D3EE,transparent_30%)]"></div>

          <div className="relative p-8 md:p-12">
            {user?.role === "admin" && (
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm">
                <span className="material-symbols-outlined text-[18px]">
                  person
                </span>
                {qr.user_first_name} {qr.user_last_name} • {qr.user_email}
              </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="max-w-3xl">
                <p className="text-accent uppercase tracking-[0.2em] text-xs font-semibold mb-4">
                  Quote Request
                </p>

                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
                  {qr.service_name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      calendar_today
                    </span>
                    {new Date(qr.created_at).toLocaleDateString()}
                  </div>

                  <div className="w-1 h-1 rounded-full bg-white/40"></div>

                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      tag
                    </span>
                    {qr.id.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 min-w-[260px]">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                    Attachments
                  </p>
                  <h3 className="text-3xl font-bold text-white">
                    {attachmentUrls.length}
                  </h3>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                    Promotions
                  </p>
                  <h3 className="text-3xl font-bold text-white">
                    {claimedPromos.length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IMAGE SECTION */}
        {attachmentUrls.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-secondary">
                  Attachments
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Uploaded reference images
                </p>
              </div>

              <div className="flex items-center gap-2">
                {attachmentUrls.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      i === currentIndex
                        ? "w-8 h-2 bg-primary"
                        : "w-2 h-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative group rounded-[30px] overflow-hidden bg-gray-100 shadow-xl">
              <img
                src={attachmentUrls[currentIndex]}
                alt=""
                onClick={() => setFullscreenImg(attachmentUrls[currentIndex])}
                className="w-full h-[320px] md:h-[580px] object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {attachmentUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === 0 ? attachmentUrls.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-secondary">
                      chevron_left
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === attachmentUrls.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-secondary">
                      chevron_right
                    </span>
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-12">
          {/* MAIN */}
          <div className="xl:col-span-2 space-y-8">
            {/* DESCRIPTION */}
            <section className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-secondary">
                    Project Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Full customer request information
                  </p>
                </div>

                {user?.id === qr.user_id &&
                  qr.status === "pending" &&
                  !isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                      Edit
                    </button>
                  )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editValue}
                    disabled={isSaving}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full min-h-[220px] rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none p-5 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleUpdateDescription}
                      className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                    >
                      {isSaving && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        setEditValue(qr.description || "");
                        setIsEditing(false);
                      }}
                      className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-gray max-w-none">
                  <p className="leading-8 whitespace-pre-wrap text-[15px] text-gray-700">
                    {qr.description}
                  </p>
                </div>
              )}
            </section>

            {/* VIDEO */}
            {videoUrl && (
              <section className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-secondary">
                    Video Overview
                  </h2>
                </div>

                <div className="overflow-hidden rounded-2xl bg-black aspect-video">
                  <video controls className="w-full h-full">
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">
            {/* VOICE NOTE */}
            {vnUrl && (
              <section className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">
                      graphic_eq
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-secondary">
                      Voice Brief
                    </h3>
                    <p className="text-sm text-gray-500">Audio explanation</p>
                  </div>
                </div>

                <audio controls className="w-full">
                  <source src={vnUrl} />
                </audio>
              </section>
            )}

            {/* PROMOTIONS */}
            {claimedPromos.length > 0 && (
              <section className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-secondary">
                    Applied Offers
                  </h2>
                </div>

                <div className="space-y-4">
                  {claimedPromos.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl bg-primary/5 border border-primary/10 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-primary">
                            {p.name}
                          </h4>

                          <p className="text-sm text-primary/60 mt-1">
                            {p.code}
                          </p>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[20px]">
                            sell
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* FULLSCREEN */}
        {fullscreenImg && (
          <div
            onClick={() => setFullscreenImg(null)}
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <button
              type="button"
              onClick={() => setFullscreenImg(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white text-2xl hover:bg-white/20 transition-all cursor-pointer"
            >
              ×
            </button>

            <img
              src={fullscreenImg}
              alt=""
              className="max-w-[92vw] max-h-[92vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </div>
    </main>
  );
}
