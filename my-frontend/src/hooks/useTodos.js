import { useState, useEffect, useCallback } from "react"
import { todosApi } from "../services/api"
import { useAuth } from "./useAuth"

export function useTodos() {
  const { token, logout } = useAuth()
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState("all") // "all" | "active" | "completed"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)

  const fetchTodos = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await todosApi.getTodos()
      setTodos(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.status === 401) {
        logout()
      } else {
        setError(err.message || "Failed to load tasks")
      }
    } finally {
      setLoading(false)
    }
  }, [token, logout])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const addTodo = async (title) => {
    if (!title.trim() || !token) return
    setAdding(true)
    try {
      await todosApi.createTodo(title.trim())
      await fetchTodos()
      return true
    } catch (err) {
      if (err.status === 401) logout()
      throw err
    } finally {
      setAdding(false)
    }
  }

  const toggleTodo = async (id, currentCompleted) => {
    if (!token) return
    try {
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? { ...todo, completed: !currentCompleted } : todo
        )
      )
      await todosApi.updateTodo(id, { completed: !currentCompleted })
    } catch (err) {
      fetchTodos()
      if (err.status === 401) logout()
    }
  }

  const editTodo = async (id, newTitle) => {
    if (!token || !newTitle.trim()) return
    try {
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? { ...todo, title: newTitle.trim() } : todo
        )
      )
      await todosApi.updateTodo(id, { title: newTitle.trim() })
    } catch (err) {
      fetchTodos()
      if (err.status === 401) logout()
    }
  }

  const deleteTodo = async (id) => {
    if (!token) return
    try {
      setTodos((prev) => prev.filter((todo) => todo._id !== id))
      await todosApi.deleteTodo(id)
    } catch (err) {
      fetchTodos()
      if (err.status === 401) logout()
    }
  }

  const doneCount = todos.filter((t) => t.completed).length
  const activeCount = todos.length - doneCount

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed
    if (filter === "completed") return t.completed
    return true
  })

  return {
    todos: filteredTodos,
    allCount: todos.length,
    activeCount,
    doneCount,
    filter,
    setFilter,
    loading,
    adding,
    error,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    refresh: fetchTodos,
  }
}

