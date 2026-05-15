import type { NavigateFunction } from "react-router-dom";
import type { Quote } from "../models/model";
import { useState } from "react";

const STATUS_STYLES: Record<string, string> = {
    "in-review": "bg-gray-100 text-gray-600 border-gray-200",
    draft: "bg-gray-100 text-gray-600 border-gray-200",
    sent: "bg-blue-100 text-blue-700 border-blue-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    paid: "bg-green-100 text-green-700 border-green-200",

    declined: "bg-red-100 text-red-700 border-red-200",
    expired: "bg-orange-100 text-orange-700 border-orange-200",
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
                                                } ${STATUS_STYLES[q.status] || STATUS_STYLES.default}`}
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


export default QuotesTable;