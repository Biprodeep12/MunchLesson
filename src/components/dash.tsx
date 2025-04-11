import { ArrowRight, Check, ClipboardList, Clock, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebase';
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
}

export default function Dash() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

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

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    await updateDoc(doc(db, 'tasks', taskId), {
      completed: !completed,
    });
  };

  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  };
  return (
    <div className='min-h-screen flex flex-col p-5'>
      <div className='flex flex-col sm:flex-row flex-wrap gap-5'>
        <div className='flex flex-col py-5 px-4 border border-[#ccc] rounded-xl w-full sm:max-w-[250px]'>
          <div className='items-center flex flex-row justify-between mb-2'>
            <div className='font-semibold'>Study Streak</div>
            <Clock size={20} color='blue' />
          </div>
          <div className='font-bold text-3xl'>12 days</div>
          <div className='text-sm text-[#8f8f8f]'>
            +2 days compared to last week
          </div>
        </div>
        <div className='flex flex-col py-5 px-4 border border-[#ccc] rounded-xl w-full sm:max-w-[250px]'>
          <div className='items-center flex flex-row justify-between mb-2'>
            <div className='font-semibold'>Total Study Time</div>
            <Clock size={20} color='blue' />
          </div>
          <div className='font-bold text-3xl'>42.5 hours</div>
          <div className='text-sm text-[#8f8f8f]'>
            +5.2 hours from last week
          </div>
        </div>
      </div>
      <div className='h-[1px] w-full bg-[#ccc] my-5'></div>
      <div className='flex flex-col lg:flex-row'>
        <div className='flex-1 flex flex-row flex-wrap gap-5 justify-center'>
          {[
            {
              lk: '/AIPage',
              img: '/flashcards.jpg',
              title: 'Study Ai',
              des: 'Get instant help with any subject and master difficult concepts with our AI-powered study platform.',
            },
            {
              lk: '/FlashPage',
              img: '/flashcards.jpg',
              title: 'FlashCards',
              des: 'Supercharge your recall with flashcards. Rapidly absorb and retain crucial information',
            },
            {
              lk: '/TimePage',
              img: '/studyplanner.jpg',
              title: 'Time Wrap Planner',
              des: 'Schedule your your studies and bend time to your academic will for the week/month.',
            },
            {
              lk: '/',
              img: '/leadershipboard.jpg',
              title: 'Leaderboard',
              des: 'Every point counts in the pursuit of success.',
            },
            {
              lk: '/quizPage',
              img: '/quizz.jpg',
              title: 'Knowledge Knockout',
              des: 'Reinforce your understanding with dynamic quizzes',
            },
          ].map((dash, index) => (
            <Link
              href={dash.lk}
              key={index}
              className='flex flex-row p-4 border border-[#ccc] rounded-xl gap-4 sm:max-w-[410px] w-full hover:shadow-xl transition-all duration-300'>
              <Image
                src={dash.img}
                alt='FlashCard'
                width={150}
                height={150}
                className='rounded-xl'
              />
              <div className='flex flex-col gap-2'>
                <div className='font-bold text-2xl sm:text-3xl'>
                  {dash.title}
                </div>
                <div>{dash.des}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className=' lg:border-l-[1px] border-t-[1px] lg:border-t-0 mt-5 lg:mt-0 border-[#ccc] lg:ml-5 lg:p-5 pt-5'>
          <div className='flex flex-col lg:w-[400px] w-full border border-[#ccc] rounded p-4 gap-2'>
            <div className='text-3xl font-bold flex flex-row items-center gap-3'>
              <ClipboardList color='green' />
              <div>Tasks</div>
              <Link
                href='/TimePage'
                className='ml-auto rounded border border-[#ccc] p-1 bg-blue-500 hover:bg-blue-600'>
                <ArrowRight color='white' />
              </Link>
            </div>
            <div className='mt-2 space-y-2 overflow-y-auto'>
              {tasks.length === 0 && (
                <p className='text-gray-500 text-sm text-center'>
                  No tasks added
                </p>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className='flex justify-between items-center border p-2 rounded bg-white min-h-[51px]'>
                  <div className='flex items-center gap-2'>
                    <button
                      className={`p-1 rounded-full ${
                        task.completed
                          ? 'bg-green-500'
                          : 'border border-gray-400'
                      }`}
                      onClick={() =>
                        toggleTaskCompletion(task.id, task.completed)
                      }>
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
        </div>
      </div>
    </div>
  );
}
