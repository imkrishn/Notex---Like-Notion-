'use client';

import SideBar from "@/components/SideBar";
import { store } from "@/redux/store";
import React from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";



export default function Layout({ children }: { children: React.ReactNode }) {


  return (
    <Provider store={store}>
      <main className="h-screen w-screen relative flex overflow-clip">
        <SideBar />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </main>
    </Provider>
  );
}
