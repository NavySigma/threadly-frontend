// src/hooks/usePostDetail.ts

import { useEffect, useState } from "react";
import { postsApi } from "../api/posts";
import type { Post } from "../types/posts";

export function usePostDetail(id: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await postsApi.getById(id);

        setPost(res.data);
      } catch {
        setError("Gagal memuat postingan");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  return {
    post,
    isLoading,
    error,
  };
}