import { useEffect, useState } from "react";
import type { Discount, Item, Promotion, QuoteRequest } from "../models/model";
import api from "../api/axios";


const CreateQuoteModal = ({ qr, onClose, onSuccess, adminID }: { qr: QuoteRequest, onClose: () => void, onSuccess: () => void, adminID: string }) => {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<Item[]>([{ name: '', price: '', description: '', quantity: 1 }]);
    const [discounts, setDiscounts] = useState<Discount[]>([{ name: '', amount: '', item_name: '', type: 'fixed', description: "" }]);
    const [notes, setNotes] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [appliedPromos, setAppliedPromos] = useState<Promotion[]>([]);

    const handleAddItem = () => setItems([...items, { name: '', price: '', description: '', quantity: 1 }]);
    const handleItemChange = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const handleAddDiscount = () => setDiscounts([...discounts, { name: '', amount: '', type: 'fixed', description: "", item_name: '' }]);
    const handleDiscountChange = (index: number, field: string, value: string | number) => {
        const newDiscounts = [...discounts];
        (newDiscounts[index] as any)[field] = value;
        setDiscounts(newDiscounts);
    };

    const calculateTotal = () => {
        const gross = items.reduce((acc, item) => acc + ((parseFloat(item.price) || 0) * (item.quantity || 0)), 0);
        let totalDeductions = 0;
        const handledItemPromos = new Set<string>();

        appliedPromos.forEach(promo => {
            promo.breakdown?.forEach(d => {
                if (d.type === 'percentage') totalDeductions += (gross * (parseFloat(d.amount ?? "0") / 100));
                else if (d.type === 'fixed') totalDeductions += parseFloat(d.amount ?? "0") || 0;
                else if (d.type === 'item_match') {
                    if (!handledItemPromos.has(d.name)) {
                        const matchingItem = items.find(i => i.name.toLowerCase() === d.item_name.toLowerCase());
                        if (matchingItem) {
                            totalDeductions += parseFloat(matchingItem.price) || 0;
                            handledItemPromos.add(d.name);
                        }
                    }
                }
            });
        });
        const manualDiscounts = discounts.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
        return Math.max(0, gross - totalDeductions - manualDiscounts);
    };

    useEffect(() => {
        const fetchPromos = async () => {
            if (qr.promo_ids?.length) {
                try {
                    const reqs = qr.promo_ids.map(id => api.get(`/promotions/${id}`));
                    const res = await Promise.all(reqs);
                    setAppliedPromos(res.map(r => r.data.promotion));
                } catch (err) { console.error("Promo Sync Failed", err); }
            }
        };
        fetchPromos();
    }, [qr.promo_ids]);

    const getMissingPromoItems = () => {
        const requiredItemNames = new Set<string>();
        appliedPromos.forEach(p => {
            p.breakdown?.forEach(d => {
                if (d.type === 'item_match') requiredItemNames.add(d.item_name.toLowerCase());
            });
        });
        const currentItemNames = new Set(items.map(i => i.name.toLowerCase()));
        return Array.from(requiredItemNames).filter(name => !currentItemNames.has(name));
    };

    const missingItems = getMissingPromoItems();
    const isBlockedByMissingItems = missingItems.length > 0;
    const isBlockedByExpiry = appliedPromos.some(p => p.expires_at && new Date(p.expires_at) < new Date());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const gross = items.reduce((acc, item) => acc + ((parseFloat(item.price) || 0) * (item.quantity || 0)), 0);
            const promoDiscounts = appliedPromos.flatMap(promo =>
                (promo.breakdown || []).map(d => {
                    let amount = d.type === 'percentage' ? (gross * (parseFloat(d.amount ?? "0") / 100)).toString() : (d.type === 'item_match' ? (items.find(i => i.name.toLowerCase() === d.item_name.toLowerCase())?.price || "0") : d.amount ?? "0");
                    return { name: `[PROMO: ${promo.code}] ${d.name}`, amount };
                })
            );

            const payload = {
                quote_request_id: qr.id,
                promo_ids: appliedPromos.map(p => p.id),
                amount: calculateTotal().toString(),
                breakdown: items,
                discounts: [...promoDiscounts, ...discounts.filter(d => d.name.trim() !== "" && parseFloat(d.amount) > 0)],
                notes,
                expires_at: new Date(expiryDate).toISOString(),
                status: 'draft',
                user_id: adminID
            };
            await api.post('/admin/quotes', payload);
            onSuccess();
            onClose();
        } catch (err) { alert("Failed to deploy quote."); }
        finally { setLoading(false); }
    };

    const summary = {
        gross: items.reduce((acc, item) => acc + ((parseFloat(item.price) || 0) * (item.quantity || 0)), 0),
        total: calculateTotal(),
        manual: discounts.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0)
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-xl">
            <div className="bg-[#0C0C0C] w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t sm:border border-[#1A1A1A] overflow-hidden shadow-2xl">
                <div className="p-6 md:p-8 border-b border-[#1A1A1A] flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-white font-black uppercase tracking-tighter text-xl">Create Quote </h3>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#141414] text-gray-500 hover:text-white flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                    {/* Line Items Section */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Breakdowns</label>
                        {items.map((item, index) => (
                            <div key={index} className="bg-[#111] p-6 rounded-[2rem] border border-[#1A1A1A] space-y-4 group transition-all hover:border-[#1A1A1A]/80">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-6">
                                        <input placeholder="Name" className="w-full bg-transparent border-b border-[#1A1A1A] py-2 text-white font-bold outline-none focus:border-primary transition-all"
                                            value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} required />
                                    </div>
                                    <div className="grid grid-cols-2 md:col-span-5 gap-4">
                                        <input placeholder="Qty" type="number" className="w-full bg-transparent border-b border-[#1A1A1A] py-2 text-white outline-none"
                                            value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} required />
                                        <input placeholder="Price (₦)" type="number" className="w-full bg-transparent border-b border-[#1A1A1A] py-2 text-white outline-none"
                                            value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} required />
                                    </div>
                                    <div className="md:col-span-1 flex items-center justify-end">
                                        <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-900 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined">delete_outline</span>
                                        </button>
                                    </div>
                                </div>
                                <input placeholder="description..." className="w-full bg-transparent text-[11px] text-gray-500 italic outline-none"
                                    value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                            </div>
                        ))}
                        <button type="button" onClick={handleAddItem} className="w-full py-4 border-2 border-dashed border-[#1A1A1A] rounded-2xl text-[10px] font-black uppercase text-gray-600 hover:text-primary transition-all">+ APPEND COMPONENT NODE</button>
                    </div>

                    {/* Promotions View */}
                    {appliedPromos.length > 0 && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">auto_awesome</span> Promotion Discounts
                            </label>
                            <div className="grid gap-3">
                                {appliedPromos.map((p) => {
                                    const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                                    return (
                                        <div key={p.id} className={`p-5 rounded-[1.5rem] border flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all ${isExpired ? 'bg-red-500/5 border-red-500/20' : 'bg-[#0046FB]/5 border-[#0046FB]/10'}`}>
                                            <div>
                                                <p className={`text-xs font-black uppercase ${isExpired ? 'text-red-400' : 'text-[#0046FB]'}`}>{p.name}</p>
                                                <p className="text-[9px] font-mono text-gray-600 uppercase mt-1">EXP: {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : '∞'}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 md:justify-end">
                                                {p.breakdown?.map((d, i) => {
                                                    const isMet = d.type !== 'item_match' || items.some(it => it.name.toLowerCase() === d.item_name.toLowerCase());
                                                    return (
                                                        <span key={i} className={`text-[9px] font-black px-2 py-1 rounded border ${isMet ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                            {d.type === 'percentage' ? `-${d.amount}%` : d.type === 'fixed' ? `-₦${Number(d.amount).toLocaleString()}` : `FREE: ${d.item_name}`}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Manual Discounts */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Add Discounts</label>
                        {discounts.map((discount, index) => (
                            <div key={index} className="bg-[#111] p-6 rounded-[2rem] border border-[#1A1A1A] space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-8 flex items-center gap-3">
                                        <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">FIXED</span>
                                        <input placeholder="Deduction Reason" className="flex-1 bg-transparent border-b border-[#1A1A1A] py-2 text-white font-bold outline-none"
                                            value={discount.name} onChange={e => handleDiscountChange(index, 'name', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-3 flex items-center bg-[#141414] rounded-xl px-3 border border-[#1A1A1A]">
                                        <span className="text-red-400 font-bold mr-2">₦</span>
                                        <input type="number" placeholder="0.00" className="bg-transparent w-full py-2 text-red-400 font-bold outline-none"
                                            value={discount.amount} onChange={e => handleDiscountChange(index, 'amount', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-1 flex items-center justify-end">
                                        <button type="button" onClick={() => setDiscounts(discounts.filter((_, i) => i !== index))} className="text-gray-700 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined">backspace</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddDiscount} className="w-full py-4 border-2 border-dashed border-[#1A1A1A] rounded-2xl text-[10px] font-black uppercase text-gray-600 hover:text-amber-500 transition-all">+ ADD</button>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Notes</label>
                        <textarea className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl p-5 text-sm text-white outline-none focus:border-primary transition-all" rows={3} placeholder="Official terms, caveats, or system instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>

                    {/* Summary Footer Panel */}
                    <div className="bg-[#0046FB]/5 p-8 rounded-[2.5rem] border border-[#0046FB]/20 space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <span>Gross Total</span>
                            <span className="font-mono">₦{summary.gross.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end border-t border-[#1A1A1A] pt-6">
                            <div>
                                <p className="text-[10px] font-black uppercase  tracking-[0.3em] mb-1">Total</p>
                                <h4 className="text-4xl font-black text-white tracking-tighter">₦{summary.total.toLocaleString()}</h4>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Expires At</label>
                                <input type="date" className="bg-transparent  text-xs font-black outline-none border-b border-[#0046FB]/30 pb-1"
                                    value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    <div className="pb-10">
                        <button
                            disabled={loading || isBlockedByExpiry || isBlockedByMissingItems}
                            className="w-full bg-[#0046FB] hover:bg-[#003ccf] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#0046FB]/20 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                        >
                            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> :
                                isBlockedByMissingItems ? `REQUIRED: ${missingItems[0]}` : "SEND QUOTE"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuoteModal;