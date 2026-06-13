import { useSearchParams } from "react-router-dom";
import { useSearchResults } from "../../hooks/useSearchResults";
import type { SearchResults, SearchType } from "../../types/search";

export interface SearchResultsLogicReturn {
  rawQuery: string;
  cleanQuery: string;
  searchType: SearchType;
  results: SearchResults;
  isLoading: boolean;
  error: Error | null;
  hasResults: boolean;
  showPosts: boolean;
  showTags: boolean;
  showUsers: boolean;
}

export function useSearchResultsLogic(): SearchResultsLogicReturn {
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get("q") || searchParams.get("search") || "";
  const explicitType = (searchParams.get("type") || "all") as SearchType;
  const normalizedType =
    explicitType === "posts" ||
    explicitType === "tags" ||
    explicitType === "users"
      ? explicitType
      : "all";

  console.log("[Search Logic] Raw query from params:", rawQuery);
  console.log("[Search Logic] Explicit type from params:", normalizedType);

  const { results, isLoading, error, searchType, cleanQuery } =
    useSearchResults({ query: rawQuery, overrideType: normalizedType });

  console.log(
    "[Search Logic] Parsed type:",
    searchType,
    "Clean query:",
    cleanQuery,
  );
  console.log("[Search Logic] Results:", results);
  console.log("[Search Logic] Is loading:", isLoading, "Error:", error);

  const showPosts = searchType === "all" || searchType === "posts";
  const showTags = searchType === "all" || searchType === "tags";
  const showUsers = searchType === "all" || searchType === "users";

  const hasResults =
    results.posts.length > 0 ||
    results.tags.length > 0 ||
    results.users.length > 0;

  return {
    rawQuery,
    cleanQuery,
    searchType,
    results,
    isLoading,
    error,
    hasResults,
    showPosts,
    showTags,
    showUsers,
  };
}
