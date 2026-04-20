import api from "./axios";



export const fetchSignedUrl = async (object_key: string) => {
    const res = await api.get(`/storage/presign/${object_key}`);
    return res;
};