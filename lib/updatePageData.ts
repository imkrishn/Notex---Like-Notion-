import { databases } from "@/app/(root)/appwrite";

export async function updatePageData(pageId: string, data: any) {
  try {
    await databases.updateRow({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
      rowId: pageId,
      data: data,
    });
  } catch (err) {
    console.log(err);
  }
}
