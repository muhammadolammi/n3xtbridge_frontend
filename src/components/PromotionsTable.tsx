import type { Promotion } from "../models/model";





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


export default PromotionsTable;