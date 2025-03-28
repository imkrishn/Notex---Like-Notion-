'use client'

import React, { useState } from 'react'

const Page = () => {
  const [onOver, setOnOver] = useState(false)

  return (
    <div
      onMouseEnter={() => setOnOver(true)}
      onMouseLeave={() => setOnOver(false)}
      className="w-full flex items-center gap-3 rounded-sm px-3 py-1 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" stroke={onOver ? "#146ED6" : "#4DA6DE"} viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-notepad-text">
        <path d="M8 2v4" />
        <path d="M12 2v4" />
        <path d="M16 2v4" />
        <rect width="16" height="18" x="4" y="4" rx="2" />
        <path d="M8 10h6" />
        <path d="M8 14h8" />
        <path d="M8 18h5" />
      </svg>
      <p className="w-full text-[15px] font-[410]">Page</p>
    </div>
  )
}

export default Page
