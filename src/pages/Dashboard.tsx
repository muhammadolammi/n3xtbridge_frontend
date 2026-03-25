import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Invoice } from '../models/model';
import { useNavigate } from 'react-router-dom';



const Dashboard = () => {
    const navigate = useNavigate();

    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await api.get('/invoices?limit=10&offset=0');
                setInvoices(res.data || []);
            } catch (err) {
                console.error("Failed to load invoices", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Enterprise Console</h1>
                        <p className="text-gray-500 font-mono text-sm uppercase mt-1">
                            Welcome back, <span className="text-primary font-bold">{user?.first_name}</span>
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Status</p>
                        <p className="text-xs text-green-500 font-mono flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Operational
                        </p>
                    </div>
                </header>

                {/* Invoice Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Recent Infrastructure Invoices</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                    <th className="px-6 py-4">ID / Reference</th>
                                    <th className="px-6 py-4">Customer Email</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-10 text-center text-gray-400">Syncing with server...</td></tr>
                                ) : invoices.length === 0 ? (
                                    <tr><td colSpan={4} className="p-10 text-center text-gray-400">No invoices found.</td></tr>
                                ) : (
                                    invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-gray-600">{inv.invoice_number}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold  }`}>
                                                    {inv.customer_email}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                ₦{inv.total.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        navigate(`/dashboard/view-invoice/${inv.id}`, { state: { invoice: inv } });

                                                    }}
                                                    className="text-primary hover:underline text-xs font-bold uppercase tracking-tighter">View</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;