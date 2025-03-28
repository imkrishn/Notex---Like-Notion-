'use client'

import Create from "@/components/Create";
import Home from "@/components/Home";
import { Room } from "@/components/Room";
import SideBar from "@/components/SideBar";
import { useLoggedInUser } from "@/hooks/getLoggedInUser";
import { setLoggedInUser } from "@/redux/slices/loggedInUser";
import { AppDispatch } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";



export default function Main() {
  const { $id, fullName, email } = useLoggedInUser();

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(setLoggedInUser({ $id, fullName, email }))
  }, [useLoggedInUser])

  return (
    <main className="h-screen w-screen flex overflow-clip">
      <SideBar />
      <Room><Create /></Room>
    </main>
  );
}
