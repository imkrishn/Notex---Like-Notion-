'use client'

import { storage } from '@/app/appwrite';
import { updatePageData } from '@/lib/updatePageData';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Upload } from 'lucide-react';
import React, { useState } from 'react'

type Props = {
  setObjectClick: (value: boolean) => void;
  className: string;
  isEmoji?: boolean;
  isLink?: boolean;
  ref?: React.Ref<HTMLDivElement>;
  accept: string;
  setValue: (value: any) => void
}

type Click = 'emoji' | 'upload' | 'link';



const URLBox = ({ setObjectClick, className, isEmoji, isLink, ref, accept, setValue }: Props) => {
  const [onClick, setOnClick] = useState<Click>('upload');
  const [link, setLink] = useState<string | undefined>()


  const handleEmojiClick = async (emojiData: EmojiClickData) => {

    setValue(emojiData.imageUrl)
    await updatePageData({ imgUrl: emojiData.imageUrl })
    setObjectClick(false)
  };

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const { files } = e.target
      if (files && files[0]) {
        const uploadFile = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          'unique()',
          files[0]
        );

        const fileHref = await storage.getFileView(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          uploadFile.$id
        );

        if (fileHref) { setValue(fileHref); await updatePageData({ coverImgUrl: fileHref }) }

        setObjectClick(false)
      }
    } catch (err) {
      console.log(err);

    }
  }

  function handleLink() {
    setValue(link)
    setObjectClick(false)
    setLink('')
  }



  return (
    <div ref={ref} className={`${className} rounded z-[99999] p-2  bg-white`} >
      <div className=' flex gap-4'>
        {isEmoji && <button onClick={() => setOnClick('emoji')} className={`px-3 py-1 rounded-md cursor-pointer hover:bg-[#888585] ${onClick === 'emoji' && 'bg-[#888585]'}`}>Emojis</button>}
        {isLink && <button onClick={() => setOnClick('link')} className={`px-3 py-1 rounded-md cursor-pointer hover:bg-[#888585] ${onClick === 'link' && 'bg-[#888585]'}`}>Link</button>}
        <button onClick={() => setOnClick('upload')} className={`px-3 py-1 rounded-md cursor-pointer hover:bg-[#888585] ${onClick === 'upload' && 'bg-[#726e6e]'}`}>Upload</button>
      </div>

      <div className='w-full py-2'>
        {onClick === 'emoji' && <EmojiPicker onEmojiClick={handleEmojiClick} />}
        {onClick === 'link' &&
          <div className='border border-[#e0e0e0] rounded-lg p-4 w-[350px] flex flex-col gap-4 justify-center items-center'>
            <input onChange={(e) => setLink(e.target.value)} type='text' accept={accept} placeholder='Paste any Image link...' className='text-sm rounded outline-none border px-3 py-1 w-full' />
            <button onClick={handleLink} className=' bg-[#3891e6] text-[#474849] cursor-pointer rounded-lg px-4   py-1'>Submit</button>
          </div>}
        {onClick === 'upload' &&
          <div className='border border-[#e0e0e0] rounded-lg p-4 w-[350px] '>
            <label className="cursor-pointer bg-[#bfc3c7] text-[#474849] rounded w-full flex gap-2 items-center justify-center py-2">
              <Upload size={20} />
              Upload File
              <input onChange={handleFile} type="file" accept={accept} className="hidden" />
            </label>
          </div>}
      </div>
    </div>
  )
}

export default URLBox