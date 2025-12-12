"use client";

import Create from "@/components/Create";
import Home from "@/components/Home";
import SharedWithMe from "@/components/SharedWithMe";

import { usePathname } from "next/navigation";
import React from "react";

const page = () => {
  const pathname = usePathname();

  const params = pathname.split("/");
  const pageId = params[2];
  const pageName = params[1];

  return (
    <div className="h-full overflow-auto">
      {pageName === "home" && <Home />}
      {pageName === "page" && <Create pageId={pageId} edit={true} />}
      {pageName === "shared" && <SharedWithMe />}
    </div>
  );
};

export default page;
