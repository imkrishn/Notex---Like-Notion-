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
import Spinner from './Spinner';
import InviteUser from './InviteUser';
import Publish from './Publish';
import { EllipsisVertical, Languages, RotateCw, Trash, X } from 'lucide-react';
import { toast } from 'sonner';
import { handleDelete } from '@/lib/deletePage';
import Editor1 from './Editor1';
import { cn } from '@/lib/utils';
import Translate from './Translate';






const Create = ({ pageId, edit }: { pageId: string, edit: boolean }) => {

  const { theme } = useTheme();
  const divRef = useRef<HTMLDivElement>(null);
  const coverDivRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null)
  const loggedInUser = useLoggedInUser();
  const loggedInUserId = loggedInUser.$id

  const [onCoverClick, setOnCoverClick] = useState<boolean>(false);
  const [onImageClick, setOnImageClick] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false)
  const [coverImgUrl, setCoverImgUrl] = useState<string | undefined>();
  const [imgUrl, setImgUrl] = useState<string | undefined>();
  const [pageName, setPageName] = useState<string | undefined>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [onInvitedClick, setOnInvitedClick] = useState<boolean>(false);
  const [onPublishClick, setOnPublishClick] = useState<boolean>(false);
  const [onMenuClick, setOnMenuClick] = useState<boolean>(false);
  const [onTranslateClick, setOnTranslateClick] = useState<boolean>(false);
  const [text, setText] = useState<string | undefined>()



  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      setOnImageClick(false)
    }
    if (coverDivRef.current && !coverDivRef.current.contains(event.target as Node)) {
      setOnCoverClick(false)
    }
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOnMenuClick(false)
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /*  async function onOffFavourite(pageId?: string, userId?: string) {
     try {
       if (!pageId || !userId) {
         throw new Error("User not authorized or page doesn't exist");
       }
       setIsFavouriteLoading(true)
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
 
     } finally {
       setIsFavouriteLoading(false)
     }
   } */

  useEffect(() => {
    async function getPageData() {
      try {
        setLoading(true)
        const page = await database.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
          pageId,
        )

        if (page) {
          setPageName(page.name)
          setCoverImgUrl(page.coverImageUrl);
          setImgUrl(page.imgUrl)
          setIsDeleted(page.isDeleted)

        }

      } catch (err) {
        console.log(err);

      } finally {
        setLoading(false)
      }
    }

    getPageData()
  }, [pageId])

  async function onRestore() {
    try {
      await database.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        pageId,
        { isDeleted: false }
      );

      setIsDeleted(false)
      toast.success('Page Restored Successfuly')
    } catch (err) {
      toast.error('Failed to Restore.Try again')
      console.log(err);

    }
  }

  async function onPermanentDelete() {
    try {

      toast.warning('Page Deletion will be Irreversible.')

      await database.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        pageId,
      );

      setIsDeleted(false)
      toast.success('Page Permanently Deleted Successfuly')
    } catch (err) {
      toast.error('Failed to Delete.Try again')
      console.log(err);

    }
  }



  function onDeletePage() {
    if (!pageId || !loggedInUserId) {
      toast.error('You are not authorized to delete this page.');
      return;
    }

    toast.warning('Are you sure?', {
      description: 'This page will be moved to 🗑️ Trash.',
      action: {
        label: 'Move to Trash',
        onClick: () => handleDelete(pageId, loggedInUserId),
      },
    });

    setOnMenuClick(false)
  }


  return (
    <div className={`w-full h-screen   flex justify-center overflow-y-auto ${theme === 'dark' ? 'bg-[#1311118a] ' : 'bg-[#F7F7FA] '}`}>

      {loading ? <Spinner color='#2360a7' size={50} /> : <div className='w-full h-full'>
        {edit ? <div>
          {isDeleted && <div className='bg-[#aee0f7be] text-white p-2 text-sm flex justify-center items-center gap-6'>
            <button onClick={onRestore} className='rounded-sm active:bg-gray-100  cursor-pointer px-2 py-1 bg-white text-blue-300 flex items-center gap-2'>Restore<RotateCw size={15} /> </button>
            <button onClick={onPermanentDelete} className='rounded-sm  bg-red-400 active:bg-red-500 cursor-pointer px-2 py-1 font-medium flex items-center gap-2'>Delete Permanently <X size={18} /></button>
          </div>}
          {onTranslateClick && <Translate setUI={setOnTranslateClick} />}
          <div className='flex mb-4 pt-3 justify-end px-6 items-center gap-2 relative'>
            {/* <button className='rounded font-sans  text-[#887c7c] py-1 active:scale-[.97]  flex gap-1 cursor-pointer  items-center font-medium text-sm'>
            Save
          </button> */}
            <button onClick={() => setOnTranslateClick(prev => !prev)} className='rounded font-sans px-2 text-[#887c7c] py-1 active:scale-[.97]  flex gap-1 cursor-pointer  items-center font-medium text-sm'>
              <Languages size={15} strokeWidth={2} />
              <p>Translate </p>
            </button>
            <button onClick={() => setOnInvitedClick(prev => !prev)} className='rounded font-sans px-2 text-[#887c7c] py-1 active:scale-[.97]  flex gap-1 cursor-pointer  items-center font-medium text-sm'>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" stroke="#887c7c" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
              <u>Invite </u>
            </button>
            {/* <svg onClick={() => !isFavouriteLoading && onOffFavourite(pageId, loggedInUserId)} xmlns="http://www.w3.org/2000/svg" width="28" height="28" stroke="#ce9120" viewBox="0 0 24 24" fill={isFavourite ? '#ce9120' : 'none'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star cursor-pointer border border-slate-500 rounded p-1.5 active:scale-[.97]"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>*/}
            <button onClick={() => setOnPublishClick(prev => !prev)} className='rounded py-0.5 px-3 text-[#4e91df] opacity-80 border border-[#4e91df] active:scale-[.97] active:opacity-90  cursor-pointer   font-medium '>
              Publish
            </button>
            <EllipsisVertical size={22} color='#887c7c' className='cursor-pointer' onClick={() => setOnMenuClick(prev => !prev)} />

            {onInvitedClick && <InviteUser loggedInUserId={loggedInUserId} pageId={pageId} setUI={setOnInvitedClick} />}
            {onPublishClick && <Publish setUI={setOnPublishClick} pageId={pageId} />}

            {onMenuClick && <div ref={menuRef} className='absolute top-11.5 right-8 rounded p-2 z-50 bg-white shadow shadow-gray-500 '>

              <p onClick={onDeletePage} className='flex gap-2 select-none items-center rounded-md text-sm  text-[#868686]  hover:bg-gray-300 font-medium cursor-pointer active:bg-gray-400 p-2'>
                <Trash size={15} /> Move to Trash
              </p>
            </div>}
          </div> </div> : <div className='h-7'></div>}
        <div className='relative w-full min-h-60 '>
          <div onClick={() => setOnImageClick(prev => !prev)} className={cn('absolute left-8 z-20 -top-8 cursor-pointer  rounded-full min-h-20 p-0.5 min-w-20', !imgUrl && 'bg-[#1d1b1b]')}>
            {imgUrl && (
              <Image
                key={imgUrl}
                src={imgUrl}
                alt='#'
                width={1000}
                height={1000}
                className=' rounded-full h-20 w-20 object-cover object-[center]'
                aria-expanded={true}
              />
            )}
          </div>
          {onImageClick && edit && <URLBox ref={divRef} accept='image/*' pageId={pageId} setObjectClick={setOnImageClick} setValue={setImgUrl} isLink={false} isEmoji={true} className='absolute top-10 left-20' />}

          <div
            onClick={() => setOnCoverClick(prev => !prev)}
            className=' bg-[#b3acac4d] w-full max-w-full h-64 cursor-pointer resize overflow-auto'
          >
            {coverImgUrl && (
              <Image
                key={coverImgUrl}
                src={coverImgUrl}
                alt='Cover Image'
                width={2000}
                height={500}
                className='h-full w-full object-cover object-[center]'
                aria-expanded={true}
              />
            )}
          </div>

          {onCoverClick && edit && <URLBox ref={coverDivRef} pageId={pageId} accept='image/*' setObjectClick={setOnCoverClick} setValue={setCoverImgUrl} isLink={true} isEmoji={false} className='absolute top-20 right-20' />}

        </div>
        <input disabled={edit ? false : true} type='text' onChange={async (e) => await updatePageData(pageId, { name: e.target.value.trim() })} className='text-4xl px-6 outline-none bg-transparent my-4 font-black text-[#887c7c]' defaultValue={pageName} placeholder='Untitled' />
        {/* <Editor pageId={pageId} edit={edit} /> */}
        {/* <Editor pageId={pageId} edit={edit} setText={setText} /> */}
        <Editor1 />
      </div>}
    </div>
  )
}

export default Create