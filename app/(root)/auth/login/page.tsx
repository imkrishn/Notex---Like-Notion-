"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";
import Image from "next/image";
import Button from "@/components/ui/button";
import bgLight from "@/public/login-light.png";
import bgDark from "@/public/login-dark.png";
import logo from "@/public/logo.png";
import github from "@/public/github.png";
import { Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";

import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

type LoginData = {
  email: string;
  password: string;
};

const Page = () => {
  const { theme } = useTheme();
  const [err, setErr] = useState<string>("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>();

  async function onSubmit(data: LoginData) {
    try {
      const { email, password } = data;

      if (!email || !password) {
        toast.error("Credentials are missing");
        setErr("Credentials are missing");
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        return toast.error(result.message || "Failed to login");
      }

      if (result.success) {
        window.location.href = `${process.env.NEXT_PUBLIC_URL}/home/${result.name}`;
      }
    } catch (err) {
      toast.error("Failed to log you in .Try again");
    }
  }

  const handleGithubLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_URL}/auth/github/callback&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  return (
    <main className="w-screen h-screen  lg:p-6 p-2 lg:overflow-clip text-(--color-base-content)">
      <div className="flex gap-2 justify-end items-center">
        <div className="flex items-end gap-1 w-full ">
          <p className="text-5xl font-black text-[#3897E4]">N</p>
          <p className="text-2xl font-black text-[#30C24B]">otex</p>
        </div>
        <ThemeToggle />
        <Image src={logo} height={50} width={50} alt="logo" />
      </div>
      <div className="relative lg:flex-row flex-col flex items-center justify-center lg:px-10  lg:mx-28 m-4 ">
        <aside className="w-full h-full ">
          <h2 className="text-center lg:text-3xl text-xl font-extrabold my-7 ">
            Welcome back to your organized world
          </h2>
          {err && (
            <p className="text-red-500 font-bold m-auto text-sm w-max my-2">
              {err}
            </p>
          )}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-max h-full m-auto flex flex-col gap-3 justify-center"
          >
            <span className="flex items-center gap-3 border  border-[#b3b0b0] rounded-xl px-3">
              <Mail size={25} />
              <input
                disabled={isSubmitting}
                {...register("email", { required: "Email is required" })}
                type="email"
                className="px-4  py-1 outline-none w-full"
                placeholder="E-Mail"
              />
            </span>
            {errors.email && (
              <p className="text-red-500 font-medium m-auto text-sm w-max my-1">
                {errors.email.message}
              </p>
            )}

            <span className="flex items-center gap-3 border  border-[#b3b0b0] rounded-xl px-3">
              <Lock size={25} />
              <input
                disabled={isSubmitting}
                {...register("password", { required: "Password is required" })}
                type="password"
                className="px-4  py-1 outline-none w-full"
                placeholder="Password"
              />
            </span>
            {errors.password && (
              <p className="text-red-500 font-medium m-auto text-sm w-max my-1">
                {errors.password.message}
              </p>
            )}

            <div
              onClick={() => (window.location.href = "/auth/resetPassword")}
              className="text-right font-bold cursor-pointer text-(--color-error) active:text-(--color-error)/70 select-none mx-2"
            >
              Forgot Password
            </div>
            <button
              disabled={isSubmitting}
              className={cn(
                "w-full rounded-2xl text-center py-2 cursor-pointer active:scale-95  font-medium bg-(--color-primary) text-(--color-primary-content)",
                isSubmitting && "bg-[#1f639b]"
              )}
            >
              {isSubmitting ? "Logging" : "Login"}
            </button>
          </form>
          <span className="w-full flex items-center justify-between">
            <hr className="w-full" />
            <p className="text-sm m-2">OR</p>
            <hr className="w-full" />
          </span>
          <Button
            logo={github}
            onClick={handleGithubLogin}
            text="Continue with Github"
            color="#ffffff"
            className="lg:w-1/2 text-[#868686] rounded-3xl m-auto"
            arrow={false}
          />
        </aside>
        <Image
          src={theme === "dark" ? bgDark : bgLight}
          height={800}
          width={550}
          alt="bg"
        />
      </div>
    </main>
  );
};

export default Page;
