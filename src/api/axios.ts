import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
    withCredentials: true,
    headers: {
        "client-api-key": import.meta.env.VITE_CLIENT_API_KEY,
    },
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. Skip redirect if the request itself was a login or refresh attempt
        // We don't want to redirect to /signin if the /signin call just failed!
        const isAuthRequest = originalRequest.url?.includes('/auth/signin') ||
            originalRequest.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            try {
                // Use a standard axios instance for refresh to avoid interceptor loops
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {}, {
                    withCredentials: true,
                    headers: { "client-api-key": import.meta.env.VITE_CLIENT_API_KEY }
                });

                const { access_token } = res.data;

                // Update the failed request and retry
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Only redirect if the refresh actually fails AND we aren't already on the signin page
                // if (window.location.pathname !== '/signin') {
                //     window.location.href = '/signin';
                // }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;