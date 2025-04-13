import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Minimize,
  Coffee,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { markdown } from 'markdown';

type TimerMode = 'work' | 'break';

export default function StudyPlanner() {
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const timerRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingResponse, setLoadingResponse] = useState(false);

  const generateStudyStrategy = async () => {
    if (!userInput.trim()) return;

    setLoadingResponse(true);
    setAiResponse('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Here's my schedule and goals: ${userInput}. Can you help me create a realistic and effective study strategy?`,
            },
          ],
        }),
      });

      const data = await res.json();
      const message = data?.choices?.[0]?.message?.content;
      setAiResponse(message || 'Sorry, something went wrong.');
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiResponse('There was an error generating your study strategy.');
    } finally {
      setLoadingResponse(false);
    }
  };

  const workDuration = 25 * 60;
  const breakDuration = 5 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(breakDuration);
      } else {
        setMode('work');
        setTimeLeft(workDuration);
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(
          `${mode === 'work' ? 'Work session' : 'Break'} completed!`,
        );
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, workDuration, breakDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workDuration : breakDuration);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (timerRef.current?.requestFullscreen) {
        timerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const progressPercentage =
    mode === 'work'
      ? ((workDuration - timeLeft) / workDuration) * 100
      : ((breakDuration - timeLeft) / breakDuration) * 100;

  return (
    <div className='min-h-screen bg-orange-50 p-4 md:p-8'>
      <Link
        href='/'
        className='absolute left-5 top-5 lg:top-7 border border-[#ccc] rounded p-1'>
        <ArrowLeft />
      </Link>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-orange-800 mb-6'>
          Study Planner
        </h1>
        <div
          ref={timerRef}
          className={`rounded-lg p-6 ${
            isFullscreen
              ? 'bg-orange-50 flex items-center justify-center h-screen'
              : 'bg-white shadow-md mb-8'
          }`}>
          <div
            className={`${
              isFullscreen ? 'scale-150' : ''
            } transition-transform duration-300`}>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-orange-800'>
                {mode === 'work' ? 'Work Session' : 'Break Time'}
              </h2>
              <button
                onClick={toggleFullscreen}
                className='p-2 text-orange-600 hover:text-orange-800 transition-colors'
                aria-label={
                  isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                }>
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>

            <div className='relative h-4 bg-orange-100 rounded-full mb-6 overflow-hidden'>
              <div
                className='absolute top-0 left-0 h-full bg-orange-500 transition-all duration-1000'
                style={{ width: `${progressPercentage}%` }}></div>
            </div>

            <div className='flex flex-col items-center'>
              <div className='text-6xl font-bold text-orange-700 mb-8'>
                {formatTime(timeLeft)}
              </div>

              <div className='flex space-x-4'>
                <button
                  onClick={toggleTimer}
                  className='p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors'
                  aria-label={isActive ? 'Pause timer' : 'Start timer'}>
                  {isActive ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <button
                  onClick={resetTimer}
                  className='p-3 bg-orange-200 text-orange-800 rounded-full hover:bg-orange-300 transition-colors'
                  aria-label='Reset timer'>
                  <RotateCcw size={24} />
                </button>

                <button
                  onClick={() => {
                    setMode(mode === 'work' ? 'break' : 'work');
                    setTimeLeft(mode === 'work' ? breakDuration : workDuration);
                    setIsActive(false);
                  }}
                  className='p-3 bg-orange-200 text-orange-800 rounded-full hover:bg-orange-300 transition-colors'
                  aria-label={
                    mode === 'work' ? 'Switch to break' : 'Switch to work'
                  }>
                  {mode === 'work' ? <Coffee size={24} /> : <Play size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className='rounded-lg p-6 bg-white shadow-md mb-8'>
          <h2 className='text-xl font-semibold text-orange-800'>
            Forge your study Strategy
          </h2>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className='border-b border-[#ccc] w-full outline-none text-xl p-2 font-mono resize-none'
            placeholder='E.g., I study in college from 10 AM to 4 PM, sleep at 12 AM, and wake up at 8 AM. I want to prepare for my finals and revise math daily.'
            rows={4}
          />
          <div className='italic text-gray-500 my-3'>
            Give an Overview of how you spend your day, mentioning your sleeping
            hours and school/college hours
          </div>
          <button
            onClick={generateStudyStrategy}
            className='mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors'
            disabled={loadingResponse}>
            {loadingResponse ? 'Generating...' : 'Generate Strategy'}
          </button>

          {aiResponse && (
            <div className='mt-4 p-4 bg-orange-100 rounded text-orange-800 whitespace-pre-wrap'>
              <p
                dangerouslySetInnerHTML={{
                  __html: markdown.toHTML(aiResponse),
                }}></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
