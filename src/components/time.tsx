import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Time() {
  return (
    <div className='min-h-screen'>
      <Link
        href='/dashboard'
        className='absolute left-5 top-5 lg:top-7 border border-[#ccc] rounded p-1'>
        <ArrowLeft />
      </Link>
    </div>
  );
}
