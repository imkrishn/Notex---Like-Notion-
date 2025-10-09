'use client'

import { useGetPages } from '@/hooks/getPages'
import Card from './Card'
import { useLoggedInUser } from '@/hooks/getLoggedInUser'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from './Spinner'



const Home = () => {
  const { $id, fullName } = useLoggedInUser();
  const router = useRouter()
  const { pages, loadMore, loading, hasMore } = useGetPages($id);
  const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore && !loading) {
        loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);




  return (
    <div className=' w-full h-screen overflow-auto' ref={containerRef}>
      {/* <video autoPlay muted loop playsInline className='w-full'>
        <source src="https://v1.pinimg.com/videos/mc/720p/e3/bd/d5/e3bdd58ff441dac9d14422f85f82f24c.mp4" type="video/mp4" />
      </video>
 */}

      <div className='w-full h-40 bg-[#8ec9e4] opacity-80 relative'>
        <p className='font-bold text-[#fff] absolute left-32 bottom-8'>Hi , Krishna</p>
        <p className="text-6xl absolute left-20 -bottom-7.5 font-bold bg-gradient-to-b from-[#2685b1] to-green-800 text-transparent bg-clip-text">
          WELCOME
        </p>

      </div>
      <div className='p-20 flex flex-wrap  justify-items-center-safe  gap-6 w-full '>
        {pages.map((card) => (
          <Card key={card.$id} data={card} onClick={() => {
            localStorage.removeItem('menu')
            router.push(`/${fullName}/${card.$id}`)
          }
          } />
        ))}
        {loading && <Spinner size={50} color='#2685b1' />}
      </div>
    </div>
  )
}

export default Home



