import { database } from "@/app/appwrite";
import { toast } from "sonner";


export async function handleDelete(pageId: string, loggedInUserId: string) {
  try {
    if (!pageId || !loggedInUserId) {
      toast.error('You are not authorized to delete this page.');
      return;
    }

    await database.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
      pageId,
      { isDeleted: true, deletedAt: Date.now() }
    );


    toast.success('Page moved to trash.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete the page.');
  }
}