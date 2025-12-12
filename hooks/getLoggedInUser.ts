import { useState, useEffect } from "react";

export function useGetLoggedinUser() {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/verifyUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const result = await res.json();
        if (!res.ok) return;

        if (result.success) {
          setUser(result.user);
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
