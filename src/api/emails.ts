import api from "./axios";


export const sendInvoiceMail = async (id: string) => {
    const res = await api.post(`/admin/mail/invoices/${id}`);
    return res;
};