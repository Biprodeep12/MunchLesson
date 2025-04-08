import { useState } from 'react';
import { auth } from '@/firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      window.location.href = '/';
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      window.location.href = '/';
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Google Sign-In failed. Try again.');
      }
    }
  };

  return (
    <>
      <Link
        href='/'
        className='absolute left-5 top-5 p-2 border border-[#ccc] rounded-xl'>
        <ArrowLeft />
      </Link>
      <div className='shadow-xl flex flex-col absolute top-1/2 left-1/2 -translate-1/2 px-5 py-7 border border-[#ccc] rounded-2xl items-center max-w-[400px] w-full'>
        <h2 className='text-3xl mb-4 font-bold'>
          {isRegister ? 'Register' : 'Login'}
        </h2>
        {error && <p className='text-red-500'>{error}</p>}

        <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-full'>
          {isRegister && (
            <input
              type='text'
              placeholder='Name'
              className='border-b border-[#ccc] h-10 outline-none'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type='email'
            placeholder='Email'
            className='border-b border-[#ccc] h-10 outline-none'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type='password'
            placeholder='Password'
            className='border-b border-[#ccc] h-10 outline-none'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type='submit'
            className='bg-blue-500 rounded-xl font-bold text-white px-4 py-2'>
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <button
          onClick={handleGoogleSignIn}
          className='bg-gray-200 rounded-xl font-bold px-4 py-2 mt-4'>
          Sign in with Google
        </button>

        <p className='mt-4'>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className='text-blue-500'>
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </>
  );
};

export default AuthPage;
