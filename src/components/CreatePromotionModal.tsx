import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Discount, Service } from "../models/model";
import { validateFiles } from '../helpers/helpers';


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

export default CreatePromotionModal;