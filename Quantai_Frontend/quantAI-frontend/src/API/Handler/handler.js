import axios, { isAxiosError } from "axios";
import {
    VITE_API_URL
} from "../../config";


const getBaseURL = () => {
    if (import.meta.env && import.meta.env.DEV) {
        return "";
    }
    return VITE_API_URL || "";
};

const axiosAuthenticated = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosAuthenticated.interceptors.request.use(
    async (request) => {
        /* --------------------------------------
           USE TOKEN FROM LOCALSTORAGE (RECEIVED FROM LOGIN)
        ---------------------------------------*/
        let token = localStorage.getItem("access_token");

        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }

        if (request.data && !request.headers["Content-Type"]) {
            request.headers["Content-Type"] = "application/json";
        }
        return request;
    },
    async (err) => await Promise.reject(err)
);

axiosAuthenticated.interceptors.response.use(
    (res) => res.data,
    async (err) => {
        if (isAxiosError(err)) {
            if (!err.response) {
                const errorMessage = err.message || "Network Error";
                const isConnectionError =
                    errorMessage.includes("ECONNREFUSED") ||
                    errorMessage.includes("Network Error") ||
                    errorMessage.includes("timeout") ||
                    errorMessage.includes("ERR_NETWORK");

                if (isConnectionError) {
                    console.error("Network Error: Unable to connect to the server.", {
                        message: errorMessage,
                        url: err.config?.url,
                        method: err.config?.method,
                        baseURL: err.config?.baseURL,
                        suggestion: "Please ensure the backend server is running and accessible.",
                    });
                    const networkError = new Error(
                        "Unable to connect to the server. Please check if the backend server is running."
                    );
                    networkError.response = {
                        status: 0,
                        data: {
                            detail:
                                "Network Error: Unable to connect to the server. Please ensure the backend is running.",
                            message: errorMessage,
                            isNetworkError: true,
                        },
                    };
                    networkError.config = err.config;
                    return await Promise.reject(networkError);
                }
            }

            const status = err.response?.status;
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.response?.data?.detail ||
                err.message;
            const errorData = err.response?.data;
            switch (status) {
                case 400:
                    console.error(`Error 400: ${message}`, errorData);
                    break;
                case 500:
                    console.error("Error 500: Internal Server Error", {
                        message: message,
                        data: errorData,
                        url: err.config?.url,
                        method: err.config?.method,
                        fullUrl: `${err.config?.baseURL}${err.config?.url}`,
                    });
                    break;
                case 401:
                    localStorage.removeItem("access_token");
                    if (window.location.pathname !== "/login") {
                        window.location.href = "/login";
                    }
                    break;
                case 404:
                    console.error("Error 404: Request Not Found", {
                        url: err.config?.url,
                        method: err.config?.method,
                        fullUrl: `${err.config?.baseURL}${err.config?.url}`,
                        data: errorData,
                    });
                    break;
                default:
                    console.error(`Error ${status}: ${message}`, {
                        data: errorData,
                        url: err.config?.url,
                        method: err.config?.method,
                    });
                    break;
            }
        } else {
            console.error("Non-Axios Error:", err);
        }
        return await Promise.reject(err);
    }
);


// API helpers
export const axiosGet = async (url, params) => await axiosAuthenticated.get(url, { params });
export const axiosPost = async (url, data, header) => await axiosAuthenticated.post(url, data, header);
export const axiosPut = async (url, data) => await axiosAuthenticated.put(url, data);
export const axiosPatch = async (url, data) => await axiosAuthenticated.patch(url, data);
export const axiosDelete = async (url) => await axiosAuthenticated.delete(url);
