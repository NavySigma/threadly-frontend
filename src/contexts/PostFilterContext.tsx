import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import type { PostFilter, SortOption, AnswerFilter } from "../types";

const DEFAULT: PostFilter = { search: "", tag_id: "", category_id: "", sort: "latest", answer: "all" };

type Action =
  | { type: "SET_SEARCH";    payload: string }
  | { type: "SET_TAG";       payload: string }
  | { type: "SET_CATEGORY";  payload: string }
  | { type: "SET_SORT";      payload: SortOption }
  | { type: "SET_ANSWER";    payload: AnswerFilter }
  | { type: "RESET" };

function reducer(state: PostFilter, action: Action): PostFilter {
  switch (action.type) {
    case "SET_SEARCH":    return { ...state, search:     action.payload };
    case "SET_TAG":       return { ...state, tag_id:     action.payload };
    case "SET_CATEGORY":  return { ...state, category_id: action.payload };
    case "SET_SORT":      return { ...state, sort:       action.payload };
    case "SET_ANSWER":    return { ...state, answer:     action.payload };
    case "RESET":         return DEFAULT;
    default:              return state;
  }
}

interface PostFilterContextValue {
  filter: PostFilter;
  setSearch: (v: string) => void;
  setTag: (v: string) => void;
  setCategory: (v: string) => void;
  setSort: (v: SortOption) => void;
  setAnswer: (v: AnswerFilter) => void;
  resetFilter: () => void;
  hasActiveFilter: boolean;
}

const PostFilterContext = createContext<PostFilterContextValue | null>(null);

export function PostFilterProvider({ children }: { children: ReactNode }) {
  const [filter, dispatch] = useReducer(reducer, DEFAULT);

  const setSearch   = useCallback((v: string)       => dispatch({ type: "SET_SEARCH", payload: v }), []);
  const setTag      = useCallback((v: string)       => dispatch({ type: "SET_TAG",    payload: v }), []);
  const setCategory = useCallback((v: string)       => dispatch({ type: "SET_CATEGORY", payload: v }), []);
  const setSort     = useCallback((v: SortOption)   => dispatch({ type: "SET_SORT",   payload: v }), []);
  const setAnswer   = useCallback((v: AnswerFilter) => dispatch({ type: "SET_ANSWER", payload: v }), []);
  const resetFilter = useCallback(()                => dispatch({ type: "RESET" }), []);

  const hasActiveFilter =
    filter.search !== "" || filter.tag_id !== "" || filter.category_id !== "" ||
    filter.sort !== "latest" || filter.answer !== "all";

  return (
    <PostFilterContext.Provider value={{ filter, setSearch, setTag, setCategory, setSort, setAnswer, resetFilter, hasActiveFilter }}>
      {children}
    </PostFilterContext.Provider>
  );
}

export function usePostFilter() {
  const ctx = useContext(PostFilterContext);
  if (!ctx) throw new Error("usePostFilter must be used inside <PostFilterProvider>");
  return ctx;
}
