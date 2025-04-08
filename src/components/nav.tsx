import Image from 'next/image';

export default function Nav() {
  return (
    <>
      <nav className='bg-[#04285a] items-center flex pt-[10px] pb-[15px] px-10 gap-5'>
        <Image src='/studymunch_logo.jpg' width={65} height={65} alt='Logo' />
        <div className='text-3xl font-bold'>StudyMunch</div>
        <div className='text-xl text-gray-400 flex flex-row gap-5 ml-auto font-bold'>
          {[{ name: 'Home' }, { name: 'Dashboard' }, { name: 'Credits' }].map(
            (opt, index) => (
              <div key={index} className='hover:text-white cursor-pointer'>
                {opt.name}
              </div>
            ),
          )}
          <div>Login</div>
        </div>
      </nav>
    </>
  );
}
