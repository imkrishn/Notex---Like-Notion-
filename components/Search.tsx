'use client'

import { database } from '@/app/appwrite';
import { useLoggedInUser } from '@/hooks/getLoggedInUser';
import fetchPages from '@/lib/fetchAllPages';
import { RootState } from '@/redux/store';
import { Query } from 'appwrite';
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

const Search = () => {
  const { theme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const loggedInUserId = useLoggedInUser().$id

  useEffect(() => {
    async function fetchPages(userId: string) {
      try {
        const pages = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
          [
            Query.equal('ownerId', userId),
          ]
        )

        const sharedWithMe = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_USERS_ID!,
          [
            Query.equal('sharedUserId', userId)
          ]
        );

        console.log(sharedWithMe);

        const sharedWithMePages = sharedWithMe.documents.map((shared) => shared.pages)

        console.log(sharedWithMePages);

      } catch (Err) {
        console.log(Err)

      }
    }
    if (loggedInUserId) {
      fetchPages(loggedInUserId)
    }
  }, [loggedInUserId, fetchPages])

  console.log(loggedInUserId);

  return (
    <div className='fixed inset-0 flex justify-center items-center z-[99999]'>
      <div className='absolute inset-0 bg-black/30 backdrop-blur-sm'></div>
      <div className='relative w-1/2 h-[70%] bg-[#cecece] rounded shadow shadow-gray-500 p-4 py-7'>
        <input type='text' placeholder="Search Your's Pages" className='outline-none border w-full rounded-lg px-3 py-1' />
        <div className='py-4'>
          {['How to grow', 'Learn coding', 'Next.js tips'].map((page, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center gap-2 px-2 py-1 cursor-pointer ${hoveredIndex === index ? 'bg-[#b8b4b4]' : ''
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="38" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-venetian-mask"><path d="M18 11c-1.5 0-2.5.5-3 2" /><path d="M4 6a2 2 0 0 0-2 2v4a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3a8 8 0 0 0-5 2 8 8 0 0 0-5-2z" /><path d="M6 11c1.5 0 2.5.5 3 2" /></svg>

              <p className='w-full'>{page}</p>
              {hoveredIndex !== index && <p className='whitespace-nowrap text-sm'>25 March</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Search;
