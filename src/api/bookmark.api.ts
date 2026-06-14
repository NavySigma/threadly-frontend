import { apiFetch } from "./client";
import type {
  BookmarksResponse,
  CheckBookmarkResponse,
  CreateBookmarkResponse,
  DeleteBookmarkResponse,
  CreateBookmarkPayload,
} from "../types/bookmark.types";

export const bookmarkApi = {
  list: (): Promise<BookmarksResponse> =>
    apiFetch<BookmarksResponse>("/me/bookmarks"),

  check: (postId: string): Promise<CheckBookmarkResponse> =>
    apiFetch<CheckBookmarkResponse>(`/bookmarks/${postId}/check`),

  add: (postId: string): Promise<CreateBookmarkResponse> =>
    apiFetch<CreateBookmarkResponse>("/bookmarks", {
      method: "POST",
      body: JSON.stringify({ post_id: postId } satisfies CreateBookmarkPayload),
    }),

  remove: (postId: string): Promise<DeleteBookmarkResponse> =>
    apiFetch<DeleteBookmarkResponse>(`/bookmarks/${postId}`, {
      method: "DELETE",
    }),
};