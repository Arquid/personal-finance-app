import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:4000/api" });

export const getAccounts = () => api.get("/accounts").then((r) => r.data);
export const createAccount = (data) => api.post("/accounts", data).then((r) => r.data);

export const getTransactions = (params) =>
  api.get("/transactions", { params }).then((r) => r.data);
export const createTransaction = (data) =>
  api.post("/transactions", data).then((r) => r.data);
export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data).then((r) => r.data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`).then((r) => r.data);
export const importTransactions = (formData) =>
  api.post("/transactions/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const getBudgets = () => api.get("/budgets").then((r) => r.data);
export const createBudget = (data) => api.post("/budgets", data).then((r) => r.data);
export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data).then((r) => r.data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`).then((r) => r.data);

export const getPots = () => api.get("/pots").then((r) => r.data);
export const createPot = (data) => api.post("/pots", data).then((r) => r.data);
export const updatePot = (id, data) => api.put(`/pots/${id}`, data).then((r) => r.data);
export const deletePot = (id) => api.delete(`/pots/${id}`).then((r) => r.data);
export const depositToPot = (id, amount) =>
  api.post(`/pots/${id}/deposit`, { amount }).then((r) => r.data);
export const withdrawFromPot = (id, amount) =>
  api.post(`/pots/${id}/withdraw`, { amount }).then((r) => r.data);

export const getRecurringBills = () => api.get("/recurring-bills").then((r) => r.data);
export const detectRecurringBills = () =>
  api.get("/recurring-bills/detect").then((r) => r.data);
export const createRecurringBill = (data) =>
  api.post("/recurring-bills", data).then((r) => r.data);
export const updateRecurringBill = (id, data) =>
  api.put(`/recurring-bills/${id}`, data).then((r) => r.data);
export const deleteRecurringBill = (id) =>
  api.delete(`/recurring-bills/${id}`).then((r) => r.data);

export const getOverview = () => api.get("/reports/overview").then((r) => r.data);
export const getSpendingByCategory = () =>
  api.get("/reports/spending-by-category").then((r) => r.data);
export const getBudgetVsActual = () => api.get("/reports/budget-vs-actual").then((r) => r.data);
export const getLatestByCategory = () =>
  api.get("/reports/latest-by-category").then((r) => r.data);
export const getMonthlyTrend = () => api.get("/reports/monthly-trend").then((r) => r.data);

export const getCategories = () => api.get("/categories").then((r) => r.data);
export const createCategory = (data) => api.post("/categories", data).then((r) => r.data);

export default api;