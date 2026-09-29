const API_BASE_URL = "http://localhost:5000/api"

/**
 * Fetch wrapper with error handling & auth token injection
 */
async function request(endpoint, options = {}) {
  const { token, body, ...customConfig } = options

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  }

  const config = {
    method: customConfig.method || "GET",
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    // Parse json response
    let data
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (!response.ok) {
      const error = new Error((data && data.message) || "Something went wrong")
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  } catch (err) {
    if (err.status) throw err
    throw new Error("Cannot connect to server! Please check backend connection.")
  }
}

// Auth API calls
export const authApi = {
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: credentials,
    }),

  register: (userData) =>
    request("/auth/register", {
      method: "POST",
      body: userData,
    }),
}

// Todos API calls
export const todosApi = {
  getTodos: (token) => request("/todos", { token }),

  createTodo: (token, title) =>
    request("/todos", {
      method: "POST",
      token,
      body: { title },
    }),

  updateTodo: (token, id, data) =>
    request(`/todos/${id}`, {
      method: "PUT",
      token,
      body: data,
    }),

  deleteTodo: (token, id) =>
    request(`/todos/${id}`, {
      method: "DELETE",
      token,
    }),
}
