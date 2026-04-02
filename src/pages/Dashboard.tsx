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
        is_featured: false, icon: '', image: '', tags: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.icon.trim()) return alert("Icon name is required");
        setLoading(true);
        try {
            const payload = { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== "") };
            await api.post('/admin/services', payload);
            alert("Service created successfully!");
            onClose();
        } catch (err) { alert("Failed to create service."); }
        finally { setLoading(false); }
    };

    const isFormValid = formData.name.trim() !== "" && formData.icon.trim() !== "" && formData.description.trim() !== "";

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
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Icon (Material Name)</label>
                        <input className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm"
                            placeholder="e.g. videocam" onChange={e => setFormData({ ...formData, icon: e.target.value })} />
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
        { name: '', amount: "", type: 'fixed', description: '', item_name: "" }
    ]);
    const [services, setServices] = useState<Service[]>([]);

    const [loading, setLoading] = useState(false);


    const handleAddDiscount = () => {
        setDiscounts([...discounts, { name: '', amount: "", type: 'fixed', description: '', item_name: "" }]);
    };

    const handleRemoveDiscount = (index: number) => {
        setDiscounts(discounts.filter((_, i) => i !== index));
    };



    const updateDiscount = (index: number, field: keyof Discount, value: string | number) => {
        const updated = [...discounts];

        if (field === "type") {
            // Reset logic: if switching to service_match, clear amount. 
            // If switching to fixed/percentage, clear item_name.
            if (value === "item_match") {
                updated[index].amount = "0";
            } else {
                updated[index].item_name = "";
            }
        }

        if (field === "amount") {
            value = value.toString() || 0;
        }

        updated[index] = { ...updated[index], [field]: value } as any;
        setDiscounts(updated);
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                service_id: formData.service_id || "",
                breakdown: discounts,
                starts_at: new Date(formData.starts_at).toISOString(),
                expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
            };
            await api.post('/admin/promotions', payload);
            alert("Marketing Campaign Registered Successfully.");
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to sync promotion.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/services?limit=100');
                const fetchedServices = res.data.services || [];
                setServices(fetchedServices);

                // Fix: If there's no service_id yet and we just got services, pick the first one
                if (fetchedServices.length > 0 && !formData.service_id) {
                    setFormData(prev => ({ ...prev, service_id: fetchedServices[0].id }));
                }
            } catch (err) {
                console.error("Failed to fetch services");
            }
        };
        fetchServices();
    }, []); // Empty dependency array is fine here as it's the mount fetch

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-black uppercase tracking-tighter text-lg text-gray-900">Configure Campaign Breakdown</h3>
                        <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">Logic: Targeted Item Matching Enabled</p>
                    </div>
                    <button onClick={onClose} className="material-symbols-outlined text-gray-400">close</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl space-y-3">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">link</span>
                            Link to Service Registry
                        </label>
                        <select
                            className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                            value={formData.service_id}
                            onChange={(e) => {
                                setFormData({ ...formData, service_id: e.target.value })


                            }}
                        >
                            {/* <option value="">Global Promotion (Applies to all/none specifically)</option> */}
                            {services.map(s => (
                                <option key={s.id} value={s.id}> {s.name} ({s.category})</option>
                            ))}
                        </select>
                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">
                            Linking a service ensures this promo automatically appears on the service's detail page and grid card.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Promo Code</label>
                            <input required className="w-full border-b border-gray-100 focus:border-primary outline-none py-2 text-sm font-bold uppercase"
                                placeholder="E.G. VISION-ZERO"

                                value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Campaign Name</label>

                            <input required className="w-full border-b border-gray-100 focus:border-primary outline-none py-2 text-sm font-bold"
                                placeholder="E.G. Free Camera Installation"

                                onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Stacked Benefits</label>
                        {discounts.map((d, index) => (
                            <div key={index} className="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-4 relative group">
                                <div className="grid grid-cols-12 gap-x-4 gap-y-2 items-end">
                                    {/* Label */}
                                    <div className="col-span-12 md:col-span-4 space-y-1">
                                        <label className="text-[8px] font-bold text-amber-600 uppercase">Discount Label</label>
                                        <input required placeholder="e.g. Free Installation" className="w-full bg-transparent border-b border-amber-200 py-1 text-xs font-bold outline-none"
                                            value={d.name} onChange={e => updateDiscount(index, 'name', e.target.value)} />
                                    </div>

                                    {/* Type Selector */}
                                    <div className="col-span-6 md:col-span-3 space-y-1">
                                        <label className="text-[8px] font-bold text-amber-600 uppercase">Benefit Type</label>
                                        <select
                                            className="w-full bg-transparent border-b border-amber-200 py-1 text-xs font-bold outline-none cursor-pointer"
                                            value={d.type}
                                            onChange={e => updateDiscount(index, 'type', e.target.value)}
                                        >
                                            <option value="fixed">Fixed (₦)</option>
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="item_match">Item Match (Free)</option>
                                        </select>
                                    </div>

                                    {/* Conditional Value or Service Name Input */}
                                    <div className="col-span-5 md:col-span-4 space-y-1">
                                        {d.type === 'item_match' ? (
                                            <>
                                                <label className="text-[8px] font-bold text-primary uppercase flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">target</span>
                                                    Target Service Name
                                                </label>
                                                <input
                                                    required
                                                    placeholder="e.g. Camera Install"
                                                    className="w-full bg-transparent border-b border-primary/30 py-1 text-xs font-bold outline-none text-primary"
                                                    value={d.item_name}
                                                    onChange={e => updateDiscount(index, 'item_name', e.target.value)}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <label className="text-[8px] font-bold text-amber-600 uppercase">Discount Value</label>
                                                <input
                                                    required
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="w-full bg-transparent border-b border-amber-200 py-1 text-xs font-bold outline-none text-amber-700 font-mono"
                                                    value={d.amount}
                                                    onChange={e => updateDiscount(index, 'amount', e.target.value)}
                                                />
                                            </>
                                        )}
                                    </div>

                                    {/* Delete Action */}
                                    <div className="col-span-1 md:col-span-1 flex justify-end pb-1">
                                        <button type="button" onClick={() => handleRemoveDiscount(index)} className="text-amber-300 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddDiscount} className="w-full py-3 border-2 border-dashed border-amber-200 rounded-2xl text-[10px] font-black uppercase text-amber-500 hover:bg-amber-50 transition-all">+ Add Another Component</button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Expiration Date</label>
                            <input type="date" className="w-full border-b border-gray-100 py-2 text-sm font-bold outline-none"
                                onChange={e => setFormData({ ...formData, expires_at: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input type="checkbox" id="promo-active" className="w-4 h-4 accent-primary" checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                            <label htmlFor="promo-active" className="text-xs font-bold uppercase">Active Immediately</label>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Public Description</label>
                        <textarea rows={2} className="w-full border border-gray-100 bg-gray-50 rounded-xl p-3 text-sm outline-none focus:border-primary"
                            placeholder="..." onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    <button disabled={loading} className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Deploy Campaign Node"}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Table Components ---

const ServicesTable = ({ services, loading, onToggle }: { services: Service[], loading: boolean, onToggle: any }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-6 py-4">Service Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4">Visibility</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Accessing Service Registry...</td></tr>
                ) : services.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400">No matching records found.</td></tr>
                ) : services.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400 text-lg">{s.icon}</span>
                                <span className="font-bold text-gray-900 text-sm">{s.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-500">{s.category}</td>
                        <td className="px-6 py-4 text-amber-500">
                            {s.is_featured ? <span className="material-symbols-outlined text-sm">stars</span> : <span className="text-gray-200 material-symbols-outlined text-sm">stars</span>}
                        </td>
                        <td className="px-6 py-4">
                            <button onClick={() => onToggle(s.id, s.is_active)} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${s.is_active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                {s.is_active ? 'Online' : 'Offline'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const InvoiceActionMenu = ({ inv, navigate, onSendReminder }: { inv: any, navigate: any, onSendReminder: (id: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <span className="material-symbols-outlined text-gray-400">more_vert</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close menu */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>

                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                        <button
                            onClick={() => navigate(`/dashboard/invoice/${inv.id}`, { state: { invoice: inv } })}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">visibility</span> View Detail
                        </button>

                        {inv.status !== 'paid' && (
                            <button
                                onClick={() => {
                                    onSendReminder(inv.id);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">mail</span> Send Reminder
                            </button>
                        )}

                        <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">archive</span> Archive
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
const InvoiceTable = ({ invoices, loading, navigate }: { invoices: Invoice[], loading: boolean, navigate: any }) => {
    const handleSendReminder = async (id: string) => {
        try {
            await sendInvoiceMail(id);
            alert("Reminder dispatched to registry.");
        } catch (err) {
            alert("Failed to send reminder.");
        }
    };
    const formatReminderDate = (dateString: string) => {
        // Check if it's the Go "Zero" time or undefined
        if (!dateString || dateString.startsWith("0001") || dateString.startsWith("1970")) {
            return <span className="text-gray-300 italic">Never Sent</span>;
        }

        const date = new Date(dateString);
        return (
            <div className="flex items-center gap-1 text-primary font-medium">
                <span className="material-symbols-outlined text-[12px]">history</span>
                {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </div>
        );
    };
    return (<div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-6 py-4">ID / Reference</th>
                    <th className="px-6 py-4">Quote Ref</th>

                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Last Reminder</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Syncing Ledger...</td></tr>
                ) : invoices.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400">No matching records found.</td></tr>
                ) : (
                    invoices.map((inv) => {
                        let quoteRef = "Empty"
                        if (inv.quote_id) {
                            quoteRef = `Q-${inv.quote_id.slice(0, 8)}`
                        }
                        return (
                            <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    {inv.invoice_number}
                                    {inv.deleted_at.Valid && inv.deleted_at.Valid === true && (
                                        <span className="ml-2 text-[8px] bg-red-100 text-red-600 px-1 rounded font-black uppercase">Archived</span>
                                    )}
                                </td>
                                {/* ... rest of columns ... */}
                                {/* <td className="px-6 py-4 font-mono text-xs text-gray-600">{inv.invoice_number}</td> */}
                                <td className="px-6 py-4 font-mono text-xs text-gray-600">{inv.quote_id?.startsWith("00000000") ? "Empty" : quoteRef}</td>

                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-gray-900">{inv.customer_name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-mono">{inv.customer_email}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${STATUS_STYLES[inv.status.toLowerCase()] || STATUS_STYLES.default}`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-900">₦{inv.total.toLocaleString()}</td>
                                <td className="px-6 py-4 text-[10px] uppercase font-bold">
                                    {formatReminderDate(inv.reminder_sent_at)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <InvoiceActionMenu
                                        inv={inv}
                                        navigate={navigate}
                                        onSendReminder={handleSendReminder}
                                    />
                                </td>
                            </tr>
                        )
                    }


                    )
                )
                }
            </tbody>
        </table>
    </div >)
};

const PromotionsTable = ({
    promos,
    loading,
    onToggleStatus
}: {
    promos: Promotion[],
    loading: boolean,
    onToggleStatus: (id: string, current: boolean) => void
}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-6 py-4">Campaign Node</th>
                    <th className="px-6 py-4">Promo Code</th>
                    <th className="px-6 py-4">Service Name</th>
                    <th className="px-6 py-4">Breakdown (Templates)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Validity</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Accessing Campaign Registry...</td></tr>
                ) : promos.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400">No active promotions found.</td></tr>
                ) : (
                    promos.map((p) => {
                        const isExpired = p.expires_at && new Date(p.expires_at) < new Date();

                        return (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-mono truncate max-w-[150px]">
                                        {p.description.String || "No description set"}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-primary font-black">
                                        {p.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-primary font-black">
                                        {/* {p.code} */}
                                        COMING SOON
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {/* Add (p.breakdown || []) to prevent the crash */}
                                        {(p.breakdown || []).map((d, idx) => (
                                            <span
                                                key={idx}
                                                className="text-[8px] font-black bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded uppercase"
                                                title={`Target: ${d.item_name || 'Global'}`}
                                            >
                                                {d.type === 'percentage' ? `${d.amount}%` : `₦${(Number(d.amount) || 0).toLocaleString()}`}
                                                {d.item_name && <span className="ml-1 opacity-50 text-[6px]">({d.item_name})</span>}
                                            </span>
                                        ))}
                                        {(!p.breakdown || p.breakdown.length === 0) && (
                                            <span className="text-[8px] text-gray-400 italic">No benefits set</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onToggleStatus(p.id, p.is_active)}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider transition-all ${p.is_active && !isExpired ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                    >
                                        <span className={`w-1 h-1 rounded-full ${p.is_active && !isExpired ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {isExpired ? 'Expired' : p.is_active ? 'Active' : 'Disabled'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="text-[10px] font-bold text-gray-900">{new Date(p.starts_at).toLocaleDateString()}</p>
                                    <p className="text-[9px] text-gray-400 uppercase">TO {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : 'INF'}</p>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    </div>
);


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

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        {(role === 'admin' || role === 'staff') && (
                            <th className="px-6 py-4">Client</th>
                        )}
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr>
                            {/* Dynamic colSpan: 5 for admin/staff, 4 for user */}
                            <td colSpan={(role === 'admin' || role === 'staff') ? 5 : 4} className="p-10 text-center text-gray-400 italic">
                                Syncing Request Ledger...
                            </td>
                        </tr>
                    ) : qrs.length === 0 ? (
                        <tr>
                            <td colSpan={(role === 'admin' || role === 'staff') ? 5 : 4} className="p-10 text-center text-gray-400 font-mono text-xs uppercase tracking-widest">
                                No matching requests.
                            </td>
                        </tr>
                    ) : (
                        qrs.map((qr) => {
                            // 1. Define logic variables inside the map block
                            const isElevated = role === 'admin' || role === 'staff';
                            const isQuoted = qr.status === 'quoted';

                            // 2. Explicitly return the JSX
                            return (
                                <tr key={qr.id} className="hover:bg-gray-50/50 transition-colors group">
                                    {isElevated && (
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">{qr.user_name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-mono">{qr.user_email}</p>
                                        </td>
                                    )}

                                    <td className="px-6 py-4 text-xs font-bold text-gray-700">{qr.service_name}</td>

                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${QUOTE_REQUEST_STATUS_STYLES[qr.status] || QUOTE_REQUEST_STATUS_STYLES.default}`}>
                                            {qr.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-600 truncate max-w-[180px] block" title={qr.description}>
                                                {qr.description}
                                            </span>
                                            {role === 'user' && qr.status === 'pending' && (
                                                <button onClick={() => onEditDescription?.(qr.id, qr.description)} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {/* 1. View Request - Always shows for everyone */}
                                            <button
                                                onClick={() => navigate(`/dashboard/qr/${qr.id}`, { state: { qr } })}
                                                className="flex items-center gap-1 px-3 py-1.5 border border-gray-100 rounded-lg text-gray-500 text-[9px] font-black uppercase tracking-tighter hover:bg-gray-50 hover:text-primary transition-all shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                                Request
                                            </button>

                                            {/* 2. Create Quote - Only Admin/Staff & Only if NOT quoted */}
                                            {!isQuoted && isElevated && (
                                                <button
                                                    onClick={() => onAddQuote?.(qr)}
                                                    className="bg-primary text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 flex items-center gap-1 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-xs">add</span>
                                                    Quote
                                                </button>
                                            )}

                                            {/* 3. View Quote - Shows for everyone ONLY if status is 'quoted' */}
                                            {isQuoted && qr && qr.quote_id && (
                                                <button
                                                    onClick={() => navigate(`/dashboard/quote/${qr.quote_id}`)}
                                                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                    Quote
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
    var statuses: Quote['status'][] = ['draft', 'sent', 'expired', 'in-review'];
    if (role === "user") {
        statuses = ['accepted', 'declined', "paid"];

    }

    return (
        <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        <th className="px-6 py-4">Quote Ref</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Valid Until</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Syncing Quotes...</td></tr>
                    ) : qs.length === 0 ? (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-mono text-xs uppercase tracking-widest">No quotes found.</td></tr>
                    ) : qs.map((q) => {
                        const dateValue = (q as any).exire_at || q.expires_at;
                        const formattedDate = dateValue && !isNaN(Date.parse(dateValue))
                            ? new Date(dateValue).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
                            : "Invalid Date";

                        return (
                            <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 font-mono text-[10px] font-bold text-gray-900 uppercase">
                                    Q-{q.id.slice(0, 8)}
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-700">{q.service_name}</td>

                                <td className="px-6 py-4 font-black text-gray-900 text-sm">
                                    ₦{parseFloat(q.amount || "0").toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative inline-block">
                                        {/* Status Switcher (Disabled for Users) */}
                                        <button
                                            disabled={role === 'user' || q.status === 'declined' || q.status === 'accepted'}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === q.id ? null : q.id);
                                            }}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-wider transition-all ${role !== 'user' ? 'hover:bg-white active:scale-95' : 'cursor-default'} z-20 ${QUOTE_STATUS_STYLES[q.status] || QUOTE_STATUS_STYLES.default}`}
                                        >
                                            <span className="w-1 h-1 rounded-full bg-current"></span>
                                            {q.status}
                                            {role !== 'user' && <span className="material-symbols-outlined text-[14px]">expand_more</span>}
                                        </button>

                                        {/* Dropdown Menu - Restricted to Admin/Staff */}
                                        {activeMenu === q.id && role !== 'user' && (
                                            <>
                                                <div className="fixed inset-0 z-[80]" onClick={() => setActiveMenu(null)}></div>
                                                <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-2xl z-[90] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {statuses.filter(s => s !== q.status).map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => { onUpdateStatus?.(q.id, status); setActiveMenu(null); }}
                                                            className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-tighter text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors"
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-700">
                                    {formattedDate}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        className="text-gray-400 hover:text-primary transition-all"
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
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState<'invoices' | 'services' | 'quote-requests' | 'quotes' | 'promotions'>('invoices');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [qrs, setQrs] = useState<QuoteRequest[]>([]);
    const [qs, setQs] = useState<Quote[]>([]);
    const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
    const [promos, setPromos] = useState<Promotion[]>([]);

    const LIMIT = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
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
            else if (currentTab === 'promotions') {
                setPromos(res.data.promotions || [])
            };

            setTotal(res.data.total || 0);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };
    useEffect(() => {

        fetchData();
    }, [currentTab, offset]);
    const handleTogglePromoStatus = async (id: string, current: boolean) => {
        try {
            await api.patch(`/admin/promotions/${id}/status`, { is_active: !current });
            setPromos(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
        } catch (err) {
            alert("Failed to toggle campaign status.");
        }
    };
    const filteredInvoices = useMemo(() => invoices.filter(inv => inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) || inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase())), [invoices, searchQuery]);
    const filteredServices = useMemo(() => services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase())), [services, searchQuery]);

    const handleToggleActive = async (id: string, status: boolean) => {
        try {
            await api.patch(`/admin/services/${id}/status`, { is_active: !status });
            setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !status } : s));
        } catch (err) { alert("Status update failed"); }
    };
    const handleUpdateQuoteStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/admin/quotes/${id}/status`, { status: newStatus });
            setQs(prev => prev.map(q => q.id === id ? { ...q, status: newStatus as any } : q));
        } catch (err) { alert(`Quote update failed`); }
    };
    const TabContent = {
        "invoices": (
            <InvoiceTable
                invoices={filteredInvoices}
                loading={loading}
                navigate={navigate}
            />
        ),
        "services": (
            <ServicesTable
                services={filteredServices}
                loading={loading}
                onToggle={handleToggleActive}
            />
        ),
        'quote-requests': <QuoteRequestTable qrs={qrs} loading={loading} onAddQuote={(qr) => setSelectedQuote(qr)} role={user.role} />,
        quotes: <QuotesTable qs={qs} loading={loading} onUpdateStatus={handleUpdateQuoteStatus} navigate={navigate} role={user.role} />,
        'promotions': (
            <PromotionsTable
                promos={promos}
                loading={loading}
                onToggleStatus={handleTogglePromoStatus}
            />
        )
    };
    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Admin</span>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Enterprise Console</h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setIsServiceModalOpen(true)} className="bg-secondary-dark text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-black transition-all">
                        <span className="material-symbols-outlined text-sm">inventory_2</span> New Service
                    </button>
                    <button onClick={() => setIsPromoModalOpen(true)} className="bg-amber-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all">
                        <span className="material-symbols-outlined text-sm">campaign</span> Create Promotion
                    </button>
                    <button onClick={() => navigate('/dashboard/create-invoice')} className="bg-primary text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        <span className="material-symbols-outlined text-sm">add</span> Create Invoice
                    </button>
                </div>
            </header>

            <div className="flex justify-between items-center mb-6 border-b border-gray-200">
                <div className="flex gap-8">
                    <button onClick={() => { setCurrentTab('invoices'); setOffset(0) }} className={`pb-4 text-xs font-black uppercase tracking-widest ${currentTab === 'invoices' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Invoices</button>
                    <button onClick={() => { setCurrentTab('services'); setOffset(0) }} className={`pb-4 text-xs font-black uppercase tracking-widest ${currentTab === 'services' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Services</button>
                    <button onClick={() => { setCurrentTab('quote-requests'); setOffset(0) }} className={`pb-4 text-xs font-black uppercase tracking-widest ${currentTab === 'quote-requests' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Quote Requests</button>
                    <button onClick={() => { setCurrentTab('quotes'); setOffset(0) }} className={`pb-4 text-xs font-black uppercase tracking-widest ${currentTab === 'quotes' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Quotes</button>
                    <button
                        onClick={() => { setCurrentTab('promotions'); setOffset(0) }}
                        className={`pb-4 text-xs font-black uppercase tracking-widest ${currentTab === 'promotions' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                    >
                        Promotions
                    </button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search ..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 w-64" />
                    </div>
                    <div className="flex gap-1">
                        <button disabled={offset === 0} onClick={() => setOffset(prev => prev - LIMIT)} className="p-2 border rounded-lg bg-white disabled:opacity-30"><span className="material-symbols-outlined">chevron_left</span></button>
                        <button disabled={offset + LIMIT >= total} onClick={() => setOffset(prev => prev + LIMIT)} className="p-2 border rounded-lg bg-white disabled:opacity-30"><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                {TabContent[currentTab]}
            </div>
            {isServiceModalOpen && <CreateServiceModal onClose={() => setIsServiceModalOpen(false)} />}
            {selectedQuote && <CreateQuoteModal qr={selectedQuote} onClose={() => setSelectedQuote(null)} onSuccess={fetchData} adminID={user.id} />}
            {isPromoModalOpen && <CreatePromotionModal onClose={() => setIsPromoModalOpen(false)} onSuccess={fetchData} />}
        </div>
    );
};

// --- Staff Terminal ---

const StaffTerminal = () => {

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
                <InvoiceTable invoices={invoices} loading={loading} navigate={navigate} />
            </div>
        </div>
    );
};

// --- Client Portal ---
const ClientPortal = ({ user }: { user: User }) => {
    const navigate = useNavigate();

    // --- State Management ---
    const [currentTab, setCurrentTab] = useState<'billing' | 'requests' | 'active-offers' | 'declined-offers' | 'paid-offers' | 'paid-offers'>('billing');
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [qrs, setQrs] = useState<QuoteRequest[]>([]);
    const [qs, setQs] = useState<Quote[]>([]);

    // Pagination
    const LIMIT = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    // Modal State
    const [editTarget, setEditTarget] = useState<{ id: string, desc: string } | null>(null);

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
            } else if (currentTab === 'active-offers' || currentTab === 'declined-offers' || currentTab === 'paid-offers') {
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
        billing: (
            <InvoiceTable
                invoices={invoices}
                loading={loading}
                navigate={navigate}
            />
        ),
        "active-offers": (
            <QuotesTable
                // Filter: Only show quotes the user can still act on or has accepted
                qs={qs.filter(q => q.status === 'sent' || q.status === 'accepted' || q.status === 'in-review')}
                loading={loading}
                role={user.role}
                navigate={navigate}
                onUpdateStatus={() => { }}
            />
        ),
        "declined-offers": (
            <QuotesTable
                // Filter: Only show quotes that were rejected or have expired
                qs={qs.filter(q => q.status === 'declined' || q.status === 'expired')}
                loading={loading}
                role={user.role}
                navigate={navigate}
                onUpdateStatus={() => { }}
            />
        ),
        "paid-offers": (
            <QuotesTable
                // Filter: Only show quotes that were rejected or have expired
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
        <div className="max-w-6xl mx-auto">
            <header className="mb-12">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary underline underline-offset-4">
                    Authorized Session: {user.first_name}
                </span>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter mt-2">My Account</h1>
            </header>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Unpaid Balance</p>
                    <h3 className="text-3xl font-black text-amber-500 tracking-tighter">
                        ₦{invoices.reduce((acc, inv) => inv.status.toLowerCase() !== 'paid' ? acc + inv.total : acc, 0).toLocaleString()}
                    </h3>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Requests</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                        {qrs.filter(r => r.status === 'pending').length}
                    </h3>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Paid Offers</p>
                    <h3 className="text-3xl font-black text-primary tracking-tighter">{qs.reduce((acc, q) => {
                        const isActive = q.status === 'paid';
                        return isActive ? acc + 1 : acc;
                    }, 0)}</h3>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Offers</p>
                    <h3 className="text-3xl font-black text-primary tracking-tighter">{qs.reduce((acc, q) => {
                        const isActive = q.status === 'sent' || q.status === 'accepted';
                        return isActive ? acc + 1 : acc;
                    }, 0)}</h3>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Declined Offers</p>
                    <h3 className="text-3xl font-black text-primary tracking-tighter">{qs.reduce((acc, q) => {
                        const isActive = q.status === 'declined';
                        return isActive ? acc + 1 : acc;
                    }, 0)}</h3>
                </div>

            </div>

            {/* Tab Navigation */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-200">
                <div className="flex gap-8">
                    {['billing', 'requests', 'active-offers', 'declined-offers', 'paid-offers'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setCurrentTab(tab as any); setOffset(0); }}
                            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all ${currentTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab === 'billing' ? 'Invoices' : tab === 'requests' ? 'My Requests' : tab === 'active-offers' ? 'Active Quotes' : tab === 'paid-offers' ? 'Paid Quotes' : 'Declined Quotes'}
                        </button>
                    ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex gap-2 mb-4">
                    <button
                        disabled={offset === 0 || loading}
                        onClick={() => setOffset(prev => Math.max(0, prev - LIMIT))}
                        className="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button
                        disabled={offset + LIMIT >= total || loading}
                        onClick={() => setOffset(prev => prev + LIMIT)}
                        className="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] overflow-hidden transition-all">
                {TabContent[currentTab]}
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
        return (<div className="min-h-screen bg-gray-50 p-8 pt-24">
            {user.role === 'admin' ? (
                <AdminConsole user={user} />
            ) : user.role === 'staff' ? (
                <StaffTerminal />
            ) : (
                <ClientPortal user={user} />
            )}
        </div>
        )
    }
};

export default Dashboard;