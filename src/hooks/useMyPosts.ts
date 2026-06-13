import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../api/client";
import type { Post } from "../types";

export function useMyPosts(userId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPosts = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<any>(`/users/${userId}/posts`);
      // Laravel pagination returns the paginated posts object
      console.log("My Posts response:", res.data);
      setPosts(res.data || []);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat postingan.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  return { posts, isLoading, error, refetch: fetchMyPosts };
}
