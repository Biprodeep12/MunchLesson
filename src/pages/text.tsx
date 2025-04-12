import { useEffect, useState } from 'react';

export default function HomePage() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // 1. On mount, read preferred theme
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;

    setTheme(savedTheme || (systemDark ? 'dark' : 'light'));
  }, []);

  // 2. Apply theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    console.log('Current HTML classes:', root.className); // Debug
  }, [theme, mounted]);

  const toggleTheme = () => {
    console.log('Toggle clicked - current theme:', theme); // Debug
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  // Simplified styling for testing
  return (
    <div className='min-h-screen bg-white dark:bg-gray-900 transition-colors'>
      <button
        onClick={toggleTheme}
        className='fixed p-3 bg-blue-500 text-white rounded'>
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className='p-8'>
        <h1 className='text-2xl font-bold dark:text-white'>
          Current Theme: {theme}
        </h1>
        <p className='dark:text-gray-300'>
          Open DevTools to check the HTML tag&apos;s class
        </p>
      </div>
    </div>
  );
}
