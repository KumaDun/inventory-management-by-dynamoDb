import axios from "axios";

export const api = axios.create({
    // Local
    // baseURL: "http://localhost:5000/api",
    // Online
    baseURL: "http://inventory-management-system-env.eba-fiteiyeq.us-east-1.elasticbeanstalk.com/api",
    headers: {
        "Content-Type": "application/json",
    }
})