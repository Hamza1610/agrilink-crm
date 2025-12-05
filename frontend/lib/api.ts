import axios from "axios";
import { data } from "framer-motion/client";

// Get API URL from environment variable or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            if (typeof window !== "undefined") {
                window.location.href = "/auth/login";
            }
        }
        return Promise.reject(error);
    }
);

// API Types
export interface LoginRequest {
    phone_number: string;
    user_type: "farmer" | "buyer" | "admin";
    language_preference?: "english" | "hausa";
}

export interface VerifyOTPRequest {
    phone_number: string;
    otp_code: string;
}

export interface User {
    id: string;
    phone_number: string;
    user_type: "farmer" | "buyer" | "admin";
    language_preference: "english" | "hausa";
    village?: string;
    created_at: string;
    reliability_score?: number;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

// Auth API functions
export const authApi = {
    requestOTP: (data: LoginRequest) =>
        apiClient.post("/auth/otp-request", data),

    verifyOTP: async (data: VerifyOTPRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/auth/verify-otp", data);
        // Store token and user in localStorage
        if (response.data.access_token) {
            localStorage.setItem("auth_token", response.data.access_token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },
};

// Produce API types
export interface Produce {
    id: string;
    farmer_id: string;
    farmer_name?: string;
    crop_type: string;
    quantity_kg: number;
    harvest_date: string;
    quality_indicators?: string[];
    expected_price_per_kg?: number;
    price_per_kg?: number;
    status: "available" | "reserved" | "sold";
    created_at: string;
    distance_km?: number;
    farmer_reliability_score?: number;
}

export interface CreateProduceRequest {
    crop_type: string;
    quantity_kg: number;
    harvest_date: string;
    expected_price_per_kg: number;
    location: string;
    expires_at?: string;
    quality_indicators?: string[];
}

// Produce API functions
export const produceApi = {
    list: (params?: Record<string, any>) =>
        apiClient.get<Produce[]>("/produce", { params }).then(response => ({
            data: { items: response.data, total: response.data.length }
        })),

    create: (data: CreateProduceRequest) => {
        console.log("Produce data: ", data)
        apiClient.post<Produce>("/produce", data)
    },
    get: (id: string) =>
        apiClient.get<Produce>(`/produce/${id}`),
};

// Transaction API types
export interface Transaction {
    id: string;
    produce_id: string;
    farmer_id: string;
    buyer_id: string;
    status: "matched" | "payment_pending" | "paid" | "in_transit" | "completed" | "cancelled";
    total_amount: number;
    agreed_price_per_kg?: number;
    created_at: string;
    payment_link?: string;
}

export interface CreateTransactionRequest {
    produce_id: string;
    buyer_id: string;
    agreed_price_per_kg: number;
    pickup_time?: string;
}

// Transaction API functions
export const transactionApi = {
    list: (params?: Record<string, any>) =>
        apiClient.get<{ items: Transaction[]; total: number }>("/transactions", { params }),

    create: (data: CreateTransactionRequest) =>
        apiClient.post<Transaction>("/transactions/match", data),

    get: (id: string) =>
        apiClient.get<Transaction>(`/transactions/${id}`),
};

// Export default apiClient for custom requests
export default apiClient;
