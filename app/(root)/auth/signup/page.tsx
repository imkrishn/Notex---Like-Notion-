'use client'

import Image from 'next/image'
import bgLight from '@/public/signup-light.png'
import bgDark from '@/public/signup-dark.png'
import logo from '@/public/logo.png'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Lock, Mail, User } from 'lucide-react'
import Button from '@/components/ui/button'
import github from '@/public/github.png'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import bcrypt from 'bcryptjs'
import { account, database } from '@/app/appwrite'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Query } from 'appwrite'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/signUpFromGithub'


const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

const UserSignupSchema = z.object({
  fullName: z.string().min(3, 'Minimum 3 letters'),
  email: z.string().email(),
  password: z.string()
    .min(6, 'Password must be of more than length 6')
    .regex(passwordRegex, "Password must include uppercase, lowercase, number, and special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type UserSignupData = z.infer<typeof UserSignupSchema>

const page = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserSignupData>({ resolver: zodResolver(UserSignupSchema) });

  const [userId, setUserId] = useState<string | undefined>();
  const [otp, setOtp] = useState<string | undefined>()


  useEffect(() => {
    setTheme('light')
  }, [theme])




  async function onSubmit(data: UserSignupData) {
    try {

      if (!data || !otp || !userId) {
        return
      }

      await account.createSession(userId, otp)


      const { fullName, email, password, confirmPassword } = data

      if (password !== confirmPassword) {
        toast.error('Passwords not match');
        return
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt);

      await account.updatePassword(hashedPassword)

      await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ID!,
        'unique()',
        { fullName, email, password: hashedPassword }
      )


      router.push(`/${fullName}/home`)

    } catch (err) {
      console.log(err);
      toast.error('Failed to Signup.Try again')
    }
  }


  async function onVerifyEmail(data: UserSignupData) {
    try {
      if (!data) {
        return
      }

      const email = data.email;

      const user = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ID!,
        [
          Query.equal('email', email)
        ]
      )

      if (user.total === 0) {
        const session = await account.createEmailToken('unique()', email);
        setUserId(session.userId);
        toast.info("Otp sent to your's email for verfication")
      } else {
        toast.info("User exist with this email . Try different")
      }



    } catch (Err) {
      console.log(Err);
      toast.error('failed to verify . Try again')

    }
  }


  return (
    <main className='w-screen h-screen  p-2 overflow-clip bg-[#ECECEC] text-[hsl(var(--foreground))]'>
      <Image src={logo} height={50} width={50} alt='bg mx-7' />
      <div className={cn('shadow relative   flex items-center justify-center px-10 py-6 lg:mx-28 m-4 rounded-3xl', theme === 'dark' ? 'bg-black' : 'bg-white')}>
        <Image src={theme === 'dark' ? bgDark : bgLight} height={800} width={400} alt='bg' className={cn(' rounded-2xl ', theme === 'dark' ? 'shadow-[5px_5px_16px_rgba(255,255,255,0.3)]' : 'shadow-[8px_8px_16px_rgba(0,0,0,0.3)]')} />
        <aside className='w-full h-full px-4 '>
          <div className="flex items-end gap-1 w-max right-4 top-4 absolute">
            <p className="text-5xl font-black text-[#3897E4]">N</p>
            <p className="text-2xl font-black text-[#30C24B]">otex</p>
          </div>
          <h2 className='text-center text-3xl font-extrabold my-7 '>Create an Account</h2>
          <Button onClick={login} logo={github} text='Continue with Github' color='#ffffff' className='lg:w-1/2 text-[#868686] rounded-3xl m-auto' arrow={false} />
          <span className='w-full flex items-center justify-between'>
            <hr className='w-full' />
            <p className='text-sm m-2'>OR</p>
            <hr className='w-full' />
          </span>
          <form className='w-max h-full m-auto flex flex-col gap-3 justify-center'>
            <span className='flex items-center gap-3 border  border-[#b3b0b0] bg-[#8b8b8b2a] rounded-3xl px-2'>
              <User size={25} />
              <input {...register('fullName', { required: true, })} type='text' disabled={userId ? true : false} className='px-4  py-1 outline-none w-full' placeholder='Full Name' />
            </span>
            {errors.fullName && <p className='m-auto text-red-500 font-medium text-sm'>{errors.fullName.message}</p>}
            <span className='flex items-center gap-3 border  border-[#b3b0b0] bg-[#8b8b8b2a] rounded-3xl px-2'>
              <Mail size={25} />
              <input {...register('email', { required: true })} type='email' disabled={userId ? true : false} className='px-4  py-1 outline-none w-full' placeholder='E-Mail' />
            </span>
            {errors.email && <p className='m-auto text-red-500 font-medium text-sm'>{errors.email.message}</p>}
            <span className='flex items-center gap-3 border  border-[#b3b0b0] bg-[#8b8b8b2a] rounded-3xl px-2'>
              <Lock size={25} />
              <input {...register('password', { required: true })} type='password' disabled={userId ? true : false} className='px-4  py-1 outline-none w-full' placeholder='Password' />
            </span>
            {errors.password && <p className='m-auto text-red-500 font-medium text-sm'>{errors.password.message}</p>}
            <span className='flex items-center gap-3 border  border-[#b3b0b0] bg-[#8b8b8b2a] rounded-3xl px-2'>
              <Lock size={25} />
              <input {...register('confirmPassword', { required: true })} type='password' disabled={userId ? true : false} className='px-4  py-1  outline-none w-full' placeholder='Confirm Password' />
            </span>
            {errors.confirmPassword && <p className='m-auto text-red-500 font-medium text-sm'>{errors.confirmPassword.message}</p>}
            {userId ? <InputOTP disabled={isSubmitting} maxLength={6} onChange={setOtp} onComplete={handleSubmit(onSubmit)} >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP> :
              <button onClick={handleSubmit(onVerifyEmail)} disabled={isSubmitting} className='w-full rounded-2xl text-center py-2 cursor-pointer active:scale-95  font-medium bg-[#3897E4] text-[#f8f7f7]'>{isSubmitting ? 'Verifing ... ' : 'Verify Email'}</button>}
          </form>

        </aside>
      </div>
    </main>
  )
}

export default page