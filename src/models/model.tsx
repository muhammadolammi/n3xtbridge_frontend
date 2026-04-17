

export interface Discount {
    name: string;
    amount: string;
    type: 'fixed' | 'percentage' | 'item_match';
    description: string;
    item_name: string;
}
export interface Item {
    name: string;
    price: string;
    description?: string;
    quantity: number;
}

export interface Invoice {
    id: string;
    quote_id?: string;
    deleted_at?: any;
    invoice_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    items: Item[];
    discounts: Discount[];
    total: number;
    notes: string;
    status: string;
    created_at: string;
    reminder_sent_at: string;
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
    promo_ids: string[];
    active_promotions?: Promotion[];
    min_price: string
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
    promo_ids: string[];
    status: 'pending' | 'reviewing' | 'quoted' | 'rejected';
    created_at: string; // Dates come as ISO strings from the Go JSON encoder
    updated_at: string;
    user_email?: string;
    user_name?: string;
    service_name?: string;
}





export interface QuoteBreakdown {

    name: string;
    price: string;
    quantity: number;
    description: string
}
export interface Quote {
    id: string;
    service_name?: string;
    quote_request_id: string;
    service_id?: string;
    user_id?: string;
    amount: string;
    breakdown: QuoteBreakdown[];
    discounts: Discount[]
    notes: string;
    promo_ids: string[];

    status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | "in-review" | "paid";
    created_at: string;
    expires_at: string;
    updated_at: string;

}


export interface Promotion {
    id: string;
    code: string;
    name: string;
    description: { String: string; Valid: boolean };
    breakdown: Discount[];
    is_active: boolean;
    starts_at: string;
    expires_at: string;
    created_at: string;
}