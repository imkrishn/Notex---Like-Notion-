import { database } from "@/app/appwrite";

export async function updatePageData(data: any) {
  const pageId = '67e289650020686faa23'
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