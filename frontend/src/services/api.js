import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Products
export const productService = {
  getAll: () => api.get("/products").then((r) => r.data),
  getById: (id) => api.get(`/products/${id}`).then((r) => r.data),
  create: (data) => api.post("/products", data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Customers
export const customerService = {
  getAll: () => api.get("/customers").then((r) => r.data),
  getById: (id) => api.get(`/customers/${id}`).then((r) => r.data),
  create: (data) => api.post("/customers", data).then((r) => r.data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Orders
export const orderService = {
  getAll: () => api.get("/orders").then((r) => r.data),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => api.post("/orders", data).then((r) => r.data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Dashboard
export const dashboardService = {
  getStats: () => api.get("/dashboard").then((r) => r.data),
};

export default api;
