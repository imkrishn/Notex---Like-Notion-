import { account, database } from "@/app/appwrite";
import { Query } from "appwrite";

export default async function fetchUserLoggedInUser() {
  try {
    const loggedInUser = await account.get();
    const { email } = loggedInUser

    const theUser = await database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ID!,
      [
        Query.equal('email', email)
      ]
    );

    const { $id, fullName } = theUser.documents[0]

    return { $id, fullName, email };


  } catch (err: any) {
    console.error("Error fetching user:", err);
    return {}
  }
}