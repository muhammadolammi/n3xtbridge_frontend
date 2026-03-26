import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Invoice, GetQuoteRequest, Service } from '../models/model';
import { useNavigate } from 'react-router-dom';

// --- Shared Constants & Sub-Components ---

const STATUS_STYLES: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border-green-200",
    unpaid: "bg-amber-100 text-amber-700 border-amber-200",
    pending: "bg-blue-100 text-blue-700 border-blue-200",
    overdue: "bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-100 text-gray-600 border-gray-200",
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
const QUOTE_REQUEST_STATUS_STYLES: Record<string, string> = {
    pending: "bg-blue-100 text-blue-700 border-blue-200",
    reviewing: "bg-purple-100 text-purple-700 border-purple-200",
    quoted: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-100 text-gray-600 border-gray-200",
};

const QuoteRequestTable = ({ qrs, loading }: { qrs: GetQuoteRequest[], loading: boolean }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-6 py-4">Request ID</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Description</th>

                    <th className="px-6 py-4 text-right">Submitted</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Syncing Request Ledger...</td></tr>
                ) : qrs.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-mono text-xs">No pending requests found.</td></tr>
                ) : (
                    qrs.map((qr) => (
                        <tr key={qr.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <p className="font-mono text-[10px] font-bold text-gray-500 uppercase">
                                    {qr.id.slice(0, 8)}...
                                </p>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-sm font-bold text-gray-900">{qr.user_name}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-mono">{qr.user_email}</p>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-700">{qr.service_name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${QUOTE_REQUEST_STATUS_STYLES[qr.status.toLowerCase()] || QUOTE_REQUEST_STATUS_STYLES.default}`}>
                                    <span className="w-1 h-1 rounded-full bg-current opacity-70"></span>
                                    {qr.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 max-w-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600 leading-relaxed">
                                        {qr.description.split(" ").slice(0, 20).join(" ")}
                                        {qr.description.split(" ").length > 20 ? "..." : ""}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <p className="text-xs font-bold text-gray-900">
                                    {new Date(qr.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-[9px] text-gray-400 font-mono">
                                    {new Date(qr.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </p>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

// --- Admin Terminal ---

// const AdminConsole = ({ user }: { user: User }) => {
const AdminConsole = () => {

    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState<'invoices' | 'services' | 'quote-requests'>('invoices');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [qrs, setQrs] = useState<GetQuoteRequest[]>([]);

    const LIMIT = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                currentTab === 'invoices' ? `/invoices` : `/admin/services`;
                if (currentTab === 'invoices') {
                    const res = await api.get(`/invoices?limit=${LIMIT}&offset=${offset}`);

                    setInvoices(res.data.invoices || []);
                    setTotal(res.data.total || 0);
                } else if (currentTab === "services") {
                    const res = await api.get(`/admin/services?limit=${LIMIT}&offset=${offset}`);
                    setServices(res.data.services || []);
                    setTotal(res.data.total || 0);
                } else if (currentTab === "quote-requests") {
                    const res = await api.get(`/admin/quote-requests?limit=${LIMIT}&offset=${offset}`);
                    setQrs(res.data.quote_requests || []);
                    setTotal(res.data.total || 0);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
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
        "quote-requests": (
            <QuoteRequestTable
                qrs={qrs}
                loading={loading}
            // props for quotes...
            />
        )
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

const ClientPortal = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/customer/invoices?limit=5&offset=0`);
                setInvoices(res.data.invoices || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchInvoices();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-12">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Secure Client Access</span>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">My Account</h1>
                <p className="text-gray-400 font-mono text-xs uppercase mt-1">Status: Authorized Session</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Unpaid Balance</p>
                    <h3 className="text-2xl font-black text-amber-500">₦{invoices.reduce((acc, inv) => inv.status.toLowerCase() !== 'paid' ? acc + inv.total : acc, 0).toLocaleString()}</h3>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Quotes</p>
                    <h3 className="text-2xl font-black text-primary">0</h3>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Security Level</p>
                    <h3 className="text-sm font-black text-green-500 uppercase flex items-center gap-2">Standard User</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Recent Transactions</h3>
                </div>
                <InvoiceTable invoices={invoices} loading={loading} navigate={navigate} />
            </div>
        </div>
    );
};

// --- Main Dashboard Traffic Controller ---

const Dashboard = () => {
    const { user } = useAuth();

    if (user) {
        return (<div className="min-h-screen bg-gray-50 p-8 pt-24">
            {user.role === 'admin' ? (
                <AdminConsole />
            ) : user.role === 'staff' ? (
                <StaffTerminal />
            ) : (
                <ClientPortal />
            )}
        </div>
        )
    }
};

export default Dashboard;