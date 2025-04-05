import { database } from "@/app/appwrite"
import { PageType } from "@/types/pageType"
import { Query } from "appwrite"


export async function fetchPages(userId: string) {
  try {
    const pages = await database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
      [
        Query.equal('ownerId', userId),
      ]
    )

    return pages.documents as PageType[]

  } catch (Err) {
    console.log(Err)

  }
}

export async function fetchSharedPages(userId: string) {
  try {


    const sharedWithMe = await database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_USERS_ID!,
      [
        Query.equal('sharedUserId', userId)
      ]
    );

    const sharedWithMePages = sharedWithMe.documents.map((shared) => shared.pages)

    return sharedWithMePages

  } catch (Err) {
    console.log(Err)

  }
}