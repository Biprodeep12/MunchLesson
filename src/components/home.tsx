'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Calendar,
  CheckCircle,
  Crown,
  FlashlightIcon as FlashCard,
  Home,
  LogOut,
  Menu,
  Settings,
  Trophy,
  X,
  Sparkles,
  Bot,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebase/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  getDoc,
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

interface Player {
  name: string;
  photo: string;
  score: number;
  uid: string;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp | Date;
}

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const [streak, setStreak] = useState<number>(0);
  const [streakPercentage, setStreakPercentage] = useState<number>(0);
  const [xpPoints, setXpPoints] = useState<number>(0);
  const [xpPercentage, setXpPercentage] = useState<number>(0);
  const [nextLevelXP, setNextLevelXP] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [tasksPercentage, setTasksPercentage] = useState<number>(0);
  const [remainingTasks, setRemainingTasks] = useState<number>(0);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scoreRef = collection(db, 'score');
        const q = query(scoreRef, orderBy('score', 'desc'));
        const snapshot = await getDocs(q);

        const data: Player[] = snapshot.docs.map((doc) => ({
          uid: doc.id,
          name: doc.data().name || 'Anonymous',
          photo: doc.data().photo || '/default-avatar.png',
          score: doc.data().score || 0,
        }));

        setPlayers(data);
      } catch (err) {
        console.error('❌ Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user) return;

      try {
        const scoreDocRef = doc(db, 'score', user.uid);
        const scoreDoc = await getDoc(scoreDocRef);

        if (scoreDoc.exists()) {
          const scoreData = scoreDoc.data();
          const score = scoreData.score || 0;
          const xp = score * 10;
          setXpPoints(xp);

          const level = Math.floor(xp / 500) + 1;
          setCurrentLevel(level);

          const nextLevelXPNeeded = level * 500;
          setNextLevelXP(nextLevelXPNeeded - xp);

          const levelProgress = ((xp % 500) / 500) * 100;
          setXpPercentage(levelProgress);
        }

        const tasksDocRef = doc(db, 'tasks', user.uid);
        const tasksDoc = await getDoc(tasksDocRef);

        if (tasksDoc.exists()) {
          const tasksData = tasksDoc.data();
          const todos = tasksData.todos || [];

          const completed = todos.filter((todo: Todo) => todo.completed).length;
          const total = todos.length;

          setCompletedTasks(completed);
          setTotalTasks(total);
          setRemainingTasks(total - completed);

          const percentage = total > 0 ? (completed / total) * 100 : 0;
          setTasksPercentage(percentage);
        }

        const userStreak = Math.floor(Math.random() * 14) + 1;
        setStreak(userStreak);

        const streakPercentage = Math.min((userStreak / 10) * 100, 100);
        setStreakPercentage(streakPercentage);
      } catch (err) {
        console.error('❌ Error fetching user progress:', err);
      }
    };

    fetchUserProgress();
  }, [user]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] transition-colors duration-300'>
      <div className='md:hidden'>
        <button
          onClick={() => setSidebarOpen(true)}
          className='fixed top-4 left-4 z-50 text-[#FF6B6B] p-2 rounded-lg hover:bg-white/10'>
          <Menu className='h-6 w-6' />
        </button>

        {sidebarOpen && (
          <div className='fixed inset-0 z-50 flex'>
            <div
              className='fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity'
              onClick={() => setSidebarOpen(false)}></div>

            <div className='relative flex flex-col w-64 max-w-[80%] h-full bg-white p-0 shadow-xl'>
              <div className='flex items-center gap-2 p-4 border-b border-[#f0f0f0]'>
                <Sparkles className='h-6 w-6 text-[#FF6B6B]' />
                <h1 className='text-xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] text-transparent bg-clip-text'>
                  BrainBoost
                </h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className='ml-auto text-gray-500 hover:text-gray-700'>
                  <X className='h-5 w-5' />
                </button>
              </div>

              <nav className='flex-1 p-4 space-y-2'>
                <Link
                  href='/'
                  className='flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-[#FF6B6B]/10 to-[#FFD166]/10 text-[#FF6B6B] font-medium'>
                  <Home className='h-5 w-5' />
                  <span>Home</span>
                </Link>
                <Link
                  href='/quizPage'
                  className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
                  <CheckCircle className='h-5 w-5' />
                  <span>Quizzes</span>
                </Link>
                <Link
                  href='/plan'
                  className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
                  <Calendar className='h-5 w-5' />
                  <span>Study Planner</span>
                </Link>
                <Link
                  href='/FlashPage'
                  className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
                  <FlashCard className='h-5 w-5' />
                  <span>Flash Cards</span>
                </Link>
                <Link
                  href='/leaderPage'
                  className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
                  <Trophy className='h-5 w-5' />
                  <span>Leaderboard</span>
                </Link>
                <Link
                  href='/todoPage'
                  className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
                  <CheckCircle className='h-5 w-5' />
                  <span>To-Do List</span>
                </Link>
                <Link
                  href='/AiPage'
                  className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
                  <Bot className='h-5 w-5' />
                  <span>Study AI</span>
                </Link>
              </nav>

              <div className='p-4 border-t border-[#f0f0f0] space-y-2'>
                <Link
                  href='/settings'
                  className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
                  <Settings className='h-5 w-5' />
                  <span>Settings</span>
                </Link>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
                    <LogOut className='h-5 w-5' />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link
                    href='/AuthPage'
                    className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
                    <LogOut className='h-5 w-5' />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className='hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-md shadow-lg rounded-r-2xl p-4 border-r border-[#f0f0f0] fixed h-screen z-10'>
        <div className='flex items-center gap-2 mb-8'>
          <Sparkles className='h-6 w-6 text-[#FF6B6B]' />
          <h1 className='text-xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] text-transparent bg-clip-text'>
            StudyMunch
          </h1>
        </div>

        <nav className='space-y-2 flex-1'>
          <Link
            href='/'
            className='flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-[#FF6B6B]/10 to-[#FFD166]/10 text-[#FF6B6B] font-medium'>
            <Home className='h-5 w-5' />
            <span>Home</span>
          </Link>
          <Link
            href='/quizPage'
            className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
            <CheckCircle className='h-5 w-5' />
            <span>Quizzes</span>
          </Link>
          <Link
            href='/plan'
            className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
            <Calendar className='h-5 w-5' />
            <span>Study Planner</span>
          </Link>
          <Link
            href='/FlashPage'
            className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
            <FlashCard className='h-5 w-5' />
            <span>Flash Cards</span>
          </Link>
          <Link
            href='/leaderboard'
            className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
            <Trophy className='h-5 w-5' />
            <span>Leaderboard</span>
          </Link>
          <Link
            href='/TodoPage'
            className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
            <CheckCircle className='h-5 w-5' />
            <span>To-Do List</span>
          </Link>
          <Link
            href='/AIPage'
            className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
            <Bot className='h-5 w-5' />
            <span>Study AI</span>
          </Link>
        </nav>

        <div className='mt-auto pt-4 border-t border-[#f0f0f0]'>
          <Link
            href='/settings'
            className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
            <Settings className='h-5 w-5' />
            <span>Settings</span>
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
              <LogOut className='h-5 w-5' />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              href='/AuthPage'
              className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#FF6B6B]/10 hover:to-[#FFD166]/10 text-gray-700 hover:text-[#FF6B6B] transition-colors'>
              <LogOut className='h-5 w-5' />
              <span>Login</span>
            </Link>
          )}
        </div>
      </aside>

      <main className='md:ml-64 p-4 md:p-8 pt-16 md:pt-8'>
        <header className='flex justify-between items-center mb-8 bg-white/60 backdrop-blur-md p-3 rounded-2xl shadow-sm'>
          <div className='md:hidden'>
            <h1 className='text-lg font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] text-transparent bg-clip-text'>
              StudyMunch
            </h1>
          </div>

          <div className='flex items-center gap-4 ml-auto'>
            <div className='flex items-center gap-3'>
              {user && (
                <div className='hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full shadow-sm border border-[#f0f0f0]'>
                  <div className='flex items-center gap-1'>
                    <span className='text-xs font-semibold text-[#FF6B6B]'>
                      {xpPoints} XP
                    </span>
                  </div>
                  <div className='h-4 w-px bg-[#f0f0f0]'></div>
                  <div className='flex items-center gap-1'>
                    <span className='text-xs font-semibold text-[#FF6B6B]'>
                      Level {currentLevel}
                    </span>
                  </div>
                </div>
              )}

              <div className='relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm'>
                <Image
                  src={user?.photoURL || '/default-avatar.png'}
                  alt={user?.displayName || 'User'}
                  width={40}
                  height={40}
                />
              </div>
            </div>
          </div>
        </header>

        <section className='mb-8'>
          <div className='bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-lg'>
            <div className='flex-1'>
              <h1 className='text-2xl md:text-3xl font-bold text-white mb-2 flex flex-nowrap'>
                Hey {user ? user?.displayName : 'User'} ✨
              </h1>
              <p className='text-white/90 mb-6'>
                Ready to level up your brain with AI-powered study tools?
              </p>
              <div className='flex flex-col sm:flex-row gap-3'>
                <Link
                  href={user ? '/AIPage' : '/AuthPage'}
                  className='px-4 py-2 bg-white hover:bg-white/90 text-[#FF6B6B] font-medium rounded-xl transition-colors'>
                  Continue Learning
                </Link>
              </div>
            </div>
            <div className='w-full md:w-auto'>
              <DotLottieReact
                src='https://lottie.host/b0e1c285-2750-4d76-94dd-956d75e03837/Rcy1wPoU4K.lottie'
                loop
                autoplay
              />
            </div>
          </div>
        </section>

        <section className='mb-8'>
          {user ? (
            <>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold text-gray-800'>
                  Your Progress
                </h2>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-white/80 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] rounded-2xl overflow-hidden p-6'>
                  <div className='flex justify-between items-center mb-3'>
                    <h3 className='font-medium text-gray-800'>Daily Streak</h3>
                    <span className='px-2 py-1 text-xs font-medium bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] text-white rounded-full'>
                      {streak} days
                    </span>
                  </div>
                  <div className='h-2 w-full bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] rounded-full'
                      style={{ width: `${streakPercentage}%` }}></div>
                  </div>
                  <p className='text-sm text-gray-600 mt-3 flex items-center'>
                    <span className='inline-block w-2 h-2 rounded-full bg-[#4ECDC4] mr-2'></span>
                    {10 - streak > 0
                      ? `${10 - streak} more days to earn a badge!`
                      : 'Badge earned! Keep it up!'}
                  </p>
                </div>

                <div className='bg-white/80 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] rounded-2xl overflow-hidden p-6'>
                  <div className='flex justify-between items-center mb-3'>
                    <h3 className='font-medium text-gray-800'>XP Points</h3>
                    <span className='px-2 py-1 text-xs font-medium bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] text-white rounded-full'>
                      {xpPoints} XP
                    </span>
                  </div>
                  <div className='h-2 w-full bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] rounded-full'
                      style={{ width: `${xpPercentage}%` }}></div>
                  </div>
                  <p className='text-sm text-gray-600 mt-3 flex items-center'>
                    <span className='inline-block w-2 h-2 rounded-full bg-[#4ECDC4] mr-2'></span>
                    {nextLevelXP} XP to reach Level {currentLevel + 1}
                  </p>
                </div>

                <div className='bg-white/80 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] rounded-2xl overflow-hidden p-6'>
                  <div className='flex justify-between items-center mb-3'>
                    <h3 className='font-medium text-gray-800'>
                      Study Progress
                    </h3>
                    <span className='px-2 py-1 text-xs font-medium bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] text-white rounded-full'>
                      {completedTasks}/{totalTasks}
                    </span>
                  </div>
                  <div className='h-2 w-full bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] rounded-full'
                      style={{ width: `${tasksPercentage}%` }}></div>
                  </div>
                  <p className='text-sm text-gray-600 mt-3 flex items-center'>
                    <span className='inline-block w-2 h-2 rounded-full bg-[#4ECDC4] mr-2'></span>
                    {remainingTasks > 0
                      ? `${remainingTasks} more tasks to complete this week`
                      : totalTasks > 0
                      ? 'All tasks completed! Great job!'
                      : 'Add some tasks to get started'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className='text-center text-4xl font-bold text-[#FF6B6B]'>
              TRACK YOUR PROGRESS
            </div>
          )}
        </section>

        <section className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold text-gray-800'>Study Tools</h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='block'>
              <div className='bg-white/80 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] h-full rounded-2xl overflow-hidden p-6 flex flex-col items-center text-center'>
                <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] flex items-center justify-center mb-3 shadow-md'>
                  <CheckCircle className='h-6 w-6 text-white' />
                </div>
                <h3 className='font-medium text-gray-800 mb-1'>
                  Knowledge Knockout
                </h3>
                <p className='text-sm text-gray-600 mb-4'>
                  Reinforce your understanding with dynamic quizes
                </p>
                <Link
                  href={user ? '/quizPage' : '/AuthPage'}
                  className='mt-auto px-4 py-2 border border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-xl transition-colors'>
                  Start Quiz
                </Link>
              </div>
            </div>

            <div className='bg-white/80 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] rounded-2xl overflow-hidden p-6 flex flex-col items-center text-center'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] flex items-center justify-center mb-3 shadow-md'>
                <Calendar className='h-6 w-6 text-white' />
              </div>
              <h3 className='font-medium text-gray-800 mb-1'>
                Time Wrap Planner
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                Schedule your studies and bend time to your academic will for
                the week/month
              </p>
              <Link
                href={user ? '/plan' : '/AuthPage'}
                className='mt-auto px-4 py-2 border border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-xl transition-colors'>
                Plan Studies
              </Link>
            </div>

            <div className='bg-white/80 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] rounded-2xl overflow-hidden p-6 flex flex-col items-center text-center'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] flex items-center justify-center mb-3 shadow-md'>
                <FlashCard className='h-6 w-6 text-white' />
              </div>
              <h3 className='font-medium text-gray-800 mb-1'>Memory Boost</h3>
              <p className='text-sm text-gray-600 mb-4'>
                Suppercharge you recall with flashcards. Rapidly absorb and
                retain crusial information.
              </p>
              <Link
                href={user ? '/FlashPage' : '/AuthPage'}
                className='mt-auto px-4 py-2 border border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-xl transition-colors'>
                View Cards
              </Link>
            </div>

            <div className='bg-white/80 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] rounded-2xl overflow-hidden p-6 flex flex-col items-center text-center'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] flex items-center justify-center mb-3 shadow-md'>
                <CheckCircle className='h-6 w-6 text-white' />
              </div>
              <h3 className='font-medium text-gray-800 mb-1'>Quest Log</h3>
              <p className='text-sm text-gray-600 mb-4'>
                Record your tasks and visualize your journey
              </p>
              <Link
                href={user ? '/TodoPage' : '/AuthPage'}
                className='mt-auto px-4 py-2 border border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-xl transition-colors'>
                Manage Tasks
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold text-gray-800'>Leaderboard</h2>
            <Link
              href='/leaderboard'
              className='text-[#FF6B6B] hover:underline'>
              View Full Leaderboard
            </Link>
          </div>

          <div className='bg-white/80 shadow-sm rounded-2xl overflow-hidden p-6'>
            {!loading && (
              <div className='space-y-3'>
                {players.slice(0, 3).map((player, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      index === 0
                        ? 'bg-gradient-to-r from-[#FF6B6B]/10 to-[#FFD166]/10'
                        : 'hover:bg-[#f9fafb]'
                    } transition-colors`}>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0
                          ? 'bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] text-white'
                          : 'bg-[#f0f0f0] text-[#FF6B6B]'
                      } font-bold`}>
                      {index + 1}
                    </div>

                    <div className='h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm'>
                      <Image
                        width={40}
                        height={40}
                        src={player.photo || '/placeholder.svg'}
                        alt={player.name}
                        className='w-full h-full object-cover'
                      />
                    </div>

                    <div className='flex-1'>
                      <p className='font-medium text-gray-800'>{player.name}</p>
                      <p className='text-xs text-gray-600'>
                        Level {Math.floor(player.score / 10)}
                      </p>
                    </div>

                    <div className='flex items-center gap-1'>
                      {index === 0 && (
                        <Crown className='h-4 w-4 text-[#FFD166]' />
                      )}
                      <span className='font-bold text-gray-800'>
                        {player.score * 10} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
