// src/pages/Home.tsx
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../contexts/useAuth";
import { usePosts } from "../hooks/usePostsQuery";
import { parseSearchQuery } from "../api/search";
import { fetchTags } from "../api/tags";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "../types/posts";
import CreatePostPage from "./post/CreatePostPage";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { apiFetch } from "../api/client";
import { postsApi } from "../api/posts";

interface CommunityStats {
  users_online: number;
  questions: number;
  answers: number;
  upvotes: number;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-5 w-full">
      {/* Kiri: Stats (Votes, Answers, Views) */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 shrink-0 sm:w-20 text-xs text-black">
        <div className="flex items-center gap-1.5 text-black">
          <span className="font-bold text-sm">{post.vote_score}</span>
          <span className="font-medium">votes</span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${post.is_answered || (post as any).comments_count > 0 ? "bg-teal-50 text-teal-700 border border-teal-200" : "text-black"}`}
        >
          <span className="font-bold text-sm">
            {(post as any).comments_count ?? (post.is_answered ? 1 : 0)}
          </span>
          <span className="font-medium">answers</span>
        </div>
        <div className="flex items-center gap-1.5 text-black">
          <span className="font-bold">{post.view_count}</span>
          <span className="font-medium">views</span>
        </div>
      </div>

      {/* Kanan: Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 mb-1.5">
          {post.status === "closed" && (
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200 uppercase">
              Private
            </span>
          )}
          <Link
            to={`/posts/${post.id}`}
            className="text-xl font-extrabold tracking-tight text-[#0074cc] hover:text-[#0a95ff] transition-colors line-clamp-2"
          >
            {post.title}
          </Link>
        </div>

        <p className="text-sm text-gray-900 line-clamp-2 mb-3 leading-relaxed">
          {post.body}
        </p>

        <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <button
                key={tag.id}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/posts?tag=${encodeURIComponent(tag.name)}`);
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-md transition-colors"
                style={{
                  backgroundColor: tag.color ? `${tag.color}22` : "#ccfbf1",
                  color: tag.color ? tag.color : "#0d9488",
                  border: `1px solid ${tag.color ? tag.color : "#0d9488"}`,
                }}
              >
                <span style={{ filter: "brightness(0.45) saturate(1.8)" }}>
                  {tag.name}
                </span>
              </button>
            ))}
          </div>

          {/* User Info (Kanan Bawah) */}
          <div className="flex items-center gap-2.5 shrink-0 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
            {post.user.avatar_url ? (
              <img
                src={post.user.avatar_url}
                alt={post.user.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {post.user.username[0].toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <Link
                to={`/users/${post.user.id}`}
                className="text-xs font-medium text-teal-700 hover:underline"
              >
                {post.user.username}
              </Link>
              <span className="text-[11px] text-black font-medium">
                asked {timeAgo(post.created_at)}
              </span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="post-item" style={{ opacity: 0.5 }}>
      <div className="post-votes">
        <div
          style={{
            width: 32,
            height: 16,
            background: "#e3e6e8",
            borderRadius: 3,
            marginBottom: 4,
          }}
        />
        <div
          style={{
            width: 32,
            height: 12,
            background: "#e3e6e8",
            borderRadius: 3,
          }}
        />
      </div>
      <div className="post-body" style={{ flex: 1 }}>
        <div
          style={{
            height: 18,
            background: "#e3e6e8",
            borderRadius: 3,
            marginBottom: 8,
            width: "70%",
          }}
        />
        <div
          style={{
            height: 13,
            background: "#e3e6e8",
            borderRadius: 3,
            marginBottom: 4,
            width: "90%",
          }}
        />
        <div
          style={{
            height: 13,
            background: "#e3e6e8",
            borderRadius: 3,
            width: "60%",
          }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();
  const isCreating = location.pathname === "/posts/create";

  const rawSearch = params.get("search") || "";
  const explicitType = (params.get("type") || "all") as
    | "all"
    | "posts"
    | "tags"
    | "users";
  const { type: parsedType, query: cleanQuery } = parseSearchQuery(rawSearch);
  const searchType = explicitType !== "all" ? explicitType : parsedType;
  const effectiveSearch = searchType !== "all" ? cleanQuery : rawSearch;

  const {
    posts,
    currentPage,
    lastPage,
    total,
    isLoading,
    error,
    sortBy,
    setSortBy,
    goToPage,
  } = usePosts(effectiveSearch);

  const { data: popularTagsData, isLoading: popularTagsLoading } = useQuery({
    queryKey: ["popular-tags"],
    queryFn: () => fetchTags({ sort: "popular", per_page: 20 }),
    staleTime: 5 * 60 * 1000,
  });
  // Ambil max 6 tag terpopuler
  const popularTags = (popularTagsData?.data || []).slice(0, 6);

  const { data: topPostsData, isLoading: topPostsLoading } = useQuery({
    queryKey: ["top-posts"],
    queryFn: () => postsApi.getAll({ sort: "popular" }),
    staleTime: 10 * 60 * 1000,
  });
  const topPosts = (topPostsData?.data ?? []).slice(0, 5);

  const { data: communityData } = useQuery({
    queryKey: ["community-stats"],
    queryFn: () =>
      apiFetch<{ data: CommunityStats }>("/stats/community"),
    staleTime: 5 * 60 * 1000,
  });
  const s = communityData?.data;

  if (isCreating) {
    return <CreatePostPage />;
  }

  return (
    <div className="flex gap-6 w-full max-w-[1100px] mx-auto">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="home-header">
          <h1>
            {effectiveSearch
              ? searchType !== "all"
                ? `Hasil pencarian ${searchType} untuk "${effectiveSearch}"`
                : `Hasil pencarian untuk "${effectiveSearch}"`
              : "Popular Questions"}
          </h1>
          {effectiveSearch && (
            <Link to="/" style={{ marginLeft: 12, fontSize: 13 }}>
              Clear search
            </Link>
          )}
          {user ? (
            <Link to="/posts/create" className="btn btn-tosca-outline">
              Ask Question
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Log in to Ask
            </Link>
          )}
        </div>

        {/* Stats + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <span className="text-lg font-semibold text-gray-800">
            {isLoading ? "Loading..." : `${total.toLocaleString()} questions`}
          </span>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
            {(["popular", "newest", "votes", "unanswered"] as const).map(
              (s, i) => (
                <button
                  key={s}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    i < 3 ? "border-r border-gray-200" : ""
                  } ${
                    sortBy === s
                      ? "bg-teal-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setSortBy(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "#fee",
              border: "1px solid #f99",
              borderRadius: 4,
              color: "#c0392b",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Posts List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-teal-500 bg-white shadow-sm px-6 py-4"
              >
                <PostSkeleton />
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-teal-500 bg-white shadow-sm p-12 text-center text-gray-500 text-sm">
              Belum ada postingan. Jadilah yang pertama bertanya!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="overflow-hidden rounded-2xl border border-teal-500 bg-white shadow-sm px-6 py-4 transition hover:shadow-md"
              >
                <PostCard post={post} />
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!isLoading && lastPage > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            <button
              className="filter-btn"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <ChevronLeft size={16} /> Prev
            </button>

            {Array.from({ length: lastPage }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2,
              )
              .map((p, idx, arr) => {
                const showEllipsis = idx > 0 && arr[idx - 1] !== p - 1;
                return (
                  <span
                    key={p}
                    style={{
                      display: "inline-flex",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    {showEllipsis && (
                      <span style={{ padding: "4px 8px", color: "#6a737c" }}>
                        …
                      </span>
                    )}
                    <button
                      className={`filter-btn${p === currentPage ? " active" : ""}`}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

            <button
              className="filter-btn"
              disabled={currentPage === lastPage}
              onClick={() => goToPage(currentPage + 1)}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Kanan: Sidebar */}
      <div className="hidden lg:flex flex-col gap-6 w-[300px] shrink-0 sticky top-24 self-start">
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-[15px]">
              Community activity
            </h3>
            <span className="text-xs text-orange-500 font-medium">All time</span>
          </div>
          <div className="p-4 flex flex-col gap-3.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2e9154] ring-4 ring-[#e3f4e9] ml-1" />
              <span className="text-sm text-gray-800 ml-1.5">
                {Math.max(1, s?.users_online ?? 1)} users online
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-gray-800">❓</span>
              <span className="text-sm text-gray-800">
                {s?.questions ?? 0} questions
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-gray-800">💬</span>
              <span className="text-sm text-gray-800">
                {s?.answers ?? 0} answers
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-gray-800">👍</span>
              <span className="text-sm text-gray-800">
                {s?.upvotes ?? 0} upvotes
              </span>
            </div>
          </div>
        </div>
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Flame
                size={16}
                className="text-[#f48043]"
                fill="currentColor"
                stroke="none"
              />
              <span className="text-[13px] text-gray-800 font-medium">
                Popular tags
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((t) => (
                <Link
                  key={t.id}
                  to={`/posts?tag=${encodeURIComponent(t.name)}`}
                  className="px-2.5 py-1 text-xs font-bold rounded-md transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: t.color ? `${t.color}22` : "#ccfbf1",
                    color: t.color ? t.color : "#0d9488",
                    border: `1px solid ${t.color ? t.color : "#0d9488"}`,
                  }}
                >
                  <span style={{ filter: "brightness(0.45) saturate(1.8)" }}>
                    {t.name}
                  </span>
                </Link>
              ))}
              {popularTagsLoading && (
                <span className="text-xs text-gray-400">Loading tags...</span>
              )}
              {!popularTagsLoading && popularTags.length === 0 && (
                <span className="text-xs text-gray-400">Tidak ada tag</span>
              )}
            </div>
          </div>
        </div>

        {/* Recently viewed posts Widget */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-[15px]">
              Recently viewed posts
            </h3>
          </div>
          <div className="flex flex-col divide-y divide-gray-100">
            {topPostsLoading ? (
              <div className="p-4 text-xs text-gray-500 text-center">Loading...</div>
            ) : topPosts.length > 0 ? (
              topPosts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Link
                    to={`/posts/${p.id}`}
                    className="text-[13px] line-clamp-3 font-medium"
                    style={{ color: "#374151" }}
                  >
                    {p.title}
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {p.vote_score} vote{p.vote_score !== 1 ? "s" : ""} •{" "}
                      {(p as any).comments_count ?? 0} answer
                      {(p as any).comments_count !== 1 ? "s" : ""}
                    </span>
                    <Link
                      to={`/posts/${p.id}`}
                      className="text-xs font-bold"
                      style={{ color: "#374151" }}
                    >
                      + Read
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-gray-500 text-center">
                Belum ada data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
