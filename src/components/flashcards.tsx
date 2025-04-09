import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { PenLine, X } from 'lucide-react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export default function Flash() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    const fetchFlashcards = async () => {
      const querySnapshot = await getDocs(collection(db, 'flashcards'));
      const flashcardsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Flashcard[];
      setFlashcards(flashcardsData);
    };

    fetchFlashcards();
  }, []);

  const addFlashcard = async () => {
    if (!question || !answer) return;
    const docRef = await addDoc(collection(db, 'flashcards'), {
      question,
      answer,
    });

    setFlashcards([...flashcards, { id: docRef.id, question, answer }]);
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
    card.question.toLowerCase().includes(text.toLowerCase()),
  );

  return (
    <div className='min-h-screen flex flex-col lg:flex-row items-center p-5 bg-gray-100'>
      <div className='flex-1 flex flex-col self-start gap-4 w-full'>
        <div className='flex flex-col lg:flex-row items-center lg:px-15 lg:gap-15 gap-5'>
          <h1 className='text-3xl font-bold text-nowrap'>Your Flashcards</h1>
          <div className='block lg:hidden bg-white p-4 rounded border border-[#ccc] mb-5'>
            <textarea
              placeholder='Enter question'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className='border-b border-[#ccc] min-h-[45px] h-[45px] max-h-[200px] outline-none p-2 w-full mb-2'
            />
            <textarea
              placeholder='Enter answer'
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className='border-b border-[#ccc] min-h-[45px] h-[45px] max-h-[200px] outline-none p-2 w-full mb-2'
            />
            <button
              onClick={addFlashcard}
              className='bg-blue-500 text-white p-2 w-full rounded'>
              Add Flashcard
            </button>
          </div>
          <input
            placeholder='Search for your Flashcards'
            className='border-b border-[#ccc] outline-none p-2 w-full mb-2'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className='flex-1 flex flex-row flex-wrap gap-[20px] justify-center'>
          {filteredFlashcards.length ? (
            filteredFlashcards.map((card) => (
              <div
                key={card.id}
                className='w-full max-w-[300px] h-[300px] perspective-1000'>
                <div
                  className={`flashcard-inner w-full h-full transition-transform duration-500 flex items-center ${
                    flipped[card.id] ? 'rotate-y-180' : ''
                  }`}
                  onClick={() => toggleFlip(card.id)}>
                  <div className='flashcard-front absolute inset-0 flex items-center justify-center bg-[#dafada] shadow-lg rounded p-5 text-[#04285a]'>
                    <p className='text-lg font-semibold text-center overflow-y-auto max-h-[230px] cardSc'>
                      {card.question}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(card);
                      }}
                      className='absolute bottom-2 left-2 bg-yellow-500 text-white text gap-2 p-1 rounded cursor-pointer flex flex-row items-center'>
                      <PenLine size={19} /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFlashcard(card.id);
                      }}
                      className='absolute bottom-2 right-2 bg-red-500 text-white text-xs p-1 rounded cursor-pointer'>
                      <X />
                    </button>
                  </div>
                  <div className='flashcard-back absolute inset-0 flex items-center justify-center bg-[#04285a] text-[#dafada] shadow-lg rounded p-5 rotate-y-180'>
                    <p className='text-lg font-semibold text-center overflow-y-auto max-h-[230px] cardSc'>
                      {card.answer}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(card);
                      }}
                      className='absolute bottom-2 left-2 bg-yellow-500 text-white text gap-2 p-1 rounded cursor-pointer flex flex-row items-center'>
                      <PenLine size={19} /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFlashcard(card.id);
                      }}
                      className='absolute bottom-2 right-2 bg-red-500 text-white text-xs p-1 rounded cursor-pointer'>
                      <X />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No Records Found</div>
          )}
        </div>
      </div>

      <div className='lg:block hidden sticky top-[20px] bg-white self-start p-4 rounded border border-[#ccc] mb-5 w-96'>
        <textarea
          placeholder='Enter question'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className='border-b border-[#ccc] min-h-[45px] h-[45px] max-h-[200px] outline-none p-2 w-full mb-2'
        />
        <textarea
          placeholder='Enter answer'
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className='border-b border-[#ccc] min-h-[45px] h-[45px] max-h-[200px] outline-none p-2 w-full mb-2'
        />
        <button
          onClick={addFlashcard}
          className='bg-blue-500 text-white p-2 w-full rounded'>
          Add Flashcard
        </button>
      </div>

      {editingId && (
        <div className='fixed inset-0 backdrop-blur bg-background/70 flex items-center justify-center'>
          <div className='bg-white p-5 rounded-xl shadow-lg w-96'>
            <h2 className='text-xl font-bold mb-4'>Edit Flashcard</h2>
            <input
              type='text'
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              className='border-b border-[#ccc] outline-none p-2 w-full mb-2'
            />
            <input
              type='text'
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
              className='border-b border-[#ccc] outline-none p-2 w-full mb-2'
            />
            <div className='flex justify-end gap-2'>
              <button
                onClick={saveEdit}
                className='bg-green-400 hover:bg-green-500 cursor-pointer text-white p-2 rounded'>
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className='bg-gray-400 hover:bg-gray-500 cursor-pointer text-white p-2 rounded'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
