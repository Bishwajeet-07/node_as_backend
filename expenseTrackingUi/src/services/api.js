// API client with interceptors for Expense Tracker & Group Splitter

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api"

/**
 * Event target for broadcast auth events (e.g. 401 Unauthorized)
 */
export class AuthEvents extends EventTarget {}
export const authEvents = new AuthEvents()

/**
 * Request Interceptors Pipeline
 */
function applyRequestInterceptors(endpoint, options = {}) {
  const { body, headers = {}, ...customConfig } = options

  // 1. Retrieve JWT token
  const token = localStorage.getItem("expense_token") || localStorage.getItem("token")

  // 2. Attach JSON headers & Bearer Token
  const finalHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  // 3. Body serialization
  const finalBody = body
    ? typeof body === "string"
      ? body
      : JSON.stringify(body)
    : undefined

  return {
    url: `${API_BASE_URL}${endpoint}`,
    config: {
      method: customConfig.method || "GET",
      headers: finalHeaders,
      body: finalBody,
      ...customConfig,
    },
  }
}

/**
 * Response Interceptors Pipeline
 */
async function applyResponseInterceptors(response) {
  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  // Handle 401 Unauthorized -> Trigger auto-logout
  if (response.status === 401) {
    authEvents.dispatchEvent(new CustomEvent("unauthorized", { detail: { status: 401 } }))
    const errorMsg = (data && data.message) || "Access Denied! Session expired or token missing."
    const error = new Error(errorMsg)
    error.status = 401
    error.data = data
    throw error
  }

  // Handle other HTTP errors
  if (!response.ok) {
    const errorMsg = (data && data.message) || `Request failed with status ${response.status}`
    const error = new Error(errorMsg)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Centralized API Client
 */
export async function apiClient(endpoint, options = {}) {
  try {
    const { url, config } = applyRequestInterceptors(endpoint, options)
    const response = await fetch(url, config)
    return await applyResponseInterceptors(response)
  } catch (err) {
    if (err.status) throw err
    throw new Error(err.message || "Cannot connect to server. Please ensure the backend is running.")
  }
}

// -------------------------------------------------------------
// API Service Modules
// -------------------------------------------------------------

// 1. Auth APIs
export const authApi = {
  register: (payload) =>
    apiClient("/auth/register", {
      method: "POST",
      body: payload, // { name, email, password, defaultCurrency }
    }),

  login: (credentials) =>
    apiClient("/auth/login", {
      method: "POST",
      body: credentials, // { email, password }
    }),

  getMe: () => apiClient("/auth/me"),
}

// 2. Category APIs
export const categoryApi = {
  getCategories: () => apiClient("/categories"),

  createCategory: (payload) =>
    apiClient("/categories", {
      method: "POST",
      body: payload, // { name, icon, color }
    }),
}

// 3. Personal Expense APIs
export const expenseApi = {
  getMyExpenses: () => apiClient("/expenses"),

  createExpense: (payload) =>
    apiClient("/expenses", {
      method: "POST",
      body: payload, // { title, amount, category, paymentMethod, date, notes }
    }),
}

// 4. Group APIs
export const groupApi = {
  createGroup: (payload) =>
    apiClient("/groups", {
      method: "POST",
      body: payload, // { name, description }
    }),

  getMyGroups: () => apiClient("/groups"),

  getGroupById: (groupId) => apiClient(`/groups/${groupId}`),

  addMember: (groupId, email) =>
    apiClient(`/groups/${groupId}/members`, {
      method: "POST",
      body: { email },
    }),

  deleteGroup: (groupId) =>
    apiClient(`/groups/${groupId}`, {
      method: "DELETE",
    }),

  removeMember: (groupId, memberId) =>
    apiClient(`/groups/${groupId}/members/${memberId}`, {
      method: "DELETE",
    }),
}

// 5. Group Expense Splitting APIs
export const groupExpenseApi = {
  addGroupExpense: (payload) =>
    apiClient("/group-expenses", {
      method: "POST",
      body: payload, // { title, amount, groupId, categoryId }
    }),

  getGroupExpenses: (groupId) => apiClient(`/group-expenses/group/${groupId}`),

  getGroupBalances: (groupId) => apiClient(`/group-expenses/group/${groupId}/balances`),

  settlePayment: (groupId, payload) =>
    apiClient(`/group-expenses/group/${groupId}/settle`, {
      method: "POST",
      body: payload, // { receiverId, amount, paymentMethod, notes }
    }),

  getGroupSettlements: (groupId) => apiClient(`/group-expenses/group/${groupId}/settlements`),
}

// 6. Friend APIs
export const friendApi = {
  getMyFriends: () => apiClient("/friends"),

  addFriend: (email) =>
    apiClient("/friends", {
      method: "POST",
      body: { email },
    }),
}
