import { useState } from "react";
import api from "../api/axios";


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

export default EditDescriptionModal;