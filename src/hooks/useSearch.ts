// src/hooks/useSearch.ts
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  parseSearchQuery,
  searchAll,
  searchPosts,
  searchTags,
  searchUsers,
  type SearchType,
} from "../api/search";

export function useSearch() {
  const [query, setQuery]           = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [isOpen, setIsOpen]         = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { type, query: cleanQuery } = parseSearchQuery(debouncedQ);
  const enabled = cleanQuery.length >= 1; // ← minimal 1 huruf

  const { data, isLoading } = useQuery({
    queryKey: ["search", type, cleanQuery],
    queryFn: () => {
      if (type === "posts") return searchPosts(cleanQuery).then(r => ({ posts: r.data ?? [], tags: [],        users: []       }));
      if (type === "tags")  return searchTags(cleanQuery).then(r  => ({ posts: [],        tags: r.data ?? [], users: []       }));
      if (type === "users") return searchUsers(cleanQuery).then(r => ({ posts: [],        tags: [],           users: r.data ?? [] }));
      return searchAll(cleanQuery);
    },
    enabled,
    staleTime: 1000 * 30,
  });

  const posts      = data?.posts ?? [];
  const tags       = data?.tags  ?? [];
  const users      = data?.users ?? [];
  const hasResults = posts.length > 0 || tags.length > 0 || users.length > 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setIsOpen(true);
  }

  function handleClear() {
    setQuery("");
    setDebouncedQ("");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleClose() {
    setIsOpen(false);
  }

  return {
    query, setQuery,
    debouncedQ, cleanQuery,
    activeType: type as SearchType,
    isOpen, setIsOpen,
    isLoading: isLoading && enabled,
    posts, tags, users, hasResults,
    inputRef,
    handleChange, handleClear, handleClose,
  };
}