"use client";

import Image from "next/image";
import bgLight from "@/public/signup-light.png";
import bgDark from "@/public/signup-dark.png";
import logo from "@/public/logo.png";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Lock, Mail, User } from "lucide-react";
import Button from "@/components/ui/button";
import github from "@/public/github.png";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

// Password validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

// schema
const UserSignupSchema = z
  .object({
    fullName: z.string().min(3, "Minimum 3 letters"),
    email: z.string().email(),
    password: z
      .string()
      .min(6, "Password must be of more than length 6")
      .regex(
        passwordRegex,
        "Password must include uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UserSignupData = z.infer<typeof UserSignupSchema>;

export default function SignupPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserSignupData>({
    resolver: zodResolver(UserSignupSchema),
  });

  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  // Send OTP
  async function onVerifyEmail(data: UserSignupData) {
    setLoading(true);
    try {
      const { email, fullName } = data;
      if (!email || !fullName)
        return toast.warning("Email and name are required");

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fullName, type: "signup" }),
      });

      const result = await res.json();

      if (!res.ok) return toast.error(result.message || "Failed to send OTP");

      toast.success("OTP sent successfully! Check your email.");
      setEmailVerified(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: UserSignupData) {
    setLoading(true);
    try {
      if (!otp) return toast.warning("Please enter your OTP");

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          name: data.fullName,
          password: data.password,
          otp,
        }),
      });

      const result = await res.json();

      if (!res.ok) return toast.error(result.message || "Signup failed");

      if (result.success) {
        window.location.href = `${process.env.NEXT_PUBLIC_URL}/home/${data.fullName}`;
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Failed to signup. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleGithubLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_URL}/auth/github/callback&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  return (
    <main className="w-screen lg:p-6 p-2 overflow-clip text-(--color-base-content)">
      <div className="flex gap-2 justify-end items-center">
        <div className="flex items-end gap-1 w-full ">
          <p className="text-5xl font-black text-[#3897E4]">N</p>
          <p className="text-2xl font-black text-[#30C24B]">otex</p>
        </div>
        <ThemeToggle />
        <Image src={logo} height={50} width={50} alt="logo" />
      </div>

      <div className="relative flex lg:flex-row flex-col-reverse justify-center lg:px-10 lg:mx-28 m-4 rounded">
        <Image
          src={theme === "dark" ? bgDark : bgLight}
          height={800}
          width={400}
          alt="background"
        />

        <aside className="w-full h-full px-4">
          <h2 className="text-center lg:text-3xl text-2xl font-extrabold my-7">
            Sign up and start building your ideas
          </h2>

          <Button
            logo={github}
            onClick={handleGithubLogin}
            text="Continue with Github"
            color="#ffffff"
            className="lg:w-1/2 text-[#868686] rounded-3xl m-auto"
            arrow={false}
          />

          <span className="w-full flex items-center justify-between">
            <span className="w-full h-0.5 bg-(--color-base-content)" />
            <p className="text-sm m-2">OR</p>
            <span className="w-full h-0.5 bg-(--color-base-content)" />
          </span>

          <form
            className="w-max h-full m-auto flex flex-col gap-3 justify-center"
            onSubmit={handleSubmit(emailVerified ? onSubmit : onVerifyEmail)}
          >
            {/* Name Input */}
            <span className="flex items-center gap-3 border border-[#b3b0b0] bg-[#8b8b8b2a] rounded-xl px-2">
              <User size={21} />
              <input
                {...register("fullName")}
                type="text"
                disabled={emailVerified || loading}
                className="px-4 py-1 outline-none w-full"
                placeholder="Full Name"
              />
            </span>
            {errors.fullName && (
              <p className="m-auto text-red-500 font-medium text-sm">
                {errors.fullName.message}
              </p>
            )}

            {/* Email Input */}
            <span className="flex items-center gap-3 border border-[#b3b0b0] bg-[#8b8b8b2a] rounded-xl px-2">
              <Mail size={21} />
              <input
                {...register("email")}
                type="email"
                disabled={emailVerified || loading}
                className="px-4 py-1 outline-none w-full"
                placeholder="E-Mail"
              />
            </span>
            {errors.email && (
              <p className="m-auto text-red-500 font-medium text-sm">
                {errors.email.message}
              </p>
            )}

            {/* Password Input */}
            <span className="flex items-center gap-3 border border-[#b3b0b0] bg-[#8b8b8b2a] rounded-xl px-2">
              <Lock size={21} />
              <input
                {...register("password")}
                type="password"
                disabled={emailVerified || loading}
                className="px-4 py-1 outline-none w-full"
                placeholder="Password"
              />
            </span>
            {errors.password && (
              <p className="m-auto text-red-500 font-medium text-sm">
                {errors.password.message}
              </p>
            )}

            {/* Confirm Password Input */}
            <span className="flex items-center gap-3 border border-[#b3b0b0] bg-[#8b8b8b2a] rounded-xl px-2">
              <Lock size={21} />
              <input
                {...register("confirmPassword")}
                type="password"
                disabled={emailVerified || loading}
                className="px-4 py-1 outline-none w-full"
                placeholder="Confirm Password"
              />
            </span>
            {errors.confirmPassword && (
              <p className="m-auto text-red-500 font-medium text-sm">
                {errors.confirmPassword.message}
              </p>
            )}

            {/* OTP Field */}
            {emailVerified && (
              <div className="flex flex-col items-center gap-4 mt-4">
                <InputOTP
                  disabled={isSubmitting || loading}
                  maxLength={6}
                  onChange={setOtp}
                  value={otp}
                >
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
                </InputOTP>
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full rounded-2xl text-center py-2 cursor-pointer active:scale-95 font-medium bg-[#3897E4] text-[#f8f7f7]"
            >
              {isSubmitting
                ? emailVerified
                  ? "Verifying..."
                  : "Sending OTP..."
                : emailVerified
                ? "Verify & Signup"
                : "Verify Email"}
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
