'use client'

import { database } from '@/app/appwrite';
import { useLoggedInUser } from '@/hooks/getLoggedInUser';
import { useGetPages, useGetSharedPages } from '@/hooks/getPages';
import formatTime from '@/lib/formatTime';
import { Menu } from '@/types/menuType';
import { Query } from 'appwrite';
import { CircleX, RotateCcw, StickyNote, Trash } from 'lucide-react';
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { toast } from 'sonner';


const Search = ({ setMenu }: { setMenu: Dispatch<SetStateAction<Menu>> }) => {
  const { theme } = useTheme();
  const router = useRouter()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const loggedInUser = useLoggedInUser()
  const loggedInUserId = loggedInUser.$id;
  const { pages, hasMore, loadMore, loading, setPages } = useGetPages(loggedInUserId);
  const { sharedPages, hasMore: sharedHasMore, loading: sharedLoading, loadMore: sharedLoadMore } = useGetSharedPages(loggedInUserId);


  async function onSearch(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const query = e.target.value;

      if (!query.trim() || !loggedInUserId) {
        return
      }

      const result = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        [
          Query.contains('name', query),
          Query.equal('ownerId', loggedInUserId)
        ]
      );

      setPages(result.documents)

    } catch (err) {
      console.log(err);
      toast.error('Failed to Search')
    }
  }

  return (
    <div className='fixed inset-0 flex justify-center items-center z-[99999]'>
      <div className='absolute inset-0 bg-black/30 backdrop-blur-sm'></div>
      <div className='relative lg:w-1/2 h-[80%] w-[90%] overflow-auto bg-[#fff] rounded shadow shadow-gray-500 p-4 pt-2 '>
        <CircleX size={20} color='#3089bd' className='absolute right-4 my-2 cursor-pointer' onClick={() => setMenu('Personal')} />
        <input onChange={onSearch} type='text' placeholder="Search Your's Pages" className='mt-9  outline-none border w-full rounded-lg px-3 py-1' />
        <div className='py-4 select-none  h-full pr-2'>
          <h2 className='font-bold text-sm'>Personal</h2>
          {pages.length === 0 && !loading ? <p className='text-sm'>No Data found</p> : pages.map((page, index) => (
            <div
              onClick={() => {
                router.push(`/${loggedInUser.fullName}/${page.$id}`);
                setMenu('Personal');
              }}
              key={page.$id}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center gap-2 px-2 py-1 cursor-pointer ${hoveredIndex === index ? 'bg-[#3f3a3a60]' : ''
                }`}
            >
              <StickyNote size={30} color='#37b5e7' />
              <p className='w-full text-sm font-medium'>{page.name}</p>
              {/*               {hoveredIndex === index && (page.isDeleted ? <RotateCcw size={20} color='#199119ef' /> : <Trash size={20} color='#d13838ec' />)}
 */}              {hoveredIndex !== index && <p className='whitespace-nowrap text-xs'>{formatTime(page.$createdAt)}</p>}
            </div>

          ))}
          {hasMore && <p onClick={() => loadMore} className='px-2 py-1 text-xs font-medium cursor-pointer active:scale-[.98]'>{loading ? '...Loading' : '...Load More'}</p>}

          {sharedPages.length > 0 && <h2 className='font-bold text-sm py-1'>Shared With me</h2>}
          {sharedPages.map((page, index) => (
            <div
              key={page.$id}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center gap-2 px-2 py-1 cursor-pointer ${hoveredIndex === index ? 'bg-[#3f3a3a60]' : ''
                }`}
            >
              <StickyNote size={30} color='#37b5e7' />
              <p className='w-full'>{page.name}</p>
              {hoveredIndex !== index && <p className='whitespace-nowrap text-xs'>{formatTime(page.$createdAt)}</p>}
            </div>

          ))}
          {sharedHasMore && sharedPages.length > 1 && <p onClick={sharedLoadMore} className='px-2 py-1 text-xs font-medium cursor-pointer active:scale-[.98]'>{sharedLoading ? '...Loading' : '...Load More'}</p>}

        </div>
      </div>
    </div>
  )
}

export default Search;
