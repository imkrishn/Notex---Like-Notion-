'use client'

import { database } from '@/app/appwrite';
import { cn } from '@/lib/utils';
import { ID, Query } from 'appwrite';
import { ChevronDown, CircleX } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';


interface User {
  $id?: string;
  fullName?: string;
  permission?: Permission;
  email?: string;
  invited: boolean;
}

type Permission = 'All' | 'can_edit' | 'can_read'

const InviteUser = ({ loggedInUserId, pageId, setUI }: { loggedInUserId: string | undefined, pageId: string, setUI: (value: boolean) => void }) => {
  const [invitedUser, setInvitedUser] = useState<User>();
  const [permission, setPermission] = useState<Permission>('can_read');
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [err, setErr] = useState('');
  const [onHover, setOnHover] = useState(false)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const divRef = useRef<HTMLDivElement>(null)

  function handleClickOutside(e: MouseEvent) {
    if (divRef.current && !divRef.current.contains(e.target as Node)) {
      setUI(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        onChangeSearch(searchQuery);
      } else {
        setInvitedUser(undefined);
      }
    }, 400);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);


  async function onChangeSearch(query: string) {
    try {
      setLoading(true);

      if (!loggedInUserId) {
        toast.error('You are not authorized');
        return;
      }

      const user = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ID!,
        [
          Query.startsWith('email', query),
        ]
      );



      if (user.total > 0) {
        const isShared = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_USERS_ID!,
          [
            Query.equal('ownerId', loggedInUserId),
            Query.equal('email', query),
          ]
        );
        const { $id, fullName, email } = user.documents[0];

        if (isShared.total > 0) {

          setInvitedUser({
            fullName,
            email,
            $id,
            permission: isShared.documents[0].permission,
            invited: true,
          });
          setOwnerId($id)
        } else {
          setInvitedUser({
            fullName: 'Unknown',
            email: query,
            permission: 'can_read',
            $id,
            invited: false,
          });
        }
      } else {
        setErr('No user found with this email');
        setInvitedUser(undefined)
        setOwnerId(null)
      }
    } catch (err) {
      console.log(err);

    } finally {
      setLoading(false);
    }
  }




  async function onInviteUser() {


    if (!invitedUser || !invitedUser.email || (!invitedUser.email.includes('@') && !invitedUser.email.includes('.'))) {
      toast.error("Correct Email is required")
      return
    }

    if (!pageId || !loggedInUserId) {
      toast.error('User is not authorized or page not exist');
      return
    }

    setInviteLoading(true)


    try {
      await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_USERS_ID!,
        'unique()',
        {
          pages: pageId, ownerId: loggedInUserId, sharedUserId: invitedUser.$id, permission: permission, email: invitedUser.email
        }
      )

      toast.success('User Invited')
    } catch (Err) {
      console.log(Err);
      toast.error('Failed to invite user')
    } finally {
      setInviteLoading(false);
      if (invitedUser) setInvitedUser((prev) => ({ ...prev, invited: true }))
    }
  }

  async function onDisInviteuser() {
    try {
      if (!invitedUser || !invitedUser.email || (!invitedUser.email.includes('@') && !invitedUser.email.includes('.'))) {
        toast.error("Correct Email is required")
        return
      }

      setInviteLoading(true)
      if (!loggedInUserId) {
        toast.error("YOU ARE NOT AUTHORIZED ")
        return
      }

      const isShared = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_USERS_ID!,
        [
          Query.equal('ownerId', loggedInUserId),
          Query.equal('email', invitedUser.email)
        ]
      );

      await database.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_USERS_ID!,
        isShared.documents[0].$id
      )

      toast.success('User Disinvited Successfully.')

    } catch (Err) {
      console.log(Err);
      toast.error('Failed to disinvite user.')
    } finally {
      setInviteLoading(false);
      if (invitedUser) setInvitedUser((prev) => ({ ...prev, invited: false }))
    }
  }



  return (
    <div ref={divRef} className='bg-white w-1/3  absolute top-11.5 rounded z-20 shadow shadow-gray-500  p-4'>
      <div className='w-full flex justify-end p-1 mb-2'>
        <CircleX onClick={() => setUI(false)} size={15} className='cursor-pointer' color='#7a7979' />
      </div>
      <input onChange={(e) => setSearchQuery(e.target.value)} type='text' placeholder='Email to invite' className='w-full px-3 py-0.5 outline-none rounded border border-[#5994d8] text-[#777676]' />

      <div className='rounded grid place-items-center w-full h-full my-4 text-[#7a7979]'>
        {loading ? <p>Searching ...</p> :
          (invitedUser ? <div
            onMouseEnter={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}
            className={cn('flex items-center gap-2 relative w-full p-2 rounded hover:bg-[#afecf7] cursor-pointer')}>
            <span className='text-xl rounded-full p-2 px-4 text-white font-black bg-[#49a8d4] font-blacktext-center'>{invitedUser.fullName && invitedUser?.fullName[0].toUpperCase()}</span>
            <div className='w-full '><p>{`${invitedUser.fullName}${loggedInUserId === ownerId ? ' (You)' : ''} `}</p><span className='text-xs font-medium px-3'>{invitedUser.email}</span></div>
            <select

              disabled={invitedUser.invited}
              className="border rounded p-2 text-sm cursor-pointer "
              defaultValue={invitedUser.permission as Permission}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPermission(e.target.value as Permission)}
            >
              <option value="All">All</option>
              <option value="can_read">can_read</option>
              <option value="can_edit">can_edit</option>

            </select>
            {invitedUser.invited && onHover && <p className='absolute right-0 text-sm bg-white z-30 border rounded-2xl p-2 -bottom-4'>Disinvite First</p>}
          </div>
            : (err && searchQuery ? err : <p className='my-3'>User  will appear here</p>))}
        {invitedUser && (invitedUser.invited ?
          <button onClick={onDisInviteuser} className='bg-[#4badd4] w-[92%] py-1 text-[#ffffff] font-semibold cursor-pointer active:bg-[#3f70af] rounded px-3 mt-2'>Disinvite</button>
          :
          <button onClick={onInviteUser} className='bg-[#4badd4] w-[92%] py-1 text-[#ffffff] font-semibold cursor-pointer active:bg-[#3f70af] rounded px-3 mt-2'>{inviteLoading ? 'Inviting' : 'Invite'}</button>
        )}
      </div>
    </div>
  )
}

export default InviteUser