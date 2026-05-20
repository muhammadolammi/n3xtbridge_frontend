import { useNavigate } from "react-router-dom";
import type { CustomerAnalytics, Invoice, Quote, QuoteRequest, User } from "../models/model";
import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import InvoiceTable from "./InvoiceTable";
import QuotesTable from "./QuotesTable";
import EditDescriptionModal from "./EditQuotreRequestDescriptionModal";
import QuoteRequestTable from "./QuoteRequestTable";

// Define a type for our tabs to make configuration clean
type TabType = 'billing' | 'requests' | 'active-offers' | 'declined-offers' | 'paid-offers' | 'expired-offers';

const ClientDashboard = ({ user }: { user: User }) => {
    const navigate = useNavigate();

    // --- State Management ---
    const [currentTab, setCurrentTab] = useState<TabType>('billing');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Table Data
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);

    // Analytics Counter Stats
    const [analytics, setAnalytics] = useState<CustomerAnalytics>({
        unpaidBalance: 0,
        pendingRequests: 0,
        paidOffers: 0,
        activeOffers: 0,
        declinedOffers: 0,
        expiredOffers: 0
    });

    // Server-side Pagination
    const LIMIT = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    // Modal State
    const [editTarget, setEditTarget] = useState<{ id: string, desc: string } | null>(null);

    // --- 1. Fetch Analytics (Once on Mount) ---
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {

                const res = await api.get(`/customer/analytics`);
                setAnalytics(res.data);
            } catch (err) {
                console.error("Analytics Sync Error:", err);
            }
        };
        fetchAnalytics();
    }, []);

    // --- 2. Unified Server-Side Data Fetching ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Map tabs to endpoints
            const endpoints: Record<TabType, string> = {
                'billing': `/customer/invoices`,
                'requests': `/customer/quotes/my-requests`,
                'active-offers': `/customer/quotes`,
                'declined-offers': `/customer/quotes`,
                'expired-offers': `/customer/quotes`,
                'paid-offers': `/customer/quotes`
            };

            // Build structural query params for backend filtering
            const params = new URLSearchParams({
                limit: LIMIT.toString(),
                offset: offset.toString(),
                search: searchQuery
            });

            // Pass status queries straight to the server API instead of filtering client-side
            if (currentTab === 'active-offers') params.append('status', 'sent,accepted,in-review');
            if (currentTab === 'declined-offers') params.append('status', 'declined');
            if (currentTab === 'expired-offers') params.append('status', 'expired');
            if (currentTab === 'paid-offers') params.append('status', 'paid');

            const res = await api.get(`${endpoints[currentTab]}?${params.toString()}`);

            // Update respective states cleanly
            if (currentTab === 'billing') {
                setInvoices(res.data.invoices || []);
            } else if (currentTab === 'requests') {
                setQuoteRequests(res.data.quote_requests || []);
            } else {
                setQuotes(res.data.quotes || []);
            }

            setTotal(res.data.total || 0);
        } catch (err) {
            console.error("Data Sync Error:", err);
        } finally {
            setLoading(false);
        }
    }, [currentTab, offset, searchQuery]);

    // Fetch data when parameters alter
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle searching cleanly (resets page back to 0)
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setOffset(0);
    };

    // Handle tab switching cleanly
    const handleTabChange = (tab: TabType) => {
        setCurrentTab(tab);
        setSearchQuery('');
        setOffset(0);
    };

    // --- 3. Dynamic Render Mapping ---
    const renderTabContent = () => {
        switch (currentTab) {
            case 'billing':
                return <InvoiceTable invoices={invoices} loading={loading} navigate={navigate} isadmin={user.role === "admin"} />;
            case 'requests':
                return <QuoteRequestTable qrs={quoteRequests} loading={loading} role={user.role} onEditDescription={(id, desc) => setEditTarget({ id, desc })} />;
            case 'active-offers':
            case 'declined-offers':
            case 'paid-offers':
            case 'expired-offers':
                return <QuotesTable qs={quotes} loading={loading} role={user.role} navigate={navigate} onUpdateStatus={fetchData} />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <header className="px-4 sm:px-0 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="h-1 w-8 rounded-full bg-primary"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Welcome Back {user.first_name}
                    </span>
                </div>
            </header>

            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4 sm:px-0">
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] transition-all group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Unpaid Balance</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">₦{analytics.unpaidBalance.toLocaleString()}</h3>
                </div>
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] transition-all group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Pending Requests</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.pendingRequests}</h3>
                </div>
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] transition-all group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Paid Offers</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.paidOffers}</h3>
                </div>
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] transition-all group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Active Offers</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.activeOffers}</h3>
                </div>
                <div className="p-6 rounded-3xl border border-secondary hover:border-[#22D3EE] transition-all group">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 group-hover:text-[#22D3EE]">Expired Offers</p>
                    <h3 className="text-2xl font-black text-primary tracking-tighter">{analytics.expiredOffers}</h3>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-primary px-4 sm:px-0 pb-4 md:pb-0">

                    {/* MOBILE Dropdown */}
                    <div className="md:hidden w-full relative">
                        <select
                            value={currentTab}
                            onChange={(e) => handleTabChange(e.target.value as TabType)}
                            className="appearance-none w-full border border-primary text-[#22D3EE] rounded-xl px-4 py-3 font-black uppercase tracking-widest text-[11px] focus:outline-none"
                        >
                            {['billing', 'requests', 'active-offers', 'paid-offers', 'declined-offers', 'expired-offers'].map((tab) => (
                                <option key={tab} value={tab} className="bg-neutral-900 text-white">
                                    {tab.replace('-', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* DESKTOP Navigation */}
                    <div className="hidden md:flex gap-6 overflow-x-auto w-full scrollbar-hide pb-0">
                        {(['billing', 'requests', 'active-offers', 'paid-offers', 'declined-offers', 'expired-offers'] as const).map((tab) => (
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
                                onClick={() => setOffset(prev => prev - LIMIT)}
                                className="p-3 rounded-xl bg-secondary text-white disabled:opacity-20 hover:bg-[#22D3EE] transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <button
                                disabled={offset + LIMIT >= total || loading}
                                onClick={() => setOffset(prev => prev + LIMIT)}
                                className="p-3 border rounded-xl bg-secondary text-white disabled:opacity-20 hover:bg-[#22D3EE] transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Layout Render */}
                <div className="md:min-h-[540px] min-h-[540px] overflow-hidden shadow-2xl mx-4 sm:mx-0">
                    {renderTabContent()}
                </div>
            </div>

            {/* Description Modals */}
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