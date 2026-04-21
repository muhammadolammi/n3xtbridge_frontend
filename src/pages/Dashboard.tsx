import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Invoice, Service, Quote, QuoteRequest, User, Promotion, Discount, Item } from '../models/model';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { QUOTE_REQUEST_STATUS_STYLES } from '../constants/const';
import { sendInvoiceMail } from '../api/emails';

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
const CreateServiceModal = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', category: 'Tech Support',
        is_featured: false, icon: '', image: '', tags: '', min_price: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== "") };
            await api.post('/admin/services', payload);
            alert("Service created successfully!");
            onClose();
        } catch (err) { alert("Failed to create service."); }
        finally { setLoading(false); }
    };

    const isFormValid = formData.name.trim() !== "" && formData.description.trim() !== "";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-black uppercase tracking-tighter text-lg">Register New Infrastructure Service</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Service Name</label>
                        <input required className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm font-bold"
                            onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Category</label>
                        <select className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm"
                            onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option>Tech Support</option>
                            <option>Security</option>
                            <option>Web Development</option>
                            <option>Networking</option>
                            <option>Cloud Infrastructure</option>
                        </select>
                    </div>

                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Description</label>
                        <textarea required rows={3} className="w-full border-2 border-gray-100 focus:border-primary rounded-lg p-3 text-sm"
                            onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Image URL</label>
                        <input className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm"
                            placeholder="https://..." onChange={e => setFormData({ ...formData, image: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Tags (comma separated)</label>
                        <input className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm"
                            placeholder="AI, 24/7, Cloud" onChange={e => setFormData({ ...formData, tags: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Starting Price</label>
                        <input className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm"
                            placeholder="200000, 500000 " onChange={e => setFormData({ ...formData, min_price: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="featured" className="w-4 h-4 accent-primary"
                            onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
                        <label htmlFor="featured" className="text-xs font-bold uppercase">Mark as Featured</label>
                    </div>
                    <button disabled={loading || !isFormValid} className="col-span-2 bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/30 mt-4">
                        {loading ? "Registering Service..." : "Deploy Service"}
                    </button>
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

    // const applyItemToDiscount = (discountIndex: number, itemIndex: number) => {
    //     if (itemIndex === -1) {
    //         // Reset to a standard fixed discount if "Custom" is picked
    //         const newDiscounts = [...discounts];
    //         newDiscounts[discountIndex] = { ...newDiscounts[discountIndex], type: 'fixed', item_name: '', name: '' };
    //         setDiscounts(newDiscounts);
    //         return;
    //     }

    //     const selectedItem = items[itemIndex];
    //     const newDiscounts = [...discounts];
    //     newDiscounts[discountIndex] = {
    //         ...newDiscounts[discountIndex],
    //         name: `Deduction: ${selectedItem.name}`,
    //         item_name: selectedItem.name,
    //         amount: selectedItem.price,
    //         type: 'fixed', // Since we are matching a specific item price
    //         description: `Full value offset for ${selectedItem.name}`
    //     };
    //     setDiscounts(newDiscounts);
    // };

    const calculateTotal = () => {
        // 1. Calculate Gross Total from Items
        const gross = items.reduce((acc, item) => {
            return acc + ((parseFloat(item.price) || 0) * (item.quantity || 0));
        }, 0);

        let totalDeductions = 0;
        const handledItemPromos = new Set<string>(); // To ensure "one only counts" per unique item name

        // 2. Process Applied Promotions (from the User's Request)
        appliedPromos.forEach(promo => {
            promo.breakdown?.forEach(d => {
                if (d.type === 'percentage') {
                    totalDeductions += (gross * (parseFloat(d.amount ?? "0") / 100));
                } else if (d.type === 'fixed') {
                    totalDeductions += parseFloat(d.amount ?? "0") || 0;
                } else if (d.type === 'item_match') {
                    // Logic: Find if the admin added this specific item name
                    // Only count the first instance of this promo item
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

        // 3. Add Manual Admin Discounts
        const manualDiscounts = discounts.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);

        return Math.max(0, gross - totalDeductions - manualDiscounts);
    };
    useEffect(() => {
        const fetchPromos = async () => {
            if (qr.promo_ids && qr.promo_ids.length > 0) {
                try {
                    // Fetch all promo details based on IDs in the QR
                    const reqs = qr.promo_ids.map(id => api.get(`/promotions/${id}`));
                    const res = await Promise.all(reqs);
                    setAppliedPromos(res.map(r => r.data.promotion));
                } catch (err) {
                    console.error("Failed to sync promo registry", err);
                }
            }
        };
        fetchPromos();
    }, [qr.promo_ids]);
    const getMissingPromoItems = () => {
        const requiredItemNames = new Set<string>();

        // Collect all unique 'item_name' requirements from promos
        appliedPromos.forEach(p => {
            p.breakdown?.forEach(d => {
                if (d.type === 'item_match') requiredItemNames.add(d.item_name.toLowerCase());
            });
        });

        // Check which ones are NOT in the items list
        const currentItemNames = new Set(items.map(i => i.name.toLowerCase()));
        return Array.from(requiredItemNames).filter(name => !currentItemNames.has(name));
    };

    const missingItems = getMissingPromoItems();
    const isBlockedByMissingItems = missingItems.length > 0;
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Calculate Gross for percentage math
            const gross = items.reduce((acc, item) => acc + ((parseFloat(item.price) || 0) * (item.quantity || 0)), 0);

            // 2. Map Applied Promos to the "Discount" format the backend expects
            const promoDiscounts = appliedPromos.flatMap(promo =>
                (promo.breakdown || []).map(d => {
                    let amount = "0";
                    if (d.type === 'percentage') {
                        amount = (gross * (parseFloat(d.amount ?? "0") / 100)).toString();
                    } else if (d.type === 'fixed') {
                        amount = d.amount ?? "0";
                    } else if (d.type === 'item_match') {
                        const match = items.find(i => i.name.toLowerCase() === d.item_name.toLowerCase());
                        amount = match ? match.price : "0";
                    }

                    return {
                        // Include the Promo Code in the name for better tracking
                        name: `[PROMO: ${promo.code}] ${d.name}`,
                        amount: amount
                    };
                })
            );

            // 3. Combine with manual discounts
            const allDiscounts = [
                ...promoDiscounts,
                ...discounts.filter(d => d.name.trim() !== "" && parseFloat(d.amount) > 0)
            ];



            const payload = {
                quote_request_id: qr.id,
                promo_ids: appliedPromos.map(p => p.id),
                amount: calculateTotal().toString(),
                breakdown: items,
                discounts: allDiscounts, // Send the combined list
                notes: notes,
                expires_at: new Date(expiryDate).toISOString(),
                status: 'draft',
                user_id: adminID
            };

            await api.post('/admin/quotes', payload);
            alert("Official Quote dispatched to registry.");
            onSuccess();
            onClose();
        } catch (err) {
            alert("Failed to deploy quote.");
        } finally {
            setLoading(false);
        }
    };

    const getExpiredPromos = () => {
        const now = new Date();
        return appliedPromos.filter(p => p.expires_at && new Date(p.expires_at) < now);
    };
    const getPricingSummary = () => {
        const gross = items.reduce((acc, item) => acc + ((parseFloat(item.price) || 0) * (item.quantity || 0)), 0);

        let promoDeductions = 0;
        appliedPromos.forEach(promo => {
            promo.breakdown?.forEach(d => {
                if (d.type === 'percentage') promoDeductions += (gross * (parseFloat(d.amount ?? "0") / 100));
                else if (d.type === 'fixed') promoDeductions += parseFloat(d.amount ?? "0") || 0;
                else if (d.type === 'item_match') {
                    const match = items.find(i => i.name.toLowerCase() === d.item_name.toLowerCase());
                    if (match) promoDeductions += parseFloat(match.price) || 0;
                }
            });
        });

        const manualDeductions = discounts.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
        const total = Math.max(0, gross - promoDeductions - manualDeductions);

        return { gross, promoDeductions, manualDeductions, total };
    };

    const summary = getPricingSummary();

    const isBlockedByExpiry = getExpiredPromos().length > 0;
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-black uppercase tracking-tighter text-lg text-gray-900">Generate Official Quote</h3>
                        <p className="text-[10px] font-mono text-primary font-bold">MODE: ARCHITECTURAL SPECIFICATION</p>
                    </div>
                    <button onClick={onClose} className="material-symbols-outlined text-gray-400 hover:text-black transition-colors">close</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Line Items Section */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Line Items (Breakdown)</label>
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                                <div className="col-span-12 md:col-span-6">
                                    <input placeholder="Item Name" className="w-full bg-transparent border-b border-gray-200 py-1 text-sm font-bold outline-none focus:border-primary"
                                        value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} required />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <input placeholder="Qty" type="number" className="w-full bg-transparent border-b border-gray-200 py-1 text-sm font-bold outline-none focus:border-primary"
                                        value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} required />
                                </div>
                                <div className="col-span-6 md:col-span-3">
                                    <input placeholder="Unit Price (₦)" type="number" className="w-full bg-transparent border-b border-gray-200 py-1 text-sm font-bold outline-none focus:border-primary"
                                        value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} required />
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-end">
                                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-300 hover:text-red-500">
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                                <div className="col-span-12">
                                    <input placeholder="Description..." className="w-full bg-transparent border-b border-gray-100 py-1 text-[10px] outline-none italic"
                                        value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddItem} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-primary hover:text-primary transition-all">+ Add Component</button>
                    </div>

                    {appliedPromos.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                User-Attached Promotions
                            </label>
                            <div className="grid gap-2">
                                {appliedPromos.map((p) => {
                                    const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                                    {/* Inside the promo display loop */ }
                                    {
                                        p.breakdown?.filter(d => d.type === 'item_match').map((d, i) => {
                                            const isPresent = items.some(item => item.name.toLowerCase() === d.name.toLowerCase());
                                            return (
                                                <div key={i} className={`flex items-center gap-2 mt-1 text-[10px] font-bold ${isPresent ? 'text-green-600' : 'text-amber-600'}`}>
                                                    <span className="material-symbols-outlined text-[12px]">
                                                        {isPresent ? 'check_circle' : 'error_outline'}
                                                    </span>
                                                    Requirement: Add "{d.name}" to items (Value: -100%)
                                                </div>
                                            );
                                        })
                                    }
                                    return (
                                        <div key={p.id} className={`p-4 rounded-2xl border flex justify-between items-center transition-all ${isExpired ? 'bg-red-50 border-red-200' : 'bg-primary/5 border-primary/10'}`}>
                                            <div>
                                                <p className={`text-xs font-black uppercase ${isExpired ? 'text-red-600' : 'text-primary'}`}>{p.name}</p>
                                                <p className="text-[9px] font-mono text-gray-500">EXPIRES: {new Date(p.expires_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                {/* Display the value (Percentage or Fixed) */}
                                                {p.breakdown?.map((d, i) => (
                                                    <p key={i} className="text-[10px] font-bold text-gray-700">
                                                        {d.item_name} {d.type === 'item_match' ? "" : d.type === 'percentage' ? `:-${d.amount}%` : `:-₦${Number(d.amount).toLocaleString()}`}
                                                    </p>
                                                ))}
                                                {isExpired && <span className="text-[9px] font-black text-red-600 uppercase">Expired - Action Required</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {isBlockedByExpiry && (
                                <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100 italic">
                                    ⚠️ Blocked: One or more attached promos have expired. Please manually adjust or remove them in the final quote notes.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Discounts Section */}

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Discounts & Deductions</label>
                        {discounts.map((discount, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 p-5 bg-amber-50/50 rounded-2xl border border-amber-100 relative group">

                                {/* Type Indicator Badge */}
                                <div className="col-span-12 flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${discount.item_name ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                                            }`}>
                                            {discount.item_name ? 'Type: Item Match' : 'Type: Fixed Deduction'}
                                        </span>
                                        {discount.item_name && (
                                            <span className="text-[9px] font-mono text-gray-400">Target: {discount.item_name}</span>
                                        )}
                                    </div>

                                    {/* <select
                                        className="bg-white border border-amber-200 rounded px-2 py-1 text-[9px] font-bold uppercase text-amber-700 outline-none"
                                        onChange={(e) => applyItemToDiscount(index, parseInt(e.target.value))}
                                    >
                                        <option value="-1">Custom / Manual</option>
                                        {items.map((item, i) => (
                                            item.name && <option key={i} value={i}>Match Item: {item.name}</option>
                                        ))}
                                    </select> */}
                                </div>

                                <div className="col-span-12 md:col-span-7">
                                    <input
                                        placeholder="Discount Name"
                                        className="w-full bg-transparent border-b border-amber-200 py-1 text-sm font-bold outline-none focus:border-amber-500"
                                        value={discount.name}
                                        onChange={e => handleDiscountChange(index, 'name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="col-span-10 md:col-span-4">
                                    <div className="relative flex items-center">
                                        {/* Visual Currency/Type Sign */}
                                        <span className="absolute left-0 text-red-400 font-bold text-sm">
                                            {discount.type === 'fixed' ? '₦' : '%'}
                                        </span>
                                        <input
                                            placeholder="0.00"
                                            type="number"
                                            className="w-full bg-transparent border-b border-amber-200 py-1 pl-4 text-sm font-bold outline-none focus:border-amber-500 text-red-600"
                                            value={discount.amount}
                                            onChange={e => handleDiscountChange(index, 'amount', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 md:col-span-1 flex justify-end">
                                    <button type="button" onClick={() => setDiscounts(discounts.filter((_, i) => i !== index))} className="text-amber-300 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-lg">delete_sweep</span>
                                    </button>
                                </div>

                                {/* Optional Description Field from your State */}
                                <div className="col-span-12">
                                    <input
                                        placeholder="Internal deduction notes..."
                                        className="w-full bg-transparent text-[10px] text-gray-400 italic outline-none"
                                        value={discount.description}
                                        onChange={e => handleDiscountChange(index, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={handleAddDiscount} className="w-full py-3 border-2 border-dashed border-amber-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-amber-400 hover:border-amber-500 hover:text-amber-600 transition-all">+ Add Discount Slot</button>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Quote Notes / Terms</label>
                        <textarea className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-primary transition-all" rows={3} placeholder="..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Validity Period</label>
                            <input type="date" required className="w-full border-b-2 border-gray-100 py-2 text-sm outline-none focus:border-primary transition-all"
                                value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                        </div>
                        <div className="text-right">
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Final Investment Total</label>
                            <span className="text-3xl font-black text-primary tracking-tighter">₦{calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-gray-900 rounded-3xl p-8 text-white space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Gross Subtotal</span>
                            <span className="font-mono font-bold">₦{summary.gross.toLocaleString()}</span>
                        </div>

                        {summary.promoDeductions > 0 && (
                            <div className="flex justify-between items-center text-primary-container">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Campaign Credits</span>
                                <span className="font-mono font-bold">- ₦{summary.promoDeductions.toLocaleString()}</span>
                            </div>
                        )}

                        {summary.manualDeductions > 0 && (
                            <div className="flex justify-between items-center text-amber-400">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Admin Adjustments</span>
                                <span className="font-mono font-bold">- ₦{summary.manualDeductions.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-end pt-2">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Total Net</p>
                                <h4 className="text-4xl font-black tracking-tighter text-white">
                                    ₦{summary.total.toLocaleString()}
                                </h4>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-gray-500 uppercase italic">
                                    Valid Till {expiryDate
                                        ? new Date(expiryDate).toLocaleDateString()
                                        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        disabled={loading || isBlockedByExpiry || isBlockedByMissingItems}
                        className="w-full bg-secondary-dark text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isBlockedByExpiry ? 'Expired Promos Found' :
                            isBlockedByMissingItems ? `Add required item: ${missingItems[0]}` :
                                (loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span>Dispatch Final Quote</span><span className="material-symbols-outlined text-sm">verified</span></>)}
                    </button>
                </form>
            </div>
        </div>
    );
};

const EditDescriptionModal = ({
    requestId,
    initialValue,
    onClose,
    onSuccess
}: {
    requestId: string,
    initialValue: string,
    onClose: () => void,
    onSuccess: () => void
}) => {
    const [description, setDescription] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim() === initialValue.trim()) return onClose();
        if (!description.trim()) return alert("Description cannot be empty");

        setLoading(true);
        try {
            await api.patch(`/customer/quotes/requests/${requestId}/description`, {
                description: description.trim()
            });
            alert("Specification updated successfully.");
            onSuccess();
            onClose();
        } catch (err) {
            alert("Failed to sync updates to the terminal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-black uppercase tracking-tighter text-lg text-gray-900">Edit Specification</h3>
                        <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">Request Ref: {requestId.slice(0, 8)}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em]">Updated Requirements</label>
                        <textarea
                            required
                            rows={5}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all leading-relaxed"
                            placeholder="Describe your technical requirements in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            className="flex-[2] bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Update Terminal</span>
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
    const [files, setFiles] = useState<File[]>([]);

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

            if (files.length > 0) {
                attachmentKeys = await Promise.all(files.map(async (file) => {
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
                        <h3 className="text-white font-black uppercase tracking-tighter text-xl">Campaign Architect</h3>
                        <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-[0.2em] mt-1">Status: Ready for Deployment</p>
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
                            Target Service Registry
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
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Campaign Label</label>
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
                            + Append Incentive Node
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
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Public Marketing Description (Markdown Supported)</label>
                        <textarea
                            rows={4}
                            className="w-full bg-[#141414] border border-[#1A1A1A] text-gray-300 rounded-2xl p-5 text-sm outline-none focus:border-primary/50 transition-all leading-relaxed"
                            placeholder="Detailed technical breakdown of why this promotion matters..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                            Attachments (Images)
                        </label>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files) {
                                    setFiles(Array.from(e.target.files));
                                }
                            }}
                            className="w-full bg-[#141414] border border-[#1A1A1A] text-gray-400 rounded-2xl px-5 py-4 text-sm cursor-pointer"
                        />

                        {/* Preview */}
                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {files.map((file, i) => (
                                    <div key={i} className="text-xs bg-[#111] px-3 py-2 rounded-lg border border-[#1A1A1A] flex items-center gap-2">
                                        📎 {file.name}
                                        <button
                                            type="button"
                                            onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                                            className="text-red-400 ml-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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

// --- TABLE COMPONENTS (Batch 1: Services & Menus) ---

const ServicesTable = ({ services, loading, onToggle }: { services: Service[], loading: boolean, onToggle: any }) => (
    <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left min-w-[700px]">
            <thead>
                <tr className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service Registry</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Category</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Tier</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Operational Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
                {loading ? (
                    <tr><td colSpan={4} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">ACCESSING SERVICE REGISTRY...</td></tr>
                ) : services.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-gray-500 font-medium">No matching records found in registry.</td></tr>
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
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Featured</span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-black uppercase tracking-tighter text-gray-700">Standard</span>
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
                                {s.is_active ? 'Online' : 'Offline'}
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
                            <span className="material-symbols-outlined text-base">visibility</span> View  Detail
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
                                <span className="material-symbols-outlined text-base">archive</span> Archive Record
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
            alert("Reminder dispatched to registry.");
        } catch (err) {
            alert("Failed to send reminder.");
        }
    };

    const formatReminderDate = (dateString: string) => {
        if (!dateString || dateString.startsWith("0001") || dateString.startsWith("1970")) {
            return <span className="text-gray-600 italic lowercase tracking-tight">never sent</span>;
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
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Invoice Ref</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Quote Link</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Customer Entity</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Amount</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Last Signal</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                    {loading ? (
                        <tr><td colSpan={7} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">SYNCING FINANCIAL LEDGER...</td></tr>
                    ) : invoices.length === 0 ? (
                        <tr><td colSpan={7} className="p-20 text-center text-gray-500 font-medium">No financial records found.</td></tr>
                    ) : (
                        invoices.map((inv) => {
                            const quoteRef = inv.quote_id ? `Q-${inv.quote_id.slice(0, 8).toUpperCase()}` : "UNLINKED";
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
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Campaign Node</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Access Code</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Linked Service</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Benefit Matrix</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Validity Window</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
                {loading ? (
                    <tr><td colSpan={6} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">SYNCING CAMPAIGN REGISTRY...</td></tr>
                ) : promos.length === 0 ? (
                    <tr><td colSpan={6} className="p-20 text-center text-gray-500 font-medium">No active campaign nodes found.</td></tr>
                ) : (
                    promos.map((p) => {
                        const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                        return (
                            <tr key={p.id} className="hover:bg-[#111] transition-colors group">
                                <td className="px-6 py-5">
                                    <p className="text-sm font-bold text-white tracking-tight">{p.name}</p>
                                    <p className="text-[10px] text-gray-500 font-medium italic truncate max-w-[150px]">
                                        {p.description.String || "No metadata description"}
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
                                            <span className="text-[9px] text-gray-700 font-bold uppercase tracking-tighter">no_benefits_mapped</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <button
                                        onClick={() => onToggleStatus(p.id, p.is_active)}
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${p.is_active && !isExpired ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                                    >
                                        <span className={`w-1 h-1 rounded-full ${p.is_active && !isExpired ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-red-500'}`}></span>
                                        {isExpired ? 'Expired' : p.is_active ? 'Active' : 'Offline'}
                                    </button>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <p className="text-[10px] font-bold text-white tracking-tighter">{new Date(p.starts_at).toLocaleDateString()}</p>
                                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">TO {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : '∞ INF'}</p>
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
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Client Entity</th>
                        )}
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service Profile</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Terminal Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Specification Brief</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Protocol Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                    {loading ? (
                        <tr>
                            <td colSpan={isElevated ? 5 : 4} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">
                                SYNCING REQUEST LEDGER...
                            </td>
                        </tr>
                    ) : qrs.length === 0 ? (
                        <tr>
                            <td colSpan={isElevated ? 5 : 4} className="p-20 text-center text-gray-500 font-medium font-mono text-xs uppercase tracking-widest">
                                No active requests in queue.
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
                                                "{qr.description}"
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
                                                View Request
                                            </button>

                                            {!isQuoted && isElevated && (
                                                <button
                                                    onClick={() => onAddQuote?.(qr)}
                                                    className="bg-[#0046FB] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#0046FB]/20 hover:bg-[#003ccf] flex items-center gap-2 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-base">add_box</span>
                                                    Build Quote
                                                </button>
                                            )}

                                            {isQuoted && qr.quote_id && (
                                                <button
                                                    onClick={() => navigate(`/dashboard/quote/${qr.quote_id}`)}
                                                    className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-base">verified</span>
                                                    View Quote
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
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Quote Reference</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service Profile</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Investment</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Workflow Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Validity End</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                    {loading ? (
                        <tr><td colSpan={6} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">SYNCING QUOTATION REGISTRY...</td></tr>
                    ) : qs.length === 0 ? (
                        <tr><td colSpan={6} className="p-20 text-center text-gray-500 font-medium">No quotations found in terminal.</td></tr>
                    ) : qs.map((q) => {
                        const dateValue = (q as any).exire_at || q.expires_at;
                        const formattedDate = dateValue && !isNaN(Date.parse(dateValue))
                            ? new Date(dateValue).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
                            : "Unlimited";

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
                        <span className="material-symbols-outlined text-sm">inventory_2</span> Deploy Service
                    </button>
                    <button onClick={() => setIsPromoModalOpen(true)} className="flex-1 lg:flex-none bg-amber-500/10 border border-amber-500/20 text-amber-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">campaign</span> Campaign Architect
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
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Queue Size</p>
                    <h3 className="text-2xl font-black text-[#0046FB] tracking-tighter">{stats.pendingRequests}</h3>
                </div>
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Quotes</p>
                    <h3 className="text-2xl font-black text-white tracking-tighter">{stats.activeQuotes}</h3>
                </div>
                <div className="p-6 bg-[#111] rounded-3xl border border-[#1A1A1A]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Node Registry</p>
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
                                placeholder="Search Registry..."
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
                        Authorized Session: {user.first_name}
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Control Center</h1>
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