import api from "./axios"



export const makePayment = async (invoiceID: string) => {
    // console.log(invoiceID)
    const res = await api.post(`/customer/payments/${invoiceID}`);
    return res.data.checkout_url;
};

export const verifyPayment = async (reference: string) => {
    const res = await api.get(`/customer/payments/verify/${reference}`);
    return res.data; // Should return { status: 'success' | 'pending' | 'failed' }
};