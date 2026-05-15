import { useNavigate } from "react-router-dom";
import type { Invoice, Quote, QuoteRequest, User } from "../models/model";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import InvoiceTable from "./InvoiceTable";
import QuotesTable from "./QuotesTable";
import EditDescriptionModal from "./EditQuotreRequestDescriptionModal";
import QuoteRequestTable from "./QuoteRequestTable";



const ClientDashboard = ({ user }: { user: User }) => {
    const navigate = useNavigate();

    // --- State Management ---
    const [currentTab, setCurrentTab] = useState<'billing' | 'requests' | 'active-offers' | 'declined-offers' | 'paid-offers'>('billing');
    const [loading, setLoading] = useState(true);

    // List Data
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [qrs, setQrs] = useState<QuoteRequest[]>([]);
    const [qs, setQs] = useState<Quote[]>([]);

    // ✅ LOGIC UPDATE: Analytics state to hold counts and totals independently of tab switching
    const [analytics, setAnalytics] = useState({
        unpaidBalance: 0,
        pendingRequests: 0,
        paidOffers: 0,
        activeOffers: 0,
        declinedOffers: 0
    });

    // Pagination
    const LIMIT = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    // Modal State
    const [editTarget, setEditTarget] = useState<{ id: string, desc: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');


    // ✅ LOGIC UPDATE: Fetch initial analytics once on mount
    // This ensures numbers are visible immediately regardless of which tab is active
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetching large sets or specialized count endpoints to populate the stats cards
                // TODO have an enpoint in backend that return the number of these in the backend instead of fetching the endpoints 
                const [invRes, qrRes, qRes] = await Promise.all([
                    api.get(`/customer/invoices?limit=1000`),
                    api.get(`/customer/quotes/my-requests?limit=1000`),
                    api.get(`/customer/quotes?limit=1000`)
                ]);

                const invs: Invoice[] = invRes.data.invoices || [];
                const requests: QuoteRequest[] = qrRes.data.quote_requests || [];
                const quotes: Quote[] = qRes.data.quotes || [];

                setAnalytics({
                    unpaidBalance: invs.reduce((acc, inv) => inv.status.toLowerCase() !== 'paid' ? acc + inv.total : acc, 0),
                    pendingRequests: requests.filter(r => r.status === 'pending').length,
                    paidOffers: quotes.filter(q => q.status === 'paid').length,
                    activeOffers: quotes.filter(q => q.status === 'sent' || q.status === 'accepted').length,
                    declinedOffers: quotes.filter(q => q.status === 'declined' || q.status === 'expired').length
                });
            } catch (err) {
                console.error("Analytics Sync Error:", err);
            }
        };
        fetchAnalytics();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoints: Record<string, string> = {
                'billing': `/customer/invoices`,
                'requests': `/customer/quotes/my-requests`,
                'active-offers': `/customer/quotes`,
                'declined-offers': `/customer/quotes`,
                'paid-offers': `/customer/quotes`
            };
            const res = await api.get(`${endpoints[currentTab]}?limit=${LIMIT}&offset=${offset}`);

            if (currentTab === 'billing') {
                setInvoices(res.data.invoices || []);
            } else if (currentTab === 'requests') {
                setQrs(res.data.quote_requests || []);
            } else {
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

    // Memoized Filters
    const filteredInvoices = useMemo(() => invoices.filter(inv =>
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||

        inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [invoices, searchQuery]);

    const filteredQrs = useMemo(() => qrs.filter(qr =>
        qr.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.description.toLowerCase().includes(searchQuery.toLowerCase())

    ), [qrs, searchQuery]);
    const filteredActiveQs = useMemo(() => qs.filter(q =>
        ['sent', 'accepted', 'in-review'].includes(q.status) ||
        q.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.notes.toLowerCase().includes(searchQuery.toLowerCase())

    ), [qs, searchQuery]);
    const filteredDeclinedQs = useMemo(() => qs.filter(q =>
        ['declined', 'expired'].includes(q.status) ||
        q.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.notes.toLowerCase().includes(searchQuery.toLowerCase())

    ), [qs, searchQuery]);
    const filteredPaidQs = useMemo(() => qs.filter(q =>
        ['paid'].includes(q.status) ||
        q.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.notes.toLowerCase().includes(searchQuery.toLowerCase())

    ), [qs, searchQuery]);



    // --- Tab Content Mapping ---
    const TabContent = {
        billing: (<InvoiceTable
            invoices={filteredInvoices}
            loading={loading}
            navigate={navigate}
            isadmin={user.role === "admin"}
        />),
        "active-offers": (
            <QuotesTable
                qs={filteredActiveQs}
                loading={loading}
                role={user.role}
                navigate={navigate}
                onUpdateStatus={() => { }}
            />
        ),
        "declined-offers": (
            <QuotesTable
                qs={filteredDeclinedQs}
                loading={loading}
                role={user.role}
                navigate={navigate}
                onUpdateStatus={() => { }}
            />
        ),
        "paid-offers": (
            <QuotesTable
                qs={filteredPaidQs}
                loading={loading}
                role={user.role}
                navigate={navigate}
                onUpdateStatus={() => { }}
            />
        ),
        requests: (
            <QuoteRequestTable
                qrs={filteredQrs}
                loading={loading}
                role={user.role}
                onEditDescription={(id, desc) => setEditTarget({ id, desc })}
            />
        ),
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <header className="px-4 sm:px-0 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="h-1 w-8  rounded-full"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Welcome Back {user.first_name}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4 sm:px-0">


                <div className="p-6  rounded-3xl border border-secondary hover:border-[#22D3EE] transition-all group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Unpaid Balance</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">
                        ₦{analytics.unpaidBalance.toLocaleString()}
                    </h3>
                </div>
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] transition-all group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1  group-hover:text-[#22D3EE]">Pending</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.pendingRequests}</h3>
                </div>
                <div className="p-6  rounded-3xl border border-secondary hover:border-[#22D3EE] transition-all group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Paid</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.paidOffers}</h3>
                </div>
                <div className="p-6  rounded-3xl border border-secondary hover:border-[#22D3EE] transition-all group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Active</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.activeOffers}</h3>
                </div>
                <div className="p-6  rounded-3xl border border-secondary hover:border-[#22D3EE] transition-all group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Expired</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.declinedOffers}</h3>
                </div>
            </div>


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

                            {['billing', 'requests', 'active-offers', 'paid-offers', 'declined-offers'].map((tab) => (
                                <option key={tab} value={tab} className="bg-neutral-900 text-white">
                                    {tab.replace('-', ' ')}
                                </option>
                            ))}
                        </select>

                    </div>

                    {/* DESKTOP: Tabs (Hidden on small screens) */}
                    <div className="hidden md:flex gap-6 overflow-x-auto w-full scrollbar-hide pb-0">
                        {(['billing', 'requests', 'active-offers', 'paid-offers', 'declined-offers'] as const).map((tab) => (
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

                {/* Content Container */}
                <div className=" md:min-h-[540px] min-h-[540px] overflow-hidden shadow-2xl mx-4 sm:mx-0">
                    {TabContent[currentTab]}
                </div>
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

export default ClientDashboard;