import api from "./axios"


export const makePayment = async (invoiceID: string, token?: string | null) => {
    // Construct the URL. If a token exists, append it as a query param.
    const url = token
        ? `/payments/${invoiceID}?token=${encodeURIComponent(token)}`
        : `/payments/${invoiceID}`;

    const res = await api.post(url);
    // The backend InitializePaymentHandler returns { checkout_url: "..." }
    return res.data.checkout_url;
};

export const verifyPayment = async (reference: string) => {
    const res = await api.get(`/payments/verify/${reference}`);
    return res.data.status; // Should return { status: 'success' | 'pending' | 'failed' }
};