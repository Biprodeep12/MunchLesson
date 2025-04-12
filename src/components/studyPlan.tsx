import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Minimize,
  Coffee,
  BarChart,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

type TimerMode = 'work' | 'break';
type ViewMode = 'week' | 'month';

type SessionRecord = {
  date: string;
  duration: number;
};

function getDateOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
}

export default function StudyPlanner() {
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const timerRef = useRef<HTMLDivElement>(null);

  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [graphData, setGraphData] = useState<
    { date: string; duration: number; label: string }[]
  >([]);

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
        addSession(workDuration);
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

  const addSession = (duration: number) => {
    const today = new Date().toISOString().split('T')[0];

    setSessionRecords((prev) => {
      const existingRecordIndex = prev.findIndex(
        (record) => record.date === today,
      );

      if (existingRecordIndex >= 0) {
        const newRecords = [...prev];
        newRecords[existingRecordIndex] = {
          ...newRecords[existingRecordIndex],
          duration: newRecords[existingRecordIndex].duration + duration,
        };
        return newRecords;
      } else {
        return [...prev, { date: today, duration }];
      }
    });
  };

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

  useEffect(() => {
    const mockData: SessionRecord[] = [
      { date: getDateOffset(-6), duration: 45 * 60 },
      { date: getDateOffset(-5), duration: 30 * 60 },
      { date: getDateOffset(-4), duration: 60 * 60 },
      { date: getDateOffset(-3), duration: 20 * 60 },
      { date: getDateOffset(-2), duration: 35 * 60 },
      { date: getDateOffset(-1), duration: 50 * 60 },
      { date: getDateOffset(0), duration: 40 * 60 },
    ];

    setSessionRecords(mockData);
  }, []);

  const progressPercentage =
    mode === 'work'
      ? ((workDuration - timeLeft) / workDuration) * 100
      : ((breakDuration - timeLeft) / breakDuration) * 100;

  useEffect(() => {
    if (sessionRecords.length === 0) {
      setGraphData([]);
      return;
    }

    const today = new Date();
    const data: { date: string; duration: number; label: string }[] = [];

    if (viewMode === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        const record = sessionRecords.find((r) => r.date === dateString);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

        data.push({
          date: dateString,
          duration: record ? Math.round(record.duration / 60) : 0,
          label: dayLabel,
        });
      }
    } else {
      const weeks: { [key: string]: { total: number; count: number } } = {};

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeks[weekKey]) {
          weeks[weekKey] = { total: 0, count: 0 };
        }

        const record = sessionRecords.find((r) => r.date === dateString);
        if (record) {
          weeks[weekKey].total += record.duration / 60;
          weeks[weekKey].count++;
        }
      }

      Object.entries(weeks).forEach(([weekKey, value]) => {
        const weekDate = new Date(weekKey);
        const weekLabel = `${weekDate.getMonth() + 1}/${weekDate.getDate()}`;

        data.push({
          date: weekKey,
          duration: Math.round(value.total),
          label: weekLabel,
        });
      });
    }

    setGraphData(data);
  }, [sessionRecords, viewMode]);

  const maxDuration = Math.max(...graphData.map((d) => d.duration), 60);

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

        <div className='bg-white rounded-lg p-6 shadow-md'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-semibold text-orange-800'>
              Study Progress
            </h2>
            <div className='flex space-x-2'>
              <button
                onClick={() => setViewMode('week')}
                className={`p-2 rounded ${
                  viewMode === 'week'
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                } transition-colors`}
                aria-label='View weekly progress'>
                <BarChart size={20} />
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`p-2 rounded ${
                  viewMode === 'month'
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                } transition-colors`}
                aria-label='View monthly progress'>
                <Calendar size={20} />
              </button>
            </div>
          </div>

          {sessionRecords.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <p>No study sessions recorded yet.</p>
              <p className='text-sm mt-2'>
                Complete a pomodoro session to see your progress.
              </p>
            </div>
          ) : (
            <div className='h-64'>
              <div className='flex h-full items-end space-x-2'>
                {graphData.map((item, index) => (
                  <div
                    key={index}
                    className='flex flex-col items-center flex-1'>
                    <div className='w-full flex justify-center mb-1'>
                      <div
                        className='bg-orange-500 rounded-t w-full max-w-[30px]'
                        style={{
                          height: `${(item.duration / maxDuration) * 100}%`,
                          minHeight: item.duration > 0 ? '4px' : '0',
                        }}></div>
                    </div>
                    <div className='text-xs text-gray-600'>{item.label}</div>
                    {item.duration > 0 && (
                      <div className='text-xs font-medium text-orange-800 mt-1'>
                        {item.duration}m
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='mt-4 pt-4 border-t border-gray-100'>
            <div className='flex justify-between text-sm text-gray-600'>
              <div>
                Total:{' '}
                {Math.round(
                  sessionRecords.reduce(
                    (sum, record) => sum + record.duration / 60,
                    0,
                  ),
                )}
                minutes
              </div>
              <div>Sessions: {sessionRecords.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
