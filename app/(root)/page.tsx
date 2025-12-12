// app/(public)/page.tsx  (or wherever your original page component lives)
"use client";

import Button from "@/components/ui/button";
import logo from "@/public/logo.png";
import Image from "next/image";
import bgLight from "@/public/bg-light.png";
import bgDark from "@/public/bg-dark.png";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { Sparkles, CheckCircle } from "lucide-react";

const LandingPage = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const bgImg = theme === "dark" ? bgDark : bgLight;

  return (
    <main className="min-h-screen w-full flex flex-col ">
      {/* NAV */}
      <nav className="max-w-7xl w-full mx-auto px-6 sm:px-8 py-5 flex items-center gap-4 justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/")}
          aria-label="Notex home"
        >
          <Image src={logo} alt="Notex logo" width={36} height={36} />

          <div className="leading-tight">
            <div className="text-2xl font-extrabold tracking-tighter text-(--color-primary)">
              N<span className="ml-1 text-[#30C24B]">otex</span>
            </div>
            <div className="text-xs text-(--color-neutral-content-light) -mt-1">
              Smart notes, smarter you
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-3 text-(--color-neutral-content-light)"
            role="region"
            aria-label="controls"
          >
            <ThemeToggle />
            <Button
              onClick={() => (window.location.href = "/auth/login")}
              arrow={false}
              text="Log in"
              className="px-3 py-1.5 text-sm h-9 bg-transparent text-(--color-neutral-content-light)  border-none shadow-none"
            />

            <Button
              onClick={() => (window.location.href = "/auth/signup")}
              arrow={false}
              text="Get Notex Free"
              className="h-10 text-(--color-primary) mx-3 shadow-blue-300"
              logo={logo}
            />
          </div>

          {/* mobile CTA group */}
          <div className="sm:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => (window.location.href = "/auth/signup")}
              aria-label="Sign up"
              className="h-9 w-9 grid place-items-center rounded-lg bg-(--color-primary) text-(--color-primary-content)"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex-1 w-full flex items-center">
        <div className="max-w-7xl w-full mx-auto px-6 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* left: text */}
          <div className="lg:col-span-6 col-span-1">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
                <span className="text-(--color-primary)">New</span>
                <span className="text-(--color-neutral-content-light) text-xs">
                  Free forever plan
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-(--color-neutral-content)">
                Write, organize and{" "}
                <span className="text-(--color-primary)">achieve</span> more
                with{" "}
                <span className="block text-(--color-primary) sm:inline">
                  Notex
                </span>
              </h1>

              <p className="text-lg text-(--color-neutral-content-light) max-w-md">
                Capture ideas, structure your work, and ship faster — everything
                in a clean, distraction-free workspace.
              </p>

              <TextGenerateEffect
                duration={1.2}
                words="Your ideas deserve a smarter space"
                className="text-md text-(--color-neutral-content-light)"
              />

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => (window.location.href = "/auth/signup")}
                  arrow
                  text="Get Notex Free"
                  className="px-4 py-2 rounded-lg text-sm h-11 bg-(--color-primary) text-(--color-primary-content) shadow-lg"
                />

                <Button
                  onClick={() => (window.location.href = "/auth/login")}
                  arrow={false}
                  text="Log in"
                  className="px-4 py-2 rounded-lg text-sm h-11 bg-transparent text-(--color-neutral-content) border border-(--bn-colors-menu-background)"
                />
              </div>

              {/* feature chips */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-(--color-base-200)] text-(--color-neutral-content-light) text-sm">
                  <CheckCircle size={16} />
                  <span>Fast notes</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-(--color-base-200) text-(--color-neutral-content-light) text-sm">
                  <CheckCircle size={16} />
                  <span>Fast notes</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-(--color-base-200) text-(--color-neutral-content-light) text-sm">
                  <CheckCircle size={16} />
                  <span>Organize your ideas</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-(--color-base-200) text-(--color-neutral-content-light) text-sm">
                  <CheckCircle size={16} />
                  <span>Share & collaborate</span>
                </div>
              </div>
            </div>
          </div>

          {/* right: illustration / card */}
          <div className="lg:col-span-6 col-span-1 flex items-center justify-center">
            <div
              className={cn(
                "relative w-full max-w-md rounded-2xl p-6 shadow-2xl",
                "border border-(--bn-colors-menu-background)",
                "bg-[linear-gradient(180deg,var(--background)_80%,transparent_100%)"
              )}
            >
              <div className="absolute -top-6 -right-6 opacity-90"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-(--color-neutral-content-light)">
                      Notebook
                    </div>
                    <div className="text-lg font-bold text-(--color-neutral-content)">
                      Project ideas
                    </div>
                  </div>
                  <div className="text-xs text-(--color-neutral-content-light)">
                    3 pages
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="h-3 rounded bg-(--color-base-200) w-3/4" />
                  <div className="h-3 rounded bg-(--color-base-200) w-2/3" />
                  <div className="h-3 rounded bg-(--color-base-200) w-1/2" />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-(--color-neutral-content-light)">
                    Last edited: 2 days ago
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-sm px-2 py-1 rounded text-(--color-neutral-content)">
                      Preview
                    </button>
                    <button className="text-sm px-2 py-1 rounded bg-(--color-primary) text-(--color-primary-content)">
                      Open
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER / small note */}
      <footer className="w-full border-t mt-auto border-(--bn-colors-menu-background)">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 text-sm text-(--color-neutral-content-light) flex justify-between items-center">
          <div>© {new Date().getFullYear()} Notex — Built for focus</div>
          <div className="flex items-center gap-4">
            <a
              className="text-(--color-neutral-content-light) hover:text-(--color-neutral-content)"
              href="/"
            >
              Terms
            </a>
            <a
              className="text-(--color-neutral-content-light) hover:text-(--color-neutral-content)"
              href="/"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
