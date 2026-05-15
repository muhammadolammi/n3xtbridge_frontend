import { useState, useEffect } from "react";
import api from "../api/axios";
import type { ServiceCategory } from "../models/model";

export const CreateServiceModal = ({ onClose }: { onClose: () => void }) => {
    // State for managing dynamic categories from backend
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [fetchingCategories, setFetchingCategories] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        is_featured: false,
        icon: 'inventory_2',
        image: '',
        tags: '',
        min_price: '',

    });
    const [loading, setLoading] = useState(false);

    // --- FETCH CATEGORIES ON MOUNT ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setFetchingCategories(true);
                // Update this endpoint path matching your specific API spec if needed
                const res = await api.get('/categories/services');
                // Assuming backend returns an array of strings or an object containing them
                const fetchedCats = res.data.service_categories || [];
                setCategories(fetchedCats);

                // Set the default initial select option to the first category found
                if (fetchedCats.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: fetchedCats[0] }));
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
                // Hardcoded fallback list so form remains functional if API fails
                // const fallbacks = ['Tech Support', 'Security', 'Web Development', 'Networking', 'Solar Energy', 'Cloud Infrastructure'];
                // setCategories(fallbacks);
                // setFormData(prev => ({ ...prev, category: fallbacks[0] }));
            } finally {
                setFetchingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== "")
            };
            // console.log("Submitting new service with payload:", payload);
            await api.post('/admin/services', payload);
            onClose();
        } catch (err) {
            alert("Failed to create service.");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.name.trim() !== "" && formData.description.trim() !== "" && formData.category_id !== "";

    return (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl">
            {/* Backdrop Click-to-Close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t sm:border border-primary shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-primary flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-primary font-black uppercase tracking-tighter text-xl">Create New Service</h3>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full text-text flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                            Service Category
                        </label>
                        <div className="relative">
                            <select
                                disabled={fetchingCategories}
                                className="w-full border border-primary bg-transparent rounded-2xl px-5 py-4 text-text appearance-none outline-none focus:border-[#22D3EE] transition-all disabled:opacity-40"
                                value={formData.category_id}
                                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                            >
                                {fetchingCategories ? (
                                    <option className="bg-neutral-900 text-white">Loading categories...</option>
                                ) : (
                                    categories.map((cat) => (
                                        <option key={cat.id} value={cat.id} className="bg-neutral-900 text-white">
                                            {cat.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                                expand_more
                            </span>
                        </div>
                    </div>

                    {/* Service Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                            Service Name
                        </label>
                        <input
                            required
                            className="w-full border border-primary bg-transparent rounded-2xl px-5 py-4 text-text font-bold outline-none focus:border-[#22D3EE] transition-all placeholder:text-secondary"
                            placeholder="E.g. Enterprise Networking"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Price Input (Now stands on its own or scales smoothly across grid structures) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                            Starting Price (₦)
                        </label>
                        <input
                            className="w-full border border-primary bg-transparent rounded-2xl px-5 py-4 text-text font-mono outline-none focus:border-[#22D3EE] transition-all"
                            placeholder="0.00"
                            type="number"
                            value={formData.min_price}
                            onChange={e => setFormData({ ...formData, min_price: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                            Service Description
                        </label>
                        <textarea
                            required
                            rows={3}
                            className="w-full border border-primary bg-transparent rounded-2xl px-5 py-4 text-text text-sm outline-none focus:border-[#22D3EE] transition-all placeholder:text-gray-700"
                            placeholder="Describe technical scope and capabilities..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Image & Tags */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                                Image (URL)
                            </label>
                            <input
                                className="w-full border border-primary bg-transparent rounded-2xl px-5 py-4 text-text text-xs outline-none focus:border-[#22D3EE] transition-all"
                                placeholder="https://cdn.n3xtbridge.com/assets/..."
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                                Tags
                            </label>
                            <input
                                className="w-full border border-primary bg-transparent rounded-2xl px-5 py-4 text-text text-xs outline-none focus:border-[#22D3EE] transition-all placeholder:text-gray-700"
                                placeholder="AI, 24/7, Enterprise, Cloud"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Featured Checkbox */}
                    <div className="flex items-center gap-4 border border-primary p-5 rounded-3xl group cursor-pointer"
                        onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}>
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.is_featured ? 'bg-[#22D3EE] border-[#22D3EE]' : 'bg-transparent border-secondary'}`}>
                            {formData.is_featured && <span className="material-symbols-outlined text-white text-sm">check</span>}
                        </div>
                        <label className="text-xs font-black uppercase tracking-widest text-white cursor-pointer select-none">
                            Featured
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pb-4 sm:pb-0 pt-4">
                        <button
                            disabled={loading || !isFormValid || fetchingCategories}
                            className="w-full bg-secondary text-text py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#0046FB]/20 flex items-center justify-center gap-3 hover:bg-[#22D3EE] transition-all disabled:opacity-30 disabled:grayscale"
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