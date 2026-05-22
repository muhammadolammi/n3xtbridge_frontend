import { useNavigate, useSearchParams } from "react-router-dom";
import type { AdminAnalytics, Invoice, Promotion, Quote, QuoteRequest, Service, User } from "../models/model";
import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import InvoiceTable from "./InvoiceTable";
import QuoteRequestTable from "./QuoteRequestTable";
import QuotesTable from "./QuotesTable";
import ServicesTable from "./ServicesTable";
import PromotionsTable from "./PromotionsTable";
import CreateServiceModal from "./CreateServiceModal";
import CreateQuoteModal from "./CreateQuoteModal";
import CreatePromotionModal from "./CreatePromotionModal";

type TabType = 'invoices' | 'services' | 'quote-requests' | 'quotes' | 'promotions';

const AdminDashboard = ({ user }: { user: User }) => {
    const navigate = useNavigate();

    // --- State Management ---
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = (searchParams.get('tab') as TabType) || 'invoices';
    const [loading, setLoading] = useState(true);
    const searchQuery = searchParams.get('search') || '';
    // Modals
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

    // Dynamic Data Collections
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);

    // Global Command Stats
    const [analytics, setAnalytics] = useState<AdminAnalytics>({
        totalRevenue: 0,
        pendingRequests: 0,
        activeQuotes: 0,
        totalServices: 0,
        activePromos: 0
    });

    // Server-side Pagination
    const LIMIT = 10;
    const offset = Number(searchParams.get('offset') || 0);
    const [total, setTotal] = useState(0);

    // --- 1. Fetch Global System Analytics (Once on Mount) ---
    const fetchSystemStats = useCallback(async () => {
        try {
            const response = await api.get('/admin/analytics');
            const data = response.data;

            setAnalytics({
                totalRevenue: data.total_revenue || 0,
                pendingRequests: data.pending_requests || 0,
                activeQuotes: data.active_quotes || 0,
                totalServices: data.total_services || 0,
                activePromos: data.active_promos || 0
            });
        } catch (err) {
            console.error("Command Stats Sync Error:", err);
        }
    }, []);

    useEffect(() => {
        fetchSystemStats();
    }, [fetchSystemStats]);

    // --- 2. Unified, Paginated, & Searchable Data Engine ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const endpoints: Record<TabType, string> = {
                'invoices': `/admin/invoices`,
                'services': `/admin/services`,
                'quote-requests': `/admin/quote-requests`,
                'quotes': `/admin/quotes`,
                'promotions': `/admin/promotions`
            };

            // Compile clean URL Search Params for backend consumption
            const params = new URLSearchParams({
                limit: LIMIT.toString(),
                offset: offset.toString(),
                search: searchQuery.trim()
            });

            const res = await api.get(`${endpoints[currentTab]}?${params.toString()}`);

            // Direct mapping without mixing array updates
            if (currentTab === 'invoices') setInvoices(res.data.invoices || []);
            else if (currentTab === 'services') setServices(res.data.services || []);
            else if (currentTab === 'quote-requests') setQuoteRequests(res.data.quote_requests || []);
            else if (currentTab === 'quotes') setQuotes(res.data.quotes || []);
            else if (currentTab === 'promotions') setPromotions(res.data.promotions || []);

            setTotal(res.data.total || 0);
        } catch (err) {
            console.error("Registry Sync Error:", err);
        } finally {
            setLoading(false);
        }
    }, [currentTab, offset, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- 3. Event Handling Refreshes ---
    const handleTogglePromoStatus = async (id: string, current: boolean) => {
        try {
            await api.patch(`/admin/promotions/${id}/status`, { is_active: !current });
            setPromotions(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
            fetchSystemStats(); // Sync banner counter top display
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleActive = async (id: string, status: boolean) => {
        try {
            await api.patch(`/admin/services/${id}/status`, { is_active: !status });
            setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !status } : s));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateQuoteStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/admin/quotes/${id}/status`, { status: newStatus });
            setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus as any } : q));
            fetchSystemStats(); // Sync banner counter top display
        } catch (err) {
            console.error(err);
        }
    };
    const updateOffset = (value: number) => {
        const params = new URLSearchParams(searchParams);

        params.set('offset', value.toString());

        setSearchParams(params);
    };

    const handleTabChange = (tab: TabType) => {
        const params = new URLSearchParams(searchParams);

        params.set('tab', tab);
        params.set('offset', '0');
        params.set('search', '');
        setSearchParams(params);



        setTotal(0);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const params = new URLSearchParams(searchParams);

        params.set('search', e.target.value);
        params.set('offset', '0');

        setSearchParams(params);
    };

    // --- 4. Content Dynamic Mapping ---
    const renderTabContent = () => {
        switch (currentTab) {
            case 'invoices':
                return <InvoiceTable invoices={invoices} loading={loading} navigate={navigate} isadmin={user.role === "admin"} />;
            case 'services':
                return <ServicesTable services={services} loading={loading} onToggle={handleToggleActive} />;
            case 'quote-requests':
                return <QuoteRequestTable qrs={quoteRequests} loading={loading} onAddQuote={setSelectedQuote} role={user.role} />;
            case 'quotes':
                return <QuotesTable qs={quotes} loading={loading} onUpdateStatus={handleUpdateQuoteStatus} navigate={navigate} role={user.role} />;
            case 'promotions':
                return <PromotionsTable promos={promotions} loading={loading} onToggleStatus={handleTogglePromoStatus} />;
            default:
                return null;
        }
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
                    <button onClick={() => setIsServiceModalOpen(true)} className="flex-1 lg:flex-none bg-secondary text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#22D3EE] transition-all flex items-center justify-center gap-2">
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
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Total Yield</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">₦{analytics.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Quote Requests</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.pendingRequests}</h3>
                </div>
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Active Quotes</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.activeQuotes}</h3>
                </div>
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Services</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.totalServices}</h3>
                </div>
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Live Promos</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.activePromos}</h3>
                </div>
            </div>

            {/* Sub-Navigation & Filters */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-primary px-4 sm:px-0 pb-4 md:pb-0">

                    {/* MOBILE: Dropdown */}
                    <div className="md:hidden w-full relative">
                        <select
                            value={currentTab}
                            onChange={(e) => handleTabChange(e.target.value as TabType)}
                            className="appearance-none w-full border border-primary text-[#22D3EE] rounded-xl px-4 py-3 font-black uppercase tracking-widest text-[11px] focus:outline-none"
                        >
                            {['invoices', 'services', 'quote-requests', 'quotes', 'promotions'].map((tab) => (
                                <option key={tab} value={tab} className="bg-neutral-900 text-white">
                                    {tab.replace('-', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* DESKTOP: Tabs */}
                    <div className="hidden md:flex gap-6 overflow-x-auto w-full scrollbar-hide pb-0">
                        {(['invoices', 'services', 'quote-requests', 'quotes', 'promotions'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative ${currentTab === tab ? 'text-[#22D3EE] ' : 'text-primary hover:text-[#22D3EE]'}`}
                            >
                                {tab.replace('-', ' ')}
                                {currentTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#22D3EE] rounded-full"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto pb-6 xl:pb-4">
                        <div className="relative w-full sm:w-64 group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
                            <input
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search..."
                                className="w-full pl-12 pr-4 py-3 border border-secondary rounded-2xl text-xs font-bold text-text outline-none focus:border-[#22D3EE] transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={offset === 0 || loading}
                                onClick={() => updateOffset(offset - LIMIT)}
                                className="p-3 rounded-xl bg-secondary text-white disabled:opacity-20 hover:bg-[#22D3EE] transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <button
                                disabled={offset + LIMIT >= total || loading}
                                onClick={() => updateOffset(offset + LIMIT)}
                                className="p-3 border rounded-xl bg-secondary text-white disabled:opacity-20 hover:bg-[#22D3EE] transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Terminal */}
                <div className="md:min-h-[540px] min-h-[540px] shadow-2xl mx-4 sm:mx-0 relative">
                    {renderTabContent()}
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