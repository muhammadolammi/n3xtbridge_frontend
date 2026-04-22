import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
    withCredentials: true,
    headers: {
        "client-api-key": import.meta.env.VITE_CLIENT_API_KEY,
    },
});


let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.map((cb) => cb(token));
    refreshSubscribers = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthRequest = originalRequest.url?.includes('/auth/signin') ||
            originalRequest.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {

            if (isRefreshing) {
                // WAIT for the existing refresh to finish
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {}, {
                    withCredentials: true,
                    headers: { "client-api-key": import.meta.env.VITE_CLIENT_API_KEY }
                });

                const { access_token } = res.data;
                isRefreshing = false;
                onRefreshed(access_token); // Tell everyone waiting that we have the token

                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;