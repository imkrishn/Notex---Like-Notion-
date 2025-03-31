import { database } from "@/app/appwrite"
import { Query } from "appwrite"


export default async function fetchPages(userId: string) {
  try {
    const pages = await database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
      [
        Query.equal('ownerId', userId),
      ]
    )

    const sharedWithMe = await database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_USERS_ID!,
      [
        Query.equal('sharedUserId', userId)
      ]
    );

    console.log(sharedWithMe);


    const sharedWithMePagesIds = sharedWithMe.documents.map((shared) => shared.pages.$id);

    const sharedWithMePages = await database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
      [
        Query.equal('$id', sharedWithMePagesIds),
      ]
    )

    console.log(sharedWithMePages);

  } catch (Err) {
    console.log(Err)

  }
}