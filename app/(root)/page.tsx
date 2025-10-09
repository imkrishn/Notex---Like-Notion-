'use client'

import Button from '@/components/ui/button'
import logo from '@/public/logo.png'
import Image from 'next/image'
import bgLight from '@/public/bg-light.png'
import bgDark from '@/public/bg-dark.png'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'


const page = () => {
  const router = useRouter()
  const { theme, setTheme } = useTheme()


  return (
    <main className={cn('p-3 overflow-clip h-screen', theme === 'dark' ? 'bg-black text-white' : 'bg-white text-[#696868e1]')}>
      <nav className='flex items-center justify-between'>
        <div className="flex items-end gap-1 w-full ">
          <p className="text-5xl font-black text-[#3897E4]">N</p>
          <p className="text-2xl font-black text-[#30C24B]">otex</p>
        </div>

        <Button onClick={() => router.push('/auth/login')} arrow={false} color='#60B5FF' text='Log in' />
        <Button onClick={() => router.push('/auth/signup')} arrow={false} text='Get Notex Free' color='#fff' logo={logo} className='h-10 text-[#3897E4] mx-3 shadow-blue-300' />

      </nav>
      <main className='grid place-items-center'>
        <Image src={theme === 'dark' ? bgDark : bgLight} alt='bg' width={400} height={400} />
        <p className='text-4xl font-extralight'>Write , organize and achive more with <b className='font-extrabold text-5xl text-[#3897E4]'>Notex</b></p>
        <TextGenerateEffect duration={1} words='Your ideas deserve a smarter space' className={cn(theme === 'dark' ? 'text-[#dadadaef]' : 'text-[#2525257c]')} />
        <Button onClick={() => router.push('/auth/signup')} arrow={true} text='Get Notex Free' color='#fff' logo={logo} className='h-10 text-[#3897E4] m-3 dark:shadow-blue-200 shadow-gray-300' />

      </main>
    </main>
  )
}

export default page