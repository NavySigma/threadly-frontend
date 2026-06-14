import { useNavigate, useParams } from "react-router-dom";
import { usePostDetail } from "../../hooks/usePostDetail";
import { useAuth } from "../../hooks/useAuth";
import CommentSection from "../../components/post/CommentSection";
import PostVote from "../post/vote/PostVote";
import PostLike from "../post/like/PostLike";
import PostReport from "../post/like/PostReport";
import { PostActionMenu } from "../profile/PostActionMenu";
import { ArrowLeft } from "lucide-react";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { post, isLoading, error, refetch } = usePostDetail(id!);

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Memuat postingan...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-500">{error ?? "Postingan tidak ditemukan."}</p>
      </div>
    );
  }

  const isOwner = user?.id === post.user.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {isOwner && (
          <PostActionMenu
            postId={post.id}
            postStatus={post.status}
            closedAt={post.closed_at}
            onUpdated={refetch}
          />
        )}
      </div>

      {/* Title + Report */}
      <div className="flex justify-between items-start gap-4 mb-2">
        <h1 className="text-xl font-bold text-gray-900 leading-snug flex items-center gap-2 flex-wrap">
          {post.status?.toLowerCase() !== "open" && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase">
              PRIVATE
            </span>
          )}
          {post.title}
        </h1>

        {!isOwner && <PostReport postId={post.id} />}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-5 flex-wrap">
        <span>Ditanya {timeAgo(post.created_at)}</span>
        <span>Dilihat {post.view_count}x</span>
        <span className={`font-semibold ${post.status?.toLowerCase() === "open" ? "text-green-600" : "text-red-500"}`}>
          {post.status?.toLowerCase() !== "open" ? "PRIVATE" : "OPEN"}
        </span>
        {post.is_answered && (
          <span className="text-green-600 font-semibold">Terjawab</span>
        )}
      </div>

      {/* Body */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex gap-5 items-start">
            {/* Vote */}
            <PostVote
              postId={post.id}
              score={post.vote_score}
              userVote={post.user_vote ?? null}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words text-gray-800">
                {post.body}
              </div>

              {/* Tags */}
              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2.5 py-1 text-xs font-bold rounded-md"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}22` : "#ccfbf1",
                        color: tag.color ? tag.color : "#0d9488",
                        border: `1px solid ${tag.color ? tag.color : "#0d9488"}`,
                      }}
                    >
                      <span style={{ filter: "brightness(0.45) saturate(1.8)" }}>
                        {tag.name}
                      </span>
                    </span>
                  ))}
                </div>
              )}

              {/* Author + Like */}
              <div className="flex items-center justify-between flex-wrap gap-3 mt-5">
                <div className="flex items-center gap-2.5 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                    {post.user.avatar_url ? (
                      <img
                        src={post.user.avatar_url}
                        alt={post.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (post.user.username?.[0] ?? "?").toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {post.user.username}
                    </div>
                    <div className="text-xs text-gray-400">
                      {timeAgo(post.created_at)}
                    </div>
                  </div>
                </div>

                <PostLike postId={post.id} initialLiked={post.is_liked} initialCount={post.likes_count} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="mt-4 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
        Kategori: <strong className="text-gray-800">{post.category.name}</strong>
      </div>

      {/* Comment Section */}
      <div className="mt-6">
        <CommentSection
          postId={post.id}
          postOwnerId={post.user.id}
          acceptedAnswerId={post.accepted_answer_id}
          postStatus={post.status}
        />
      </div>
    </div>
  );
}
