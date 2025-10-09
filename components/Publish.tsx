'use client'

import { database } from "@/app/appwrite";
import { Copy, Globe } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner";
import Spinner from "./Spinner";



const Publish = ({ setUI, pageId }: { setUI: (value: boolean) => void, pageId: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isPublished, setIsPublished] = useState<boolean | undefined>();
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>('');
  const [onClickCopiedBtn, setOnClickCopiedBtn] = useState<boolean>(false)

  function handleClickOutside(e: MouseEvent) {
    if (divRef.current && !divRef.current.contains(e.target as Node)) {
      setUI(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!pageId) {
          return
        }
        setLoadingData(true)
        const page = await database.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
          pageId,
        );

        if (page) {
          setIsPublished(page.isPublished);
          const url = `${process.env.NEXT_PUBLIC_URL}/preview/${pageId}`;
          setCopiedText(url)
        }
      } catch (err) {
        console.log(err);
        toast.error('Failed to load')
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [pageId])

  async function onPublish() {
    try {
      if (!pageId) {
        toast.error('Page is missing')
        return
      }
      setLoading(true)
      await database.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        pageId,
        { isPublished: true }
      );

      const url = `${process.env.NEXT_PUBLIC_URL}/preview/${pageId}`;
      toast.success('Note is Published successfully');
      setCopiedText(url)
      setIsPublished(true)
    } catch (err) {
      console.log(err);
      toast.error('Failed To Publish.Try again')
    } finally {
      setLoading(false)
    }
  }

  async function onUnpublish() {
    try {
      if (!pageId) {
        toast.error('Page is missing')
        return
      }
      setLoading(true)

      await database.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        pageId,
        { isPublished: false }
      );

      toast.success('Note is Unpublished successfully')
      setIsPublished(false)
    } catch (err) {
      console.log(err);
      toast.error('Failed To Unpublish.Try again')
    } finally {
      setLoading(false)
    }
  }

  function onClickCopyBtn() {
    navigator.clipboard.writeText(copiedText);
    setOnClickCopiedBtn(true);
    setTimeout(() => {
      setOnClickCopiedBtn(false)
    }, 2000)
  }

  return (
    <div ref={divRef} className='bg-white w-1/3  absolute top-11.5 rounded z-20 grid place-items-center shadow shadow-gray-500  p-4'>
      {isPublished !== undefined && !loadingData && (isPublished ?
        <div className="w-full grid place-items-center">
          <p className="flex gap-3 items-center text-[#979797] font-medium"><Globe size={20} color="#49a8d4" />This note is live on internet...</p>
          <div className="flex border gap-4 relative rounded items-center px-3 w-full my-3 border-blue-500">
            <textarea value={copiedText} typeof="text" className="w-full text-gray-500 text-sm resize-none border-r border-blue-500 outline-none" />
            <Copy onClick={onClickCopyBtn} size={25} color="#2b9ee0" className="cursor-pointer active:scale-95" />
            {onClickCopiedBtn && <span className="absolute  -top-8 -right-2">
              <span className="bg-[#102E50] relative text-white px-2.5 text-sm py-1.5 font-bold rounded-2xl">Copied
                <span className="w-0 h-0 absolute left-0 -bottom-1 border-t-[8px] border-b-[8px] border-r-[14px] border-t-transparent border-b-transparent border-r-[#102E50] rotate-200 inline-block"></span>
              </span>
            </span>}
          </div>
          <button onClick={onUnpublish} className='bg-[#4badd4] w-[92%] py-1 text-[#ffffff] font-semibold cursor-pointer active:bg-[#3f8faf] rounded px-3 mt-2'>{loading ? 'Unpublishing' : 'Unpublish'}</button>
        </div> :
        <><Globe size={45} color="#49a8d4" />
          <p className="font-medium text-[#237caf] my-2">Your Work is going to be public</p>
          <button onClick={onPublish} className='bg-[#4badd4] w-[92%] py-1 text-[#ffffff] font-semibold cursor-pointer active:bg-[#3f8faf] rounded px-3 mt-2'>{loading ? 'Publishing' : 'Publish'}</button>
        </>)}
      {loadingData && <Spinner size={40} color="#6DE1D2" />}
    </div>
  )
}

export default Publish