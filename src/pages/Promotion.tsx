import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Tag,
  Calendar,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
} from "lucide-react";
import api from "../api/axios";
import { QuoteRequestModal } from "../components/QuoteRequestModal";
import { BrandLoader } from "../components/resusable";
import type { Promotion, Service } from "../models/model";
import { getFileUrl } from "../helpers/helpers";

export default function PromotionPage() {
  const { promo_code } = useParams<{ promo_code: string }>();
  const navigate = useNavigate();

  const [promo, setPromo] = useState<Promotion | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        setError("This offer is no longer available or may have expired.");
      } finally {
        setLoading(false);
      }
    };

    if (promo_code) fetchPromoData();
  }, [promo_code]);

  if (loading) return <BrandLoader />;

  if (error || !promo || !service) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
          <Tag className="w-8 h-8" />
        </div>
        <h2 className="text-secondary text-2xl font-bold">
          Offer Not Available
        </h2>
        <p className="text-[#64748B] mt-2 max-w-md">
          {error || "This promotion link is invalid or has ended."}
        </p>
        <button
          onClick={() => navigate("/services")}
          className="mt-6 bg-primary text-white font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Browse Services
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-text font-['Inter'] pt-28 pb-20 px-6 md:px-12 lg:px-20 selection:bg-[#0046FB]/30">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-7 space-y-8">
            {/* IMAGE CAROUSEL */}
            {promo.attachments && promo.attachments.length > 0 && (
              <div className="space-y-4">
                <div className="w-full h-[280px] md:h-[420px] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 relative group shadow-sm">
                  <img
                    src={getFileUrl(promo.attachments[currentIndex], "public")}
                    alt={promo.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                  {promo.attachments.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            prev === 0
                              ? promo.attachments.length - 1
                              : prev - 1,
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-secondary p-2.5 rounded-full shadow-md transition-all"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            prev === promo.attachments.length - 1
                              ? 0
                              : prev + 1,
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-secondary p-2.5 rounded-full shadow-md transition-all"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {promo.attachments.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {promo.attachments.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          i === currentIndex
                            ? "border-primary shadow-sm scale-105"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={getFileUrl(img, "public")}
                          alt=""
                          className="w-20 h-16 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TITLE & DESCRIPTION */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-4">
                <Tag className="w-3.5 h-3.5" /> Special Promotion
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-secondary leading-tight mb-4">
                {promo.name}
              </h1>

              {/* MARKDOWN / TEXT DESCRIPTION */}
              <div className="text-[#64748B] text-base md:text-lg leading-relaxed space-y-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="leading-relaxed mb-3" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong
                        className="text-secondary font-semibold"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-xl font-bold text-secondary mt-6 mb-2"
                        {...props}
                      />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4
                        className="text-lg font-bold text-secondary mt-4 mb-2"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="space-y-2.5 my-4 list-none pl-1"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li
                        className="flex items-start gap-2.5 text-base"
                        {...props}
                      >
                        <span className="text-primary font-bold mt-1 text-lg leading-none shrink-0">
                          •
                        </span>
                        <span>{props.children}</span>
                      </li>
                    ),
                  }}
                >
                  {promo.description?.String ||
                    "We've put together an exclusive offer package tailored to deliver maximum value for your business."}
                </ReactMarkdown>
              </div>
            </div>

            {/* BREAKDOWN / BENEFITS */}
            {promo.breakdown && promo.breakdown.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-secondary">
                  Offer Breakdown
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {promo.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-primary/20 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xl">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>
                          {item.type === "percentage"
                            ? `${item.amount}% off`
                            : item.type === "fixed"
                              ? item.amount === "0"
                                ? "FREE"
                                : `₦${Number(item.amount).toLocaleString()} off`
                              : "Included"}
                        </span>
                      </div>
                      <p className="text-sm text-[#64748B] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TERMS AND CONDITIONS SECTION */}
            {promo.terms_and_conditions &&
              promo.terms_and_conditions.length > 0 && (
                <div className="pt-6 border-t border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-secondary font-semibold text-base">
                    <FileText className="w-4 h-4 text-primary" />
                    <h4>Terms & Conditions</h4>
                  </div>
                  <ul className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    {promo.terms_and_conditions.map(
                      (term: string, idx: number) => (
                        <li
                          key={idx}
                          className="text-xs text-[#64748B] flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-primary font-bold">•</span>
                          <span>{term}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
          </div>

          {/* RIGHT CARD / ACTION */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl sticky top-28 space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Service
                </span>
                <h3 className="text-2xl font-bold text-secondary mt-1">
                  {service.name}
                </h3>
                {service.category && (
                  <p className="text-sm text-[#64748B] mt-1">
                    {service.category}
                  </p>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              <p className="text-sm text-gray-400 mb-6">
                Tell us what you need and we’ll send you a price. This offer
                will be applied automatically.
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-primary text-white py-4 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary/20 text-center"
              >
                Claim Offer & Get Quote
              </button>

              {promo.expires_at && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 py-2.5 rounded-xl border border-amber-100">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Ends {new Date(promo.expires_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-[#64748B] pt-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>No upfront payment required • Fast Reply</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUOTE MODAL */}
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
