const PromotionsTable = ({
    promos,
    loading,
    onToggleStatus
}: {
    promos: Promotion[],
    loading: boolean,
    onToggleStatus: (id: string, current: boolean) => void
}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-6 py-4">Campaign Node</th>
                    <th className="px-6 py-4">Promo Code</th>
                    <th className="px-6 py-4">Breakdown (Templates)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Validity</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Accessing Campaign Registry...</td></tr>
                ) : promos.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400">No active promotions found.</td></tr>
                ) : (
                    promos.map((p) => {
                        const isExpired = p.expires_at?.Valid && new Date(p.expires_at.Time) < new Date();

                        return (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-mono truncate max-w-[150px]">
                                        {p.description.String || "No description set"}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-primary font-black">
                                        {p.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {p.breakdown.map((d, idx) => (
                                            // Inside the p.breakdown.map in PromotionsTable
                                            <span className="text-[8px] font-black bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded uppercase">
                                                {d.type === 'item_match' ? `Free: ${d.item_name}` :
                                                    d.type === 'percentage' ? `${d.amount}%` : `₦${Number(d.amount).toLocaleString()}`}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onToggleStatus(p.id, p.is_active)}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider transition-all ${p.is_active && !isExpired ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                    >
                                        <span className={`w-1 h-1 rounded-full ${p.is_active && !isExpired ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {isExpired ? 'Expired' : p.is_active ? 'Active' : 'Disabled'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="text-[10px] font-bold text-gray-900">{new Date(p.starts_at).toLocaleDateString()}</p>
                                    <p className="text-[9px] text-gray-400 uppercase">TO {p.expires_at?.Valid ? new Date(p.expires_at.Time).toLocaleDateString() : 'INF'}</p>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    </div>
);



const CreatePromotionModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        is_active: true,
        starts_at: new Date().toISOString().split('T')[0],
        expires_at: ''
    });

    const [discounts, setDiscounts] = useState<Discount[]>([
        { name: '', amount: "", type: 'fixed', description: '', item_name: "" }
    ]);

    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch existing services to populate the dropdown
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/admin/services?limit=100');
                setAvailableServices(res.data.services || []);
            } catch (err) { console.error("Failed to fetch service registry"); }
        };
        fetchServices();
    }, []);

    const handleAddDiscount = () => {
        setDiscounts([...discounts, { name: '', amount: "", type: 'fixed', description: '', item_name: "" }]);
    };

    const updateDiscount = (index: number, field: keyof Discount, value: any) => {
        const updated = [...discounts];

        // Logic: If user picks 'service_match', we default the name and set amount to 0
        if (field === 'type' && value === 'item_match') {
            updated[index].amount = "0";
        }

        updated[index] = { ...updated[index], [field]: value };
        setDiscounts(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                breakdown: discounts,
                starts_at: new Date(formData.starts_at).toISOString(),
                expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
            };
            await api.post('/admin/promotions', payload);
            onSuccess();
            onClose();
        } catch (err) { alert("Deployment failed"); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-black uppercase tracking-tighter text-lg">Configure Campaign Logic</h3>
                    <button onClick={onClose} className="material-symbols-outlined text-gray-400">close</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
                    {/* Basic Info (Code, Name) - Keep same as before */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Promo Code</label>
                            <input required className="w-full border-b border-gray-100 focus:border-primary outline-none py-2 text-sm font-bold uppercase"
                                value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Campaign Name</label>
                            <input required className="w-full border-b border-gray-100 focus:border-primary outline-none py-2 text-sm font-bold"
                                onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Discount Components</label>
                        {discounts.map((d, index) => (
                            <div key={index} className="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-4">
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-12 md:col-span-4">
                                        <label className="text-[8px] font-bold text-amber-600 uppercase">Discount Label</label>
                                        <input required placeholder="e.g. Service Waived" className="w-full bg-transparent border-b border-amber-200 py-1 text-xs font-bold outline-none"
                                            value={d.name} onChange={e => updateDiscount(index, 'name', e.target.value)} />
                                    </div>
                                    <div className="col-span-6 md:col-span-4">
                                        <label className="text-[8px] font-bold text-amber-600 uppercase">Benefit Type</label>
                                        <select className="w-full bg-transparent border-b border-amber-200 py-1 text-xs font-bold outline-none"
                                            value={d.type} onChange={e => updateDiscount(index, 'type', e.target.value)}>
                                            <option value="fixed">Fixed (₦)</option>
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="service_match">Free Service Fee</option>
                                        </select>
                                    </div>

                                    {/* DYNAMIC INPUT: Show Amount OR Service Selector */}
                                    <div className="col-span-6 md:col-span-4">
                                        <label className="text-[8px] font-bold text-amber-600 uppercase">
                                            {d.type === 'item_match' ? 'Target Service' : 'Discount Value'}
                                        </label>
                                        {d.type === 'item_match' ? (
                                            <select
                                                required
                                                className="w-full bg-transparent border-b border-amber-200 py-1 text-xs font-bold outline-none text-primary"
                                                value={d.item_name}
                                                onChange={e => updateDiscount(index, 'item_name', e.target.value)}
                                            >
                                                <option value="">Select Service...</option>
                                                {availableServices.map(s => (
                                                    <option key={s.id} value={s.name}>{s.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input required type="number" placeholder="Value" className="w-full bg-transparent border-b border-amber-200 py-1 text-xs font-bold outline-none text-amber-700"
                                                value={d.amount} onChange={e => updateDiscount(index, 'amount', e.target.value)} />
                                        )}
                                    </div>
                                </div>

                                {d.type !== 'item_match' && (
                                    <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-amber-100">
                                        <span className="material-symbols-outlined text-xs text-amber-500">target</span>
                                        <input
                                            placeholder="Optional: Target Item Name Match"
                                            className="bg-transparent w-full text-[10px] font-bold uppercase outline-none"
                                            value={d.item_name}
                                            onChange={e => updateDiscount(index, 'item_name', e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddDiscount} className="w-full py-3 border-2 border-dashed border-amber-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-50 transition-all">+ Add Component</button>
                    </div>

                    {/* ... Rest of the form (Dates, Description, Button) ... */}
                    <button disabled={loading} className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                        {loading ? "Deploying..." : "Deploy Campaign Node"}
                    </button>
                </form>
            </div>
        </div>
    );
};
