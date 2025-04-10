"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Page from "./Page";
import { database } from "@/app/appwrite";
import fetchUserLoggedInUser from "@/lib/fetchLoggedInUser";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { setLoggedInUser } from "@/redux/slices/loggedInUser";
import { useLoggedInUser } from "@/hooks/getLoggedInUser";
import Spinner from "./Spinner";
import { PageType } from "@/types/pageType";
import { Query } from "appwrite";
import { toast } from "sonner";
import Search from "./Search";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useMediaQuery } from 'usehooks-ts'
import { cn } from "@/lib/utils";

type Menu = 'Home' | 'Favourite' | 'Create' | 'Personal' | 'Trash' | 'Search' | 'Shared';

const SideBar = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useMediaQuery("(max-width:768px)");

  const { $id, fullName, email } = useLoggedInUser();
  const { theme, setTheme } = useTheme();
  const isResizing = useRef(false);
  const sideBarRef = useRef<HTMLDivElement>(null)

  const [isPersonal, setIsPersonal] = useState(true);
  const [profile, setProfile] = useState(false);
  const [pages, setPages] = useState<PageType[]>([]);
  const [deletedPageId, setDeletedPageId] = useState<string | undefined>();
  const [onCreatePageLoading, setOnCreatePageLoading] = useState<boolean>(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<string>(isMobile ? 'w-0' : 'min-w-72')
  const [menu, setMenu] = useState<Menu>(() => {
    const menuValue = localStorage.getItem('menu');
    return menuValue ? JSON.parse(menuValue) : 'Home'
  });







  useEffect(() => {
    dispatch(setLoggedInUser({ $id, fullName, email }))
  }, [useLoggedInUser])

  useEffect(() => {
    setTheme('light')
  }, [theme]);

  useEffect(() => {
    const filteredChildrens = pages.filter((children) => children.$id !== deletedPageId);
    setPages(filteredChildrens)
  }, [deletedPageId])


  function onPersonalClick() {
    setIsPersonal(prev => !prev)
    setMenu('Personal')
    localStorage.setItem('menu', JSON.stringify('Personal'))
  }

  function onProfileClick() {
    setProfile(prev => !prev)

  }

  async function onCreatePage() {
    try {
      setOnCreatePageLoading(true)
      setMenu('Create');

      const { $id, fullName } = await fetchUserLoggedInUser()
      const newPage = await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        'unique()',
        { ownerId: $id }
      );

      if (newPage) setPages(prev => [...prev, newPage])

      router.push(`/${fullName}/${newPage.$id}`)


    } catch (err) {
      console.log(err);

    } finally {
      setOnCreatePageLoading(false)
      localStorage.setItem('menu', JSON.stringify('Create'))
      toast.success('New Page Created.');
    }
  }

  useEffect(() => {

    async function fetchPages(userId: string) {
      try {
        const thePages = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
          [
            Query.equal('ownerId', userId),
            Query.isNull('parentId'),
            Query.equal('isDeleted', false)
          ]
        )
        setPages(thePages.documents)


      } catch (Err) {
        console.log(Err)

      }
    }



    if ($id) {
      fetchPages($id);

    }

  }, [$id, isPersonal]);


  const mouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation()

    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;

    let newWidth = e.clientX;

    if (newWidth < 288) newWidth = 288;
    if (newWidth > 800) newWidth = 1000;
    if (sideBarRef.current) {
      sideBarRef.current.style.width = `${newWidth}px`
      setSidebarWidth(`${newWidth}px`)
    }




  }

  const handleMouseUp = (e: MouseEvent) => {
    isResizing.current = false

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp)
  }


  return (
    <aside className={cn('relative', sidebarWidth)} ref={sideBarRef}>
      {sidebarWidth !== 'w-0' ? <div className={`${theme === "dark" ? "bg-[#050505] text-[#786B6B] shadow-gray-400" : "bg-[#FFFFFF] text-[#928989]"} ${isMobile && 'fixed w-full z-[999999]'} p-4 h-screen before:pointer-events-none shadow-lg before:absolute before:inset-0  before:shadow-[inset_0_0_10px_rgba(0,0,0,0.3)] `}>
        {onCreatePageLoading && <div className="absolute  w-screen h-screen z-[99999] opacity-70 flex items-center bg-amber-50 justify-center text-2xl font-bold text-[#706b6b] ">
          <p className="grid grid-cols-2 items-center w-max"><Spinner size={30} color="#3897E4" />Creating...</p></div>}
        {isSearch && <Search setIsSearch={setIsSearch} />}
        <nav className="flex items-end gap-1">
          <p className="text-4xl font-black text-[#3897E4]">N</p>
          <p className="text-2xl font-black text-[#30C24B]">otex</p>
        </nav>
        <ChevronsLeft onClick={() => setSidebarWidth('w-0')} className="absolute right-4 top-4 cursor-pointer active:scale-95" size={20} color="#838383" />

        <div className="flex flex-col my-4 select-none gap-0.5">
          <div className={` ${menu === 'Home' && 'bg-[#8ECAE9]'} w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house "><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            <p className="w-full text-[14px] font-[410]">Home</p>
          </div>
          <div onClick={() => setIsSearch(true)} className={` ${menu === 'Search' && 'bg-[#8ECAE9]'} w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <p className="w-full text-[14px] font-[410]">Search</p>
          </div>
          <div className={` ${menu === 'Favourite' && 'bg-[#8ECAE9]'} w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" stroke="#F57B11" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>
            <p className="w-full text-[14px] font-[410]">Favourites</p>
          </div>
          <div className={` ${menu === 'Trash' && 'bg-[#8ECAE9]'} w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            <p className="w-full text-[14px]  font-[410]">Trash</p>
          </div>
          <div className={` ${menu === 'Create' && 'bg-[#8ECAE9]'} w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-plus"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M9 15h6" /><path d="M12 18v-6" /></svg>
            <p onClick={onCreatePage} className="w-full text-[14px] font-[410]">Create New</p>
          </div>
          <div className={` ${menu === 'Shared' && 'bg-[#8ECAE9]'} w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-waypoints"><circle cx="12" cy="4.5" r="2.5" /><path d="m10.2 6.3-3.9 3.9" /><circle cx="4.5" cy="12" r="2.5" /><path d="M7 12h10" /><circle cx="19.5" cy="12" r="2.5" /><path d="m13.8 17.7 3.9-3.9" /><circle cx="12" cy="19.5" r="2.5" /></svg>
            <p className="w-full text-[14px] font-[410]">Shared with me</p>
          </div>
          <div>
            <div onClick={onPersonalClick} className={` ${menu === 'Personal' && 'bg-[#8ECAE9]'} w-full flex items-center  gap-3 rounded-sm px-3 py-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="34" height="28" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-venetian-mask"><path d="M18 11c-1.5 0-2.5.5-3 2" /><path d="M4 6a2 2 0 0 0-2 2v4a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3a8 8 0 0 0-5 2 8 8 0 0 0-5-2z" /><path d="M6 11c1.5 0 2.5.5 3 2" /></svg>
              <p className="w-full text-[14px] font-[410]">Personal</p>
              {isPersonal ?
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" stroke={theme === 'dark' ? "#978D8D" : "#786B6B"} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6" /></svg>
              }
            </div>
            <div className="flex flex-col pl-[40px] lg:h-64 p-2 overflow-y-auto">
              {isPersonal && pages && pages.map((element) => (
                <Page key={element.$id} page={element} loggedInUserName={fullName} loggedInUserId={$id} setDeletedId={setDeletedPageId} />
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
        <div onMouseDown={mouseDown} className="cursor-ew-resize h-screen top-0 w-0.5  hover:bg-[#786B6B] absolute right-0 z-[99999]"></div>

      </div> : <ChevronsRight onClick={() => setSidebarWidth('min-w-72')} className="absolute -right-6 top-4 cursor-pointer active:scale-95" size={20} color="#838383" />}
    </aside>
  );
};

export default SideBar;
