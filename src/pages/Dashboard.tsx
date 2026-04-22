import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Invoice, Service, Quote, QuoteRequest, User, Promotion, Discount, Item } from '../models/model';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { QUOTE_REQUEST_STATUS_STYLES } from '../constants/const';
import { sendInvoiceMail } from '../api/emails';
import { validateFiles } from '../helpers/helpers';

// --- Shared Constants & Sub-Components ---

const STATUS_STYLES: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border-green-200",
    unpaid: "bg-amber-100 text-amber-700 border-amber-200",
    pending: "bg-blue-100 text-blue-700 border-blue-200",
    overdue: "bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-100 text-gray-600 border-gray-200",
};


const QUOTE_STATUS_STYLES: Record<string, string> = {
    "in-review": "bg-gray-100 text-gray-600 border-gray-200",
    draft: "bg-gray-100 text-gray-600 border-gray-200",
    sent: "bg-blue-100 text-blue-700 border-blue-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    paid: "bg-green-100 text-green-700 border-green-200",

    declined: "bg-red-100 text-red-700 border-red-200",
    expired: "bg-orange-100 text-orange-700 border-orange-200",
};

export const CreateServiceModal = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Tech Support',
        is_featured: false,
        icon: 'inventory_2',
        image: '',
        tags: '',
        min_price: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== "")
            };
            await api.post('/admin/services', payload);
            onClose();
        } catch (err) {
            alert("Failed to create service.");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.name.trim() !== "" && formData.description.trim() !== "";

    return (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-xl">
            {/* Backdrop Click-to-Close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative bg-[#0C0C0C] w-full max-w-xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t sm:border border-[#1A1A1A] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-[#1A1A1A] flex justify-between items-center bg-[#0C0C0C] shrink-0">
                    <div>
                        <h3 className="text-white font-black uppercase tracking-tighter text-xl">Create New Service</h3>

                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#141414] text-gray-500 hover:text-white flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

                    {/* Service Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                            Service Name
                        </label>
                        <input
                            required
                            className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-[#0046FB] transition-all placeholder:text-gray-700"
                            placeholder="E.g. Enterprise Networking"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Category & Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white appearance-none outline-none focus:border-[#0046FB] transition-all"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Tech Support</option>
                                    <option>Security</option>
                                    <option>Web Development</option>
                                    <option>Networking</option>
                                    <option>Solar Energy</option>
                                    <option>Cloud Infrastructure</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    expand_more
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                                Starting Price (₦)
                            </label>
                            <input
                                className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white font-mono outline-none focus:border-[#0046FB] transition-all"
                                placeholder="0.00"
                                type="number"
                                value={formData.min_price}
                                onChange={e => setFormData({ ...formData, min_price: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                            Service Description
                        </label>
                        <textarea
                            required
                            rows={3}
                            className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#0046FB] transition-all placeholder:text-gray-700"
                            placeholder="Describe technical scope and capabilities..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Image & Tags */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                                Images (URL)
                            </label>
                            <input
                                className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white text-xs outline-none focus:border-[#0046FB] transition-all"
                                placeholder="https://cdn.n3xtbridge.com/assets/..."
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                                Tags
                            </label>
                            <input
                                className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl px-5 py-4 text-white text-xs outline-none focus:border-[#0046FB] transition-all placeholder:text-gray-700"
                                placeholder="AI, 24/7, Enterprise, Cloud"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Featured Checkbox */}
                    <div className="flex items-center gap-4 bg-[#111] border border-[#1A1A1A] p-5 rounded-3xl group cursor-pointer"
                        onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}>
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.is_featured ? 'bg-[#0046FB] border-[#0046FB]' : 'border-white bg-[#141414]'}`}>
                            {formData.is_featured && <span className="material-symbols-outlined text-white text-sm">check</span>}
                        </div>
                        <label className="text-xs font-black uppercase tracking-widest text-white cursor-pointer select-none">
                            Featured
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pb-4 sm:pb-0 pt-4">
                        <button
                            disabled={loading || !isFormValid}
                            className="w-full bg-[#0046FB] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#0046FB]/20 flex items-center justify-center gap-3 hover:bg-[#003ccf] transition-all disabled:opacity-30 disabled:grayscale"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Create Service </span>
                                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


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

const EditDescriptionModal = ({ requestId, initialValue, onClose, onSuccess }: { requestId: string, initialValue: string, onClose: () => void, onSuccess: () => void }) => {
    const [description, setDescription] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim() === initialValue.trim()) return onClose();

        setLoading(true);
        try {
            await api.patch(`/customer/quotes/requests/${requestId}/description`, { description: description.trim() });
            onSuccess();
            onClose();
        } catch (err) {
            alert("Failed to sync updates.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-xl">
            {/* Backdrop Click-to-Close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative bg-[#0C0C0C] w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t sm:border border-[#1A1A1A] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-[#1A1A1A] flex justify-between items-center bg-[#0C0C0C]">
                    <div>
                        <h3 className="text-white font-black uppercase tracking-tighter text-xl">Edit  Quote Request Desription</h3>
                        {/* <p className="text-[10px] font-black text-[#0046FB] uppercase tracking-[0.2em] mt-1">
                            Request ID: {requestId.slice(0, 8).toUpperCase()}
                        </p> */}
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#141414] text-gray-500 hover:text-white flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleUpdate} className="p-6 md:p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                            Updated Description
                        </label>
                        <textarea
                            required
                            rows={6}
                            className="w-full bg-[#141414] border border-[#1A1A1A] rounded-3xl p-6 text-white text-sm outline-none focus:border-[#0046FB] transition-all leading-relaxed placeholder:text-gray-700"
                            placeholder="Describe your technical requirements in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4 pb-4 sm:pb-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase text-gray-500 border border-[#1A1A1A] hover:bg-[#111] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading || !description.trim()}
                            className="flex-[2] bg-[#0046FB] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#0046FB]/20 flex items-center justify-center gap-2 hover:bg-[#003ccf] transition-all disabled:opacity-30 disabled:grayscale"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Update</span>
                                    <span className="material-symbols-outlined text-sm">sync</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CreatePromotionModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        service_id: '',
        is_active: true,
        starts_at: new Date().toISOString().split('T')[0],
        expires_at: ''
    });

    const [discounts, setDiscounts] = useState<Discount[]>([
        { name: '', amount: "0", type: 'fixed', description: '', item_name: "" }
    ]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/services?limit=100');
                const fetchedServices = res.data.services || res.data || [];
                setServices(fetchedServices);
                if (fetchedServices.length > 0 && !formData.service_id) {
                    setFormData(prev => ({ ...prev, service_id: fetchedServices[0].id }));
                }
            } catch (err) {
                console.error("Failed to fetch services");
            }
        };
        fetchServices();
    }, []);

    const handleAddDiscount = () => {
        setDiscounts([...discounts, { name: '', amount: "0", type: 'fixed', description: '', item_name: "" }]);
    };

    const handleRemoveDiscount = (index: number) => {
        setDiscounts(discounts.filter((_, i) => i !== index));
    };

    const updateDiscount = (index: number, field: keyof Discount, value: any) => {
        const updated = [...discounts];
        if (field === "type") {
            if (value === "item_match") {
                updated[index].amount = "0";
            } else {
                updated[index].item_name = "";
            }
        }
        updated[index] = { ...updated[index], [field]: value };
        setDiscounts(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let attachmentKeys: string[] = [];

            if (images.length > 0) {
                attachmentKeys = await Promise.all(images.map(async (file) => {
                    const ext = file.name.split('.').pop();
                    const random = crypto.randomUUID();

                    const object_key = `promotions/${formData.code}/${Date.now()}-${random}.${ext}`;
                    const mime_type = file.type || 'application/octet-stream';

                    const { data } = await api.post('/storage/presign', {
                        object_key,
                        mime_type,
                        visibility: "public"
                    });

                    await fetch(data.upload_url, {
                        method: "PUT",
                        body: file,
                    });

                    return data.object_key;
                }));
            }
            const payload = {
                ...formData,
                breakdown: discounts,
                starts_at: new Date(formData.starts_at).toISOString(),
                expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
                attachments: attachmentKeys
            };
            await api.post('/admin/promotions', payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to sync promotion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="bg-[#0C0C0C] w-full max-w-3xl rounded-[2.5rem] border border-[#1A1A1A] overflow-hidden shadow-2xl animate-in zoom-in duration-300">

                {/* HEADER */}
                <div className="p-8 border-b border-[#1A1A1A] flex justify-between items-center bg-[#0C0C0C]">
                    <div>
                        <h3 className="text-white font-black uppercase tracking-tighter text-xl">Create Promotion</h3>
                        {/* <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-[0.2em] mt-1">Status: Ready for Deployment</p> */}
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#141414] text-gray-500 hover:text-white flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    {/* SERVICE LINK */}
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-4">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">hub</span>
                            Target Service
                        </label>
                        <select
                            className="w-full bg-[#0C0C0C] border border-[#1A1A1A] text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                            value={formData.service_id}
                            onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                        >
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} — {s.category}</option>
                            ))}
                        </select>
                    </div>

                    {/* BASIC INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Promotion Code</label>
                            <input
                                required
                                placeholder="E.G. ALPHA-2026"
                                className="w-full bg-[#141414] border border-[#1A1A1A] text-primary rounded-2xl px-5 py-4 text-sm font-mono font-black uppercase outline-none focus:border-primary/50 transition-all"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Label</label>
                            <input
                                required
                                placeholder="E.G. Seasonal Infrastructure Rebate"
                                className="w-full bg-[#141414] border border-[#1A1A1A] text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary/50 transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* DYNAMIC DISCOUNTS */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Incentive Breakdown</label>
                            <span className="text-[9px] font-mono text-primary/60 uppercase">Multiple stacking allowed</span>
                        </div>

                        <div className="space-y-4">
                            {discounts.map((d, index) => (
                                <div key={index} className="p-6 bg-[#111111] border border-[#1A1A1A] rounded-[2rem] space-y-6 relative group animate-in slide-in-from-top-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-500 uppercase">Label</label>
                                            <input
                                                required
                                                placeholder="e.g. Licensing Fee"
                                                className="w-full bg-transparent border-b border-[#1A1A1A] py-2 text-sm text-white font-bold outline-none focus:border-primary transition-all"
                                                value={d.name}
                                                onChange={e => updateDiscount(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-500 uppercase">Type</label>
                                            <select
                                                className="w-full bg-transparent border-b border-[#1A1A1A] py-2 text-sm text-primary font-bold outline-none cursor-pointer"
                                                value={d.type}
                                                onChange={e => updateDiscount(index, 'type', e.target.value)}
                                            >
                                                <option value="fixed">Fixed Amount (₦)</option>
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="item_match">Free Item/Service</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-500 uppercase">
                                                {d.type === 'item_match' ? 'Match Reference' : 'Value'}
                                            </label>
                                            <input
                                                required
                                                type={d.type === 'item_match' ? 'text' : 'number'}
                                                placeholder={d.type === 'item_match' ? "e.g. Installation" : "0.00"}
                                                className="w-full bg-transparent border-b border-[#1A1A1A] py-2 text-sm text-white font-mono font-bold outline-none focus:border-primary transition-all"
                                                value={d.type === 'item_match' ? d.item_name : d.amount}
                                                onChange={e => updateDiscount(index, d.type === 'item_match' ? 'item_name' : 'amount', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <input
                                            placeholder="Short description for this specific benefit..."
                                            className="bg-transparent text-[11px] text-gray-500 outline-none w-full mr-4"
                                            value={d.description}
                                            onChange={e => updateDiscount(index, 'description', e.target.value)}
                                        />
                                        {discounts.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveDiscount(index)} className="text-red-500/50 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddDiscount}
                            className="w-full py-4 border-2 border-dashed border-[#1A1A1A] rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:border-primary/50 hover:text-primary transition-all"
                        >
                            + ADD
                        </button>
                    </div>

                    {/* EXPIRY & STATUS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Expiration Date</label>
                            <input
                                type="date"
                                className="w-full bg-[#141414] border border-[#1A1A1A] text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary/50"
                                value={formData.expires_at}
                                onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-4 bg-[#141414] border border-[#1A1A1A] p-5 rounded-2xl">
                            <input
                                type="checkbox"
                                id="promo-active"
                                className="w-5 h-5 accent-primary rounded-lg"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            <label htmlFor="promo-active" className="text-xs font-black uppercase tracking-widest text-white cursor-pointer">Live Immediately</label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Description (Markdown Supported)</label>
                        <textarea
                            rows={4}
                            className="w-full bg-[#141414] border border-[#1A1A1A] text-gray-300 rounded-2xl p-5 text-sm outline-none focus:border-primary/50 transition-all leading-relaxed"
                            placeholder="Detailed technical breakdown of why this promotion matters..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    {/* IMAGES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Images ({images.length}/5)</p>
                            <div className="grid grid-cols-3 gap-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#1A1A1A]">
                                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                                        <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 rounded-full p-1"><span className="material-symbols-outlined text-[12px] text-white">close</span></button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-[#1A1A1A] rounded-xl cursor-pointer hover:bg-[#141414] transition-colors">
                                        <span className="material-symbols-outlined text-gray-500">add_a_photo</span>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            try { validateFiles(files); setImages(prev => [...prev, ...files].slice(0, 5)); } catch (err: any) { alert(err.message); }
                                        }} />
                                    </label>
                                )}
                            </div>
                        </div>

                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-primary text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>Deploy Campaign Node <span className="material-symbols-outlined text-sm">rocket_launch</span></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Table Components ---


const ServicesTable = ({ services, loading, onToggle }: { services: Service[], loading: boolean, onToggle: any }) => (
    <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left min-w-[700px]">
            <thead>
                <tr className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service Name</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Category</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Plan</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
                {loading ? (
                    <tr><td colSpan={4} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">Loading services...</td></tr>
                ) : services.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-gray-500 font-medium">No services found.</td></tr>
                ) : services.map((s) => (
                    <tr key={s.id} className="hover:bg-[#111] transition-colors group">
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center group-hover:bg-[#0046FB]/10 transition-colors">
                                    <span className="material-symbols-outlined text-gray-400 group-hover:text-[#0046FB] transition-colors">{s.icon || 'inventory_2'}</span>
                                </div>
                                <span className="font-bold text-white text-sm tracking-tight">{s.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            <span className="text-[11px] font-medium text-gray-400 py-1 px-3 bg-[#1A1A1A] rounded-full border border-[#222]">
                                {s.category}
                            </span>
                        </td>
                        <td className="px-6 py-5">
                            {s.is_featured ? (
                                <div className="flex items-center gap-1 text-amber-500">
                                    <span className="material-symbols-outlined text-sm">stars</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Popular</span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-black uppercase tracking-tighter text-gray-700">Basic</span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                            <button
                                onClick={() => onToggle(s.id, s.is_active)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${s.is_active
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                    : 'bg-gray-500/5 text-gray-500 border-gray-500/10 hover:bg-gray-500/10'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse' : 'bg-gray-600'}`}></span>
                                {s.is_active ? 'Active' : 'Inactive'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const InvoiceActionMenu = ({ inv, navigate, onSendReminder, isadmin }: { inv: any, navigate: any, onSendReminder: (id: string) => void, isadmin: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${isOpen ? 'bg-[#0046FB] text-white shadow-lg shadow-[#0046FB]/20' : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#252525]'
                    }`}
            >
                <span className="material-symbols-outlined text-lg">{isOpen ? 'close' : 'more_horiz'}</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

                    <div className="absolute right-0 mt-3 w-56 bg-[#111] border border-[#1A1A1A] rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        {/* <div className="px-4 py-2 border-b border-[#1A1A1A] mb-1">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Management Actions</p>
                        </div> */}

                        <button
                            onClick={() => navigate(`/dashboard/invoice/${inv.id}`, { state: { invoice: inv } })}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:bg-[#1A1A1A] hover:text-[#0046FB] flex items-center gap-3 transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">visibility</span> View  Details
                        </button>

                        {inv.status !== 'paid' && isadmin && (
                            <button
                                onClick={() => {
                                    onSendReminder(inv.id);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:bg-[#0046FB]/10 hover:text-[#0046FB] flex items-center gap-3 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">outgoing_mail</span> Send Reminder
                            </button>
                        )}

                        {isadmin && (<div className="border-t border-[#1A1A1A] mt-1 pt-1">
                            <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500/70 hover:bg-red-500/10 hover:text-red-500 flex items-center gap-3 transition-colors">
                                <span className="material-symbols-outlined text-base">archive</span> Archive Invoice
                            </button>
                        </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
// --- TABLE COMPONENTS (Batch 2: Invoices & Promotions) ---

const InvoiceTable = ({ invoices, loading, navigate, isadmin }: { invoices: Invoice[], loading: boolean, navigate: any, isadmin: boolean }) => {
    const handleSendReminder = async (id: string) => {
        try {
            await sendInvoiceMail(id);
            alert("Reminder sent.");
        } catch (err) {
            alert("Could not send reminder.");
        }
    };

    const formatReminderDate = (dateString: string) => {
        if (!dateString || dateString.startsWith("0001") || dateString.startsWith("1970")) {
            return <span className="text-gray-600 italic lowercase tracking-tight">Not sent</span>;
        }

        const date = new Date(dateString);
        return (
            <div className="flex items-center gap-1.5 text-[#0046FB] font-bold">
                <span className="material-symbols-outlined text-[14px]">history</span>
                {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </div>
        );
    };

    return (
        <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left min-w-[900px]">
                <thead>
                    <tr className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Invoice No.</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Quote</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Customer</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Amount</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Last Reminder</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                    {loading ? (
                        <tr><td colSpan={7} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">Loading invoices...</td></tr>
                    ) : invoices.length === 0 ? (
                        <tr><td colSpan={7} className="p-20 text-center text-gray-500 font-medium">No invoices found.</td></tr>
                    ) : (
                        invoices.map((inv) => {
                            const quoteRef = inv.quote_id ? `Q-${inv.quote_id.slice(0, 8).toUpperCase()}` : "No Quote";
                            return (
                                <tr key={inv.id} className="hover:bg-[#111] transition-colors group">
                                    <td className="px-6 py-5 font-mono text-xs text-white">
                                        <div className="flex items-center gap-2">
                                            #{inv.invoice_number}
                                            {inv.deleted_at.Valid && (
                                                <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[8px] font-black uppercase border border-red-500/20">Archived</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-mono text-[10px] text-gray-500 tracking-tighter">
                                        {inv.quote_id?.startsWith("00000000") ? "---" : quoteRef}
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-white tracking-tight">{inv.customer_name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-mono">{inv.customer_email}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[inv.status.toLowerCase()] || STATUS_STYLES.default}`}>
                                            <span className="w-1 h-1 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-white text-sm">
                                        ₦{inv.total.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5 text-[10px] font-bold uppercase tracking-tighter">
                                        {formatReminderDate(inv.reminder_sent_at)}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <InvoiceActionMenu
                                            inv={inv}
                                            navigate={navigate}
                                            isadmin={isadmin}
                                            onSendReminder={handleSendReminder}
                                        />
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};


const PromotionsTable = ({ promos, loading, onToggleStatus }: { promos: Promotion[], loading: boolean, onToggleStatus: (id: string, current: boolean) => void }) => (
    <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left min-w-[900px]">
            <thead>
                <tr className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Promotion</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Promo Code</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Benefits</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Valid Period</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
                {loading ? (
                    <tr><td colSpan={6} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">Loading promotions...</td></tr>
                ) : promos.length === 0 ? (
                    <tr><td colSpan={6} className="p-20 text-center text-gray-500 font-medium">No promotions available.</td></tr>
                ) : (
                    promos.map((p) => {
                        const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                        return (
                            <tr key={p.id} className="hover:bg-[#111] transition-colors group">
                                <td className="px-6 py-5">
                                    <p className="text-sm font-bold text-white tracking-tight">{p.name}</p>
                                    <p className="text-[10px] text-gray-500 font-medium italic truncate max-w-[150px]">
                                        {p.description.String || "No description provided"}
                                    </p>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="font-mono text-xs bg-[#1A1A1A] border border-[#222] px-3 py-1 rounded-lg text-[#0046FB] font-black uppercase">
                                        {p.code}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                                        {/* Logic preserved as requested */}
                                        COMING SOON
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-wrap gap-1.5">
                                        {(p.breakdown || []).map((d, idx) => (
                                            <span key={idx} className="text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase"
                                                title={`Target: ${d.item_name || 'Global System'}`}>
                                                {d.type === 'percentage' ? `${d.amount}%` : `₦${(Number(d.amount) || 0).toLocaleString()}`}
                                            </span>
                                        ))}
                                        {(!p.breakdown || p.breakdown.length === 0) && (
                                            <span className="text-[9px] text-gray-700 font-bold uppercase tracking-tighter">No benefits set</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <button
                                        onClick={() => onToggleStatus(p.id, p.is_active)}
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${p.is_active && !isExpired ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                                    >
                                        <span className={`w-1 h-1 rounded-full ${p.is_active && !isExpired ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-red-500'}`}></span>
                                        {isExpired ? 'Expired' : p.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <p className="text-[10px] font-bold text-white tracking-tighter">{new Date(p.starts_at).toLocaleDateString()}</p>
                                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest"> {p.expires_at ? `To ${new Date(p.expires_at).toLocaleDateString()}` : 'No expiry'}</p>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    </div>
);
// --- TABLE COMPONENTS (Batch 3: Quote Requests & Quotes) ---

const QuoteRequestTable = ({
    qrs,
    loading,
    onAddQuote,
    onEditDescription,
    role
}: {
    qrs: QuoteRequest[],
    loading: boolean,
    onAddQuote?: (qr: QuoteRequest) => void,
    onEditDescription?: (id: string, currentDesc: string) => void,
    role: string
}) => {
    const navigate = useNavigate();
    const isElevated = role === 'admin' || role === 'staff';

    return (
        <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left min-w-[900px]">
                <thead>
                    <tr className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
                        {isElevated && (
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Client</th>
                        )}
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service </th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Request Details</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                    {loading ? (
                        <tr>
                            <td colSpan={isElevated ? 5 : 4} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">
                                Loading requests...
                            </td>
                        </tr>
                    ) : qrs.length === 0 ? (
                        <tr>
                            <td colSpan={isElevated ? 5 : 4} className="p-20 text-center text-gray-500 font-medium font-mono text-xs uppercase tracking-widest">
                                No quote requests found.
                            </td>
                        </tr>
                    ) : (
                        qrs.map((qr) => {
                            const isQuoted = qr.status === 'quoted';
                            return (
                                <tr key={qr.id} className="hover:bg-[#111] transition-colors group">
                                    {isElevated && (
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-white tracking-tight">{qr.user_name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-mono">{qr.user_email}</p>
                                        </td>
                                    )}

                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-white">{qr.service_name}</span>
                                    </td>

                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${QUOTE_REQUEST_STATUS_STYLES[qr.status] || QUOTE_REQUEST_STATUS_STYLES.default}`}>
                                            <span className="w-1 h-1 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                                            {qr.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-gray-500 truncate max-w-[220px] italic block" title={qr.description}>
                                                {qr.description}
                                            </span>
                                            {role === 'user' && qr.status === 'pending' && (
                                                <button onClick={() => onEditDescription?.(qr.id, qr.description)} className="text-[#0046FB] opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                                    <span className="material-symbols-outlined text-base">edit_note</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/qr/${qr.id}`, { state: { qr } })}
                                                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] rounded-xl text-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-[#252525] hover:text-white transition-all border border-transparent hover:border-[#333]"
                                            >
                                                <span className="material-symbols-outlined text-base">visibility</span>
                                                View
                                            </button>

                                            {!isQuoted && isElevated && (
                                                <button
                                                    onClick={() => onAddQuote?.(qr)}
                                                    className="bg-[#0046FB] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#0046FB]/20 hover:bg-[#003ccf] flex items-center gap-2 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-base">add_box</span>
                                                    Create Quote
                                                </button>
                                            )}

                                            {isQuoted && qr.quote_id && (
                                                <button
                                                    onClick={() => navigate(`/dashboard/quote/${qr.quote_id}`)}
                                                    className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-base">verified</span>
                                                    Open Quote
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

const QuotesTable = ({
    qs,
    loading,
    onUpdateStatus,
    navigate,
    role
}: {
    qs: Quote[],
    loading: boolean,
    onUpdateStatus?: (id: string, newStatus: string) => void,
    navigate: NavigateFunction,
    role: string
}) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const isAdmin = role === 'admin' || role === 'staff';

    let statuses: Quote['status'][] = isAdmin
        ? ['draft', 'sent', 'expired', 'in-review']
        : ['accepted', 'declined'];

    return (
        <div className="overflow-x-auto scrollbar-hide min-h-[450px]">
            <table className="w-full text-left min-w-[900px]">
                <thead>
                    <tr className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Quote ID</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Amount</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Expires On</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                    {loading ? (
                        <tr><td colSpan={6} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">Loading quotes...</td></tr>
                    ) : qs.length === 0 ? (
                        <tr><td colSpan={6} className="p-20 text-center text-gray-500 font-medium">No quotes available.</td></tr>
                    ) : qs.map((q) => {
                        const dateValue = (q as any).exire_at || q.expires_at;
                        const formattedDate = dateValue && !isNaN(Date.parse(dateValue))
                            ? new Date(dateValue).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
                            : "No expiry";

                        return (
                            <tr key={q.id} className="hover:bg-[#111] transition-colors group">
                                <td className="px-6 py-5 font-mono text-[11px] font-bold text-[#0046FB] uppercase tracking-wider">
                                    Q-{q.id.slice(0, 8).toUpperCase()}
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm font-bold text-white tracking-tight">{q.service_name}</span>
                                </td>
                                <td className="px-6 py-5 font-black text-white text-sm">
                                    ₦{parseFloat(q.amount || "0").toLocaleString()}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="relative inline-block">
                                        <button
                                            disabled={!isAdmin || q.status === 'paid'}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === q.id ? null : q.id);
                                            }}
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${isAdmin && q.status !== 'paid' ? 'hover:bg-[#1A1A1A] cursor-pointer' : 'cursor-default'
                                                } ${QUOTE_STATUS_STYLES[q.status] || QUOTE_STATUS_STYLES.default}`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {q.status}
                                            {isAdmin && q.status !== 'paid' && <span className="material-symbols-outlined text-[16px]">expand_more</span>}
                                        </button>

                                        {activeMenu === q.id && (
                                            <>
                                                <div className="fixed inset-0 z-[80]" onClick={() => setActiveMenu(null)}></div>
                                                <div className="absolute left-0 mt-3 w-40 bg-[#111] border border-[#1A1A1A] rounded-2xl shadow-2xl z-[90] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {statuses.filter(s => s !== q.status).map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => { onUpdateStatus?.(q.id, status); setActiveMenu(null); }}
                                                            className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-[#1A1A1A] hover:text-[#0046FB] transition-colors"
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-xs font-bold text-gray-500 uppercase">
                                    {formattedDate}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1A1A1A] text-gray-400 hover:bg-[#0046FB] hover:text-white transition-all shadow-sm"
                                        onClick={() => navigate(`/dashboard/quote/${q.id}`, { state: { quote: q } })}
                                    >
                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div >
    );
};

// --- Admin Terminal ---
const AdminConsole = ({ user }: { user: User }) => {
    const navigate = useNavigate();

    // --- State Management ---
    const [currentTab, setCurrentTab] = useState<'invoices' | 'services' | 'quote-requests' | 'quotes' | 'promotions'>('invoices');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

    // Data Collections
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [qrs, setQrs] = useState<QuoteRequest[]>([]);
    const [qs, setQs] = useState<Quote[]>([]);
    const [promos, setPromos] = useState<Promotion[]>([]);

    // ✅ LOGIC UPDATE: Global Stats for the Command Center
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingRequests: 0,
        activeQuotes: 0,
        totalServices: 0,
        activePromos: 0
    });

    // Pagination
    const LIMIT = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    // ✅ LOGIC UPDATE: Fetch Global Analytics once on mount
    useEffect(() => {
        const fetchSystemStats = async () => {
            try {
                const [invRes, qrRes, qRes, sRes, pRes] = await Promise.all([
                    api.get('/worker/invoices?limit=1000'),
                    api.get('/admin/quote-requests?limit=1000'),
                    api.get('/admin/quotes?limit=1000'),
                    api.get('/admin/services?limit=1000'),
                    api.get('/admin/promotions?limit=1000')
                ]);

                const invs: Invoice[] = invRes.data.invoices || [];
                const requests: QuoteRequest[] = qrRes.data.quote_requests || [];
                const quotes: Quote[] = qRes.data.quotes || [];
                const svcs: Service[] = sRes.data.services || [];
                const prms: Promotion[] = pRes.data.promotions || [];

                setStats({
                    totalRevenue: invs.reduce((acc, inv) => inv.status === 'paid' ? acc + inv.total : acc, 0),
                    pendingRequests: requests.filter(r => r.status === 'pending').length,
                    activeQuotes: quotes.filter(q => q.status === 'sent').length,
                    totalServices: svcs.length,
                    activePromos: prms.filter(p => p.is_active).length
                });
            } catch (err) {
                console.error("Command Stats Sync Error:", err);
            }
        };
        fetchSystemStats();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoints: Record<string, string> = {
                'invoices': `/worker/invoices`,
                'services': `/admin/services`,
                'quote-requests': `/admin/quote-requests`,
                'quotes': `/admin/quotes`,
                'promotions': `/admin/promotions`
            };
            const res = await api.get(`${endpoints[currentTab]}?limit=${LIMIT}&offset=${offset}`);

            if (currentTab === 'invoices') setInvoices(res.data.invoices || []);
            else if (currentTab === 'services') setServices(res.data.services || []);
            else if (currentTab === 'quote-requests') setQrs(res.data.quote_requests || []);
            else if (currentTab === 'quotes') setQs(res.data.quotes || []);
            else if (currentTab === 'promotions') setPromos(res.data.promotions || []);

            setTotal(res.data.total || 0);
        } catch (err) {
            console.error("Registry Sync Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentTab, offset]);

    // HANDLERS
    const handleTogglePromoStatus = async (id: string, current: boolean) => {
        try {
            await api.patch(`/admin/promotions/${id}/status`, { is_active: !current });
            setPromos(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
        } catch (err) { alert("Status sync failed."); }
    };

    const handleToggleActive = async (id: string, status: boolean) => {
        try {
            await api.patch(`/admin/services/${id}/status`, { is_active: !status });
            setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !status } : s));
        } catch (err) { alert("Visibility sync failed."); }
    };

    const handleUpdateQuoteStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/admin/quotes/${id}/status`, { status: newStatus });
            setQs(prev => prev.map(q => q.id === id ? { ...q, status: newStatus as any } : q));
        } catch (err) { alert(`Status update failed`); }
    };

    // Memoized Filters
    const filteredInvoices = useMemo(() => invoices.filter(inv =>
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [invoices, searchQuery]);

    const filteredServices = useMemo(() => services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    ), [services, searchQuery]);

    const TabContent = {
        "invoices": <InvoiceTable invoices={filteredInvoices} loading={loading} navigate={navigate} isadmin={user.role === "admin"} />,
        "services": <ServicesTable services={filteredServices} loading={loading} onToggle={handleToggleActive} />,
        "quote-requests": <QuoteRequestTable qrs={qrs} loading={loading} onAddQuote={setSelectedQuote} role={user.role} />,
        "quotes": <QuotesTable qs={qs} loading={loading} onUpdateStatus={handleUpdateQuoteStatus} navigate={navigate} role={user.role} />,
        "promotions": <PromotionsTable promos={promos} loading={loading} onToggleStatus={handleTogglePromoStatus} />
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-4 sm:px-0">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="h-1 w-12 bg-[#0046FB] rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Root Administrator</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Enterprise Console</h1>
                </div>

                {/* Global Actions */}
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <button onClick={() => setIsServiceModalOpen(true)} className="flex-1 lg:flex-none bg-[#111] border border-[#1A1A1A] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">inventory_2</span> Create Service
                    </button>
                    <button onClick={() => setIsPromoModalOpen(true)} className="flex-1 lg:flex-none bg-amber-500/10 border border-amber-500/20 text-amber-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">campaign</span> Create Promotion
                    </button>
                    <button onClick={() => navigate('/dashboard/create-invoice')} className="flex-1 lg:flex-none bg-[#0046FB] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#003ccf] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0046FB]/20">
                        <span className="material-symbols-outlined text-sm">add</span> New Invoice
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4 sm:px-0">
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A] group">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 group-hover:text-green-400">Total Yield</p>
                    <h3 className="text-2xl font-black text-white tracking-tighter">₦{stats.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Quote Requets</p>
                    <h3 className="text-2xl font-black text-[#0046FB] tracking-tighter">{stats.pendingRequests}</h3>
                </div>
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Quotes</p>
                    <h3 className="text-2xl font-black text-white tracking-tighter">{stats.activeQuotes}</h3>
                </div>
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Services</p>
                    <h3 className="text-2xl font-black text-white tracking-tighter">{stats.totalServices}</h3>
                </div>
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Live Promos</p>
                    <h3 className="text-2xl font-black text-amber-500 tracking-tighter">{stats.activePromos}</h3>
                </div>
            </div>

            {/* Sub-Navigation & Filters */}
            <div className="space-y-6">
                <div className="flex flex-col xl:flex-row justify-between items-center gap-6 border-b border-[#1A1A1A] px-4 sm:px-0">
                    {/* Tabs */}
                    <div className="flex gap-8 overflow-x-auto w-full scrollbar-hide">
                        {['invoices', 'services', 'quote-requests', 'quotes', 'promotions'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setCurrentTab(tab as any); setOffset(0); }}
                                className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative ${currentTab === tab ? 'text-[#0046FB]' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {tab.replace('-', ' ')}
                                {currentTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0046FB] rounded-full"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search & Pagination Strip */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto pb-6 xl:pb-4">
                        <div className="relative w-full sm:w-64 group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#0046FB] transition-colors text-sm">search</span>
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-12 pr-4 py-3 bg-[#111] border border-[#1A1A1A] rounded-2xl text-xs font-bold text-white outline-none focus:border-[#0046FB] transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={offset === 0 || loading}
                                onClick={() => setOffset(prev => prev - LIMIT)}
                                className="p-3 border border-[#1A1A1A] rounded-xl bg-[#111] text-white disabled:opacity-20 hover:bg-[#1A1A1A] transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <button
                                disabled={offset + LIMIT >= total || loading}
                                onClick={() => setOffset(prev => prev + LIMIT)}
                                className="p-3 border border-[#1A1A1A] rounded-xl bg-[#111] text-white disabled:opacity-20 hover:bg-[#1A1A1A] transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Terminal */}
                <div className="bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2.5rem] min-h-[500px] overflow-hidden shadow-2xl mx-4 sm:mx-0 transition-all">
                    {TabContent[currentTab]}
                </div>
            </div>

            {/* Modals Container */}
            {isServiceModalOpen && <CreateServiceModal onClose={() => setIsServiceModalOpen(false)} />}
            {selectedQuote && <CreateQuoteModal qr={selectedQuote} onClose={() => setSelectedQuote(null)} onSuccess={fetchData} adminID={user.id} />}
            {isPromoModalOpen && <CreatePromotionModal onClose={() => setIsPromoModalOpen(false)} onSuccess={fetchData} />}
        </div>
    );
};

// --- Staff Terminal ---

const StaffTerminal = ({ user }: { user: User }) => {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const LIMIT = 10;

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/invoices?limit=${LIMIT}&offset=${offset}`);
                setInvoices(res.data.invoices || []);
                setTotal(res.data.total || 0);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchInvoices();
    }, [offset]);

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Operations Node</span>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Billing Terminal</h1>
                </div>
                <button onClick={() => navigate('/dashboard/create-invoice')} className="bg-primary text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined text-sm">add</span> Create Invoice
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Assignments</h3>
                    <div className="flex gap-2">
                        <button disabled={offset === 0} onClick={() => setOffset(prev => prev - LIMIT)} className="p-1 border rounded bg-white disabled:opacity-20"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                        <button disabled={offset + LIMIT >= total} onClick={() => setOffset(prev => prev + LIMIT)} className="p-1 border rounded bg-white disabled:opacity-20"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                    </div>
                </div>
                <InvoiceTable invoices={invoices} loading={loading} navigate={navigate} isadmin={user.role === "admin"} />
            </div>
        </div>
    );
};

// --- Client Portal ---
const ClientPortal = ({ user }: { user: User }) => {
    const navigate = useNavigate();

    // --- State Management ---
    const [currentTab, setCurrentTab] = useState<'billing' | 'requests' | 'active-offers' | 'declined-offers' | 'paid-offers'>('billing');
    const [loading, setLoading] = useState(true);

    // List Data
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [qrs, setQrs] = useState<QuoteRequest[]>([]);
    const [qs, setQs] = useState<Quote[]>([]);

    // ✅ LOGIC UPDATE: Analytics state to hold counts and totals independently of tab switching
    const [analytics, setAnalytics] = useState({
        unpaidBalance: 0,
        pendingRequests: 0,
        paidOffers: 0,
        activeOffers: 0,
        declinedOffers: 0
    });

    // Pagination
    const LIMIT = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    // Modal State
    const [editTarget, setEditTarget] = useState<{ id: string, desc: string } | null>(null);

    // ✅ LOGIC UPDATE: Fetch initial analytics once on mount
    // This ensures numbers are visible immediately regardless of which tab is active
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetching large sets or specialized count endpoints to populate the stats cards
                // TODO have an enpoint in backend that return the number of these in the backend instead of fetching the endpoints 
                const [invRes, qrRes, qRes] = await Promise.all([
                    api.get(`/customer/invoices?limit=1000`),
                    api.get(`/customer/quotes/my-requests?limit=1000`),
                    api.get(`/customer/quotes?limit=1000`)
                ]);

                const invs: Invoice[] = invRes.data.invoices || [];
                const requests: QuoteRequest[] = qrRes.data.quote_requests || [];
                const quotes: Quote[] = qRes.data.quotes || [];

                setAnalytics({
                    unpaidBalance: invs.reduce((acc, inv) => inv.status.toLowerCase() !== 'paid' ? acc + inv.total : acc, 0),
                    pendingRequests: requests.filter(r => r.status === 'pending').length,
                    paidOffers: quotes.filter(q => q.status === 'paid').length,
                    activeOffers: quotes.filter(q => q.status === 'sent' || q.status === 'accepted').length,
                    declinedOffers: quotes.filter(q => q.status === 'declined' || q.status === 'expired').length
                });
            } catch (err) {
                console.error("Analytics Sync Error:", err);
            }
        };
        fetchAnalytics();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoints: Record<string, string> = {
                'billing': `/customer/invoices`,
                'requests': `/customer/quotes/my-requests`,
                'active-offers': `/customer/quotes`,
                'declined-offers': `/customer/quotes`,
                'paid-offers': `/customer/quotes`
            };
            const res = await api.get(`${endpoints[currentTab]}?limit=${LIMIT}&offset=${offset}`);

            if (currentTab === 'billing') {
                setInvoices(res.data.invoices || []);
            } else if (currentTab === 'requests') {
                setQrs(res.data.quote_requests || []);
            } else {
                setQs(res.data.quotes || []);
            }

            setTotal(res.data.total || 0);
        } catch (err) {
            console.error("Terminal Sync Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentTab, offset]);

    // --- Tab Content Mapping ---
    const TabContent = {
        billing: <InvoiceTable invoices={invoices} loading={loading} navigate={navigate} isadmin={user.role === "admin"} />,
        "active-offers": (
            <QuotesTable
                qs={qs.filter(q => ['sent', 'accepted', 'in-review'].includes(q.status))}
                loading={loading}
                role={user.role}
                navigate={navigate}
                onUpdateStatus={() => { }}
            />
        ),
        "declined-offers": (
            <QuotesTable
                qs={qs.filter(q => ['declined', 'expired'].includes(q.status))}
                loading={loading}
                role={user.role}
                navigate={navigate}
                onUpdateStatus={() => { }}
            />
        ),
        "paid-offers": (
            <QuotesTable
                qs={qs.filter(q => q.status === 'paid')}
                loading={loading}
                role={user.role}
                navigate={navigate}
                onUpdateStatus={() => { }}
            />
        ),
        requests: (
            <QuoteRequestTable
                qrs={qrs}
                loading={loading}
                role={user.role}
                onEditDescription={(id, desc) => setEditTarget({ id, desc })}
            />
        ),
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <header className="px-4 sm:px-0 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="h-1 w-8 bg-[#0046FB] rounded-full"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                        Welcome Back {user.first_name}
                    </span>
                </div>
                {/* <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Control Center</h1> */}
            </header>

            {/* Stats Grid - Updated to Dark Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4 sm:px-0">
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A] hover:border-[#0046FB]/50 transition-all group">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 group-hover:text-[#0046FB]">Unpaid Balance</p>
                    <h3 className="text-2xl font-black text-amber-500 tracking-tighter">
                        ₦{analytics.unpaidBalance.toLocaleString()}
                    </h3>
                </div>
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Pending</p>
                    <h3 className="text-2xl font-black text-white tracking-tighter">{analytics.pendingRequests}</h3>
                </div>
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Paid</p>
                    <h3 className="text-2xl font-black text-[#0046FB] tracking-tighter">{analytics.paidOffers}</h3>
                </div>
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active</p>
                    <h3 className="text-2xl font-black text-green-500 tracking-tighter">{analytics.activeOffers}</h3>
                </div>
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Expired</p>
                    <h3 className="text-2xl font-black text-red-500 tracking-tighter">{analytics.declinedOffers}</h3>
                </div>
            </div>

            {/* Navigation & Controls Wrapper */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#1A1A1A] px-4 sm:px-0">
                    {/* Tabs with custom scroll for mobile */}
                    <div className="flex gap-6 overflow-x-auto w-full scrollbar-hide pb-0">
                        {(['billing', 'requests', 'active-offers', 'paid-offers', 'declined-offers'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setCurrentTab(tab); setOffset(0); }}
                                className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative ${currentTab === tab ? 'text-[#0046FB]' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {tab.replace('-', ' ')}
                                {currentTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0046FB] rounded-full animate-in fade-in zoom-in duration-300"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex gap-2 pb-4 md:pb-4">
                        <button
                            disabled={offset === 0 || loading}
                            onClick={() => setOffset(prev => Math.max(0, prev - LIMIT))}
                            className="p-2 border border-[#1A1A1A] rounded-xl bg-[#111] text-white hover:bg-[#1A1A1A] disabled:opacity-20 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button
                            disabled={offset + LIMIT >= total || loading}
                            onClick={() => setOffset(prev => prev + LIMIT)}
                            className="p-2 border border-[#1A1A1A] rounded-xl bg-[#111] text-white hover:bg-[#1A1A1A] disabled:opacity-20 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* Content Container - Glassmorphic Dark Style */}
                <div className="bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2.5rem] min-h-[450px] overflow-hidden shadow-2xl mx-4 sm:mx-0">
                    {TabContent[currentTab]}
                </div>
            </div>

            {/* Modals */}
            {editTarget && (
                <EditDescriptionModal
                    requestId={editTarget.id}
                    initialValue={editTarget.desc}
                    onClose={() => setEditTarget(null)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

// --- Main Dashboard Traffic Controller ---

const Dashboard = () => {
    const { user } = useAuth();

    if (user) {
        return (
            <div className="min-h-screen bg-[#0C0C0C] p-8 pt-24 ">
                {user.role === 'admin' ? (
                    <AdminConsole user={user} />
                ) : user.role === 'staff' ? (
                    <StaffTerminal user={user} />
                ) : (
                    <ClientPortal user={user} />
                )}
            </div>
        )
    }
};

export default Dashboard;