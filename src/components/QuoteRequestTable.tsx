import { useNavigate } from "react-router-dom";
import type { QuoteRequest } from "../models/model";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const QRActionMenu = ({
    qr,
    navigate,
    isElevated,
    openUpward = false,
    onAddQuote
}: {
    qr: any;
    navigate: any;
    isElevated: boolean;
    openUpward?: boolean;
    onAddQuote?: (qr: any) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement | null>(null);

    const isQuoted = qr.status === "quoted";

    const updatePosition = () => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();

        setPos({
            top: rect.bottom + window.scrollY,
            left: rect.right + window.scrollX - 240 // menu width offset
        });
    };

    useEffect(() => {
        if (isOpen) updatePosition();
    }, [isOpen]);

    const menu = isOpen ? createPortal(
        <>
            {/* backdrop */}
            <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsOpen(false)}
            />

            {/* menu */}
            <div
                style={{
                    position: "absolute",
                    top: openUpward ? undefined : pos.top,
                    left: pos.left,
                    bottom: openUpward ? window.innerHeight - pos.top + 10 : undefined,
                }}
                className="
                    w-60
                    z-[9999]
                    rounded-2xl
                    border border-accent/10
                    bg-secondary
                    backdrop-blur-xl
                    shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                    overflow-hidden
                "
            >
                <button
                    onClick={() => navigate(`/dashboard/qr/${qr.id}`, { state: { qr } })}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#22D3EE]/90"
                >
                    <span className="material-symbols-outlined text-[18px] text-accent">
                        visibility
                    </span>
                    <div>
                        <p className="text-[11px] font-black uppercase text-text">View Details</p>
                        <p className="text-[10px] text-text/50">Open request</p>
                    </div>
                </button>

                {!isQuoted && isElevated && (
                    <button
                        onClick={() => onAddQuote?.(qr)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#22D3EE]/90"
                    >
                        <span className="material-symbols-outlined text-[18px] text-accent">
                            add_box
                        </span>
                        <div>
                            <p className="text-[11px] font-black uppercase text-text">Create Quote</p>
                            <p className="text-[10px] text-text/50">Make offer</p>
                        </div>
                    </button>
                )}

                {isQuoted && qr.quote_id && (
                    <button
                        onClick={() => navigate(`/dashboard/quote/${qr.quote_id}`)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#22D3EE]/90"
                    >
                        <span className="material-symbols-outlined text-[18px] text-accent">
                            verified
                        </span>
                        <div>
                            <p className="text-[11px] font-black uppercase text-text">Open Quote</p>
                            <p className="text-[10px] text-text/50">View offer</p>
                        </div>
                    </button>
                )}
            </div>
        </>,
        document.body
    ) : null;

    return (
        <div className="relative inline-block">
            <button
                ref={btnRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-10 h-10 flex items-center justify-center rounded-xl border
                    transition-all duration-200
                    ${isOpen
                        ? "bg-accent border-accent text-secondary"
                        : "bg-secondary border-secondary text-white"
                    }
                `}
            >
                <span className="material-symbols-outlined text-[20px]">
                    {isOpen ? "close" : "more_horiz"}
                </span>
            </button>

            {menu}
        </div>
    );
};


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
        <div className="relative overflow-x-auto scrollbar-hide">
            <table className="w-full text-left min-w-[900px] relative">
                <thead>
                    <tr className="bg-gray-300 ">
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">ID</th>
                        {isElevated && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text">QUOTE ID</th>
                        }
                        {isElevated && (
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Client</th>
                        )}
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text">Service Name</th>

                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text">Request Details</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#22D3EE]">
                    {loading ? (
                        <tr>
                            <td colSpan={isElevated ? 5 : 4} className="p-20 text-center text-text font-bold italic tracking-widest animate-pulse">
                                Loading requests...
                            </td>
                        </tr>
                    ) : qrs.length === 0 ? (
                        <tr>
                            <td colSpan={isElevated ? 5 : 4} className="p-20 text-center text-text font-medium text-xs uppercase tracking-widest">
                                No quote requests found.
                            </td>
                        </tr>
                    ) : (
                        qrs.map((qr, index) => {
                            return (
                                <tr key={qr.id} className="hover:bg-[#22D3EE]/10 transition-colors group relative">
                                    <td className="px-6 py-5 text-xs text-text">
                                        QR-{qr.id.slice(0, 8).toUpperCase()}
                                    </td>
                                    {isElevated &&
                                        <td className="px-6 py-5 text-xs text-text">
                                            {/* check if theres a quote id then show it as QR- 0,8 or show unquoted qr */}
                                            {qr.quote_id?.startsWith('00000') ? "---" : `Q-${qr.quote_id?.slice(0, 8).toUpperCase()}`}
                                        </td>}
                                    {isElevated && (
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-text tracking-tight">{qr.user_first_name} {qr.user_last_name}</p>
                                            <p className="text-[10px] text-text/100 uppercase font-mono">{qr.user_email}</p>
                                        </td>
                                    )}

                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-text">{qr.service_name}</span>
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
                                                <button onClick={() => onEditDescription?.(qr.id, qr.description)} className="text-[#22D3EE] opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                                    <span className="material-symbols-outlined text-base">edit_note</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-right relative overflow-visible">
                                        <QRActionMenu
                                            qr={qr}
                                            navigate={navigate}
                                            isElevated={isElevated}
                                            openUpward={index >= qrs.length - 3} // open upward if its one of the last 3 items and there are more than 5 items
                                            onAddQuote={onAddQuote}
                                        />
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