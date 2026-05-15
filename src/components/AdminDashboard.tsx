import { useNavigate } from "react-router-dom";
import type { Invoice, Promotion, Quote, QuoteRequest, Service, User } from "../models/model";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import InvoiceTable from "./InvoiceTable";
import QuoteRequestTable from "./QuoteRequestTable";
import QuotesTable from "./QuotesTable";
import ServicesTable from "./ServicesTable";
import PromotionsTable from "./PromotionsTable";
import CreateServiceModal from "./CreateServiceModal";
import CreateQuoteModal from "./CreateQuoteModal";
import CreatePromotionModal from "./CreatePromotionModal";


const AdminDashboard = ({ user }: { user: User }) => {
    const navigate = useNavigate();

    // --- State Management ---
    const [currentTab, setCurrentTab] = useState<'invoices' | 'services' | 'quote-requests' | 'quotes' | 'promotions'>('invoices');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

    // Data Collections
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [qrs, setQrs] = useState<QuoteRequest[]>([]);
    const [qs, setQs] = useState<Quote[]>([]);
    const [promos, setPromos] = useState<Promotion[]>([]);

    // ✅ LOGIC UPDATE: Global Stats for the Command Center
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingRequests: 0,
        activeQuotes: 0,
        totalServices: 0,
        activePromos: 0
    });

    // Pagination
    const LIMIT = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    // ✅ LOGIC UPDATE: Fetch Global Analytics once on mount
    useEffect(() => {
        const fetchSystemStats = async () => {
            try {
                const [invRes, qrRes, qRes, sRes, pRes] = await Promise.all([
                    api.get('/worker/invoices?limit=1000'),
                    api.get('/admin/quote-requests?limit=1000'),
                    api.get('/admin/quotes?limit=1000'),
                    api.get('/admin/services?limit=1000'),
                    api.get('/admin/promotions?limit=1000')
                ]);

                const invs: Invoice[] = invRes.data.invoices || [];
                const requests: QuoteRequest[] = qrRes.data.quote_requests || [];
                const quotes: Quote[] = qRes.data.quotes || [];
                const svcs: Service[] = sRes.data.services || [];
                const prms: Promotion[] = pRes.data.promotions || [];

                setStats({
                    totalRevenue: invs.reduce((acc, inv) => inv.status === 'paid' ? acc + inv.total : acc, 0),
                    pendingRequests: requests.filter(r => r.status === 'pending').length,
                    activeQuotes: quotes.filter(q => q.status === 'sent').length,
                    totalServices: svcs.length,
                    activePromos: prms.filter(p => p.is_active).length
                });
            } catch (err) {
                console.error("Command Stats Sync Error:", err);
            }
        };
        fetchSystemStats();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoints: Record<string, string> = {
                'invoices': `/worker/invoices`,
                'services': `/admin/services`,
                'quote-requests': `/admin/quote-requests`,
                'quotes': `/admin/quotes`,
                'promotions': `/admin/promotions`
            };
            const res = await api.get(`${endpoints[currentTab]}?limit=${LIMIT}&offset=${offset}`);

            if (currentTab === 'invoices') setInvoices(res.data.invoices || []);
            else if (currentTab === 'services') setServices(res.data.services || []);
            else if (currentTab === 'quote-requests') setQrs(res.data.quote_requests || []);
            else if (currentTab === 'quotes') setQs(res.data.quotes || []);
            else if (currentTab === 'promotions') setPromos(res.data.promotions || []);

            setTotal(res.data.total || 0);
        } catch (err) {
            console.error("Registry Sync Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentTab, offset]);
    // HANDLERS
    const handleTogglePromoStatus = async (id: string, current: boolean) => {
        try {
            await api.patch(`/admin/promotions/${id}/status`, { is_active: !current });
            setPromos(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
        } catch (err) { alert("Status sync failed."); }
    };

    const handleToggleActive = async (id: string, status: boolean) => {
        try {
            await api.patch(`/admin/services/${id}/status`, { is_active: !status });
            setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !status } : s));
        } catch (err) { alert("Visibility sync failed."); }
    };

    const handleUpdateQuoteStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/admin/quotes/${id}/status`, { status: newStatus });
            setQs(prev => prev.map(q => q.id === id ? { ...q, status: newStatus as any } : q));
        } catch (err) { alert(`Status update failed`); }
    };

    // Memoized Filters
    const filteredInvoices = useMemo(() => invoices.filter(inv =>
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||

        inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [invoices, searchQuery]);

    const filteredServices = useMemo(() => services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    ), [services, searchQuery]);
    const filteredQrs = useMemo(() => qrs.filter(qr =>
        qr.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.description.toLowerCase().includes(searchQuery.toLowerCase())

    ), [qrs, searchQuery]);
    const filteredQs = useMemo(() => qs.filter(q =>
        q.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.notes.toLowerCase().includes(searchQuery.toLowerCase())

    ), [qs, searchQuery]);
    const filteredPromos = useMemo(() => promos.filter(p =>
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.String.toLowerCase().includes(searchQuery.toLowerCase())
    ), [promos, searchQuery]);

    const TabContent = {
        "invoices": <InvoiceTable invoices={filteredInvoices} loading={loading} navigate={navigate} isadmin={user.role === "admin"} />,
        "services": <ServicesTable services={filteredServices} loading={loading} onToggle={handleToggleActive} />,
        "quote-requests": <QuoteRequestTable qrs={filteredQrs} loading={loading} onAddQuote={setSelectedQuote} role={user.role} />,
        "quotes": <QuotesTable qs={filteredQs} loading={loading} onUpdateStatus={handleUpdateQuoteStatus} navigate={navigate} role={user.role} />,
        "promotions": <PromotionsTable promos={filteredPromos} loading={loading} onToggleStatus={handleTogglePromoStatus} />
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-4 sm:px-0">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="h-1 w-12 bg-[#22D3EE] rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Root Administrator</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tighter">Admin Dashboard</h1>
                </div>

                {/* Global Actions */}
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <button onClick={() => setIsServiceModalOpen(true)} className="flex-1 lg:flex-none bg-secondary  text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#22D3EE] transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">inventory_2</span> Create Service
                    </button>
                    <button onClick={() => setIsPromoModalOpen(true)} className="flex-1 lg:flex-none bg-amber-500/10 border border-amber-500/20 text-amber-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">campaign</span> Create Promotion
                    </button>
                    <button onClick={() => navigate('/dashboard/create-invoice')} className="flex-1 lg:flex-none bg-secondary text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#22D3EE] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0046FB]/20">
                        <span className="material-symbols-outlined text-sm">add</span> New Invoice
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4 sm:px-0">
                <div className="p-6  rounded-3xl  border border-secondary hover:border-[#22D3EE] group">
                    <p className="text-[10px] font-bold text-primary  uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Total Yield</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">₦{stats.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-6  rounded-3xl border border-secondary hover:border-[#22D3EE] group">
                    <p className="text-[10px] font-bold text-primary  uppercase tracking-widest mb-1">Quote Requets</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{stats.pendingRequests}</h3>
                </div>
                <div className="p-6  rounded-3xl border border-secondary hover:border-[#22D3EE] group">
                    <p className="text-[10px] font-bold text-primary  uppercase tracking-widest mb-1">Active Quotes</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{stats.activeQuotes}</h3>
                </div>
                <div className="p-6  rounded-3xl border border-secondary hover:border-[#22D3EE] group">
                    <p className="text-[10px] font-bold text-primary  uppercase tracking-widest mb-1">Services</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{stats.totalServices}</h3>
                </div>
                <div className="p-6  rounded-3xl border border-secondary hover:border-[#22D3EE] group">
                    <p className="text-[10px] font-bold text-primary  uppercase tracking-widest mb-1">Live Promos</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{stats.activePromos}</h3>
                </div>
            </div>

            {/* Sub-Navigation & Filters */}
            <div className="space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-primary px-4 sm:px-0 pb-4 md:pb-0">

                    {/* MOBILE: Dropdown (Visible only on small screens) */}
                    <div className="md:hidden w-full relative">
                        <div>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <select
                            value={currentTab}
                            onChange={(e) => { setCurrentTab(e.target.value as any); setOffset(0); }}
                            className="appearance-none w-full  border border-primary text-[#22D3EE] rounded-xl px-4 py-3 font-black uppercase tracking-widest text-[11px] focus:outline-none"
                        >

                            {['invoices', 'services', 'quote-requests', 'quotes', 'promotions'].map((tab) => (
                                <option key={tab} value={tab} className="bg-neutral-900 text-white">
                                    {tab.replace('-', ' ')}
                                </option>
                            ))}
                        </select>

                    </div>

                    {/* DESKTOP: Tabs (Hidden on small screens) */}
                    <div className="hidden md:flex gap-6 overflow-x-auto w-full scrollbar-hide pb-0">
                        {(['invoices', 'services', 'quote-requests', 'quotes', 'promotions'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setCurrentTab(tab); setOffset(0); }}
                                className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative ${currentTab === tab ? 'text-[#22D3EE] ' : 'text-primary hover:text-[#22D3EE]'}`}
                            >
                                {tab.replace('-', ' ')}
                                {currentTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#22D3EE] rounded-full animate-in fade-in zoom-in duration-300"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto pb-6 xl:pb-4">
                        <div className="relative w-full sm:w-64 group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#22D3EE] transition-colors text-sm">search</span>
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-12 pr-4 py-3  border border-secondary rounded-2xl text-xs font-bold text-text outline-none focus:border-[#22D3EE] transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={offset === 0 || loading}
                                onClick={() => setOffset(prev => prev - LIMIT)}
                                className="p-3   rounded-xl bg-secondary text-white disabled:opacity-20 hover:bg-[#22D3EE] transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <button
                                disabled={offset + LIMIT >= total || loading}
                                onClick={() => setOffset(prev => prev + LIMIT)}
                                className="p-3 border  rounded-xl bg-secondary text-white disabled:opacity-20 hover:bg-[#22D3EE] transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Main Content Terminal */}
                <div className=" md:min-h-[540px] min-h-[540px] overflow-hidden shadow-2xl mx-4 sm:mx-0">
                    {TabContent[currentTab]}
                </div>
            </div>

            {/* Modals Container */}
            {isServiceModalOpen && <CreateServiceModal onClose={() => setIsServiceModalOpen(false)} />}
            {selectedQuote && <CreateQuoteModal qr={selectedQuote} onClose={() => setSelectedQuote(null)} onSuccess={fetchData} adminID={user.id} />}
            {isPromoModalOpen && <CreatePromotionModal onClose={() => setIsPromoModalOpen(false)} onSuccess={fetchData} />}
        </div>
    );
};
export default AdminDashboard;