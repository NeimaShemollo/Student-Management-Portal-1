import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true
});

// A separate, clean instance specifically for token refreshing to avoid infinite loops
const refreshApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true
});

// Use sessionStorage (or localStorage) so refreshing the webpage doesn't break the token state
let dynamicToken = sessionStorage.getItem("accessToken") || null;

export const setGlobalAccessToken = (token) => {
    dynamicToken = token;
    if (token) {
        sessionStorage.setItem("accessToken", token);
    } else {
        sessionStorage.removeItem("accessToken");
    }
};

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        if (dynamicToken) {
            config.headers["Authorization"] = `Bearer ${dynamicToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. Existing Refresh Token Loop Prevention Bypass Tracker
        if (originalRequest.url?.includes("refresh-access-token")) {
            return Promise.reject(error);
        }

        // 🌟 2. THE CRITICAL BYPASS FIX: 
        // If the request came from viewing the course layout list or fetching student billing,
        // let the local page capture the error silently instead of kicking the browser to /login
        if (
            originalRequest.url?.includes("/course/view") || 
            originalRequest.url?.includes("/my-payments")
        ) {
            return Promise.reject(error); 
        }

        // 3. Your core 401 token extraction logic begins here...
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await refreshApi.post("/auth/refresh-access-token");
                const { accessToken } = res.data;

                setGlobalAccessToken(accessToken);

                if (window.__onTokenRefreshed) {
                    window.__onTokenRefreshed(accessToken);
                }

                originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                return api(originalRequest); 
            } catch (refreshError) {
                setGlobalAccessToken(null);
                localStorage.removeItem("user");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

