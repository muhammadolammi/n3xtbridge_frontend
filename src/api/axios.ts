import axios from 'axios';



const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true, // CRITICAL for Cross-Origin Cookies
    headers: {
        "client-api-key": import.meta.env.VITE_CLIENT_API_KEY,
    },
});


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried to refresh this specific request yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call the "naked" refresh endpoint
                const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
                const { access_token } = res.data;

                // Update the failed request with the new Bearer token
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, the session is dead (Revoked or Expired)
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;