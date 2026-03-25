import { useState } from "react";

export default function InvoicePage() {
    const [items, setItems] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
    const addItem = () => {
        setItems([
            ...items,
            { description: "", qty: 1, price: 0 }
        ]);
    };
    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };
    const updateItem = (index: number, field: string, value: any) => {
        const updated = [...items];
        updated[index][field] = field === "description" ? value : Number(value);
        setItems(updated);
    };

    const addDiscount = () => {
        setDiscounts([
            ...discounts,
            { name: "", amount: 0 }
        ]);
    };

    const updateDiscount = (index: number, field: string, value: any) => {
        const updated = [...discounts];
        updated[index][field] = field === "name" ? value : Number(value);
        setDiscounts(updated);
    };

    const removeDiscount = (index: number) => {
        setDiscounts(discounts.filter((_, i) => i !== index));
    };

    const itemsTotal = items.reduce((acc, item) => {
        return acc + item.qty * item.price;
    }, 0);

    const discountTotal = discounts.reduce((acc, d) => {
        return acc + d.amount;
    }, 0);

    const total = itemsTotal - discountTotal;
    const validate = () => {
        if (items.length === 0) {
            alert("Add at least one item");
            return false;
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!item.description.trim()) {
                alert(`Item ${i + 1} must have a description`);
                return false;
            }

            if (item.qty <= 0) {
                alert(`Item ${i + 1} quantity must be greater than 0`);
                return false;
            }

            if (item.price < 0) {
                alert(`Item ${i + 1} price cannot be negative`);
                return false;
            }
        }

        for (let i = 0; i < discounts.length; i++) {
            const d = discounts[i];

            if (!d.name.trim()) {
                alert(`Discount ${i + 1} must have a name`);
                return false;
            }

            if (d.amount <= 0) {
                alert(`Discount ${i + 1} must be greater than 0`);
                return false;
            }
        }

        return true;
    };

    return (

        <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8">
            {/* <!-- Blueprint Background Pattern --> */}
            <div className="fixed inset-0 blueprint-grid pointer-events-none"></div>
            <div className="max-w-4xl mx-auto relative">
                <div className="h-10">

                </div>
                {/* <!-- Logo and Title --> */}
                {/* <div className="text-center mb-10">
                    <h1 className="text-2xl font-black text-secondary-dark tracking-tighter uppercase">N3xtbridge</h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-outline font-bold">Nexus Logic Blueprint Generator</p>
                </div> */}

                <form className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (!validate()) return;
                    }}>
                    {/* <!-- Header Card --> */}
                    <div className="bg-white border border-outline-variant/30 rounded-xl p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-3xl  font-black tracking-tight text-secondary-dark">Invoice Generation</h2>
                                <p className="text-on-surface-variant text-sm mt-1">Fill in the details below to generate a
                                    professional ledger entry.</p>
                            </div>

                        </div>
                    </div>
                    {/* <!-- Customer Details --> */}
                    <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-8 py-4 border-b border-outline-variant/30">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary-dark" data-icon="person">person</span>
                                <h3 className="font-bold tracking-tight text-sm uppercase">Customer Information</h3>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label
                                    className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">Customer
                                    Name</label>
                                <input
                                    className="w-full bg-slate-50 border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    placeholder="Legal Entity Name" required={true} type="text" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">Email
                                    Address</label>
                                <input
                                    className="w-full bg-slate-50 border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    placeholder="billing@domain.com" required={true} type="email" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">Phone
                                    Number</label>
                                <input
                                    className="w-full bg-slate-50 border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    placeholder="+234 9012345678" type="tel" />
                            </div>
                        </div>
                    </div>
                    {/* <!-- Line Items --> */}
                    <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-8 py-4 border-b border-outline-variant/30 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary-dark"
                                    data-icon="inventory_2">inventory_2</span>
                                <h3 className="font-bold tracking-tight text-sm uppercase">Service &amp; Item Specification</h3>
                            </div>
                            <button
                                className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
                                type="button"
                                onClick={addItem}
                            >

                                <span className="material-symbols-outlined text-[16px]" data-icon="add">add</span>
                                Add Line Item
                            </button>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th
                                            className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                                            Description</th>
                                        <th
                                            className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 w-24 text-center">
                                            Qty</th>
                                        <th
                                            className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 w-32 text-right">
                                            Unit Price</th>
                                        <th
                                            className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 w-32 text-right">
                                            Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-6 text-sm text-gray-400">
                                                No items yet — click "Add Line Item" to begin
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-8 py-4">
                                                    <input
                                                        // className="w-full bg-transparent border-0 p-0 text-sm focus:ring-0 font-medium text-secondary-dark"
                                                        className={`w-full bg-transparent border-0 p-0 text-sm focus:ring-0 font-medium ${!item.description ? "border-b border-red-400" : "text-secondary-dark"
                                                            }`}
                                                        type="text"
                                                        value={item.description}
                                                        placeholder="Item description (e.g Solar Panel)"
                                                        onChange={(e) => updateItem(index, "description", e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        className="w-full bg-transparent border-0 p-0 text-sm focus:ring-0 text-center"
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={(e) => updateItem(index, "qty", e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end">
                                                        <span className="text-xs text-outline mr-1">₦</span>
                                                        <input
                                                            className="w-32 bg-transparent border-0 p-0 text-sm focus:ring-0 text-right"
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updateItem(index, "price", e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <button
                                                        onClick={() => removeItem(index)}
                                                        className="text-error/60 hover:text-error transition-colors"
                                                        type="button"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* <!-- Footer Section: Discount & Notes --> */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-secondary-dark text-[20px]"
                                    data-icon="sticky_note_2">sticky_note_2</span>
                                <h3 className="font-bold tracking-tight text-xs uppercase">Internal Notes </h3>
                            </div>
                            <textarea
                                className="w-full bg-slate-50 border border-outline-variant/50 rounded-lg p-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                                placeholder="Enter specific instructions or payment terms for this invoice..."
                                rows={4}></textarea>
                        </div>
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-secondary-dark text-[20px]"
                                        data-icon="sell">sell</span>
                                    <h3 className="font-bold tracking-tight text-xs uppercase">Adjustments</h3>
                                </div>
                                <div className="space-y-3 flex flex-col">
                                    {discounts.length === 0 && (
                                        <p className="text-xs text-gray-400">No discounts applied</p>
                                    )}

                                    {discounts.map((d, index) => (
                                        <div key={index} className="flex gap-2 items-center w-full">
                                            <input
                                                type="text"
                                                placeholder="Discount name (e.g Promo)"
                                                value={d.name}
                                                onChange={(e) => updateDiscount(index, "name", e.target.value)}
                                                className="flex-1 min-w-0 bg-slate-50 border border-outline-variant/50 rounded-lg px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={d.amount}
                                                onChange={(e) => updateDiscount(index, "amount", e.target.value)}
                                                className="w-24 shrink-0 bg-slate-50 border border-outline-variant/50 rounded-lg px-3 py-2 text-sm text-right"
                                            />
                                            <button
                                                onClick={() => removeDiscount(index)}
                                                type="button"
                                                className="text-error/60 hover:text-error"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addDiscount}
                                        className="self-start mt-2 text-[11px] font-bold uppercase text-primary hover:opacity-80"
                                    >
                                        + Add Discount
                                    </button>
                                </div>
                            </div>
                            <div className="bg-secondary-dark text-white rounded-xl p-6 shadow-lg">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Estimated
                                        Total</span>
                                </div>
                                <div className="text-3xl font-black tracking-tighter mb-4">

                                    ₦{total.toLocaleString()}
                                </div>
                                <button
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98]"
                                    type="submit">
                                    <span className="material-symbols-outlined text-[18px]"
                                        data-icon="picture_as_pdf">picture_as_pdf</span>
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

            </div>
        </div>
    );
}