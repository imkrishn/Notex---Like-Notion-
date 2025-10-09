import formatTime from '@/lib/formatTime';
import { PageType } from '@/types/pageType';
import Image from 'next/image';
import React from 'react'



function Card({ data, onClick }: { data: PageType, onClick: React.MouseEventHandler<HTMLDivElement> | undefined }) {


  return (
    <div onClick={onClick} className='w-68 h-48 rounded-2xl shadow shadow-gray-500 relative cursor-pointer hover:-translate-y-2 active:scale-[.98]'>
      {data?.coverImageUrl ? <Image src={data?.coverImageUrl} alt='#coverImage' height={400} width={500} className=' rounded-tl-2xl rounded-tr-2xl  h-[70%]' />
        : <div className='bg-[#b3acac4d] rounded-tl-2xl rounded-tr-2xl  h-[70%]'></div>}
      {data.imgUrl && <Image src={data?.imgUrl} alt='#img' height={40} width={40} className='rounded-full absolute bottom-8 left-4 ' />}
      <p className="text-right px-2 mt-3 font-medium overflow-hidden text-ellipsis whitespace-nowrap w-64">
        {data?.name}
      </p>
      <p className='text-xs font-extralight mb-2  px-3 text-[#616161]'>{formatTime(data?.$createdAt)}</p>
    </div>
  )
}

export default Card