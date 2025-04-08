import { useState } from 'react';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

export default function Flash() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const addFlashcard = () => {
    if (!question || !answer) return;
    setFlashcards([...flashcards, { id: Date.now(), question, answer }]);
    setQuestion('');
    setAnswer('');
  };

  const deleteFlashcard = (id: number) => {
    setFlashcards(flashcards.filter((card) => card.id !== id));
  };

  const toggleFlip = (id: number) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className='min-h-screen flex flex-col items-center p-5 bg-gray-100'>
      <h1 className='text-3xl font-bold mb-5'>Memory Flashcards</h1>

      {/* Flashcard Form */}
      <div className='bg-white p-4 rounded shadow-md mb-5 w-96'>
        <input
          type='text'
          placeholder='Enter question'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className='border p-2 w-full mb-2'
        />
        <input
          type='text'
          placeholder='Enter answer'
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className='border p-2 w-full mb-2'
        />
        <button
          onClick={addFlashcard}
          className='bg-blue-500 text-white p-2 w-full rounded'>
          Add Flashcard
        </button>
      </div>

      {/* Flashcard List */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {flashcards.map((card) => (
          <div
            key={card.id}
            onClick={() => toggleFlip(card.id)}
            className='relative w-64 h-40 flex items-center justify-center bg-white shadow-lg rounded p-5 cursor-pointer transition-transform duration-300 hover:scale-105'>
            <div className='text-lg font-semibold text-center'>
              {flipped[card.id] ? card.answer : card.question}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteFlashcard(card.id);
              }}
              className='absolute top-2 right-2 bg-red-500 text-white text-xs p-1 rounded'>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
