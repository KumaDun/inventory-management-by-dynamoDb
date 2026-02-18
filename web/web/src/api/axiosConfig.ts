import axios from "axios";

export const api = axios.create({
    // Local
    // baseURL: "http://localhost:5000/api",
    // Online
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    }
})