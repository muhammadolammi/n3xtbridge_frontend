import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Invoice, Service, Quote, QuoteRequest, User } from '../models/model';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { QUOTE_REQUEST_STATUS_STYLES } from '../constants/const';

// --- Shared Constants & Sub-Components ---

const STATUS_STYLES: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border-green-200",
    unpaid: "bg-amber-100 text-amber-700 border-amber-200",
    pending: "bg-blue-100 text-blue-700 border-blue-200",
    overdue: "bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-100 text-gray-600 border-gray-200",
};


const QUOTE_STATUS_STYLES: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600 border-gray-200",
    sent: "bg-blue-100 text-blue-700 border-blue-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    declined: "bg-red-100 text-red-700 border-red-200",
    expired: "bg-orange-100 text-orange-700 border-orange-200",
};
const CreateServiceModal = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', category: 'Tech Support',
        is_featured: false, icon: '', image: '', tags: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.icon.trim()) return alert("Icon name is required");
        setLoading(true);
        try {
            const payload = { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== "") };
            await api.post('/admin/services', payload);
            alert("Service created successfully!");
            onClose();
        } catch (err) { alert("Failed to create service."); }
        finally { setLoading(false); }
    };

    const isFormValid = formData.name.trim() !== "" && formData.icon.trim() !== "" && formData.description.trim() !== "";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-black uppercase tracking-tighter text-lg">Register New Infrastructure Service</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Service Name</label>
                        <input required className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm font-bold"
                            onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Category</label>
                        <select className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm"
                            onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option>Tech Support</option>
                            <option>Security</option>
                            <option>Web Development</option>
                            <option>Networking</option>
                            <option>Cloud Infrastructure</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Icon (Material Name)</label>
                        <input className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm"
                            placeholder="e.g. videocam" onChange={e => setFormData({ ...formData, icon: e.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Description</label>
                        <textarea required rows={3} className="w-full border-2 border-gray-100 focus:border-primary rounded-lg p-3 text-sm"
                            onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Image URL</label>
                        <input className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm"
                            placeholder="https://..." onChange={e => setFormData({ ...formData, image: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Tags (comma separated)</label>
                        <input className="w-full border-b-2 border-gray-100 focus:border-primary outline-none py-2 text-sm"
                            placeholder="AI, 24/7, Cloud" onChange={e => setFormData({ ...formData, tags: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="featured" className="w-4 h-4 accent-primary"
                            onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
                        <label htmlFor="featured" className="text-xs font-bold uppercase">Mark as Featured</label>
                    </div>
                    <button disabled={loading || !isFormValid} className="col-span-2 bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/30 mt-4">
                        {loading ? "Registering Service..." : "Deploy Service"}
                    </button>
                </form>
            </div>
        </div>
    );
};
const CreateQuoteModal = ({ requestId, onClose, onSuccess }: { requestId: string, onClose: () => void, onSuccess: () => void }) => {
    const [loading, setLoading] = useState(false);
    // Initializing with quantity 1 as a better default
    const [items, setItems] = useState([{ name: '', cost: '', description: '', quantity: 1 }]);
    const [notes, setNotes] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    const handleAddItem = () => setItems([...items, { name: '', cost: '', description: '', quantity: 1 }]);

    const handleItemChange = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => {
            const price = parseFloat(item.cost) || 0;
            const qty = item.quantity || 0;
            return acc + (price * qty);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                quote_request_id: requestId,
                amount: calculateTotal().toString(),
                breakdown: items,
                notes: notes,
                expires_at: new Date(expiryDate).toISOString(),
                status: 'draft'
            };
            await api.post('/admin/quotes', payload);
            alert("Official Quote dispatched to registry.");
            onSuccess();
            onClose();
        } catch (err) {
            alert("Failed to deploy quote. Please check connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-black uppercase tracking-tighter text-lg text-gray-900">Generate Official Quote</h3>
                        <p className="text-[10px] font-mono text-primary font-bold">MODE: ARCHITECTURAL SPECIFICATION</p>
                    </div>
                    <button onClick={onClose} className="material-symbols-outlined text-gray-400 hover:text-black transition-colors">close</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Line Items Section */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Line Items (Breakdown)</label>
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                                {/* Item Name */}
                                <div className="col-span-12 md:col-span-6">
                                    <input placeholder="Item Name (e.g. 4K IP Camera)" className="w-full bg-transparent border-b border-gray-200 py-1 text-sm font-bold outline-none focus:border-primary transition-colors"
                                        value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} required />
                                </div>
                                {/* Quantity */}
                                <div className="col-span-4 md:col-span-2">
                                    <input placeholder="Qty" type="number" min="1" className="w-full bg-transparent border-b border-gray-200 py-1 text-sm font-bold outline-none focus:border-primary transition-colors"
                                        value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} required />
                                </div>
                                {/* Unit Cost */}
                                <div className="col-span-6 md:col-span-3">
                                    <input placeholder="Unit Cost (₦)" type="number" className="w-full bg-transparent border-b border-gray-200 py-1 text-sm font-bold outline-none focus:border-primary transition-colors"
                                        value={item.cost} onChange={e => handleItemChange(index, 'cost', e.target.value)} required />
                                </div>
                                {/* Delete Button */}
                                <div className="col-span-2 md:col-span-1 flex justify-end items-center">
                                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-300 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                                {/* Item Description */}
                                <div className="col-span-12">
                                    <input placeholder="Technical specification or item details..." className="w-full bg-transparent border-b border-gray-100 py-1 text-[10px] outline-none text-gray-500 italic"
                                        value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={handleAddItem} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-primary hover:text-primary transition-all active:scale-[0.98]">
                            + Add Infrastructure Component
                        </button>
                    </div>

                    {/* General Quote Notes */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Quote Notes / Terms</label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-primary transition-all"
                            rows={3}
                            placeholder="Add payment terms, installation timelines, or warranty info..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Footer Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Validity Period</label>
                            <input type="date" required className="w-full border-b-2 border-gray-100 py-2 text-sm outline-none focus:border-primary transition-all"
                                value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                        </div>
                        <div className="text-right">
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Estimated Total</label>
                            <span className="text-3xl font-black text-primary tracking-tighter">₦{calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Final Action */}
                    <button disabled={loading} className="w-full bg-secondary-dark text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:shadow-secondary-dark/20 disabled:opacity-50 flex items-center justify-center gap-3">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Dispatch Final Quote</span>
                                <span className="material-symbols-outlined text-sm">verified</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
const EditDescriptionModal = ({
    requestId,
    initialValue,
    onClose,
    onSuccess
}: {
    requestId: string,
    initialValue: string,
    onClose: () => void,
    onSuccess: () => void
}) => {
    const [description, setDescription] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim() === initialValue.trim()) return onClose();
        if (!description.trim()) return alert("Description cannot be empty");

        setLoading(true);
        try {
            await api.patch(`/customer/quotes/requests/${requestId}/description`, {
                description: description.trim()
            });
            alert("Specification updated successfully.");
            onSuccess();
            onClose();
        } catch (err) {
            alert("Failed to sync updates to the terminal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-black uppercase tracking-tighter text-lg text-gray-900">Edit Specification</h3>
                        <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">Request Ref: {requestId.slice(0, 8)}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-[0.2em]">Updated Requirements</label>
                        <textarea
                            required
                            rows={5}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all leading-relaxed"
                            placeholder="Describe your technical requirements in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            className="flex-[2] bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Update Terminal</span>
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

// --- Table Components ---

const ServicesTable = ({ services, loading, onToggle }: { services: Service[], loading: boolean, onToggle: any }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-6 py-4">Service Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4">Visibility</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Accessing Service Registry...</td></tr>
                ) : services.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400">No matching records found.</td></tr>
                ) : services.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400 text-lg">{s.icon}</span>
                                <span className="font-bold text-gray-900 text-sm">{s.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-500">{s.category}</td>
                        <td className="px-6 py-4 text-amber-500">
                            {s.is_featured ? <span className="material-symbols-outlined text-sm">stars</span> : <span className="text-gray-200 material-symbols-outlined text-sm">stars</span>}
                        </td>
                        <td className="px-6 py-4">
                            <button onClick={() => onToggle(s.id, s.is_active)} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${s.is_active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                {s.is_active ? 'Online' : 'Offline'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const InvoiceTable = ({ invoices, loading, navigate }: { invoices: Invoice[], loading: boolean, navigate: any }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-6 py-4">ID / Reference</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Syncing Ledger...</td></tr>
                ) : invoices.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400">No matching records found.</td></tr>
                ) : invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-600">{inv.invoice_number}</td>
                        <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-900">{inv.customer_name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-mono">{inv.customer_email}</p>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${STATUS_STYLES[inv.status.toLowerCase()] || STATUS_STYLES.default}`}>
                                {inv.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">₦{inv.total.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => navigate(`/dashboard/view-invoice/${inv.id}`, { state: { invoice: inv } })} className="text-primary hover:underline text-xs font-black uppercase tracking-tighter">View</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);



const QuoteRequestTable = ({
    qrs,
    loading,
    onAddQuote,
    onEditDescription,
    role
}: {
    qrs: QuoteRequest[],
    loading: boolean,
    onAddQuote?: (id: string) => void,
    onEditDescription?: (id: string, currentDesc: string) => void,
    role: string
}) => {
    const navigate = useNavigate();

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        {(role === 'admin' || role === 'staff') && (
                            <th className="px-6 py-4">Client</th>
                        )}
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr>
                            {/* Dynamic colSpan: 5 for admin/staff, 4 for user */}
                            <td colSpan={(role === 'admin' || role === 'staff') ? 5 : 4} className="p-10 text-center text-gray-400 italic">
                                Syncing Request Ledger...
                            </td>
                        </tr>
                    ) : qrs.length === 0 ? (
                        <tr>
                            <td colSpan={(role === 'admin' || role === 'staff') ? 5 : 4} className="p-10 text-center text-gray-400 font-mono text-xs uppercase tracking-widest">
                                No matching requests.
                            </td>
                        </tr>
                    ) : (
                        qrs.map((qr) => {
                            // 1. Define logic variables inside the map block
                            const isElevated = role === 'admin' || role === 'staff';
                            const isQuoted = qr.status === 'quoted';

                            // 2. Explicitly return the JSX
                            return (
                                <tr key={qr.id} className="hover:bg-gray-50/50 transition-colors group">
                                    {isElevated && (
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">{qr.user_name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-mono">{qr.user_email}</p>
                                        </td>
                                    )}

                                    <td className="px-6 py-4 text-xs font-bold text-gray-700">{qr.service_name}</td>

                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${QUOTE_REQUEST_STATUS_STYLES[qr.status] || QUOTE_REQUEST_STATUS_STYLES.default}`}>
                                            {qr.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-600 truncate max-w-[180px] block" title={qr.description}>
                                                {qr.description}
                                            </span>
                                            {role === 'user' && qr.status === 'pending' && (
                                                <button onClick={() => onEditDescription?.(qr.id, qr.description)} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {/* 1. View Request - Always shows for everyone */}
                                            <button
                                                onClick={() => navigate(`/dashboard/view-qr/${qr.id}`, { state: { qr } })}
                                                className="flex items-center gap-1 px-3 py-1.5 border border-gray-100 rounded-lg text-gray-500 text-[9px] font-black uppercase tracking-tighter hover:bg-gray-50 hover:text-primary transition-all shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                                Request
                                            </button>

                                            {/* 2. Create Quote - Only Admin/Staff & Only if NOT quoted */}
                                            {!isQuoted && isElevated && (
                                                <button
                                                    onClick={() => onAddQuote?.(qr.id)}
                                                    className="bg-primary text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 flex items-center gap-1 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-xs">add</span>
                                                    Quote
                                                </button>
                                            )}

                                            {/* 3. View Quote - Shows for everyone ONLY if status is 'quoted' */}
                                            {isQuoted && qr && qr.quote_id && (
                                                <button
                                                    onClick={() => navigate(`/dashboard/view-quote/${qr.quote_id}`)}
                                                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                    Quote
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
    const statuses: Quote['status'][] = ['draft', 'sent', 'accepted', 'declined', 'expired'];

    return (
        <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        <th className="px-6 py-4">Quote Ref</th>
                        <th className="px-6 py-4">Service</th>

                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Valid Until</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Syncing Quotes...</td></tr>
                    ) : qs.length === 0 ? (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-mono text-xs uppercase tracking-widest">No quotes found.</td></tr>
                    ) : qs.map((q) => {
                        const dateValue = (q as any).exire_at || q.expires_at;
                        const formattedDate = dateValue && !isNaN(Date.parse(dateValue))
                            ? new Date(dateValue).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
                            : "Invalid Date";

                        return (
                            <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 font-mono text-[10px] font-bold text-gray-900 uppercase">
                                    Q-{q.id.slice(0, 8)}
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-700">{q.service_name}</td>

                                <td className="px-6 py-4 font-black text-gray-900 text-sm">
                                    ₦{parseFloat(q.amount || "0").toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative inline-block">
                                        {/* Status Switcher (Disabled for Users) */}
                                        <button
                                            disabled={role === 'user'}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === q.id ? null : q.id);
                                            }}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-wider transition-all ${role !== 'user' ? 'hover:bg-white active:scale-95' : 'cursor-default'} z-20 ${QUOTE_STATUS_STYLES[q.status] || QUOTE_STATUS_STYLES.default}`}
                                        >
                                            <span className="w-1 h-1 rounded-full bg-current"></span>
                                            {q.status}
                                            {role !== 'user' && <span className="material-symbols-outlined text-[14px]">expand_more</span>}
                                        </button>

                                        {/* Dropdown Menu - Restricted to Admin/Staff */}
                                        {activeMenu === q.id && role !== 'user' && (
                                            <>
                                                <div className="fixed inset-0 z-[80]" onClick={() => setActiveMenu(null)}></div>
                                                <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-2xl z-[90] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {statuses.filter(s => s !== q.status).map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => { onUpdateStatus?.(q.id, status); setActiveMenu(null); }}
                                                            className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-tighter text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors"
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-700">
                                    {formattedDate}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        className="text-gray-400 hover:text-primary transition-all"
                                        onClick={() => navigate(`/dashboard/view-quote/${q.id}`, { state: { quote: q } })}
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

// --- Admin Terminal ---

const AdminConsole = ({ user }: { user: User }) => {

    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState<'invoices' | 'services' | 'quote-requests' | 'quotes'>('invoices');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [qrs, setQrs] = useState<QuoteRequest[]>([]);
    const [qs, setQs] = useState<Quote[]>([]);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);


    const LIMIT = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoints: Record<string, string> = {
                'invoices': `/worker/invoices`,
                'services': `/admin/services`,
                'quote-requests': `/admin/quote-requests`,
                'quotes': `/admin/quotes`
            };
            const res = await api.get(`${endpoints[currentTab]}?limit=${LIMIT}&offset=${offset}`);

            if (currentTab === 'invoices') setInvoices(res.data.invoices || []);
            else if (currentTab === 'services') setServices(res.data.services || []);
            else if (currentTab === 'quote-requests') setQrs(res.data.quote_requests || []);
            else if (currentTab === 'quotes') setQs(res.data.quotes || []);

            setTotal(res.data.total || 0);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };
    useEffect(() => {

        fetchData();
    }, [currentTab, offset]);

    const filteredInvoices = useMemo(() => invoices.filter(inv => inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) || inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase())), [invoices, searchQuery]);
    const filteredServices = useMemo(() => services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase())), [services, searchQuery]);

    const handleToggleActive = async (id: string, status: boolean) => {
        try {
            await api.patch(`/admin/services/${id}/status`, { is_active: !status });
            setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !status } : s));
        } catch (err) { alert("Status update failed"); }
    };
    const handleUpdateQuoteStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/admin/quotes/${id}/status`, { status: newStatus });
            setQs(prev => prev.map(q => q.id === id ? { ...q, status: newStatus as any } : q));
        } catch (err) { alert("Quote update failed"); }
    };
    const TabContent = {
        "invoices": (
            <InvoiceTable
                invoices={filteredInvoices}
                loading={loading}
                navigate={navigate}
            />
        ),
        "services": (
            <ServicesTable
                services={filteredServices}
                loading={loading}
                onToggle={handleToggleActive}
            />
        ),
        'quote-requests': <QuoteRequestTable qrs={qrs} loading={loading} onAddQuote={(id) => setSelectedQuoteId(id)} role={user.role} />,
        quotes: <QuotesTable qs={qs} loading={loading} onUpdateStatus={handleUpdateQuoteStatus} navigate={navigate} role={user.role} />
    };
    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Administrative Terminal</span>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Enterprise Console</h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setIsServiceModalOpen(true)} className="bg-secondary-dark text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-black transition-all">
                        <span className="material-symbols-outlined text-sm">inventory_2</span> New Service
                    </button>
                    <button onClick={() => navigate('/dashboard/create-invoice')} className="bg-primary text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        <span className="material-symbols-outlined text-sm">add</span> Create Invoice
                    </button>
                </div>
            </header>

            <div className="flex justify-between items-center mb-6 border-b border-gray-200">
                <div className="flex gap-8">
                    <button onClick={() => { setCurrentTab('invoices'); setOffset(0) }} className={`pb-4 text-xs font-black uppercase tracking-widest ${currentTab === 'invoices' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Invoices</button>
                    <button onClick={() => { setCurrentTab('services'); setOffset(0) }} className={`pb-4 text-xs font-black uppercase tracking-widest ${currentTab === 'services' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Services</button>
                    <button onClick={() => { setCurrentTab('quote-requests'); setOffset(0) }} className={`pb-4 text-xs font-black uppercase tracking-widest ${currentTab === 'quote-requests' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Quote Requests</button>
                    <button onClick={() => { setCurrentTab('quotes'); setOffset(0) }} className={`pb-4 text-xs font-black uppercase tracking-widest ${currentTab === 'quotes' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Quotes</button>

                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search ..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 w-64" />
                    </div>
                    <div className="flex gap-1">
                        <button disabled={offset === 0} onClick={() => setOffset(prev => prev - LIMIT)} className="p-2 border rounded-lg bg-white disabled:opacity-30"><span className="material-symbols-outlined">chevron_left</span></button>
                        <button disabled={offset + LIMIT >= total} onClick={() => setOffset(prev => prev + LIMIT)} className="p-2 border rounded-lg bg-white disabled:opacity-30"><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                {TabContent[currentTab]}
            </div>
            {isServiceModalOpen && <CreateServiceModal onClose={() => setIsServiceModalOpen(false)} />}
            {selectedQuoteId && <CreateQuoteModal requestId={selectedQuoteId} onClose={() => setSelectedQuoteId(null)} onSuccess={fetchData} />}
        </div>
    );
};

// --- Staff Terminal ---

const StaffTerminal = () => {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const LIMIT = 10;

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/invoices?limit=${LIMIT}&offset=${offset}`);
                setInvoices(res.data.invoices || []);
                setTotal(res.data.total || 0);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchInvoices();
    }, [offset]);

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Operations Node</span>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Billing Terminal</h1>
                </div>
                <button onClick={() => navigate('/dashboard/create-invoice')} className="bg-primary text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined text-sm">add</span> Create Invoice
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Assignments</h3>
                    <div className="flex gap-2">
                        <button disabled={offset === 0} onClick={() => setOffset(prev => prev - LIMIT)} className="p-1 border rounded bg-white disabled:opacity-20"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                        <button disabled={offset + LIMIT >= total} onClick={() => setOffset(prev => prev + LIMIT)} className="p-1 border rounded bg-white disabled:opacity-20"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                    </div>
                </div>
                <InvoiceTable invoices={invoices} loading={loading} navigate={navigate} />
            </div>
        </div>
    );
};

// --- Client Portal ---
const ClientPortal = ({ user }: { user: User }) => {
    const navigate = useNavigate();

    // --- State Management ---
    const [currentTab, setCurrentTab] = useState<'billing' | 'requests' | 'offers'>('billing');
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [qrs, setQrs] = useState<QuoteRequest[]>([]);
    const [qs, setQs] = useState<Quote[]>([]);

    // Pagination
    const LIMIT = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    // Modal State
    const [editTarget, setEditTarget] = useState<{ id: string, desc: string } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoints: Record<string, string> = {
                'billing': `/customer/invoices`,
                'requests': `/customer/quotes/my-requests`,
                'offers': `/customer/quotes`
            };
            const res = await api.get(`${endpoints[currentTab]}?limit=${LIMIT}&offset=${offset}`);

            if (currentTab === 'billing') {
                setInvoices(res.data.invoices || []);
            } else if (currentTab === 'requests') {
                setQrs(res.data.quote_requests || []);
            } else if (currentTab === 'offers') {
                setQs(res.data.quotes || []);
            }

            setTotal(res.data.total || 0);
        } catch (err) {
            console.error("Terminal Sync Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentTab, offset]);

    // --- Tab Content Mapping ---
    const TabContent = {
        billing: (
            <InvoiceTable
                invoices={invoices}
                loading={loading}
                navigate={navigate}
            />
        ),
        requests: (
            <QuoteRequestTable
                qrs={qrs}
                loading={loading}
                role={user.role}
                onEditDescription={(id, desc) => setEditTarget({ id, desc })}
            />
        ),
        offers: (
            <QuotesTable
                qs={qs}
                loading={loading}
                role={user.role}
                navigate={navigate}
                onUpdateStatus={() => { }} // Users cannot update status
            />
        )
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-12">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary underline underline-offset-4">
                    Authorized Session: {user.first_name}
                </span>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter mt-2">My Account</h1>
            </header>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Unpaid Balance</p>
                    <h3 className="text-3xl font-black text-amber-500 tracking-tighter">
                        ₦{invoices.reduce((acc, inv) => inv.status.toLowerCase() !== 'paid' ? acc + inv.total : acc, 0).toLocaleString()}
                    </h3>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Offers</p>
                    <h3 className="text-3xl font-black text-primary tracking-tighter">{qs.length}</h3>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Requests</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                        {qrs.filter(r => r.status === 'pending').length}
                    </h3>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-200">
                <div className="flex gap-8">
                    {['billing', 'requests', 'offers'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setCurrentTab(tab as any); setOffset(0); }}
                            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all ${currentTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab === 'billing' ? 'Invoices' : tab === 'requests' ? 'My Requests' : 'Quotes Received'}
                        </button>
                    ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex gap-2 mb-4">
                    <button
                        disabled={offset === 0 || loading}
                        onClick={() => setOffset(prev => Math.max(0, prev - LIMIT))}
                        className="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button
                        disabled={offset + LIMIT >= total || loading}
                        onClick={() => setOffset(prev => prev + LIMIT)}
                        className="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] overflow-hidden transition-all">
                {TabContent[currentTab]}
            </div>

            {/* Modals */}
            {editTarget && (
                <EditDescriptionModal
                    requestId={editTarget.id}
                    initialValue={editTarget.desc}
                    onClose={() => setEditTarget(null)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

// --- Main Dashboard Traffic Controller ---

const Dashboard = () => {
    const { user } = useAuth();

    if (user) {
        return (<div className="min-h-screen bg-gray-50 p-8 pt-24">
            {user.role === 'admin' ? (
                <AdminConsole user={user} />
            ) : user.role === 'staff' ? (
                <StaffTerminal />
            ) : (
                <ClientPortal user={user} />
            )}
        </div>
        )
    }
};

export default Dashboard;