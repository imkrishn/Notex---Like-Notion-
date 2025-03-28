'use client'

import { useTheme } from 'next-themes'
import Editor from './Editor';
import { useEffect, useRef, useState } from 'react';
import URLBox from './URLBox';
import Image from 'next/image';
import { updatePageData } from '@/lib/updatePageData';
import { database } from '@/app/appwrite';
import { Query } from 'appwrite';
import { useLoggedInUser } from '@/hooks/getLoggedInUser';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const pageId = '67e289650020686faa23';



const Create = () => {
  const { theme } = useTheme();
  const [onCoverClick, setOnCoverClick] = useState(false);
  const [onImageClick, setOnImageClick] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const coverDivRef = useRef<HTMLDivElement>(null);
  const [coverImgUrl, setCoverImgUrl] = useState();
  const [imgUrl, setImgUrl] = useState<string | undefined>();
  const [pageName, setPageName] = useState<string | undefined>('');
  const [isFavourite, setIsFavourite] = useState<boolean | undefined>();
  const loggedInUserId = useSelector((state: RootState) => state.loggedInUser.$id)


  console.log(loggedInUserId);


  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      setOnImageClick(false)
    }
    if (coverDivRef.current && !coverDivRef.current.contains(event.target as Node)) {
      setOnCoverClick(false)
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function onOffFavourite(pageId?: string, userId?: string) {
    try {
      if (!pageId || !userId) {
        throw new Error("User not authorized or page doesn't exist");
      }
      if (!isFavourite) {
        await database.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FAVOURITE_ID!,
          'unique()',
          { pageId, userId, user: userId }
        )
        setIsFavourite(true)
      } else if (isFavourite) {
        const page = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FAVOURITE_ID!,
          [
            Query.equal('pageId', pageId),
            Query.equal('userId', userId)
          ]
        );

        await database.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FAVOURITE_ID!,
          page.documents[0].$id
        )

        setIsFavourite(false)
      }
    } catch (err) {
      console.log(err);

    }
  }

  useEffect(() => {
    async function getPageData() {
      try {
        const page = await database.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
          pageId,
        )

        if (page) {
          setPageName(page.name)
          setCoverImgUrl(page.coverImageUrl);
          setImgUrl(page.imgUrl)
        }
      } catch (err) {
        console.log(err);

      }
    }

    getPageData()
  }, [pageId])



  return (
    <div className={`w-full h-full p-7 overflow-y-auto ${theme === 'dark' ? 'bg-[#1311118a] ' : 'bg-[#F7F7FA] '}`}>

      <div className='flex mb-4 justify-end items-center gap-4 '>

        <button className='rounded font-sans px-2 text-[#887c7c] py-1 active:scale-[.97]  flex gap-1 cursor-pointer  items-center font-medium text-sm'>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" stroke="#887c7c" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          <u>Invite User</u>
        </button>
        <svg onClick={() => onOffFavourite(pageId, loggedInUserId)} xmlns="http://www.w3.org/2000/svg" width="28" height="28" stroke="#ce9120" viewBox="0 0 24 24" fill={isFavourite ? '#ce9120' : 'none'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star cursor-pointer border border-slate-500 rounded p-1.5 active:scale-[.97]"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>

        <button className='rounded py-0.5 px-3 text-[#4e91df] opacity-80 border border-[#4e91df] active:scale-[.97] active:opacity-90  cursor-pointer   font-medium '>
          Publish
        </button>


      </div>
      <div className='relative w-full min-h-60 '>
        <div onClick={() => setOnImageClick(prev => !prev)} className='absolute left-8 z-20 -top-8 cursor-pointer bg-[#1d1b1b] rounded-full min-h-20 p-0.5 min-w-20'>
          {imgUrl && (
            <Image
              src={imgUrl}
              alt='Cover Image'
              width={500}
              height={500}
              className=' rounded-full h-20 w-20 object-cover object-[center]'
              aria-expanded={true}
            />
          )}
        </div>
        {onImageClick && <URLBox ref={divRef} accept='image/*' setObjectClick={setOnImageClick} setValue={setImgUrl} isLink={false} isEmoji={true} className='absolute top-10 left-20' />}

        <div
          onClick={() => setOnCoverClick(prev => !prev)}
          className='rounded bg-[#b3acac] w-full max-w-full min-h-56 cursor-pointer resize overflow-auto'
        >
          {coverImgUrl && (
            <Image
              src={coverImgUrl}
              alt='Cover Image'
              width={2000}
              height={500}
              className='h-full w-full object-cover object-[center]'
              aria-expanded={true}
            />
          )}
        </div>

        {onCoverClick && <URLBox ref={coverDivRef} accept='image/*' setObjectClick={setOnCoverClick} setValue={setCoverImgUrl} isLink={true} isEmoji={false} className='absolute top-20 right-20' />}

      </div>
      <input type='text' onChange={async (e) => await updatePageData({ name: e.target.value.trim() })} className='text-4xl outline-none bg-transparent my-4 font-black text-[#887c7c]' defaultValue={pageName} placeholder='Untitled' />
      <Editor />
    </div>
  )
}

export default Create