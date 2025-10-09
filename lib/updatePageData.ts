import { database } from "@/app/appwrite";

export async function updatePageData(pageId: string, data: any) {
  try {
    await database.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
      pageId,
      data
    )
  } catch (err) {
    console.log(err);

  }
}