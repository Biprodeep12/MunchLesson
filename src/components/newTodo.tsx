import { ArrowLeft, ListChecks, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchTodos = async () => {
      if (user?.uid) {
        const docRef = doc(db, 'tasks', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTodos(docSnap.data().todos || []);
        }
      }
    };

    fetchTodos();
  }, [user]);

  const updateFirestoreTodos = async (updatedTodos: Todo[]) => {
    if (!user?.uid) return;
    const docRef = doc(db, 'tasks', user.uid);
    await setDoc(docRef, { todos: updatedTodos }, { merge: true });
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      const updatedTodos = [
        ...todos,
        { id: Date.now(), text: newTodo, completed: false },
      ];
      setTodos(updatedTodos);
      setNewTodo('');
      await updateFirestoreTodos(updatedTodos);
    }
  };

  const toggleTodo = async (id: number) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
    setTodos(updatedTodos);
    await updateFirestoreTodos(updatedTodos);
  };

  const deleteTodo = async (id: number) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    await updateFirestoreTodos(updatedTodos);
  };

  return (
    <div className='min-h-screen px-4 py-8 bg-gradient-to-r from-orange-200 via-yellow-100 to-pink-300'>
      <Link
        href='/'
        className='absolute left-5 top-5 lg:top-7 border border-[#ccc] rounded p-1'>
        <ArrowLeft color='black' />
      </Link>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-5xl font-bold text-center text-amber-800 mb-6 flex flex-row items-center justify-center gap-3'>
          <ListChecks size={45} /> Quest Log
        </h1>
        <p className='text-center text-lg text-yellow-900 mb-10'>
          Outline your next steps with a todo list ✨
        </p>

        <div className='flex justify-center mb-6'>
          <input
            type='text'
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder='Add a new task...'
            className='px-6 py-2 rounded w-3/4 text-sm text-gray-800 shadow-md border-2 border-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <button
            onClick={addTodo}
            className='ml-4 px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all'>
            <Plus />
          </button>
        </div>

        <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
          {todos.length === 0 ? (
            <p className='text-center text-gray-500 py-4'>
              No tasks yet. Add some tasks to get started!
            </p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-4 border-b transition-all duration-300 ${
                  todo.completed ? 'bg-green-100' : 'hover:bg-gray-50'
                }`}>
                <div className='flex items-center gap-4'>
                  <input
                    type='checkbox'
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className='w-5 h-5 accent-indigo-500'
                  />
                  <span
                    className={`font-medium text-lg ${
                      todo.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-800'
                    }`}>
                    {todo.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className='text-red-500 hover:text-red-700'>
                  ❌
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
