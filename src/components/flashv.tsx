import React, { useState } from 'react';

export default function FlashcardApp() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className='min-h-screen bg-gradient-to-tr from-[#FFD3A5] via-[#FD6585] to-[#FFB88C] p-10 font-sans text-[#2F2F2F]'>
      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10'>
        {/* Left section */}
        <div className='bg-white bg-opacity-70 backdrop-blur-md p-8 rounded-3xl shadow-2xl'>
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
          />

          <label className='block font-medium text-gray-800 mb-1'>
            Back (Answer/Definition):
          </label>
          <textarea
            className='w-full p-4 mb-6 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm'
            placeholder='Enter the answer or definition here'
          />

          <button className='bg-gradient-to-r from-[#FF5F6D] to-[#FFC371] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition'>
            Generate Flashcard
          </button>
        </div>

        <div className='max-h-[75v]'>
          <input
            type='text'
            placeholder='Search flashcards...'
            className='w-full p-3 mb-6 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <h2 className='text-3xl font-bold text-transparent bg-clip-text bg-white mb-6'>
            Flashcards Collection
          </h2>

          <div className='space-y-5'>
            <div className='bg-gradient-to-r from-[#FDB99B] to-[#CF8BF3] p-5 rounded-xl shadow-md text-white'>
              <p className='font-bold text-lg mb-1'>Q: </p>
              <p className='text-md'>A:</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
