import type { Service } from "../models/model";

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

export default ServicesTable;