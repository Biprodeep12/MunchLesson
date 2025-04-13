// pages/flashcards.tsx
import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, PenLine, X } from 'lucide-react';
import Link from 'next/link';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  userId: string;
}

export default function FlashcardApp() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchFlashcards = async () => {
      const q = query(
        collection(db, 'flashcards'),
        where('userId', '==', user.uid),
      );
      const querySnapshot = await getDocs(q);
      const flashcardsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Flashcard[];
      setFlashcards(flashcardsData);
    };
    fetchFlashcards();
  }, [user]);

  const addFlashcard = async () => {
    if (!question || !answer || !user) return;

    const docRef = await addDoc(collection(db, 'flashcards'), {
      question,
      answer,
      userId: user.uid,
    });

    setFlashcards([
      ...flashcards,
      { id: docRef.id, question, answer, userId: user.uid },
    ]);
    setQuestion('');
    setAnswer('');
  };

  const deleteFlashcard = async (id: string) => {
    await deleteDoc(doc(db, 'flashcards', id));
    setFlashcards(flashcards.filter((card) => card.id !== id));
  };

  const toggleFlip = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startEditing = (card: Flashcard) => {
    setEditingId(card.id);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const flashcardRef = doc(db, 'flashcards', editingId);
    await updateDoc(flashcardRef, {
      question: editQuestion,
      answer: editAnswer,
    });
    setFlashcards(
      flashcards.map((card) =>
        card.id === editingId
          ? { ...card, question: editQuestion, answer: editAnswer }
          : card,
      ),
    );
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  const filteredFlashcards = flashcards.filter((card) =>
    card.question.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className='min-h-screen bg-gradient-to-tr from-[#FFD3A5] via-[#FD6585] to-[#FFB88C] px-5 py-15 font-sans text-[#2F2F2F]'>
      <Link
        href='/'
        className='absolute left-5 top-5 border border-[#ccc] rounded p-1'>
        <ArrowLeft />
      </Link>
      <div className='max-w-6xl mx-auto flex flex-col md:flex-row gap-10'>
        <div className='sticky top-[60px] bg-white bg-opacity-70 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-[500px] max-h-[600px] w-full'>
          <h1 className='text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF5F6D] to-[#FFC371] mb-4'>
            Memory Boost
          </h1>
          <p className='text-lg text-gray-700 mb-8'>
            Craft engaging flashcards to enhance your memory. Type your question
            on the front and the answer on the back.
          </p>

          <h2 className='text-2xl font-semibold text-[#444] mb-4'>
            New Flashcard
          </h2>
          <label className='block font-medium text-gray-800 mb-1'>
            Front (Question/Term):
          </label>
          <textarea
            className='w-full p-4 mb-5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm'
            placeholder='Enter the question or term here'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <label className='block font-medium text-gray-800 mb-1'>
            Back (Answer/Definition):
          </label>
          <textarea
            className='w-full p-4 mb-6 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm'
            placeholder='Enter the answer or definition here'
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button
            onClick={addFlashcard}
            className='bg-gradient-to-r from-[#FF5F6D] to-[#FFC371] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition'>
            Generate Flashcard
          </button>
        </div>

        <div className='flex-1'>
          <input
            type='text'
            placeholder='Search flashcards...'
            className='w-full p-3 mb-6 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <h2 className='text-3xl font-bold text-white mb-6'>
            Flashcards Collection
          </h2>

          <div className='flex flex-wrap gap-6 justify-center'>
            {filteredFlashcards.length ? (
              filteredFlashcards.map((card) => (
                <div
                  key={card.id}
                  className='w-[260px] h-[260px] perspective cursor-pointer'
                  onClick={() => toggleFlip(card.id)}>
                  <div
                    className={`relative w-full h-full transition-transform duration-700 preserve-3d ${
                      flipped[card.id] ? 'rotate-y-180' : ''
                    }`}>
                    <div className='absolute inset-0 backface-hidden bg-yellow-200 rounded-xl shadow-xl p-5 flex flex-col justify-between contbtnfs'>
                      <p className='text-center text-lg font-medium overflow-auto max-h-[180px]'>
                        {card.question}
                      </p>
                      <div className='flex justify-between mt-4 opacity-0 transition btnfs'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(card);
                          }}
                          className='flex items-center gap-1 text-sm text-yellow-600'>
                          <PenLine size={18} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFlashcard(card.id);
                          }}
                          className='text-red-500 text-sm'>
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    <div className='absolute inset-0 backface-hidden rotate-y-180 bg-[#333] text-white rounded-xl shadow-xl p-5 flex flex-col justify-between contbtnfs'>
                      <p className='text-center text-lg font-medium overflow-auto max-h-[180px]'>
                        {card.answer}
                      </p>
                      <div className='flex justify-between mt-4 opacity-0 transition btnfs'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(card);
                          }}
                          className='flex items-center gap-1 text-sm text-yellow-300'>
                          <PenLine size={18} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFlashcard(card.id);
                          }}
                          className='text-red-300 text-sm'>
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-white'>No flashcards found.</p>
            )}
          </div>
        </div>
      </div>

      {editingId && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50'>
          <div className='bg-white p-6 rounded-xl shadow-2xl w-96'>
            <h2 className='text-xl font-bold mb-4'>Edit Flashcard</h2>
            <input
              type='text'
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              className='w-full p-3 mb-3 border border-gray-300 rounded'
              placeholder='Edit question'
            />
            <input
              type='text'
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
              className='w-full p-3 mb-4 border border-gray-300 rounded'
              placeholder='Edit answer'
            />
            <div className='flex justify-end gap-2'>
              <button
                onClick={saveEdit}
                className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'>
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
