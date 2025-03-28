"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Page from "./Page";


const SideBar = () => {
  const { theme, setTheme } = useTheme();
  const [isPersonal, setIsPersonal] = useState(true);
  const [profile, setProfile] = useState(false);



  useEffect(() => {
    setTheme('light')
  }, [theme])

  function onPersonalClick() {
    setIsPersonal(prev => !prev)
  }

  function onProfileClick() {
    setProfile(prev => !prev)
  }


  return (
    <aside
      className={`${theme === "dark" ? "bg-[#050505] text-[#786B6B] shadow-gray-400" : "bg-[#FFFFFF] text-[#928989]"
        } min-w-72 p-4 resize before:pointer-events-none shadow-lg before:absolute before:inset-0  before:shadow-[inset_0_0_10px_rgba(0,0,0,0.3)] relative`}
    >
      <nav className="flex items-end gap-1">
        <p className="text-4xl font-black text-[#3897E4]">N</p>
        <p className="text-2xl font-black text-[#30C24B]">otex</p>
      </nav>
      <div className="flex flex-col my-4 select-none ">
        <div className="w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house "><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
          <p className="w-full text-[14px] font-[410]">Home</p>
        </div>
        <div className="w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <p className="w-full text-[14px] font-[410]">Search</p>
        </div>
        <div className="w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" stroke="#F57B11" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>
          <p className="w-full text-[14px] font-[410]">Favourites</p>
        </div>
        <div className="w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
          <p className="w-full text-[14px]  font-[410]">Trash</p>
        </div>
        <div className="w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-plus"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M9 15h6" /><path d="M12 18v-6" /></svg>
          <p className="w-full text-[14px] font-[410]">Create New</p>
        </div>
        <div className="w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-waypoints"><circle cx="12" cy="4.5" r="2.5" /><path d="m10.2 6.3-3.9 3.9" /><circle cx="4.5" cy="12" r="2.5" /><path d="M7 12h10" /><circle cx="19.5" cy="12" r="2.5" /><path d="m13.8 17.7 3.9-3.9" /><circle cx="12" cy="19.5" r="2.5" /></svg>
          <p className="w-full text-[14px] font-[410]">Shared with me</p>
        </div>
        <div>
          <div onClick={onPersonalClick} className="w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]">
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="28" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-venetian-mask"><path d="M18 11c-1.5 0-2.5.5-3 2" /><path d="M4 6a2 2 0 0 0-2 2v4a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3a8 8 0 0 0-5 2 8 8 0 0 0-5-2z" /><path d="M6 11c1.5 0 2.5.5 3 2" /></svg>
            <p className="w-full text-[14px] font-[410]">Personal</p>
            {isPersonal ?
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6" /></svg>
            }
          </div>
          <div className="flex flex-col pl-[40px]">
            {isPersonal && ['*', '*', '*', '*', '*', '*'].map((element, index) => (
              <Page key={index} />
            ))}
          </div>
        </div>
      </div>
      <div onClick={onProfileClick} className="absolute left-0 px-5 bottom-0 my-2 w-full  flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? "#4DA6DE" : "#2E5974"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-user"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>
        <p className={`text-sm font-medium w-full cursor-pointer ${theme === 'dark' ? "text-[#4DA6DE]" : "text-[#2E5974]"}`}>Krishna Kumar Yadav</p>
        {!profile ?
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
          : <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6" /></svg>
        }
      </div>
    </aside>
  );
};

export default SideBar;
