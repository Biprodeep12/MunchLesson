"use client"

import { ArrowLeft, ListChecks, Plus, Trash2 } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

type Todo = {
  id: number
  text: string
  completed: boolean
  createdAt: Date
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchTodos = async () => {
      if (user?.uid) {
        try {
          setLoading(true)
          const docRef = doc(db, "tasks", user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const data = docSnap.data()
            const todosWithDates = (data.todos || []).map((todo: any) => {
              let createdAt: Date

              if (todo.createdAt?.toDate) {
                createdAt = todo.createdAt.toDate()
              } else if (todo.createdAt) {
                const dateValue = new Date(todo.createdAt)
                createdAt = isNaN(dateValue.getTime()) ? new Date() : dateValue
              } else {
                createdAt = new Date()
              }

              return {
                ...todo,
                createdAt,
              }
            })
            setTodos(todosWithDates)
          }
        } catch (error) {
          console.error("Error fetching todos:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchTodos()
  }, [user])

  const updateFirestoreTodos = async (updatedTodos: Todo[]) => {
    if (!user?.uid) return

    try {
      setSaving(true)
      const docRef = doc(db, "tasks", user.uid)
      const todosForFirestore = updatedTodos.map((todo) => ({
        ...todo,
        createdAt: todo.createdAt.toISOString(),
      }))
      await setDoc(docRef, { todos: todosForFirestore }, { merge: true })
    } catch (error) {
      console.error("Error updating todos:", error)
    } finally {
      setSaving(false)
    }
  }

  const addTodo = async () => {
    if (newTodo.trim() && user?.uid) {
      const newTodoItem: Todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date(),
      }

      const updatedTodos = [newTodoItem, ...todos]
      setTodos(updatedTodos)
      setNewTodo("")
      await updateFirestoreTodos(updatedTodos)
    }
  }

  const toggleTodo = async (id: number) => {
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    setTodos(updatedTodos)
    await updateFirestoreTodos(updatedTodos)
  }

  const deleteTodo = async (id: number) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id)
    setTodos(updatedTodos)
    await updateFirestoreTodos(updatedTodos)
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gradient-to-br from-orange-200 via-yellow-100 to-pink-300">
        <Link
          href="/"
          className="fixed left-4 top-4 sm:left-6 sm:top-6 lg:left-8 lg:top-8 z-10 border border-gray-300 rounded-lg p-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors shadow-md"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>

        <div className="max-w-4xl mx-auto pt-16 sm:pt-12 lg:pt-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
            <p className="text-amber-800 text-lg">Loading your quest log...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gradient-to-br from-orange-200 via-yellow-100 to-pink-300">
        <Link
          href="/"
          className="fixed left-4 top-4 sm:left-6 sm:top-6 lg:left-8 lg:top-8 z-10 border border-gray-300 rounded-lg p-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors shadow-md"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>

        <div className="max-w-4xl mx-auto pt-16 sm:pt-12 lg:pt-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Authentication Required</h2>
            <p className="text-amber-700 text-lg">Please sign in to access your quest log.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gradient-to-br from-orange-200 via-yellow-100 to-pink-300">
      <Link
        href="/"
        className="fixed left-4 top-4 sm:left-6 sm:top-6 lg:left-8 lg:top-8 z-10 border border-gray-300 rounded-lg p-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors shadow-md"
      >
        <ArrowLeft className="w-5 h-5 text-black" />
      </Link>

      <div className="max-w-4xl mx-auto pt-16 sm:pt-12 lg:pt-8">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-800 mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <ListChecks className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
            <span>Quest Log</span>
          </h1>
          <p className="text-base sm:text-lg text-yellow-900 mb-4">Outline your next steps with a todo list ✨</p>
          {totalCount > 0 && (
            <div className="text-sm sm:text-base text-amber-700 font-medium">
              {completedCount} of {totalCount} tasks completed
              {saving && <span className="ml-2 text-xs">(saving...)</span>}
            </div>
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task..."
              disabled={saving}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base text-gray-800 shadow-lg border-2 border-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={addTodo}
              disabled={!newTodo.trim() || saving}
              className="px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{saving ? "Adding..." : "Add Task"}</span>
            </button>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {todos.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="text-6xl sm:text-7xl mb-4">📝</div>
              <p className="text-gray-500 text-base sm:text-lg font-medium mb-2">No tasks yet</p>
              <p className="text-gray-400 text-sm sm:text-base">Add some tasks to get started on your quest!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {todos.map((todo, index) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-6 transition-all duration-300 ${
                    todo.completed ? "bg-green-50/80" : "hover:bg-gray-50/80"
                  } ${index === 0 ? "rounded-t-2xl sm:rounded-t-3xl" : ""} ${
                    index === todos.length - 1 ? "rounded-b-2xl sm:rounded-b-3xl" : ""
                  }`}
                >
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      disabled={saving}
                      className="w-5 h-5 sm:w-6 sm:h-6 accent-yellow-500 rounded focus:ring-2 focus:ring-yellow-400 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`block text-sm sm:text-base lg:text-lg font-medium transition-all duration-200 ${
                        todo.completed ? "line-through text-gray-500" : "text-gray-800"
                      }`}
                    >
                      {todo.text}
                    </span>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">
                      {todo.createdAt.toLocaleDateString()} at{" "}
                      {todo.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    disabled={saving}
                    className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <div className="mt-6 sm:mt-8 max-w-2xl mx-auto">
            <div className="bg-white/50 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-green-400 to-green-500 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-amber-700 mt-2 font-medium">
              <span>Progress</span>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TodoList
