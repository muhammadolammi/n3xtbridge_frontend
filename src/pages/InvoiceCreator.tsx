import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import type { Invoice } from "../models/model";

export default function InvoiceCreator() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [items, setItems] = useState([{ name: '', price: "", description: '', quantity: 1 }]);
    const [discounts, setDiscounts] = useState([{ name: '', amount: "" }]);

    const addItem = () => {
        setItems([...items, { name: "", quantity: 1, price: '', description: '' }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const updated = [...items];
        if (field === "quantity") {
            const numValue = parseInt(value.toString(), 10) || 0;
            updated[index][field] = numValue;
        } else if (field === "price") {
            updated[index][field] = value.toString();
        } else {
            (updated[index] as any)[field] = value;
        }
        setItems(updated);
    };

    const addDiscount = () => {
        setDiscounts([...discounts, { name: "", amount: "" }]);
    };

    const updateDiscount = (index: number, field: string, value: string) => {
        const updated = [...discounts];
        (updated[index] as any)[field] = value;
        setDiscounts(updated);
    };

    const removeDiscount = (index: number) => {
        setDiscounts(discounts.filter((_, i) => i !== index));
    };

    const itemsTotal = items.reduce((acc, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = item.quantity;
        return acc + (qty * price);
    }, 0);

    const discountTotal = discounts.reduce((acc, d) => {
        const amount = parseFloat(d.amount) || 0;
        return acc + amount;
    }, 0);

    const total = itemsTotal - discountTotal;

    const validate = () => {
        if (!customerName || !customerEmail) {
            alert("Customer name and email are required");
            return false;
        }
        if (items.length === 0) {
            alert("Add at least one item");
            return false;
        }
        if (items.some(item => !item.name.trim())) {
            alert("All items must have a name");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const sanitizedItems = items.map(item => ({
            ...item,
            quantity: parseFloat(item.quantity.toString()) || 0,
            price: item.price.toString()
        }));

        if (!validate()) return;

        const payload = {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            items: sanitizedItems,
            discounts: discounts.filter(d => d.name.trim() !== ""),
            notes: notes
        };

        try {
            setLoading(true);
            const res = await api.post("/worker/invoices", payload);
            if (res.status === 201) {
                const createdInvoice: Invoice = res.data;
                navigate(`/dashboard/invoice/${createdInvoice.id}`, { state: { invoice: createdInvoice } });
            }
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to create invoice");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0C0C0C] text-white pt-24 pb-20 px-4 md:px-8 relative overflow-hidden">
            {/* Blueprint Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-10 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="h-1 w-12 bg-[#0046FB] rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Billing Node</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Invoice Architect</h1>
                    <p className="text-gray-500 text-sm font-medium">Generate professional ledger entries for enterprise clients.</p>
                </header>

                <form className="space-y-8" onSubmit={handleSubmit}>

                    {/* Customer Information Panel */}
                    <section className="bg-[#111] border border-[#1A1A1A] rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-[#1A1A1A] bg-[#0A0A0A]">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#0046FB]">badge</span>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Client Identity Matrix</h3>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-600 tracking-widest ml-1">Entity Name</label>
                                <input required className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all"
                                    placeholder="Legal Business Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-600 tracking-widest ml-1">Email Endpoint</label>
                                <input required className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all"
                                    placeholder="billing@domain.com" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-600 tracking-widest ml-1">Communication</label>
                                <input className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white focus:border-[#0046FB] outline-none transition-all"
                                    placeholder="+234..." type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                            </div>
                        </div>
                    </section>

                    {/* Specification Table */}
                    <section className="bg-[#111] border border-[#1A1A1A] rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-[#1A1A1A] bg-[#0A0A0A] flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#0046FB]">terminal</span>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Line Item Specification</h3>
                            </div>
                            <button type="button" onClick={addItem} className="bg-[#0046FB] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#003ccf] transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">add</span> Add Entry
                            </button>
                        </div>

                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
                                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
                                        <th className="px-8 py-4">Descriptor</th>
                                        <th className="px-8 py-4">Technical Detail</th>
                                        <th className="px-4 py-4 text-center">Qty</th>
                                        <th className="px-4 py-4 text-right">Unit Net (₦)</th>
                                        <th className="px-8 py-4 text-right">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1A1A1A]">
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-[#141414] transition-colors">
                                            <td className="px-8 py-5">
                                                <input className="w-full bg-transparent border-0 p-0 text-sm font-bold text-white focus:ring-0"
                                                    placeholder="Item Identity" value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} />
                                            </td>
                                            <td className="px-8 py-5">
                                                <input className="w-full bg-transparent border-0 p-0 text-xs text-gray-500 italic focus:ring-0"
                                                    placeholder="Brief description..." value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} />
                                            </td>
                                            <td className="px-4 py-5">
                                                <input className="w-full bg-transparent border-0 p-0 text-sm font-mono text-center focus:ring-0"
                                                    type="number" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} />
                                            </td>
                                            <td className="px-4 py-5">
                                                <input className="w-full bg-transparent border-0 p-0 text-sm font-mono text-right text-white focus:ring-0"
                                                    type="number" value={item.price} onChange={(e) => updateItem(index, "price", e.target.value)} />
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => removeItem(index)} type="button" className="text-red-900 hover:text-red-500 transition-colors">
                                                    <span className="material-symbols-outlined text-base">delete_sweep</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Adjustments & Totals */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-7 bg-[#111] border border-[#1A1A1A] rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#0046FB]">notes</span>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Internal Protocol Notes</h3>
                            </div>
                            <textarea className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl p-6 text-sm text-gray-300 outline-none focus:border-[#0046FB] transition-all resize-none leading-relaxed"
                                rows={6} placeholder="Terms of engagement, payment windows, and technical caveats..."
                                value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>

                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-[#111] border border-[#1A1A1A] rounded-[2.5rem] p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Yield Adjustments</h3>
                                    <button type="button" onClick={addDiscount} className="text-[#0046FB] text-[10px] font-black uppercase tracking-widest hover:underline">+ New Node</button>
                                </div>
                                <div className="space-y-4">
                                    {discounts.map((d, index) => (
                                        <div key={index} className="flex gap-3 items-center animate-in slide-in-from-right-4">
                                            <input className="flex-1 bg-[#141414] border border-[#1A1A1A] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500"
                                                placeholder="Reason" value={d.name} onChange={(e) => updateDiscount(index, "name", e.target.value)} />
                                            <div className="w-28 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-[10px]">₦</span>
                                                <input className="w-full bg-[#141414] border border-[#1A1A1A] rounded-xl pl-6 pr-3 py-3 text-xs text-red-400 font-mono text-right outline-none focus:border-red-500"
                                                    type="number" value={d.amount} onChange={(e) => updateDiscount(index, "amount", e.target.value)} />
                                            </div>
                                            <button onClick={() => removeDiscount(index)} type="button" className="text-gray-700 hover:text-red-500">
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#0046FB] rounded-[2.5rem] p-8 shadow-2xl shadow-[#0046FB]/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-6xl">account_balance_wallet</span>
                                </div>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-1">Final Net Investment</p>
                                <h2 className="text-4xl font-black text-white tracking-tighter mb-8">₦{total.toLocaleString()}</h2>
                                <button disabled={loading} type="submit"
                                    className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                    ) : (
                                        <><span>Dispatch Invoice</span><span className="material-symbols-outlined text-sm">rocket_launch</span></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}