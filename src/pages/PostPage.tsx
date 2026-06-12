import { Link } from "react-router-dom";
import { usePostFilter } from "../contexts/PostFilterContext";
import { usePosts } from "../hooks";
import { PostFilterBar } from "../components/post/PostFilterBar";
import { PostCard } from "../components/post/PostCard";
import { Pagination } from "../components/post/Pagination";
import type { Post } from "../types";

export function PostsPage() {
  const { filter } = usePostFilter();
  const { posts, meta, isLoading, error, page, setPage } = usePosts(filter);

  function handleClick(post: Post) {
    console.log("Navigate to:", post.id); // ganti dengan navigate(`/posts/${post.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">

      {/* Header */}
      <div className="flex justify-between items-center gap-3">
        <h1 className="text-xl font-bold text-gray-800">Semua Pertanyaan</h1>
        <Link 
          to="/posts/create"
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
        >
          + Ajukan Pertanyaan
        </Link>
      </div>

      {/* Filter */}
      <PostFilterBar />

      {/* Result count */}
      {!isLoading && meta && (
        <p className="text-xs text-gray-400">{meta.total} pertanyaan ditemukan</p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Memuat pertanyaan...</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2 bg-white border border-gray-200 rounded-xl">
          <p className="text-3xl">🔍</p>
          <p className="text-sm font-semibold text-gray-600">Tidak ada pertanyaan ditemukan</p>
          <p className="text-xs text-gray-400">Coba ubah filter atau kata kunci pencarian kamu.</p>
        </div>
      )}

      {/* Post list */}
      {!isLoading && !error && posts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onClick={handleClick} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && <Pagination meta={meta} page={page} onPageChange={setPage} />}
    </div>
  );
}