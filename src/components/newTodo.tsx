import React, { useState } from 'react';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');

  // Add new task
  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  // Delete task
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className='min-h-screen px-4 py-8 bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC]'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-5xl font-bold text-center text-black mb-6'>
          📝 To-Do List
        </h1>
        <p className='text-center text-lg text-black mb-10'>
          Stay organized and complete your tasks with style! ✨
        </p>

        {/* Input & Button */}
        <div className='flex justify-center mb-6'>
          <input
            type='text'
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder='Add a new task...'
            className='px-6 py-2 rounded-full w-3/4 text-sm text-gray-800 shadow-md border-2 border-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <button
            onClick={addTodo}
            className='ml-4 px-6 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all'>
            Add Task
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
