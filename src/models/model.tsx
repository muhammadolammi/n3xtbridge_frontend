
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
    status: string;
    created_at: string;
}
export interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    image: string;
    is_featured: boolean;
    is_active: boolean;
    tags?: string[];
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: { String: string; Valid: boolean } | null;
    address: { String: string; Valid: boolean } | null;
    role: string;
    created_at?: { Time: string; Valid: boolean } | null;
}
export interface QuoteRequest {
    id: string;
    user_id?: string;
    quote_id?: string;
    service_id: string;
    description: string;
    attachments: string[];
    status: 'pending' | 'reviewing' | 'quoted' | 'rejected';
    created_at: string; // Dates come as ISO strings from the Go JSON encoder
    updated_at: string;
    user_email?: string;
    user_name?: string;
    service_name?: string;
}





export interface QuoteBreakdown {

    name: string;
    cost: string;
    quantity: number;
    description: string
}
export interface Quote {

    id: string;
    service_name?: string;
    quote_request_id: string;
    service_id?: string;
    amount: string;
    breakdown: QuoteBreakdown[];
    notes: string;
    status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | "in-review";
    created_at: string;
    expires_at: string;
    updated_at: string;

}