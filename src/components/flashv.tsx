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
    <div className="min-h-screen bg-gradient-to-tr from-[#FFD3A5] via-[#FD6585] to-[#FFB88C] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 font-sans text-[#2F2F2F]">
      <Link
        href="/"
        className="fixed left-4 top-4 z-10 border border-[#ccc] rounded-lg p-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="max-w-7xl mx-auto pt-16 sm:pt-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <div className="w-full lg:w-[500px] lg:sticky lg:top-8 bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF5F6D] to-[#FFC371] mb-4">
              Memory Boost
            </h1>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
              Craft engaging flashcards to enhance your memory. Type your question on the front and the answer on the
              back.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-[#444] mb-4">New Flashcard</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-800 mb-2 text-sm sm:text-base">
                  Front (Question/Term):
                </label>
                <textarea
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base resize-none"
                  placeholder="Enter the question or term here"
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium text-gray-800 mb-2 text-sm sm:text-base">
                  Back (Answer/Definition):
                </label>
                <textarea
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base resize-none"
                  placeholder="Enter the answer or definition here"
                  rows={3}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>

              <button
                onClick={addFlashcard}
                disabled={!question.trim() || !answer.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-[#FF5F6D] to-[#FFC371] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Flashcard
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search flashcards..."
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base bg-white/90 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center lg:text-left">
              Flashcards Collection ({filteredFlashcards.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
              {filteredFlashcards.length ? (
                filteredFlashcards.map((card) => (
                  <div
                    key={card.id}
                    className="w-full max-w-[280px] h-[200px] sm:h-[240px] cursor-pointer group"
                    style={{ perspective: "1000px" }}
                    onClick={() => toggleFlip(card.id)}
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-700 ${
                        flipped[card.id] ? "[transform:rotateY(180deg)]" : ""
                      }`}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div
                        className="absolute inset-0 bg-yellow-200 rounded-xl shadow-xl p-4 sm:p-5 flex flex-col justify-between group-hover:shadow-2xl transition-shadow"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-center text-sm sm:text-base lg:text-lg font-medium overflow-auto max-h-full leading-relaxed">
                            {card.question}
                          </p>
                        </div>
                        <div className="flex justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditing(card)
                            }}
                            className="flex items-center gap-1 text-xs sm:text-sm text-yellow-700 hover:text-yellow-800 transition-colors"
                          >
                            <PenLine size={16} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteFlashcard(card.id)
                            }}
                            className="text-red-500 hover:text-red-600 transition-colors text-xs sm:text-sm"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      <div
                        className="absolute inset-0 bg-[#333] text-white rounded-xl shadow-xl p-4 sm:p-5 flex flex-col justify-between group-hover:shadow-2xl transition-shadow"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-center text-sm sm:text-base lg:text-lg font-medium overflow-auto max-h-full leading-relaxed">
                            {card.answer}
                          </p>
                        </div>
                        <div className="flex justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditing(card)
                            }}
                            className="flex items-center gap-1 text-xs sm:text-sm text-yellow-300 hover:text-yellow-200 transition-colors"
                          >
                            <PenLine size={16} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteFlashcard(card.id)
                            }}
                            className="text-red-300 hover:text-red-200 transition-colors text-xs sm:text-sm"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-white text-lg sm:text-xl">
                    {searchTerm
                      ? "No flashcards found matching your search."
                      : "No flashcards yet. Create your first one!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Flashcard</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question:</label>
                <textarea
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm resize-none"
                  placeholder="Edit question"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer:</label>
                <textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm resize-none"
                  placeholder="Edit answer"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                onClick={saveEdit}
                disabled={!editQuestion.trim() || !editAnswer.trim()}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditingId(null)
                  setEditQuestion("")
                  setEditAnswer("")
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
