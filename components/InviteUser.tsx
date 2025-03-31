import React from 'react'

const InviteUser = () => {
  return (
    <div className='bg-white w-1/3 h-48 absolute top-11 rounded z-20 shadow shadow-gray-500 py-6 p-4'>
      <div className='flex justify-center gap-3'>
        <input type='text' placeholder='Email to invite' className='w-full px-3 py-0.5 outline-none rounded border border-gray-500' />
        <button className='bg-[#5999ec] text-gray-700 rounded px-3'>Invite</button>
      </div>
      <div className='rounded bg-[#e4dddd]  w-full'>

      </div>
    </div>
  )
}

export default InviteUser