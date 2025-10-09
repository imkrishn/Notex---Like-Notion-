'use client'

import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'
import { account, database } from '@/app/appwrite'
import { Query } from 'appwrite'
import { useRouter } from 'next/navigation'
import bcrypt from 'bcryptjs'
import Image from 'next/image'
import Button from '@/components/ui/button'
import bgLight from '@/public/login-light.png'
import bgDark from '@/public/login-dark.png'
import logo from '@/public/logo.png'
import github from '@/public/github.png'
import { Mail, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { login } from '@/lib/signUpFromGithub'
import { toast } from 'sonner'

type LoginData = {
  email: string;
  password: string;
}

const Page = () => {
  const { theme, setTheme } = useTheme()
  const [err, setErr] = useState<string>('')
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>()


  useEffect(() => {
    setTheme('light')
  }, [theme]);

  async function onSubmit(data: LoginData) {
    try {
      const { email, password } = data;

      if (!email || !password) {
        toast.error('Credentials are missing');
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
        setErr('User is not registered with this email')
        return
      }

      const isRightPassword = await bcrypt.compare(password, user.documents[0].password);


      if (!isRightPassword) {
        setErr('Password is wrong');
        return
      }

      console.log(email);
      console.log(user.documents[0].password);
      console.log(isRightPassword);




      await account.createEmailPasswordSession(email, user.documents[0].password)

      router.push(`/${user.documents[0].fullName}/home`)


    } catch (err) {
      console.log(err);
      toast.error('Failed to log you in .Try again')
    }
  }

  return (
    <main className='w-screen h-screen  p-2 overflow-clip bg-[#ECECEC] text-[hsl(var(--foreground))]'>
      <Image src={logo} height={50} width={50} alt='bg mx-7' />
      <div className={cn('shadow relative lg:flex-row flex-col  flex items-center justify-center px-10 py-6 lg:mx-28 m-4 rounded-3xl', theme === 'dark' ? 'bg-black' : 'bg-white')}>
        <aside className='w-full h-full px-4 '>
          <div className="flex items-end gap-1 w-max left-4 top-4 absolute">
            <p className="text-5xl font-black text-[#3897E4]">N</p>
            <p className="text-2xl font-black text-[#30C24B]">otex</p>
          </div>
          <h2 className='text-center text-3xl font-extrabold my-7 '>Login</h2>
          {err && <p className='text-red-500 font-bold m-auto text-sm w-max my-2'>{err}</p>}
          <form onSubmit={handleSubmit(onSubmit)} className='w-max h-full m-auto flex flex-col gap-3 justify-center'>

            <span className='flex items-center gap-3 border  border-[#b3b0b0] rounded-3xl px-2'>
              <Mail size={25} />
              <input disabled={isSubmitting} {...register('email', { required: 'Email is required' })} type='email' className='px-4  py-1 outline-none w-full' placeholder='E-Mail' />
            </span>
            {errors.email && <p className='text-red-500 font-medium m-auto text-sm w-max my-1'>{errors.email.message}</p>}

            <span className='flex items-center gap-3 border  border-[#b3b0b0] rounded-3xl px-2'>
              <Lock size={25} />
              <input disabled={isSubmitting} {...register('password', { required: 'Password is required' })} type='password' className='px-4  py-1 outline-none w-full' placeholder='Password' />
            </span>
            {errors.password && <p className='text-red-500 font-medium m-auto text-sm w-max my-1'>{errors.password.message}</p>}

            <div className='text-right font-bold cursor-pointer active:text-[#2b2a2a] select-none mx-2'>Forgot Password</div>
            <button disabled={isSubmitting} className={cn('w-full rounded-2xl text-center py-2 cursor-pointer active:scale-95  font-medium bg-[#3897E4] text-[#f8f7f7]', isSubmitting && 'bg-[#1f639b]')}>{isSubmitting ? 'Logging' : 'Login'}</button>
          </form>
          <span className='w-full flex items-center justify-between'>
            <hr className='w-full' />
            <p className='text-sm m-2'>OR</p>
            <hr className='w-full' />
          </span>
          <Button logo={github} onClick={login} text='Continue with Github' color='#ffffff' className='lg:w-1/2 text-[#868686] rounded-3xl m-auto' arrow={false} />

        </aside>
        <Image src={theme === 'dark' ? bgDark : bgLight} height={800} width={550} alt='bg' className={cn(' rounded-2xl ', theme === 'dark' ? 'shadow-[5px_5px_16px_rgba(255,255,255,0.3)]' : 'shadow-[8px_8px_16px_rgba(0,0,0,0.3)]')} />

      </div>

    </main>
  )
}

export default Page