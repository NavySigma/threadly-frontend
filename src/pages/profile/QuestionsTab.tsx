import { useNavigate } from "react-router-dom";
import { useMyPosts } from "../../hooks/useMyPosts";
import { PostActionMenu } from "../post/PostActionMenu";
import type { UserPost } from "../../types/userPost.type";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface QuestionsTabProps {
  userId: string;
}

export function QuestionsTab({ userId }: QuestionsTabProps) {
  const { posts, isLoading, error, refetch } = useMyPosts(userId);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Memuat pertanyaan...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2 bg-white border border-gray-200 rounded-xl">
          <p className="text-3xl">🔍</p>
          <p className="text-sm font-semibold text-gray-600">
            Tidak ada pertanyaan ditemukan
          </p>
        </div>
      )}

      {!isLoading && !error && posts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
          {posts.map((post: UserPost) => (
            <div
              key={post.id}
              onClick={() => navigate(`/posts/${post.id}`)}
              className="p-5 flex gap-5 hover:bg-gray-50/50 cursor-pointer transition relative"
            >
              {/* Kiri: Stats (Votes, Answers, Views) */}
              <div className="flex flex-col items-end gap-1.5 text-right min-w-[70px] text-gray-500 text-xs">
                <div>
                  <span className="font-semibold text-gray-700">
                    {post.vote_score}
                  </span>{" "}
                  votes
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    {post.is_answered ? "✓" : "0"}
                  </span>{" "}
                  answers
                </div>
                <div className="text-gray-400">{post.view_count} views</div>
              </div>

              {/* Kanan: Content Details */}
              <div className="flex-1 flex flex-col gap-1 pr-8">
                {/* Title */}
                <h3 className="text-sm font-semibold text-blue-600 hover:text-blue-800 line-clamp-2">
                  {post.title}
                </h3>

                {/* Body Preview */}
                <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                  {post.body}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div
                    className="flex flex-wrap gap-1.5 my-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 rounded text-[11px] font-medium text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: tag.color ?? "#4a5568" }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta User Info */}
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                  <span className="font-medium text-gray-600">
                    {post.user?.username ?? "anonymous"}
                  </span>
                  <span>•</span>
                  <span>{timeAgo(post.created_at)}</span>
                </div>
              </div>

              {/* Action Menu (Edit/Private/Reopen/Delete) */}
              <div
                className="absolute left-4 top-4"
                onClick={(e) => e.stopPropagation()}
              >
                <PostActionMenu
                  postId={post.id}
                  postStatus={post.status}
                  closedAt={post.closed_at}
                  onDeleted={refetch}
                  onUpdated={refetch}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
