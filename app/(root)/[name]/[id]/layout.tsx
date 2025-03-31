'use client'

import SideBar from "@/components/SideBar";
import { store } from "@/redux/store";
import { Provider } from "react-redux";

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <Provider store={store}>
        <main className="h-screen w-screen relative flex overflow-clip">
          <SideBar />
          {children}
        </main>
      </Provider>
    </>
  )
}