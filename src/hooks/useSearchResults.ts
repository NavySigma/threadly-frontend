import { useQuery } from "@tanstack/react-query";
import type { SearchResults, SearchType } from "../types/search";
import {
  parseSearchQuery,
  searchAllApi,
  searchPostsApi,
  searchTagsApi,
  searchUsersApi,
} from "../api/search-api";

export interface UseSearchResultsOptions {
  query: string;
  minChars?: number;
  overrideType?: SearchType;
}

export interface UseSearchResultsReturn {
  results: SearchResults;
  isLoading: boolean;
  error: Error | null;
  searchType: SearchType;
  cleanQuery: string;
}

export function useSearchResults({
  query,
  minChars = 1,
  overrideType,
}: UseSearchResultsOptions): UseSearchResultsReturn {
  const parsed = parseSearchQuery(query);
  const { type: parsedType, query: cleanQuery } = parsed;
  const type = overrideType ?? parsedType;
  const isValid = cleanQuery.length >= minChars;

  const { data, isLoading, error } = useQuery<SearchResults>({
    queryKey: ["search-results", type, cleanQuery],
    queryFn: async (): Promise<SearchResults> => {
      if (type === "posts") {
        const res = await searchPostsApi(cleanQuery);
        return { posts: res.data ?? [], tags: [], users: [] };
      }

      if (type === "tags") {
        const res = await searchTagsApi(cleanQuery);
        return { posts: [], tags: res.data ?? [], users: [] };
      }

      if (type === "users") {
        const res = await searchUsersApi(cleanQuery);
        return { posts: [], tags: [], users: res.data ?? [] };
      }

      return searchAllApi(cleanQuery);
    },
    enabled: isValid,
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    results: data ?? { posts: [], tags: [], users: [] },
    isLoading: isLoading && isValid,
    error: error instanceof Error ? error : null,
    searchType: type,
    cleanQuery,
  };
}
