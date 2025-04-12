import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const quotes = [
  'Every page you turn today plants a seed your future self will thank you for.',
  'Study like your dreams are cheering you on from the finish line.',
  'Some nights you’ll want to quit. That’s when you’re closest to the version of you who won’t.',
  'Discipline is louder than motivation. Show up, even when the spark is silent.',
  'Success isn’t in the big leaps—it’s in the pages no one saw you read.',
  "While others sleep on dreams, you're awake building them—one lesson at a time.",
  'You’re doing enough. Breathe. You don’t need to rush what’s meant to grow.',
  'It’s okay to pause. A calm mind absorbs more than a chaotic one.',
  'You are not a machine. You are a human with limits, and that’s okay.',
  'The brain learns best in peace. Don’t chase perfection—create balance.',
  'Step back, breathe deep. The page will wait for you.',
];

export default function MotivationGen() {
  const [quote, setQuote] = useState(quotes[0]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showQuote = () => {
      setQuote((prevQuote) => {
        let newQuote;
        do {
          newQuote = quotes[Math.floor(Math.random() * quotes.length)];
        } while (newQuote === prevQuote);
        return newQuote;
      });

      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };

    const interval = setInterval(showQuote, 30000);
    showQuote();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='fixed left-1/2 -translate-x-1/2 top-5 z-90'>
      <AnimatePresence>
        {visible && (
          <motion.div
            key={quote}
            className='bg-white border border-[#ccc] italic text-gray-800 text-sm md:text-base font-medium px-4 py-3 rounded-xl shadow-lg max-w-sm'
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.5 }}>
            “{quote}”
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
