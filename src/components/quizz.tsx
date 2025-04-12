import { useState } from 'react';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/firebase';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

interface QuizResponse {
  topic: string;
  questions: QuizQuestion[];
}

export default function Quiz() {
  const [topic, setTopic] = useState<string>('');
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number | null>(null);

  const { user } = useAuth();

  const fetchQuiz = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setLoading(true);
    setError(null);
    setQuiz(null);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(null);

    try {
      const response = await fetch('/api/quizAi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (response.ok) {
        setQuiz(data);
      } else {
        setError(data.error || 'Failed to fetch quiz');
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionKey: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionKey,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = correctCount;
    setScore(finalScore);
    setSubmitted(true);

    try {
      const userDocRef = doc(db, 'score', user.uid);

      // Fetch existing score (if any)
      const existingDoc = await getDoc(userDocRef);
      const previousScore = existingDoc.exists()
        ? existingDoc.data().score || 0
        : 0;

      const updatedScore = previousScore + finalScore;

      await setDoc(
        userDocRef,
        {
          name: user.displayName || 'Anonymous',
          photo: user.photoURL || '',
          score: updatedScore,
          lastUpdated: new Date(),
        },
        { merge: true },
      );

      console.log('✅ Cumulative score updated successfully');
    } catch (err) {
      console.error('❌ Error saving score:', err);
      setError('Failed to save score.');
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setTopic('');
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] transition-colors duration-300'>
      <Link
        href='/'
        className='absolute left-5 top-5 lg:top-7 border border-[#ccc] rounded p-1'>
        <ArrowLeft />
      </Link>
      <h1 className='text-3xl font-bold py-5 text-center'>Quiz Generator</h1>
      {!quiz ? (
        <div className='bg-white/80 shadow-sm max-w-[600px] w-full m-auto transition-all rounded-2xl overflow-hidden p-6 mb-6'>
          <input
            type='text'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder='Enter quiz topic...'
            className='border-b outline-none border-[#ccc] p-2 w-full'
            onKeyDown={(e) => e.key === 'Enter' && fetchQuiz()}
          />
          <button
            onClick={fetchQuiz}
            className='w-full mt-4 px-4 py-2 border border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-xl transition-colors'
            disabled={loading}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      ) : (
        <div className='flex flex-col items-center'>
          <div className='flex justify-between items-center mb-4 max-w-[800px] w-full'>
            <h2 className='text-xl font-bold'>{quiz.topic} Quiz</h2>
            <button
              onClick={resetQuiz}
              className='px-4 py-2 border border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-xl transition-colors'>
              New Quiz
            </button>
          </div>

          <div className='space-y-6'>
            {quiz.questions.map((question, index) => (
              <div
                key={index}
                className='bg-white/80 shadow-sm max-w-[800px] w-full m-auto transition-all rounded-2xl overflow-hidden p-6 mb-6'>
                <p className='font-semibold mb-3'>
                  {index + 1}. {question.question}
                </p>
                <div className='space-y-2'>
                  {Object.entries(question.options).map(([key, value]) => (
                    <div key={key} className='flex items-center'>
                      <input
                        type='radio'
                        id={`q${index}-${key}`}
                        name={`question-${index}`}
                        checked={selectedAnswers[index] === key}
                        onChange={() => handleAnswerSelect(index, key)}
                        disabled={submitted}
                        className='mr-2'
                      />
                      <label
                        htmlFor={`q${index}-${key}`}
                        className={`cursor-pointer ${
                          submitted && question.correctAnswer === key
                            ? 'text-green-600 font-bold'
                            : ''
                        } ${
                          submitted &&
                          selectedAnswers[index] === key &&
                          selectedAnswers[index] !== question.correctAnswer
                            ? 'text-red-600'
                            : ''
                        }`}>
                        <strong>{key}.</strong> {value}
                      </label>
                    </div>
                  ))}
                </div>
                {submitted && (
                  <p
                    className={`mt-2 text-sm ${
                      selectedAnswers[index] === question.correctAnswer
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {selectedAnswers[index] === question.correctAnswer
                      ? '✓ Correct'
                      : `✗ Correct answer: ${question.correctAnswer}`}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={
                Object.keys(selectedAnswers).length !== quiz.questions.length
              }
              className={`my-6 p-3 rounded-xl w-full max-w-[800px] ${
                Object.keys(selectedAnswers).length === quiz.questions.length
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}>
              Submit Answers
            </button>
          ) : (
            <div className='my-6 p-4 bg-blue-50 rounded-lg flex flex-col items-center'>
              <h3 className='text-xl font-bold mb-2'>Quiz Results</h3>
              <p className='text-lg'>
                Your score:{' '}
                <span className='font-bold'>
                  {score} out of {quiz.questions.length}
                </span>{' '}
                ({Math.round((score! / quiz.questions.length) * 100)}%)
              </p>
              <button
                onClick={resetQuiz}
                className='mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'>
                Try Another Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className='mt-4 p-3 bg-red-100 text-red-700 rounded'>{error}</div>
      )}
    </div>
  );
}
