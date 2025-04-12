'use client'; // if using Next.js pages directory, omit this

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Player {
  name: string;
  photo: string;
  score: number;
  uid: string;
}

export default function Lead() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scoreRef = collection(db, 'score');
        const q = query(scoreRef, orderBy('score', 'desc'));
        const snapshot = await getDocs(q);

        const data: Player[] = snapshot.docs.map((doc) => ({
          uid: doc.id,
          name: doc.data().name || 'Anonymous',
          photo: doc.data().photo || '/default-avatar.png',
          score: doc.data().score || 0,
        }));

        setPlayers(data);
      } catch (err) {
        console.error('❌ Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  return (
    <div className='min-h-screen px-4 py-8 bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] '>
      <Link
        href='/'
        className='absolute left-5 top-5 lg:top-7 border border-[#ccc] rounded p-1'>
        <ArrowLeft color='white' />
      </Link>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-5xl font-bold text-center text-[#FF6B6B] mb-4'>
          🏆 Leaderboard
        </h1>
        <p className='text-center text-lg text-[#FF6B6B] mb-8'>
          Reach the top and shine with XP! ✨
        </p>

        {/* Leaderboard Table */}
        <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
          <div className='flex flex-row gap-4 justify-evenly bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] p-4 text-sm font-bold text-gray-700'>
            <div>Rank</div>
            <div>Player</div>
            <div>XP</div>
            <div>Level</div>
          </div>

          {!loading &&
            players.map((player, index) => (
              <div
                key={player.uid}
                className={`flex flex-row justify-evenly gap-6 items-center p-4 border-b transition-all duration-300 hover:bg-gray-50 ${
                  index < 3
                    ? 'bg-gradient-to-r from-yellow-200 to-yellow-400'
                    : 'bg-white'
                }`}>
                <div
                  className={`font-bold text-center text-lg ${
                    index === 0
                      ? 'text-yellow-600 animate-pulse'
                      : index === 1
                      ? 'text-gray-500'
                      : index === 2
                      ? 'text-orange-500'
                      : 'text-gray-700'
                  }`}>
                  {index + 1}
                </div>

                <div className='flex items-center gap-4'>
                  <Image
                    width={56}
                    height={56}
                    src={player.photo}
                    alt={player.name}
                    className='w-14 h-14 rounded-full border-4 border-white shadow-lg object-cover'
                  />
                  <span className='font-medium text-gray-800 text-lg'>
                    {player.name}
                  </span>
                </div>

                <div className='text-orange-500 font-semibold'>
                  {player.score * 10} XP
                </div>

                <div className='text-md text-blue-700 bg-blue-100 px-4 py-2 rounded-full w-fit font-semibold'>
                  Lv. {Math.floor(player.score / 10)}
                </div>
              </div>
            ))}
        </div>

        <p className='text-center text-sm text-white mt-6'>
          🚀 Keep climbing and unlock awesome perks soon!
        </p>
      </div>
    </div>
  );
}
