import { useState, useEffect } from "react";
import { Query } from "appwrite";
import { account, database } from "@/app/appwrite";
import { User } from "@/types/userType";



export function useLoggedInUser() {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
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

        if (theUser.total > 0) {
          const { fullName, email, $id } = theUser.documents[0]
          setUser({ fullName, email, $id })
        }


      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { ...user, loading, error };
}