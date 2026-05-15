
import { useState } from 'react';
import { sendInvoiceMail } from '../api/emails';
import type { Invoice } from '../models/model';
const STATUS_STYLES: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border-green-200",
    unpaid: "bg-amber-100 text-amber-700 border-amber-200",
    pending: "bg-blue-100 text-blue-700 border-blue-200",
    overdue: "bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-100 text-gray-600 border-gray-200",
};

const InvoiceActionMenu = ({
    inv,
    navigate,
    onSendReminder,
    isadmin,
    openUpward = false
}: {
    inv: any,
    navigate: any,
    onSendReminder: (id: string) => void,
    isadmin: boolean,
    openUpward?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-10 h-10
                    flex items-center justify-center
                    rounded-xl
                    border
                    transition-all duration-200
                    ${isOpen
                        ? 'bg-accent border-accent text-secondary shadow-lg shadow-accent/30 scale-105'
                        : 'bg-secondary border-secondary text-white hover:border-accent/40 hover:bg-accent/10 hover:text-accent'
                    }
                `}
            >
                <span className="material-symbols-outlined text-[20px]">
                    {isOpen ? 'close' : 'more_horiz'}
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    <div
                        className={`
        absolute
        right-0
        w-60
        z-50
        overflow-hidden
        rounded-2xl
        border border-accent/10
        bg-[#22D3EE]/95
        backdrop-blur-xl
        shadow-[0_20px_60px_rgba(0,0,0,0.45)]
        animate-in fade-in zoom-in-95 duration-200
        ${openUpward ? 'bottom-full mb-3' : 'top-full mt-3'}
    `}
                    >
                        {/* Header */}
                        {/* <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-accent font-black">
                                Invoice Actions
                            </p>
                        </div> */}

                        {/* View */}
                        <button
                            onClick={() => {
                                navigate(`/dashboard/invoice/${inv.id}`, {
                                    state: { invoice: inv }
                                });
                                setIsOpen(false);
                            }}
                            className="
                                w-full
                                flex items-center gap-3
                                px-4 py-3
                                text-left
                                transition-all
                                group
                            "
                        >
                            <span className="material-symbols-outlined text-[18px] text-accent">
                                visibility
                            </span>

                            <div>
                                <p className="text-[11px] font-black uppercase tracking-wider text-text">
                                    View Details
                                </p>
                                <p className="text-[10px] text-text/50">
                                    Open invoice information
                                </p>
                            </div>
                        </button>

                        {/* Reminder */}
                        {inv.status !== 'paid' && isadmin && (
                            <button
                                onClick={() => {
                                    onSendReminder(inv.id);
                                    setIsOpen(false);
                                }}
                                className="
                                    w-full
                                    flex items-center gap-3
                                    px-4 py-3
                                    text-left
                                    transition-all
                                    group
                                "
                            >
                                <span className="material-symbols-outlined text-[18px] text-text">
                                    outgoing_mail
                                </span>

                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-wider text-text">
                                        Send Reminder
                                    </p>
                                    <p className="text-[10px] text-text/50">
                                        Notify customer by email
                                    </p>
                                </div>
                            </button>
                        )}

                        {/* Archive */}
                        {isadmin && (
                            <div className="border-t border-white/5 mt-1">
                                <button
                                    className="
                                        w-full
                                        flex items-center gap-3
                                        px-4 py-3
                                        text-left
                                        transition-all
                                        hover:bg-red-500/10
                                    "
                                >
                                    <span className="material-symbols-outlined text-[18px] text-red-400">
                                        archive
                                    </span>

                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-wider text-red-400">
                                            Archive Invoice
                                        </p>
                                        <p className="text-[10px] text-red-300/50">
                                            Move invoice to archive
                                        </p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
const InvoiceTable = ({ invoices, loading, navigate, isadmin }: { invoices: Invoice[], loading: boolean, navigate: any, isadmin: boolean }) => {
    const handleSendReminder = async (id: string) => {
        try {
            await sendInvoiceMail(id);
            alert("Reminder sent.");
        } catch (err) {
            alert("Could not send reminder.");
        }
    };

    const formatReminderDate = (dateString: string) => {
        if (!dateString || dateString.startsWith("0001") || dateString.startsWith("1970")) {
            return <span className="text-gray-600 italic lowercase tracking-tight">Not sent</span>;
        }

        const date = new Date(dateString);
        return (
            <div className="flex items-center gap-1.5 text-[#0046FB] font-bold">
                <span className="material-symbols-outlined text-[14px]">history</span>
                {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </div>
        );
    };

    return (
        <div className="overflow-x-auto overflow-y-visible scrollbar-hide">
            <table className="w-full text-left min-w-[900px]">
                <thead className='bg-gray-300'>
                    <tr >
                        <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text">Invoice No.</th>
                        <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text">Quote</th>
                        <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text">Customer</th>
                        <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text">Status</th>
                        <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text text-right">Amount</th>
                        <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text">Last Reminder</th>
                        <th className="px-6 py-5 text-[10px]  uppercase tracking-[0.2em] text-text text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#22D3EE]">
                    {loading ? (
                        <tr><td colSpan={7} className="p-20 text-center text-text font-bold italic tracking-widest animate-pulse">Loading invoices...</td></tr>
                    ) : invoices.length === 0 ? (
                        <tr><td colSpan={7} className="p-20 text-center text-text font-medium">No invoices found.</td></tr>
                    ) : (
                        invoices.map((inv, index) => {
                            const quoteRef = inv.quote_id ? `Q-${inv.quote_id.slice(0, 8).toUpperCase()}` : "No Quote";
                            return (
                                <tr key={inv.id}
                                    className="hover:bg-[#22D3EE]/10 transition-colors group relative">
                                    <td className="px-6 py-5 font-mono text-xs text-text">
                                        <div className="flex items-center gap-2">
                                            #{inv.invoice_number}
                                            {inv.deleted_at.Valid && (
                                                <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[8px] font-black uppercase border border-red-500/20">Archived</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-mono text-[10px] text-text tracking-tighter">
                                        {inv.quote_id?.startsWith("00000000") ? "---" : quoteRef}
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-italic text-text/80 tracking-tight">{inv.customer_name}</p>
                                        <p className="text-[10px] text-text/70 uppercase font-mono">{inv.customer_email}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[inv.status.toLowerCase()] || STATUS_STYLES.default}`}>
                                            <span className="w-1 h-1 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right  text-text text-sm">
                                        ₦{inv.total.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5 text-[10px] font-bold uppercase tracking-tighter">
                                        {formatReminderDate(inv.reminder_sent_at)}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <InvoiceActionMenu
                                            inv={inv}
                                            navigate={navigate}
                                            isadmin={isadmin}
                                            onSendReminder={handleSendReminder}
                                            openUpward={index >= invoices.length - 3}
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

export default InvoiceTable;