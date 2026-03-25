
export interface Invoice {
    id: string;
    invoice_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    items: Array<{ name: string; quantity: number; price: number; }>;
    discounts: Array<{ name: string; amount: number; }>;
    total: number;
    notes: string;
    created_at: string;
}