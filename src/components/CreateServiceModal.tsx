import { useState } from "react";
import api from "../api/axios";

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


export default CreateServiceModal;