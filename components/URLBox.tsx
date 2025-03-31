'use client'

import { storage } from '@/app/appwrite';
import { updatePageData } from '@/lib/updatePageData';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Upload } from 'lucide-react';
import React, { useState, forwardRef } from 'react';
import Spinner from './Spinner';

type Props = {
  setObjectClick: (value: boolean) => void;
  className: string;
  isEmoji?: boolean;
  isLink?: boolean;
  accept: string;
  pageId: string;
  setValue: (value: any) => void;
};

type Click = 'emoji' | 'upload' | 'link';

const URLBox = forwardRef<HTMLDivElement, Props>(({ setObjectClick, className, isEmoji, isLink, accept, pageId, setValue }, ref) => {
  const [onClick, setOnClick] = useState<Click>('upload');
  const [link, setLink] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false)

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
  if (!bucketId) {
    console.error('Appwrite bucket ID is not defined.');
    return null;
  }

  const getButtonClass = (type: Click) =>
    `px-3 py-1 rounded-md cursor-pointer hover:bg-[#888585] ${onClick === type ? 'bg-[#888585]' : ''}`;

  const handleEmojiClick = async (emojiData: EmojiClickData) => {
    try {
      setLoading(true)
      setValue(emojiData.imageUrl);
      await updatePageData(pageId, { imgUrl: emojiData.imageUrl });
    } catch (error) {
      console.error('Error updating emoji:', error);
    } finally {
      setLoading(false)
      setObjectClick(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)
      const file = e.target.files?.[0];
      if (file) {
        const uploadFile = await storage.createFile(bucketId, 'unique()', file);
        const fileHref = await storage.getFileView(bucketId, uploadFile.$id);
        if (fileHref) {
          setValue(fileHref);
          isEmoji ? await updatePageData(pageId, { imgUrl: fileHref }) : await updatePageData(pageId, { coverImageUrl: fileHref })
        }

      }
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setLoading(false)
      setObjectClick(false);
    }
  };

  const handleLink = () => {
    if (link.trim()) {
      setValue(link);
      setObjectClick(false);
      setLink('');
    }
  };

  return (
    <>
      {loading ? <div ref={ref} className={`${className} min-w-48 flex justify-center rounded z-[99999] p-2 bg-white`}><Spinner size={40} color='#4e91df' /></div> : <div ref={ref} className={`${className} rounded z-[99999] p-2 bg-white`}>
        <div className='flex gap-4'>
          {isEmoji && <button onClick={() => setOnClick('emoji')} className={getButtonClass('emoji')}>Emojis</button>}
          {isLink && <button onClick={() => setOnClick('link')} className={getButtonClass('link')}>Link</button>}
          <button onClick={() => setOnClick('upload')} className={getButtonClass('upload')}>Upload</button>
        </div>

        <div className='w-full py-2'>
          {onClick === 'emoji' && <EmojiPicker onEmojiClick={handleEmojiClick} />}

          {onClick === 'link' && (
            <div className='border border-[#e0e0e0] rounded-lg p-4 w-[350px] flex flex-col gap-4 justify-center items-center'>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                type='text'
                placeholder='Paste any Image link...'
                className='text-sm rounded outline-none border px-3 py-1 w-full'
              />
              <button onClick={handleLink} className='bg-[#3891e6] text-[#474849] cursor-pointer rounded-lg px-4 py-1'>Submit</button>
            </div>
          )}

          {onClick === 'upload' && (
            <div className='border border-[#e0e0e0] rounded-lg p-4 w-[350px]'>
              <label className='cursor-pointer bg-[#bfc3c7] text-[#474849] rounded w-full flex gap-2 items-center justify-center py-2'>
                <Upload size={20} />
                Upload File
                <input onChange={handleFile} type='file' accept={accept} className='hidden' />
              </label>
            </div>
          )}
        </div>
      </div>}
    </>
  );
});

URLBox.displayName = 'URLBox';

export default URLBox;
