'use client'

import { database } from '@/app/appwrite'
import { PageType } from '@/types/pageType'
import { Query } from 'appwrite'
import { ChevronDown, ChevronRight, Plus, StickyNote, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Spinner from './Spinner'
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'


const Page = (
  { page, loggedInUserId, loggedInUserName, setDeletedId }:
    { page?: PageType, loggedInUserId?: string, loggedInUserName?: string, setDeletedId: (id: string) => void }) => {
  const [onOver, setOnOver] = useState(false);
  const params = usePathname().split('/')
  const [childrens, setChildrens] = useState<PageType[]>([]);
  const [chevronDown, setChevronDown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [childrenIds, setChildrenIds] = useState<string[]>([]);
  const [deletedPageId, setDeletedPageId] = useState<string>();

  const router = useRouter()


  const viewChilds = async () => {
    try {
      if (!loggedInUserId) {
        throw new Error('User is not authorized')
      }

      setLoading(true);
      setChevronDown(true);
      setChildrens([])

      if (!childrenIds || childrenIds?.length === 0 || chevronDown) {
        return
      }

      const childrenPages = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        [
          Query.equal('$id', childrenIds),
          Query.equal('isDeleted', false)
        ]
      );


      setChildrens([...childrenPages.documents])
    } catch (Err) {
      console.log(Err);

    } finally {
      setLoading(false)
    }
  }

  const addChild = async () => {
    try {
      if (!loggedInUserId) {
        throw new Error('User is not authorized')
      }

      const newPage = await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        'unique()',
        { ownerId: loggedInUserId, parentId: page?.$id }
      );

      setChildrens((prev) => [...prev, newPage]);

      await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CHILDREN_PAGE_ID!,
        'unique()',
        { childrenPageId: newPage.$id, pages: page?.$id }
      )

      setChildrenIds((prev) => [...prev, newPage.$id]);
      setChevronDown(true)




    } catch (Err) {
      console.log(Err);
      toast.error('Failed to add page')
    }


  }


  useEffect(() => {
    const childrenPagesIds = page?.children?.map((child) => child.childrenPageId);
    if (childrenPagesIds && childrenPagesIds.length > 0) {
      setChildrenIds(childrenPagesIds)
    }
  }, [page])


  function onDeletePage() {
    if (!page?.$id || !loggedInUserId) {
      toast.error('You are not authorized to delete this page.');
      return;
    }

    toast.warning('Are you sure?', {
      description: 'This page will be moved to 🗑️ Trash.',
      action: {
        label: 'Move to Trash',
        onClick: () => handleDelete(),
      },
    });

  }





  async function handleDelete() {
    try {
      if (!page?.$id || !loggedInUserId) {
        toast.error('You are not authorized to delete this page.');
        return;
      }

      await database.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        page.$id,
        { isDeleted: true, deletedAt: new Date().toISOString() }
      );

      setDeletedId(page.$id);
      router.push(`/${loggedInUserName}/home`)
      toast.success('Page moved to trash.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete the page.');
    }
  }

  useEffect(() => {
    const filteredChildrens = childrens.filter((children) => children.$id !== deletedPageId);
    setChildrens(filteredChildrens)

  }, [deletedPageId])


  return (
    <div className="w-full">
      <div
        onMouseEnter={() => setOnOver(true)}
        onMouseLeave={() => setOnOver(false)}
        className={cn("w-full flex items-center gap-1.5 rounded-sm p-1 m-0.5 cursor-pointer hover:bg-[#8ECAE9] hover:text-[#786B6B] active:bg-[#63A1C0]", params[2] === page?.$id && 'bg-[#baddee]')}
      >
        {onOver ? (
          !chevronDown ? <ChevronRight onClick={viewChilds} size={20} /> : <ChevronDown onClick={() => setChevronDown(false)} size={20} />
        ) : (
          <StickyNote color='#63A1C0' size={24} />
        )}

        <p onClick={() => {
          localStorage.removeItem('menu');
          router.push(`/${loggedInUserName}/${page?.$id}`);
        }} className="w-full text-[13px] font-[410]">{page?.name ? page.name : 'Untitled'}</p>

        {onOver && <Trash onClick={onDeletePage} size={20} className="hover:bg-[#63A1C0] z-20 rounded " />}
        {onOver && <Plus onClick={addChild} className="hover:bg-[#63A1C0] z-20 rounded " size={20} />}
      </div>

      {/* Render child pages */}
      <div className="ml-3.5 border-l-2 border-gray-300 ">
        {loading && <span className='flex justify-center'><Spinner size={26} color='#3897E4' /></span>}
        {chevronDown && childrens.length > 0 && !loading && childrens.map((children) => (
          <Page key={children.$id} loggedInUserName={loggedInUserName} loggedInUserId={loggedInUserId} page={children} setDeletedId={setDeletedPageId} />
        ))}
        {chevronDown && childrens.length === 0 && !loading && <p className='pl-3 text-xs text-gray-500'>No Pages </p>}
      </div>
    </div>
  )
}

export default Page
