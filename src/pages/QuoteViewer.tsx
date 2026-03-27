import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Quote } from '../models/model';
import { useAuth } from '../context/AuthContext';

const getQuoteStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    const map: Record<string, string> = {
        draft: "bg-gray-100 text-gray-600 border-gray-200",
        sent: "bg-blue-100 text-blue-700 border-blue-200",
        accepted: "bg-green-100 text-green-700 border-green-200",
        declined: "bg-red-100 text-red-700 border-red-200",
        expired: "bg-orange-100 text-orange-700 border-orange-200",
        default: "bg-gray-100 text-gray-600 border-gray-200",
    };
    return map[s] || map.default;
};

export default function QuoteViewer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    // Support in-memory value from navigate state or fetch from backend
    const [quote, setQuote] = useState<Quote | null>(location.state?.quote || null);
    const [loading, setLoading] = useState<boolean>(!location.state?.quote);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setError("Invalid Session");
            setLoading(false);
            return;
        }

        if (quote) {
            setLoading(false);
            return;
        }

        const fetchQuoteFromAPI = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/customer/quotes/${id}`);
                setQuote(res.data.quote);
            } catch (err: any) {
                console.error("API Error:", err);
                // Distinguish between 404 (Missing) and other errors (Connection)
                const msg = err.response?.status === 404
                    ? "Quote Not Found"
                    : "Terminal Connection Error";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchQuoteFromAPI();
    }, [id, authLoading, user, !!quote]);

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `N3xtbridge_Quote_${quote?.id.slice(0, 8)}`;
        window.print();
        document.title = originalTitle;
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !quote) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 text-center">
                <div className="bg-white p-10 rounded-2xl border border-gray-200 shadow-sm max-w-sm">
                    <span className="material-symbols-outlined text-red-400 text-5xl mb-4">history_edu</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Technical Specification Missing</h3>
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-6">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="text-primary font-black text-xs uppercase hover:underline">Return to Hub</button>
                </div>
            </div>
        );
    }

    // Handle the typo from backend "exire_at"
    const expiryDate = (quote as any).exire_at || quote.expires_at;

    return (
        <main className="pt-24 pb-12 px-4 md:px-6 bg-gray-50 min-h-screen print:bg-white print:pt-0">
            <div className="max-w-4xl mx-auto">

                {/* Actions */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-secondary-dark text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                        <span className="material-symbols-outlined text-sm">print</span> Export PDF
                    </button>
                </div>

                {/* Document Body */}
                <div className="bg-white border border-gray-100 shadow-2xl rounded-sm relative overflow-hidden print:shadow-none print:border-none">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary-dark"></div>

                    <div className="p-8 md:p-16">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
                            <div className="space-y-4">
                                <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">N3xtbridge Holdings</h1>
                                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest leading-relaxed">
                                    Technical Architecture & Digital Infrastructure<br />
                                    Abuja, Nigeria | support@n3xtbridge.com
                                </p>
                            </div>
                            <div className="text-left md:text-right">
                                <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Quote</h2>
                                <span className={`px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${getQuoteStatusStyles(quote.status)}`}>
                                    {quote.status}
                                </span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-12 mb-16 py-8 border-y border-gray-50">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Reference ID:</p>
                                <p className="text-sm font-mono font-bold text-gray-900 uppercase">Q-{quote.id.slice(0, 12)}</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase">Related Req: {quote.quote_request_id.slice(0, 8)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Valid Until:</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {new Date(expiryDate).toLocaleDateString('en-NG', { dateStyle: 'long' })}
                                </p>
                                {new Date(expiryDate) < new Date() && (
                                    <p className="text-[10px] font-black text-red-500 uppercase mt-1">Status: Expired</p>
                                )}
                            </div>
                        </div>

                        {/* Breakdown Table */}
                        <table className="w-full mb-12">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                    <th className="py-4 text-left">Infrastructure Component</th>
                                    <th className="py-4 text-center w-20">Qty</th>
                                    <th className="py-4 text-right w-32">Unit Price</th>
                                    <th className="py-4 text-right w-32">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {quote.breakdown.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-6 pr-4">
                                            <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 mt-1 italic">{item.description}</p>
                                        </td>
                                        <td className="py-6 text-center text-sm text-gray-600 font-mono">x{item.quantity || 1}</td>
                                        <td className="py-6 text-right text-sm text-gray-600 font-mono">₦{parseFloat(item.cost).toLocaleString()}</td>
                                        <td className="py-6 text-right font-bold text-gray-900 font-mono">
                                            ₦{((item.quantity || 1) * parseFloat(item.cost)).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary */}
                        <div className="flex flex-col md:flex-row justify-between gap-12 pt-8 border-t-2 border-gray-900">
                            <div className="max-w-xs">
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-400">Notes & Provisions</h4>
                                <p className="text-xs text-gray-500 leading-relaxed italic">
                                    {quote.notes || "This architectural quote is subject to site inspection and standard terms of service."}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Estimated Total Investment</p>
                                <p className="text-4xl font-black text-primary tracking-tighter">
                                    ₦{parseFloat(quote.amount).toLocaleString()}
                                </p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase mt-2 italic">Currency: Nigerian Naira (NGN)</p>
                            </div>
                        </div>

                        {/* Signature Block - Print Only */}
                        <div className="hidden print:flex justify-between mt-24">
                            <div className="w-48 border-t border-gray-300 pt-2 text-center">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Authorized Signature</p>
                            </div>
                            <div className="w-48 border-t border-gray-300 pt-2 text-center">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Client Acceptance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}