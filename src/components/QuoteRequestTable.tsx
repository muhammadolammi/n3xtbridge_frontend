import { useNavigate } from "react-router-dom";
import type { QuoteRequest } from "../models/model";



export const STATUS_STYLES: Record<string, string> = {
    pending: "bg-blue-100 text-blue-700 border-blue-200",
    reviewing: "bg-purple-100 text-purple-700 border-purple-200",
    quoted: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-100 text-gray-600 border-gray-200",
};

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
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Client</th>
                        )}
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service </th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Request Details</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                    {loading ? (
                        <tr>
                            <td colSpan={isElevated ? 5 : 4} className="p-20 text-center text-gray-600 font-bold italic tracking-widest animate-pulse">
                                Loading requests...
                            </td>
                        </tr>
                    ) : qrs.length === 0 ? (
                        <tr>
                            <td colSpan={isElevated ? 5 : 4} className="p-20 text-center text-gray-500 font-medium font-mono text-xs uppercase tracking-widest">
                                No quote requests found.
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
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[qr.status] || STATUS_STYLES.default}`}>
                                            <span className="w-1 h-1 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                                            {qr.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-gray-500 truncate max-w-[220px] italic block" title={qr.description}>
                                                {qr.description}
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
                                                View
                                            </button>

                                            {!isQuoted && isElevated && (
                                                <button
                                                    onClick={() => onAddQuote?.(qr)}
                                                    className="bg-[#0046FB] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#0046FB]/20 hover:bg-[#003ccf] flex items-center gap-2 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-base">add_box</span>
                                                    Create Quote
                                                </button>
                                            )}

                                            {isQuoted && qr.quote_id && (
                                                <button
                                                    onClick={() => navigate(`/dashboard/quote/${qr.quote_id}`)}
                                                    className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-base">verified</span>
                                                    Open Quote
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

export default QuoteRequestTable;