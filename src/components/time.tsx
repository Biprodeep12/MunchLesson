import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Pause,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/firebase/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const pomodoroTimes = {
  Pomodoro: 25 * 60,
  'Short Break': 5 * 60,
  'Long Break': 10 * 60,
};

interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
}

export default function Time() {
  const [time, setTime] = useState(pomodoroTimes['Pomodoro']);
  const [isRunning, setIsRunning] = useState(false);
  const [session, setSession] =
    useState<keyof typeof pomodoroTimes>('Pomodoro');
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) =>
          prevTime === 0 ? pomodoroTimes[session] : prevTime - 1,
        );
      }, 1000);
    }
    return () => clearInterval(interval!);
  }, [isRunning, session]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title as string,
          completed: doc.data().completed as boolean,
          userId: doc.data().userId as string,
        })),
      );
    });

    return () => unsubscribe();
  }, [user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(pomodoroTimes[session]);
  };

  const addTask = async () => {
    if (!taskInput.trim() || !user) return;
    await addDoc(collection(db, 'tasks'), {
      title: taskInput,
      completed: false,
      userId: user.uid,
    });
    setTaskInput('');
  };

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    await updateDoc(doc(db, 'tasks', taskId), {
      completed: !completed,
    });
  };

  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  };

  return (
    <div className='min-h-screen flex flex-row flex-wrap px-5 pt-20 pb-5 items-start justify-center gap-5'>
      <Link
        href='/dashboard'
        className='absolute left-5 top-5 border border-[#ccc] rounded p-1'>
        <ArrowLeft />
      </Link>
      <div className='top-5 absolute text-2xl font-bold lg:left-18 left-1/2 lg:translate-0 -translate-x-1/2 text-center'>
        Plan Your Timing
      </div>
      <div className='border border-[#ccc] rounded-xl p-4 flex flex-col gap-2 max-w-[380px] w-full'>
        <div className='text-2xl font-bold'>Focus Timer</div>
        <div className='text-[#949494] mb-2'>
          Stay focused and productive with the Pomodoro technique
        </div>
        <div className='rounded bg-[#d8d8d8] p-1 flex flex-row justify-between'>
          {Object.keys(pomodoroTimes).map((key) => (
            <div
              key={key}
              className={`py-1 text-nowrap text-center w-full cursor-pointer ${
                session === key
                  ? 'bg-white text-black rounded'
                  : 'text-gray-500'
              }`}
              onClick={() => {
                setSession(key as keyof typeof pomodoroTimes);
                setTime(pomodoroTimes[key as keyof typeof pomodoroTimes]);
                setIsRunning(false);
              }}>
              {key}
            </div>
          ))}
        </div>
        <div className='text-7xl flex my-4 justify-center font-bold'>
          {formatTime(time)}
        </div>
        <div className='flex items-center justify-center'>
          <div className='w-full max-w-[300px] bg-gray-300 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all'
              style={{
                width: `${(time / pomodoroTimes[session]) * 100}%`,
              }}></div>
          </div>
        </div>

        <div className='flex flex-row text-xl mt-2 justify-evenly'>
          <button
            className='flex flex-row gap-2 items-center rounded text-white bg-blue-500 justify-center max-w-[150px] w-full py-2'
            onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? (
              <Pause color='white' size={20} />
            ) : (
              <Play color='white' size={20} />
            )}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            className='flex flex-row gap-2 items-center rounded text-black border border-[#ccc] bg-white justify-center max-w-[150px] w-full py-2'
            onClick={handleReset}>
            <RotateCcw size={20} /> Reset
          </button>
        </div>
      </div>

      <div className='border border-[#ccc] rounded-xl p-4 flex flex-col gap-2 max-w-[400px] w-full h-[366px] max-h-[366px]'>
        <div className='text-2xl font-bold'>To-do List</div>
        <div className='flex flex-row gap-2'>
          <input
            type='text'
            placeholder='Set Your Goals'
            className='rounded border border-[#ccc] p-2 outline-none flex-1'
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <button className='p-2 rounded bg-blue-500' onClick={addTask}>
            <Plus color='white' />
          </button>
        </div>

        <div className='mt-2 space-y-2 overflow-y-auto'>
          {tasks.length === 0 && (
            <p className='text-gray-500 text-sm text-center'>No tasks added</p>
          )}
          {tasks.map((task) => (
            <div
              key={task.id}
              className='flex justify-between items-center border p-2 rounded bg-white min-h-[51px]'>
              <div className='flex items-center gap-2'>
                <button
                  className={`p-1 rounded-full ${
                    task.completed ? 'bg-green-500' : 'border border-gray-400'
                  }`}
                  onClick={() => toggleTaskCompletion(task.id, task.completed)}>
                  <Check color={task.completed ? 'white' : 'gray'} />
                </button>
                <span
                  className={
                    task.completed ? 'line-through text-gray-400' : ''
                  }>
                  {task.title}
                </span>
              </div>
              <button onClick={() => deleteTask(task.id)}>
                <Trash2 className='text-red-500' size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className='border border-[#ccc] rounded-xl p-4 flex flex-col gap-2 max-w-[400px] w-full h-[366px]'></div>
    </div>
  );
}
