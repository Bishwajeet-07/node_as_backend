const API_BASE_URL = "http://localhost:5000/api"

/**
 * Event target for broadcast auth events (e.g. 401 Unauthorized)
 */
export class AuthEvents extends EventTarget {}
export const authEvents = new AuthEvents()

/**
 * Request Interceptors Pipeline
 */
function applyRequestInterceptors(endpoint, options = {}) {
  const { body, isFormData, headers = {}, ...customConfig } = options

  // 1. Token Injector Interceptor
  const token = localStorage.getItem("token")

  // 2. Headers Interceptor
  const finalHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  // 3. Body Serialization Interceptor
  const finalBody = body
    ? isFormData
      ? body
      : typeof body === "string"
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

  // 1. 401 Unauthorized Response Interceptor (Auto Logout & Token Clean)
  if (response.status === 401) {
    authEvents.dispatchEvent(new CustomEvent("unauthorized", { detail: { status: 401 } }))
    const error = new Error((data && data.message) || "Session expired. Please sign in again.")
    error.status = 401
    error.data = data
    throw error
  }

  // 2. HTTP Error Status Interceptor
  if (!response.ok) {
    const error = new Error((data && data.message) || `Request failed with status ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Centralized API Client with Request & Response Interceptors
 */
export async function apiClient(endpoint, options = {}) {
  try {
    const { url, config } = applyRequestInterceptors(endpoint, options)
    const response = await fetch(url, config)
    return await applyResponseInterceptors(response)
  } catch (err) {
    if (err.status) throw err
    throw new Error("Cannot connect to server. Please check backend connection.")
  }
}

// -------------------------------------------------------------
// API Service Modules using Interceptor Client
// -------------------------------------------------------------

// Auth APIs
export const authApi = {
  login: (credentials) =>
    apiClient("/auth/login", {
      method: "POST",
      body: credentials,
    }),

  register: (userData) =>
    apiClient("/auth/register", {
      method: "POST",
      body: userData,
    }),
}

// Profile APIs
export const profileApi = {
  getProfile: () => apiClient("/profile"),

  updateProfile: (formData) =>
    apiClient("/profile/update", {
      method: "PUT",
      body: formData,
      isFormData: true,
    }),
}

// Todos APIs
export const todosApi = {
  getTodos: () => apiClient("/todos"),

  createTodo: (title) =>
    apiClient("/todos", {
      method: "POST",
      body: { title },
    }),

  updateTodo: (id, data) =>
    apiClient(`/todos/${id}`, {
      method: "PUT",
      body: data,
    }),

  deleteTodo: (id) =>
    apiClient(`/todos/${id}`, {
      method: "DELETE",
    }),
}
