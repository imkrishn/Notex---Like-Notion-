import { databases } from "../../appwrite";
import Create from "@/components/Create";
import { toast } from "sonner";
import { redirect } from "next/navigation";

async function checkIsPublished(pageId: string) {
  if (!pageId) return false;

  try {
    const page = await databases.getRow({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
      rowId: pageId,
    });

    return !!page?.isPublished;
  } catch (err) {
    console.error(err);
    toast.error("Failed to load. Try again");
    return false;
  }
}

export default async function Main({ params }: { params: { id: string } }) {
  const pageId = params.id;

  const isPublished = await checkIsPublished(pageId);

  if (!isPublished) {
    // Option 1: redirect to 404 or another page
    redirect("/not-found");
  }

  return <Create pageId={pageId} edit={false} />;
}
