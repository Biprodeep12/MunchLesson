import { AlignJustify, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Import useRouter
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { useAuth } from '@/context/AuthContext';

export default function Nav() {
  const [navTog, setNavTog] = useState(false);
  const [profDisplay, setProfDisplay] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <>
      <nav className='bg-[#04285a] items-center flex justify-center'>
        <div className='max-w-[1440px] w-full items-center flex pt-[10px] pb-[15px] sm:px-10 px-5 gap-5'>
          <Image src='/studymunch_logo.jpg' width={65} height={65} alt='Logo' />
          <Link href='/' className='sm:text-3xl text-2xl font-bold text-white'>
            StudyMunch
          </Link>

          <div className='text-xl md:flex flex-row gap-5 ml-auto font-bold hidden items-center'>
            {['Home', 'Dashboard', 'Credits'].map((name) => {
              const isActive =
                router.pathname === `/${name.toLowerCase()}` ||
                (name === 'Home' && router.pathname === '/');
              return (
                <Link
                  key={name}
                  href={name === 'Home' ? '/' : `/${name.toLowerCase()}`}
                  className={`cursor-pointer ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}>
                  {name}
                </Link>
              );
            })}
            {user ? (
              <div className='relative'>
                <div
                  className='overflow-hidden rounded-4xl cursor-pointer'
                  onClick={() => setProfDisplay((prev) => !prev)}>
                  <Image
                    src={user.photoURL || ''}
                    alt={user?.displayName || 'User'}
                    width={40}
                    height={40}
                  />
                </div>
                {profDisplay && (
                  <div className='absolute border border-[#ccc] -bottom-[45px] right-0 z-10 bg-white rounded p-1'>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href='/AuthPage'
                className='cursor-pointer text-white px-3 py-2 rounded-xl bg-[#0948a1]'>
                Sign Up/Sign In
              </Link>
            )}
          </div>

          <div
            className='cursor-pointer md:hidden ml-auto'
            onClick={() => setNavTog((prev) => !prev)}>
            {navTog ? (
              <X size={30} color='white' />
            ) : (
              <AlignJustify size={30} color='white' />
            )}
          </div>
        </div>
      </nav>

      <div
        className={`bg-white text-[#04285a] text-xl flex flex-col gap-4 text-center font-bold overflow-hidden transition-all duration-300 items-center ${
          navTog ? 'max-h-[300px] opacity-100 py-5' : 'max-h-0 opacity-0'
        } `}>
        {['Home', 'Dashboard', 'Credits'].map((name) => {
          const isActive =
            router.pathname === `/${name.toLowerCase()}` ||
            (name === 'Home' && router.pathname === '/');
          return (
            <Link
              key={name}
              href={name === 'Home' ? '/' : `/${name.toLowerCase()}`}
              className={`cursor-pointer ${
                isActive
                  ? 'text-[#04285a] font-bold'
                  : 'text-gray-400 hover:text-[#04285a]'
              }`}>
              {name}
            </Link>
          );
        })}
        {user ? (
          <>
            <div className='overflow-hidden rounded-4xl cursor-pointer'>
              <Image
                src={user.photoURL || ''}
                alt={user?.displayName || 'User'}
                width={40}
                height={40}
              />
            </div>
            <div>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </>
        ) : (
          <Link
            href='/AuthPage'
            className='cursor-pointer hover:text-[#04285a] bg-gray-200 py-1 px-2 rounded-xl'>
            Sign Up/Sign In
          </Link>
        )}
      </div>
    </>
  );
}
