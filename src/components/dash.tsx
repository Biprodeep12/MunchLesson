import { ClipboardList, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Dash() {
  return (
    <div className='min-h-screen flex flex-col p-5'>
      <div className='flex flex-col sm:flex-row flex-wrap gap-5'>
        <div className='flex flex-col py-5 px-4 border border-[#ccc] rounded-xl w-full sm:max-w-[250px]'>
          <div className='items-center flex flex-row justify-between mb-2'>
            <div className='font-semibold'>Study Streak</div>
            <Clock size={20} color='blue' />
          </div>
          <div className='font-bold text-3xl'>12 days</div>
          <div className='text-sm text-[#8f8f8f]'>
            +2 days compared to last week
          </div>
        </div>
        <div className='flex flex-col py-5 px-4 border border-[#ccc] rounded-xl w-full sm:max-w-[250px]'>
          <div className='items-center flex flex-row justify-between mb-2'>
            <div className='font-semibold'>Total Study Time</div>
            <Clock size={20} color='blue' />
          </div>
          <div className='font-bold text-3xl'>42.5 hours</div>
          <div className='text-sm text-[#8f8f8f]'>
            +5.2 hours from last week
          </div>
        </div>
        <div className='flex flex-col py-5 px-4 border border-[#ccc] rounded-xl w-full sm:max-w-[250px]'>
          <div className='items-center flex flex-row justify-between mb-2'>
            <div className='font-semibold'>Study Streak</div>
            <Clock size={20} color='blue' />
          </div>
          <div className='font-bold text-3xl'>12 days</div>
          <div className='text-sm text-[#8f8f8f]'>
            +2 days compared to last week
          </div>
        </div>
      </div>
      <div className='h-[1px] w-full bg-[#ccc] my-5'></div>
      <div className='flex flex-col lg:flex-row'>
        <div className='flex-1 flex flex-row flex-wrap gap-5 justify-center'>
          {[
            {
              lk: '/AIPage',
              img: '/flashcards.jpg',
              title: 'Study Ai',
              des: 'Get instant help with any subject and master difficult concepts with our AI-powered study platform.',
            },
            {
              lk: '/FlashPage',
              img: '/flashcards.jpg',
              title: 'FlashCards',
              des: 'Supercharge your recall with flashcards. Rapidly absorb and retain crucial information',
            },
            {
              lk: '/TimePage',
              img: '/studyplanner.jpg',
              title: 'Time Wrap Planner',
              des: 'Schedule your your studies and bend time to your academic will for the week/month.',
            },
            {
              lk: '/',
              img: '/leadershipboard.jpg',
              title: 'Leaderboard',
              des: 'Every point counts in the pursuit of success.',
            },
            {
              lk: '/',
              img: '/quizz.jpg',
              title: 'Knowledge Knockout',
              des: 'Reinforce your understanding with dynamic quizzes',
            },
          ].map((dash, index) => (
            <Link
              href={dash.lk}
              key={index}
              className='flex flex-row p-4 border border-[#ccc] rounded-xl gap-4 sm:max-w-[410px] w-full hover:shadow-xl transition-all duration-300'>
              <Image
                src={dash.img}
                alt='FlashCard'
                width={150}
                height={150}
                className='rounded-xl'
              />
              <div className='flex flex-col gap-2'>
                <div className='font-bold text-2xl sm:text-3xl'>
                  {dash.title}
                </div>
                <div>{dash.des}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className=' border-l-[1px] border-t-[1px] lg:border-t-0 mt-5 lg:mt-0 border-[#ccc] ml-5 p-5'>
          <div className='flex flex-col lg:w-[400px] w-full border border-[#ccc] rounded p-4 gap-2'>
            <div className='text-3xl font-bold flex flex-row items-center gap-3'>
              <ClipboardList color='green' />
              Tasks
            </div>
            <div>No Tasks</div>
          </div>
        </div>
      </div>
    </div>
  );
}
