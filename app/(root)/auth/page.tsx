'use client'

import { useTheme } from 'next-themes'
import React, { useState } from 'react'
import { account, database } from '@/app/appwrite'
import { Query } from 'appwrite'
import { useRouter } from 'next/navigation'
import bcrypt from 'bcryptjs'

const Page = () => {
  const { theme, setTheme } = useTheme()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('')
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (!email || !password) {
        setErr('Credentials are missing')
        return
      }

      const user = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ID!,
        [
          Query.equal('email', email)
        ]
      );

      if (user.total === 0) {
        setErr('No users found')
        return;
      }

      const isRightPassword = await bcrypt.compare(password, user.documents[0].password);
      console.log(isRightPassword);


      if (isRightPassword) {
        await account.createSession('67dd459700110ec568fd', '345122')
        router.push(`/${user.documents[0].fullName}`)
      }




    } catch (error) {
      console.error(error);
      setErr('Something went wrong. Please try again.')
    }
  }

  return (
    <div className='w-screen h-screen flex items-center justify-center'>
      <form onSubmit={onSubmit} className='rounded flex flex-col gap-4 items-center text-center w-1/2 border p-4'>
        {err && <p className="text-red-500">{err}</p>}
        <input onChange={(e) => setEmail(e.target.value)} type='text' placeholder='Email...' className='px-3 rounded py-1 outline-none w-full' required />
        <input onChange={(e) => setPassword(e.target.value)} type='password' placeholder='Password...' className='px-3 rounded py-1 outline-none w-full' required />
        <button className='w-full text-center cursor-pointer rounded-lg bg-blue-500 py-2' type='submit'>Submit</button>
      </form>
    </div>
  )
}

export default Page
