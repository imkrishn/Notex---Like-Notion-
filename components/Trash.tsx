'use client'

import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import Card from './Card'
import { useLoggedInUser } from '@/hooks/getLoggedInUser'
import { useRouter } from 'next/navigation'
import { ArrowLeftCircle, ArrowRightCircle, CircleX } from 'lucide-react'
import { database } from '@/app/appwrite'
import { Query } from 'appwrite'
import { PageType } from '@/types/pageType'
import { useMediaQuery } from 'usehooks-ts'
import Spinner from './Spinner'
import { Menu } from '@/types/menuType'

function Trash({ setMenu }: { setMenu: Dispatch<SetStateAction<Menu>> }) {
  const { $id, fullName } = useLoggedInUser()
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width:768px)')
  const cardsPerView = isMobile ? 1 : 2

  const [deletedPages, setDeletedPages] = useState<PageType[]>([]);
  const [backupPages, setBackupPages] = useState<PageType[]>([])
  const [loading, setLoading] = useState(false)
  const [lastDocId, setLastDocId] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0)
  }, [cardsPerView])

  //on searching

  async function onSearching(query?: string) {
    try {
      if (!$id) return
      setLoading(true)

      if (query?.trim() === '' || !query) {
        setDeletedPages(backupPages)
        return
      }

      const res = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        [
          Query.startsWith('name', query),
          Query.equal('ownerId', $id),
          Query.equal('isDeleted', true),
          Query.orderDesc('deletedAt'),
        ]
      );

      if (res.total > 0) {
        setDeletedPages(res.documents)
      }

    } catch (Err) {
      console.log(Err);
    } finally {
      setLoading(false)
    }
  }

  //fetch deleted pages and for searching also


  const fetchDeletedPages = useCallback(async () => {
    if (!$id || !hasMore || loading) return
    setLoading(true)

    try {
      const queries = [
        Query.equal('ownerId', $id),
        Query.equal('isDeleted', true),
        Query.orderDesc('deletedAt'),
        Query.limit(cardsPerView),
      ]

      if (lastDocId) queries.push(Query.cursorAfter(lastDocId))

      const res = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        queries
      )

      const newDocs = res.documents as PageType[]
      if (newDocs.length > 0) {
        setDeletedPages(prev => [...prev, ...newDocs])
        setBackupPages(prev => [...prev, ...newDocs])
        setLastDocId(newDocs[newDocs.length - 1].$id)
        setHasMore(newDocs.length === cardsPerView)


      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

    , [$id, lastDocId, hasMore, loading, cardsPerView,])

  useEffect(() => {
    fetchDeletedPages()
  }, [fetchDeletedPages])



  //for next button

  const handleNext = useCallback(() => {
    const nextIndex = slideIndex + 1
    const totalFrames = Math.ceil(deletedPages.length / cardsPerView)

    if (nextIndex >= totalFrames && hasMore) {


      fetchDeletedPages().then(() => {
        setSlideIndex(prev => prev + 1)
      })
    } else if (nextIndex < Math.ceil(deletedPages.length / cardsPerView)) {
      setSlideIndex(prev => prev + 1)
    }
  }, [slideIndex, deletedPages.length, cardsPerView, hasMore, fetchDeletedPages])

  //for previous button

  const handlePrev = useCallback(() => {
    if (slideIndex > 0) setSlideIndex(prev => prev - 1)
  }, [slideIndex])

  //on card click

  const onCardClick = useCallback((id: string) => {
    setMenu('Create')
    router.push(`/${fullName}/${id}`)
  }, [router, fullName, setMenu])

  const totalFrames = Math.ceil(deletedPages.length / cardsPerView)

  return (
    <div className='w-screen h-screen fixed inset-0 z-[9999] flex justify-center items-center'>
      <div className='absolute inset-0 bg-black/30 backdrop-blur-sm'></div>

      <div className='relative lg:w-1/2 w-full h-[70%] bg-white rounded shadow p-4 pt-2'>
        <CircleX
          size={20}
          color='#3089bd'
          className='absolute right-4 my-2 cursor-pointer'
          onClick={() => setMenu('Create')}
        />

        <input
          type='text'
          placeholder='Search here'
          className='rounded-lg w-full mt-9 bg-[#a8a6a627] outline-none px-3 py-1.5'
          onChange={(e) => onSearching(e.target.value.trim())}
        />

        <p className='font-bold text-sm mx-4 mt-5'>Recently deleted...</p>

        <div className='relative overflow-hidden w-full p-3 h-[60%]'>
          {loading && deletedPages.length === 0 ? (
            <div className='flex justify-center items-center h-32'>
              <Spinner color='#26a7ce' size={40} />
            </div>
          ) : deletedPages.length === 0 ? (
            <p className='text-center font-medium'>Trash is Empty</p>
          ) : (
            <div
              className='flex gap-4 w-full transition-transform duration-300 ease-in-out'
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {deletedPages.map((page) => (
                <div
                  key={page.$id}
                  className='flex-shrink-0'
                  style={{
                    width: `calc((100% - ${(cardsPerView - 1) * 16}px) / ${cardsPerView})`,
                  }}
                >
                  <Card data={page} onClick={() => onCardClick(page.$id)} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='flex justify-between items-center m-4'>
          <ArrowLeftCircle
            size={30}
            color='#a8a6a6'
            className={`cursor-pointer active:scale-95 ${slideIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            onClick={handlePrev}
          />
          <p className='w-full text-center text-sm'>
            {deletedPages.length > 0 && `${slideIndex + 1} of ${totalFrames}`}
          </p>
          <ArrowRightCircle
            size={30}
            color='#a8a6a6'
            className={`cursor-pointer active:scale-95 ${(slideIndex >= totalFrames - 1 && !hasMore) ? 'opacity-30 cursor-not-allowed' : ''}`}
            onClick={handleNext}
          />
        </div>
      </div>
    </div>
  )
}


export default Trash;