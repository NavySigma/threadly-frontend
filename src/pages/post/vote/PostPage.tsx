import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { usePostFilter } from "../../../contexts/PostFilterContext";
import { usePosts } from "../../../hooks";
import { PostFilterBar } from "../../../components/post/PostFilterBar";
import { Pagination } from "../../../components/post/Pagination";
import { fetchTags } from "../../../api/tags";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../api/client";
import { postsApi } from "../../../api/posts";
import {
  Flame,
  Search,
  HelpCircle,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import type { Post } from "../../../types";

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

export function PostsPage() {
  const { filter, setTag, setCategory } = usePostFilter();
  const { posts, meta, isLoading, error, page, setPage } = usePosts(filter);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tagIdParam = searchParams.get("tag_id");
  useEffect(() => {
    if (tagIdParam) {
      setTag(tagIdParam);
    }
  }, [tagIdParam, setTag]);

  const categoryIdParam = searchParams.get("category_id");
  useEffect(() => {
    if (categoryIdParam) {
      setCategory(categoryIdParam);
    }
  }, [categoryIdParam, setCategory]);

  const { data: popularTagsData, isLoading: popularTagsLoading } = useQuery({
    queryKey: ["popular-tags"],
    queryFn: () => fetchTags({ sort: "popular", per_page: 20 }),
    staleTime: 5 * 60 * 1000,
  });
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

  return (
    <div className="flex gap-6 w-full max-w-[1100px] mx-auto">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="home-header">
          <h1>Semua Pertanyaan</h1>
          <Link to="/posts/create" className="btn btn-tosca-outline">
            Ask Question
          </Link>
        </div>

        {/* Filter */}
        <PostFilterBar />

        {/* Result count */}
        {!isLoading && meta && (
          <span className="text-lg font-semibold text-gray-800 mb-4 block">
            {meta.total} pertanyaan ditemukan
          </span>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white border border-gray-200 rounded-xl">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Memuat pertanyaan...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 bg-white border border-gray-200 rounded-xl">
            <Search size={32} className="text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">
              Tidak ada pertanyaan ditemukan
            </p>
            <p className="text-xs text-gray-400">
              Coba ubah filter atau kata kunci pencarian kamu.
            </p>
          </div>
        )}

        {/* Post list */}
        {!isLoading && !error && posts.length > 0 && (
          <div className="bg-white border border-[#0d9488] rounded-xl overflow-hidden divide-y divide-gray-100">
            {posts.map((post: Post) => (
              <div
                key={post.id}
                className="p-5 hover:bg-gray-50/50 cursor-pointer transition"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <div className="flex flex-col sm:flex-row gap-5 w-full">
                  {/* Kiri: Stats (Votes, Answers, Views) */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 shrink-0 sm:w-20 text-xs text-black">
                    <div className="flex items-center gap-1.5 text-black">
                      <span className="font-bold text-sm">{post.vote_score ?? 0}</span>
                      <span className="font-medium">votes</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${post.is_answered || ((post as any).comments_count ?? 0) > 0 ? "bg-teal-50 text-teal-700 border border-teal-200" : "text-black"}`}
                    >
                      <span className="font-bold text-sm">
                        {(post as any).comments_count ?? (post.is_answered ? 1 : 0)}
                      </span>
                      <span className="font-medium">answers</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-black">
                      <span className="font-bold">{post.view_count ?? 0}</span>
                      <span className="font-medium">views</span>
                    </div>
                  </div>

                  {/* Kanan: Content */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center gap-2 mb-1.5">
                      {post.status?.toLowerCase() !== "open" && (
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
                              navigate(`/posts?tag_id=${tag.id}`);
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
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && <Pagination meta={meta} page={page} onPageChange={setPage} />}
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
              <HelpCircle size={16} className="text-gray-500" />
              <span className="text-sm text-gray-800">
                {s?.questions ?? 0} questions
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <MessageCircle size={16} className="text-gray-500" />
              <span className="text-sm text-gray-800">
                {s?.answers ?? 0} answers
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ThumbsUp size={16} className="text-gray-500" />
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
                  to={`/posts?tag_id=${encodeURIComponent(t.id)}`}
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
