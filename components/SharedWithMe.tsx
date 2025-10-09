'use client'

import { useGetSharedPages } from '@/hooks/getPages'
import { DotBackground } from './ui/dot-background'
import { useLoggedInUser } from '@/hooks/getLoggedInUser'
import Card from './Card'
import { useRouter } from 'next/navigation'
import Spinner from './Spinner'

function SharedWithMe() {
  const { $id, fullName } = useLoggedInUser()
  const { sharedPages, loading } = useGetSharedPages($id);
  const router = useRouter()





  return (

    <DotBackground >
      <div className=" w-full h-full  py-28 bg-transparent">
        <h1 className='text-[#666464] text-3xl font-bold pl-11'>Shared With You</h1>
        <div className='flex items-center h-full overflow-auto justify-between lg:flex-nowrap flex-wrap px-11 gap-4 p-8'>
          {loading ? <Spinner size={50} color='#2685b1' /> : sharedPages.length > 0 ? sharedPages.map((page) => (
            <Card data={page} key={page.$id} onClick={() => {
              localStorage.removeItem('menu')
              router.push(`/${fullName}/${page.$id}`)
            }
            } />
          )) : <h1 className='text-[#747272] text-xl font-medium m-auto'>Nothing is shared to You</h1>}
        </div>
      </div>

    </DotBackground>

  )
}

export default SharedWithMe