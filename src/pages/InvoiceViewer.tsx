import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Invoice } from '../models/model';
import { useAuth } from '../context/AuthContext';

const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    const map: Record<string, string> = {
        paid: "bg-green-100 text-green-700 border-green-200",
        unpaid: "bg-amber-100 text-amber-700 border-amber-200",
        pending: "bg-blue-100 text-blue-700 border-blue-200",
        overdue: "bg-red-100 text-red-700 border-red-200",
        default: "bg-gray-100 text-gray-600 border-gray-200",
    };
    return map[s] || map.default;
};

export default function InvoiceViewer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Get auth status from context
    const { user, loading: authLoading } = useAuth();

    const [invoice, setInvoice] = useState<Invoice | null>(location.state?.invoice || null);
    const [loading, setLoading] = useState<boolean>(!location.state?.invoice);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 1. Wait for Auth to finish its silent refresh
        if (authLoading) return;

        // 2. If no user after auth finished, stop and show error
        if (!user) {
            setError("Invalid Session");
            setLoading(false);
            return;
        }

        // 3. If we have data from 'navigate' state, we are done
        if (invoice) {
            setError(null); // Clear any ghost errors
            setLoading(false);
            return;
        }

        // 4. Fetch logic
        const fetchInvoiceFromAPI = async () => {
            try {
                setLoading(true);
                setError(null); // Clear error before fetching
                const res = await api.get(`/invoices/${id}`);

                if (res.data) {
                    setInvoice(res.data);
                } else {
                    setError("Record Not Found");
                }
            } catch (err: any) {
                // If it's a 401, the interceptor might be refreshing, 
                // but if we are here, the request failed.
                const msg = err.response?.status === 404 ? "Record Not Found" : "Invalid Session";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInvoiceFromAPI();
        }
    }, [id, authLoading, user, !!invoice]); // Note: Use !!invoice to track existence without loop
    // 5. Show a clean loader while the Auth is initializing
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Authenticating Terminal...</p>
                </div>
            </div>
        );
    }
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase animate-pulse">Syncing Ledger...</p>
        </div>
    );

    if (error || !invoice) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div className="text-center p-12 bg-white border border-gray-200 rounded-xl shadow-sm max-w-md">
                <span className="material-symbols-outlined text-red-500 text-5xl mb-4">cloud_off</span>
                <h3 className="text-xl font-bold mb-2">Record Not Found</h3>
                <p className="text-gray-500 text-sm mb-6">{error || "The requested invoice does not exist."}</p>
                <button onClick={() => navigate('/dashboard')} className="text-primary font-bold text-sm hover:underline">Return to Dashboard</button>
            </div>
        </div>
    );

    const handlePrint = () => {
        // 1. Store the original title (e.g., "N3xtbridge | Viewer")
        const originalTitle = document.title;

        // 2. Set the custom filename format
        // Example: nextbridge_invoice#INV-2026-001
        document.title = `nextbridge_invoice#${invoice?.invoice_number || 'draft'}`;

        // 3. Open the print dialog
        window.print();

        // 4. Restore the original title so the browser tab looks normal again
        document.title = originalTitle;
    };

    return (
        <main className="flex-grow pt-24 pb-12 px-4 md:px-6 bg-gray-50 min-h-screen print:bg-white print:pt-0">
            <div className="max-w-5xl mx-auto">

                {/* Action Header - Hidden on Print */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 print:hidden">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Status Badge in Header */}
                        {/* <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(invoice.status)}`}>
                            {invoice.status}
                        </span> */}
                        <button
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold bg-white hover:bg-gray-50 shadow-sm transition-all active:scale-95">
                            <span className="material-symbols-outlined text-sm">print</span> Print PDF
                        </button>
                    </div>
                </div>

                {/* The Invoice Document */}
                <div className="bg-white border border-gray-200 shadow-xl rounded-sm relative overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

                    <div className="p-6 md:p-16 print:p-0">
                        {/* Company Branding & Status */}
                        <div className="flex flex-col md:flex-row justify-between mb-12 md:mb-16 gap-8">
                            <div className="space-y-3">
                                <h1 className="text-3xl font-black tracking-tighter uppercase text-gray-900">N3XTBRIDGE</h1>
                                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest leading-relaxed max-w-[240px]">
                                    Innovative Tech Solutions<br />
                                    11, Paul Amune Flat 2, Phase 1,<br />
                                    Gwagwalada, Abuja, Nigeria
                                </p>
                            </div>
                            <div className="text-left md:text-right flex flex-col md:items-end gap-2">
                                <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter uppercase leading-none">Invoice</h2>
                                <p className="text-xs font-mono font-bold text-gray-400 uppercase">Ref: {invoice.invoice_number}</p>
                                {/* Visual Status on Document */}
                                <div className={`mt-2 inline-block px-4 py-1 rounded border text-[10px] font-black uppercase tracking-[0.2em] ${getStatusStyles(invoice.status)}`}>
                                    {invoice.status}
                                </div>
                            </div>
                        </div>

                        {/* Addresses - Grid adjusted for Mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 border-y border-gray-50 py-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">Bill To:</p>
                                <h3 className="text-xl font-bold text-gray-900">{invoice.customer_name}</h3>
                                <p className="text-sm text-gray-500">{invoice.customer_email}</p>
                                <p className="text-sm text-gray-500">{invoice.customer_phone}</p>
                            </div>
                            <div className="sm:text-right flex flex-col sm:justify-center">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Date of Issue:</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {new Date(invoice.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                </p>
                            </div>
                        </div>

                        {/* Items Table - Responsive Wrap */}
                        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                            <table className="w-full mb-10 min-w-[600px] print:min-w-full">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                        <th className="py-4 text-left">Description</th>
                                        <th className="py-4 text-center w-20">Qty</th>
                                        <th className="py-4 text-right w-32">Unit Price</th>
                                        <th className="py-4 text-right w-32">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {invoice.items.map((item, i) => (
                                        <tr key={i} className="print:break-inside-avoid">
                                            <td className="py-6 pr-4">
                                                <p className="font-bold text-gray-900 text-sm md:text-base">{item.name}</p>
                                            </td>
                                            <td className="py-6 text-center text-sm text-gray-600">{item.quantity}</td>
                                            <td className="py-6 text-right text-sm text-gray-600">₦{item.price.toLocaleString()}</td>
                                            <td className="py-6 text-right font-bold text-gray-900">₦{(item.quantity * item.price).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Financial Totals - Responsive Stack */}
                        <div className="flex flex-col md:flex-row justify-between pt-10 border-t border-gray-100 gap-8">
                            <div className="max-w-sm">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400">Notes & Terms</h4>
                                <p className="text-xs text-gray-500 leading-relaxed italic border-l-2 border-gray-100 pl-4">
                                    {invoice.notes || "No additional notes provided for this transaction."}
                                </p>
                            </div>
                            <div className="md:w-72 space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400">Discounts</h4>

                                {invoice.discounts.map((d, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-red-500 font-bold uppercase text-[10px] tracking-widest"> {d.name}</span>
                                        <span className="text-red-500 font-bold">-₦{d.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-end pt-6 border-t-2 border-gray-900">
                                    <div className="text-left">
                                        <span className="block text-[10px] font-black uppercase tracking-tighter text-gray-400">Total Payable</span>
                                        <span className="text-xs font-black uppercase text-gray-900">Amount Due</span>
                                    </div>
                                    <span className="text-3xl md:text-4xl font-black text-primary tracking-tighter leading-none">
                                        ₦{invoice.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Print Footer - Only visible on Print */}
                        <div className="hidden print:block mt-20 text-center border-t border-gray-100 pt-8">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Thank you for your business</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}