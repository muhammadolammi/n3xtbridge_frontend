import type { Service } from "../models/model";

const ServicesTable = ({ services, loading, onToggle }: { services: Service[], loading: boolean, onToggle: any }) => (
    <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left min-w-[700px]">
            <thead className='bg-gray-300'>

                <tr >
                    <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text">Service Name</th>
                    <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text">Category</th>
                    <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text">Plan</th>
                    <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text">Status</th>
                </tr>
            </thead>
            {/* UPDATE: Adjusted table divider transparency to blend seamlessly into your client layout background */}
            <tbody className="divide-y divide-secondary/40">
                {loading ? (
                    <tr><td colSpan={4} className="p-20 text-center text-text font-bold italic tracking-widest animate-pulse">Loading services...</td></tr>
                ) : services.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-text font-medium">No services found.</td></tr>
                ) : services.map((s) => (
                    <tr key={s.id} className="hover:bg-[#22D3EE]/5 transition-colors group relative">
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                                {/* 
                                   UPDATE: Swapped old blue [#0046FB] color accent 
                                   for your designated cyan theme token [#22D3EE].
                                */}
                                <div className="w-10 h-10 rounded-xl bg-secondary border border-secondary flex items-center justify-center group-hover:bg-[#22D3EE]/10 group-hover:border-[#22D3EE]/30 transition-all">
                                    <span className="material-symbols-outlined text-primary/70 group-hover:text-[#22D3EE] transition-colors">
                                        {s.icon || 'inventory_2'}
                                    </span>
                                </div>
                                <span className="font-bold text-text text-sm tracking-tight transition-colors group-hover:text-white">
                                    {s.name}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            {/* UPDATE: Refined category token colors and boundaries */}
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#22D3EE] py-1 px-3 bg-[#22D3EE]/5 rounded-full border border-[#22D3EE]/20">
                                {s.category_id}
                            </span>
                        </td>
                        <td className="px-6 py-5">
                            {s.is_featured ? (
                                <div className="flex items-center gap-1.5 text-amber-400">
                                    <span className="material-symbols-outlined text-base">stars</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Popular</span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-black uppercase tracking-widest text-text/40">Standard</span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                            <button
                                onClick={() => onToggle(s.id, s.is_active)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${s.is_active
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 shadow-xs shadow-green-500/5'
                                    : 'bg-neutral-500/5 text-text/40 border-secondary hover:bg-neutral-500/10 hover:text-text'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${s.is_active
                                    ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse'
                                    : 'bg-text/30'
                                    }`}></span>
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