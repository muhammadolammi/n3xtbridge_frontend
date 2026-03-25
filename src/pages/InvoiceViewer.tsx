import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // 1. Import the hook

// --- Types (Keep these the same) ---
export interface Invoice {
    id: string;
    date: string;
    dueDate: string;
    status: string;
    client: { name: string; email: string; phone: string; address: string; };
    items: Array<{ desc: string; sub: string; qty: number; price: number; }>;
    financials: { subtotal: number; discount: number; tax: number; total: number; };
}

export default function InvoiceViewer() {
    // 2. Extract the 'id' from the URL path="invoice/:id"
    const { id } = useParams<{ id: string }>();

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoiceFromAPI = async () => {
            try {
                setLoading(true);
                // 3. Use the 'id' from the URL in your API call
                // const response = await fetch(`https://api.n3xtbridge.com/v1/invoices/${id}`);
                // const data = await response.json();

                await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network

                // Mock response based on the URL ID
                const mockData: Invoice = {
                    id: id || "PENDING",
                    date: "March 25, 2026",
                    dueDate: "April 08, 2026",
                    status: "Pending Payment",
                    client: {
                        name: "Nexus Labs Corp",
                        email: "billing@nexuslabs.io",
                        phone: "+234 800 000 0000",
                        address: "412 Innovation Way, Victoria Island, Lagos"
                    },
                    items: [
                        { desc: "Infrastructure Setup", sub: "Enterprise Node Deployment", qty: 1, price: 15000 }
                    ],
                    financials: { subtotal: 15000, discount: 0, tax: 1125, total: 16125 }
                };

                setInvoice(mockData);
            } catch (err) {
                setError("Architectural data could not be retrieved.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchInvoiceFromAPI();
    }, [id]); // Re-run if the URL ID changes

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-bold tracking-widest text-on-surface-variant uppercase animate-pulse">Syncing Ledger...</p>
        </div>
    );

    if (error || !invoice) return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-6">
            <div className="text-center p-12 bg-white border border-outline-variant/20 rounded-xl shadow-sm max-w-md">
                <span className="material-symbols-outlined text-error text-5xl mb-4">cloud_off</span>
                <h3 className="text-xl font-bold mb-2">Record Not Found</h3>
                <p className="text-on-surface-variant text-sm mb-6">{error || "The requested invoice does not exist in our systems."}</p>
                <button onClick={() => window.history.back()} className="text-primary font-bold text-sm hover:underline">Return to Dashboard</button>
            </div>
        </div>
    );

    return (
        <main className="flex-grow pt-24 pb-12 px-6 bg-surface min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Print-friendly Action Header */}
                <div className="flex justify-between items-center mb-10 print:hidden">
                    <div className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                        <button onClick={() => window.history.back()} className="hover:text-primary transition-colors">Invoices</button>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-primary font-bold">Detail View</span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-lg text-sm font-bold hover:bg-white transition-all">
                            <span className="material-symbols-outlined text-sm">print</span>
                            Print/PDF
                        </button>
                        <button className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:opacity-90">
                            Push to Client
                        </button>
                    </div>
                </div>

                {/* The Invoice Document */}
                <div className="bg-white border border-outline-variant/10 shadow-sm overflow-hidden rounded-sm relative">
                    <div className="absolute top-0 right-0 w-80 h-80 blueprint-grid opacity-20 pointer-events-none"></div>

                    <div className="p-10 md:p-16 relative z-10">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between mb-20 gap-8">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-black tracking-tighter uppercase">N3xtbridge</h1>
                                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                                    7824 Tech Boulevard, Suite 200<br />
                                    Lagos, Nigeria | billing@n3xtbridge.com
                                </p>
                            </div>
                            <div className="text-left md:text-right">
                                <h2 className="text-5xl font-black text-primary tracking-tighter uppercase mb-2">Invoice</h2>
                                <p className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase">Identifier: {invoice.id}</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                            <div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Recipient</p>
                                <h3 className="text-2xl font-bold mb-2">{invoice.client.name}</h3>
                                <div className="text-sm text-on-surface-variant space-y-1">
                                    <p>{invoice.client.address}</p>
                                    <p>{invoice.client.email}</p>
                                </div>
                            </div>
                            <div className="md:text-right flex flex-col md:items-end justify-end">
                                <div className="space-y-2">
                                    <div className="flex gap-4 text-xs font-bold">
                                        <span className="text-on-surface-variant uppercase tracking-widest">Issued:</span>
                                        <span>{invoice.date}</span>
                                    </div>
                                    <div className="flex gap-4 text-xs font-bold">
                                        <span className="text-on-surface-variant uppercase tracking-widest">Due Date:</span>
                                        <span className="text-error">{invoice.dueDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <table className="w-full mb-12">
                            <thead className="border-b-2 border-gray-900">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                                    <th className="py-4 text-left">Description</th>
                                    <th className="py-4 text-center">Quantity</th>
                                    <th className="py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invoice.items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-8">
                                            <p className="font-bold text-lg">{item.desc}</p>
                                            <p className="text-xs text-on-surface-variant mt-1">{item.sub}</p>
                                        </td>
                                        <td className="py-8 text-center font-bold">{item.qty}</td>
                                        <td className="py-8 text-right font-black text-lg">${(item.qty * item.price).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary */}
                        <div className="flex flex-col md:flex-row justify-between pt-10 border-t-4 border-gray-900">
                            <div className="max-w-xs mb-8">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4">Operational Notes</h4>
                                <p className="text-xs text-on-surface-variant leading-relaxed italic">
                                    All hardware assets remain property of N3xtbridge until final balance is cleared. Terms: 14-day net.
                                </p>
                            </div>
                            <div className="md:w-72 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-on-surface-variant">Subtotal</span>
                                    <span className="font-bold">${invoice.financials.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-100 pb-3">
                                    <span className="font-bold text-on-surface-variant">VAT (7.5%)</span>
                                    <span className="font-bold">${invoice.financials.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-2">
                                    <span className="text-xs font-black uppercase tracking-tighter">Grand Total</span>
                                    <span className="text-4xl font-black text-primary tracking-tighter">
                                        ${invoice.financials.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-2 bg-primary"></div>
                </div>
            </div>
        </main>
    );
}