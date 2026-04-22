import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Invoice } from '../models/model';
import { useAuth } from '../context/AuthContext';
import { makePayment } from '../api/payment';

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
                    // console.log(res.data)
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
            <div className="min-h-screen flex items-center justify-center bg-[#000]">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Authenticating Terminal...</p>
                </div>
            </div>
        );
    }
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#000]">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase animate-pulse">Syncing Ledger...</p>
        </div>
    );

    if (error || !invoice) return (
        <div className="min-h-screen flex items-center justify-center bg-[#000] px-6">
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


    const handlePay = async (invoiceID: string) => {
        setLoading(true);
        try {
            const checkoutUrl = await makePayment(invoiceID);
            // This is how you redirect to the Paystack checkout page
            window.location.href = checkoutUrl;
        } catch (err) {
            alert("Payment gateway communication failed. Please try again later. ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow pt-24 pb-12 px-4 md:px-6 bg-[#0C0C0C] min-h-screen print:bg-white print:pt-0">
            <div className="max-w-5xl mx-auto">

                {/* ACTION BAR */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 print:hidden">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white">
                        ← Back
                    </button>

                    <div className="flex gap-3 w-full sm:w-auto">
                        {invoice.status === 'unpaid' && invoice.customer_email === user?.email && (
                            <button
                                disabled={loading}
                                onClick={() => handlePay(invoice.id)}
                                className="bg-green-600 text-white px-5 py-2 rounded-lg text-xs font-bold"
                            >
                                {loading ? "Redirecting..." : "Pay Now"}
                            </button>
                        )}
                        <button
                            onClick={handlePrint}
                            className="bg-[#1A1A1A] text-white px-5 py-2 rounded-lg text-sm border border-[#2A2A2A]"
                        >
                            Print PDF
                        </button>
                    </div>
                </div>

                {/* INVOICE */}
                <div
                    id="invoice-area"
                    className="bg-white text-gray-900 border border-gray-200 shadow-xl rounded-sm overflow-hidden print:shadow-none print:border-none"
                >
                    {/* <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div> */}

                    <div className="p-6 md:p-16">

                        {/* HEADER (STICKY ON SCREEN ONLY) */}
                        <div className="sticky top-0 bg-white z-10 pb-6 mb-10 border-b border-gray-100 print:static print:border-none print:pb-0 print:mb-12">
                            <div className="flex justify-between items-start gap-6">
                                <div className="space-y-2">
                                    {/* <h1 className="text-2xl md:text-3xl font-black uppercase text-gray-900">
                                        N3XTBRIDGE
                                    </h1> */}
                                    <div className="h-16 md:h-20 flex items-center">
                                        <img
                                            src="https://cdn.n3xtbridge.com/frontenddata/N3xtbridge%20Logo%20PNG.png"
                                            alt="N3xtbridge Logo"
                                            className="h-full w-auto object-contain"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                        Innovative Tech Solutions <br />
                                        11, Paul Amune Flat 2, Phase 1, Gwagwalada, Abuja, Nigeria
                                    </p>
                                </div>

                                <div className="text-right flex flex-col items-end gap-2">
                                    <h2 className="text-3xl md:text-5xl font-black uppercase text-gray-900">
                                        Invoice
                                    </h2>
                                    <p className="text-xs text-gray-400 font-mono">
                                        #{invoice.invoice_number}
                                    </p>
                                    <div className={`px-3 py-1 text-[10px] font-bold border rounded ${getStatusStyles(invoice.status)}`}>
                                        {invoice.status}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CUSTOMER + DATE */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 border-y border-gray-100 py-8">
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Customer</p>
                                <h3 className="text-lg font-bold">{invoice.customer_name}</h3>
                                <p className="text-sm text-gray-500">{invoice.customer_email}</p>
                                <p className="text-sm text-gray-500">{invoice.customer_phone}</p>
                            </div>

                            <div className="sm:text-right">
                                <p className="text-xs text-gray-400 mb-2">Date</p>
                                <p className="text-sm font-semibold">
                                    {new Date(invoice.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                </p>
                            </div>
                        </div>

                        {/* ITEMS */}
                        <div className="overflow-x-auto">
                            <table className="w-full mb-10 min-w-[600px] print:min-w-full">
                                <thead>
                                    <tr className="text-xs uppercase text-gray-400 border-b">
                                        <th className="py-3 text-left">Description</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-right">Unit Price</th>
                                        <th className="text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="py-4 pr-4">
                                                <p className="font-semibold">{item.name}</p>
                                            </td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-right">₦{item.price.toLocaleString()}</td>
                                            <td className="text-right font-bold">
                                                ₦{(item.quantity * parseFloat(item.price)).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* TOTALS */}
                        <div className="flex flex-col md:flex-row justify-between gap-10 border-t pt-8">

                            <div className="max-w-sm">
                                <p className="text-xs text-gray-400 mb-2">Notes</p>
                                <p className="text-sm text-gray-500 italic">
                                    {invoice.notes || "No additional notes."}
                                </p>
                            </div>

                            <div className="w-full md:w-72 space-y-4">
                                <p className="text-xs text-gray-400">Discounts</p>

                                {invoice.discounts.map((d, i) => (
                                    <div key={i} className="flex justify-between text-sm text-red-500">
                                        <span>{d.name}</span>
                                        <span>-₦{d.amount?.toLocaleString() ?? 0}</span>
                                    </div>
                                ))}

                                <div className="flex justify-between items-end border-t pt-4">
                                    <span className="text-sm font-semibold text-gray-500">Total</span>
                                    <span className="text-2xl md:text-3xl font-black uppercase text-gray-900 ">
                                        ₦{invoice.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* PRINT FOOTER */}
                        <div className="hidden print:block mt-16 text-center text-xs text-gray-400">
                            Thank you for your business
                        </div>
                    </div>
                </div>
            </div>

            {/* PRINT CONTROL */}
            <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }

                #invoice-area, #invoice-area * {
                    visibility: visible;
                }

                #invoice-area {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                }

                @page {
                    size: A4;
                    margin: 20mm;
                }
            }
        `}</style>
        </div>
    );
}