import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css"; // Ensure Tailwind styles are loaded
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Notex",
  description: "A new notion",
};

const Roboto = localFont({
  src: [
    { path: "../public/fonts/Roboto-Black.ttf", weight: "900", style: "normal" },
    { path: "../public/fonts/Roboto-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../public/fonts/Roboto-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Roboto-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Roboto-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Roboto-Light.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Roboto-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../public/fonts/Roboto-Thin.ttf", weight: "100", style: "normal" },
  ],
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={Roboto.variable}>
      <body className="font-roboto antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
