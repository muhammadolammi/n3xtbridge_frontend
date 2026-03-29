import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Invoice, Quote } from '../models/model';
import { useAuth } from '../context/AuthContext';
import { makePayment } from '../api/payment';

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


const PaymentPromptModal = ({ onPay, onLater }: { onPay: () => void, onLater: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in duration-300">
            <span className="material-symbols-outlined text-green-500 text-6xl mb-4">check_circle</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Proposal Accepted</h3>
            <p className="text-gray-500 text-sm mb-8">Specification recorded. Would you like to proceed to secure payment now to begin implementation?</p>
            <div className="flex flex-col gap-3">
                <button onClick={onPay} className="w-full bg-primary text-white py-3 rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                    Pay Now
                </button>
                <button onClick={onLater} className="w-full bg-gray-50 text-gray-400 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                    I'll Pay Later
                </button>
            </div>
        </div>
    </div>
);


export default function QuoteViewer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    const [quote, setQuote] = useState<Quote | null>(location.state?.quote || null);
    const [quoteInvoice, setQuoteInvoice] = useState<Invoice | null>(null);

    const [loading, setLoading] = useState<boolean>(!location.state?.quote);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
    const [associatedInvoiceId, setAssociatedInvoiceId] = useState<string | null>(null);
    useEffect(() => {
        if (authLoading || !user || !id) return;

        let isMounted = true;

        const syncTerminalData = async () => {
            // If we have a quote and it's NOT accepted, we don't need to fetch anything
            if (quote && quote.status !== 'accepted') {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // 1. Check if we need the Quote (if not in state)
                let currentQuote = quote;
                if (!currentQuote) {
                    const quoteRes = await api.get(`/customer/quotes/${id}`);
                    currentQuote = quoteRes.data.quote;
                    if (isMounted) setQuote(currentQuote);
                }

                // 2. Check if we need the Invoice (Only if status is 'accepted')
                if (currentQuote?.status === 'accepted' && !quoteInvoice) {
                    const invRes = await api.get(`/quotes/invoices/${id}`);
                    if (isMounted) setQuoteInvoice(invRes.data);
                }

            } catch (err: any) {
                if (isMounted) {
                    // Only error out if we don't even have a quote to show
                    if (!quote) {
                        setError(err.response?.status === 404 ? "Quote Not Found" : "Terminal Connection Error");
                    }
                    console.error("Data sync error:", err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        syncTerminalData();

        return () => { isMounted = false; };
    }, [id, authLoading, user]); // Note: 'quote' is excluded to prevent loops

    const handleUpdateStatus = async (newStatus: 'accepted' | 'declined') => {
        if (!id) return;
        setActionLoading(true);
        try {
            const res = await api.patch(`/customer/quotes/${id}/status`, { status: newStatus });
            setQuote(prev => prev ? { ...prev, status: newStatus } : null);
            if (newStatus === 'accepted') {
                // Store the invoice ID returned from your Go transaction
                setAssociatedInvoiceId(res.data.invoice_id);
                setShowPaymentPrompt(true);
            } else {
                alert("Quote declined.");
            }
        } catch (err) {
            alert("Failed to update quote status. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handlePay = async (invoiceID: string) => {
        setActionLoading(true);
        try {
            const checkoutUrl = await makePayment(invoiceID);
            // This is how you redirect to the Paystack checkout page
            window.location.href = checkoutUrl;
        } catch (err) {
            alert("Payment gateway communication failed. Please try from your billing dashboard.");
        } finally {
            setActionLoading(false);
        }
    };
    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `N3xtbridge_Quote_${quote?.id.slice(0, 8)}`;
        window.print();
        document.title = originalTitle;
    };

    if (authLoading || loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !quote) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 text-center">
            <div className="bg-white p-10 rounded-2xl border border-gray-200 shadow-sm max-w-sm">
                <span className="material-symbols-outlined text-red-400 text-5xl mb-4">history_edu</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quote Unavailable</h3>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-6">{error}</p>
                <button onClick={() => navigate('/dashboard')} className="text-primary font-black text-xs uppercase hover:underline">Return to Hub</button>
            </div>
        </div>
    );


    const expiryDate = quote.expires_at;

    return (
        <main className="pt-24 pb-12 px-4 md:px-6 bg-gray-50 min-h-screen print:bg-white print:pt-0">
            <div className="max-w-4xl mx-auto">
                {/* Actions Header */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>

                    <div className="flex items-center gap-3">
                        {/* User Action Buttons - Only show if user is client and quote is sent */}
                        {
                            user?.role === 'user' && (
                                <div className="flex items-center gap-3">

                                    {quote.status === 'accepted' && !!quoteInvoice && quoteInvoice.id && (
                                        <button
                                            disabled={actionLoading}
                                            onClick={() => handlePay(quoteInvoice.id)}
                                            className="bg-green-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg"
                                        >
                                            {actionLoading ? "Redirecting..." : "Pay Now"}
                                        </button>
                                    )}

                                    <button
                                        disabled={actionLoading || quote.status === 'accepted'}
                                        onClick={() => handleUpdateStatus('accepted')}
                                        className="bg-green-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        disabled={actionLoading || quote.status === 'declined' || quote.status == 'accepted'}
                                        onClick={() => handleUpdateStatus('declined')}
                                        className="bg-red-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                                    >
                                        Decline
                                    </button>
                                    <button className="bg-gray-800 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                                        Discuss
                                    </button>
                                </div>

                            )
                        }
                        <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 border border-gray-200 bg-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                            <span className="material-symbols-outlined text-sm">print</span> Print
                        </button>
                    </div>
                </div>

                {/* Modal Rendering */}
                {showPaymentPrompt && associatedInvoiceId && (
                    <PaymentPromptModal
                        onPay={() => handlePay(associatedInvoiceId)}
                        onLater={() => setShowPaymentPrompt(false)}
                    />
                )}

                <div className="bg-white border border-gray-100 shadow-2xl rounded-sm relative overflow-hidden print:shadow-none print:border-none">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary-dark"></div>

                    <div className="p-8 md:p-16">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
                            <div className="space-y-4">
                                <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">N3xtbridge Holdings</h1>
                                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest leading-relaxed">
                                    Innovative Tech Solutions<br />
                                    Abuja, Nigeria | support@n3xtbridge.com
                                </p>
                            </div>
                            <div className="text-left md:text-right">

                                <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Quote</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                                    {quote.service_name || "Technical Service"}
                                </p>
                                <span className={`px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${getQuoteStatusStyles(quote.status)}`}>
                                    {quote.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12 mb-16 py-8 border-y border-gray-50">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Reference ID:</p>
                                <p className="text-sm font-mono font-bold text-gray-900 uppercase tracking-tighter">Q-{quote.id.slice(0, 12)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Valid Until:</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {new Date(expiryDate).toLocaleDateString('en-NG', { dateStyle: 'long' })}
                                </p>
                            </div>
                        </div>

                        <table className="w-full mb-8">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                    <th className="py-4 text-left">Description</th>
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
                                        <td className="py-6 text-right text-sm text-gray-600 font-mono">₦{parseFloat(item.price).toLocaleString()}</td>
                                        <td className="py-6 text-right font-bold text-gray-900 font-mono">
                                            ₦{((item.quantity || 1) * parseFloat(item.price)).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Discounts Section */}
                        {quote.discounts && quote.discounts.length > 0 && (
                            <div className="mb-12 border-t border-gray-50 pt-4">
                                {quote.discounts.map((discount, i) => (
                                    <div key={i} className="flex justify-between items-center py-2">
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">
                                            {discount.name}
                                        </span>
                                        <span className="font-mono text-sm font-bold text-red-500">
                                            - ₦{parseFloat(discount.amount).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row justify-between gap-12 pt-8 border-t-2 border-gray-900">
                            <div className="max-w-xs">
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-400">Notes & Provisions</h4>
                                <p className="text-xs text-gray-500 leading-relaxed italic border-l-2 border-gray-100 pl-4">
                                    {quote.notes || "This architectural quote is subject to standard terms of service."}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Final Investment Total</p>
                                <p className="text-4xl font-black text-primary tracking-tighter leading-none mb-2">
                                    ₦{parseFloat(quote.amount).toLocaleString()}
                                </p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase italic">Currency: Nigerian Naira (NGN)</p>
                            </div>
                        </div>

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