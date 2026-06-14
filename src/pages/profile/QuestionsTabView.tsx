import { Search } from "lucide-react";
import { PostActionMenu } from "./PostActionMenu";
import type { UserPost } from "../../types/userPost.type";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface QuestionsTabItemProps {
  post: UserPost;
  onClick: () => void;
  onUpdated: () => void;
}

function QuestionsTabItem({
  post,
  onClick,
  onUpdated,
}: QuestionsTabItemProps) {
  return (
    <div
      onClick={onClick}
      className="p-5 flex justify-between items-start hover:bg-gray-50/50 cursor-pointer transition group first:rounded-t-xl last:rounded-b-xl"
    >
      <div className="flex gap-5 flex-1 min-w-0">
        <div className="flex flex-col items-end gap-1.5 text-right min-w-[70px] text-gray-500 text-xs shrink-0">
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

        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <h3 className="text-sm font-semibold text-blue-600 hover:text-blue-800 line-clamp-2 flex items-center gap-2">
            {post.status === "closed" && (
              <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase">
                Private
              </span>
            )}
            <span>{post.title}</span>
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 mb-1">
            {post.body}
          </p>

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

          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
            <span className="font-medium text-gray-600">
              {post.user?.username ?? "anonymous"}
            </span>
            <span>•</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>

      <div
        className="shrink-0 ml-4"
        onClick={(e) => e.stopPropagation()}
      >
        <PostActionMenu
          postId={post.id}
          postStatus={post.status}
          closedAt={post.closed_at ?? null}
          onUpdated={onUpdated}
        />
      </div>
    </div>
  );
}

interface QuestionsTabViewProps {
  posts: UserPost[];
  isLoading: boolean;
  error: string | null;
  onItemClick: (postId: string) => void;
  onUpdated: () => void;
}

export function QuestionsTabView({
  posts,
  isLoading,
  error,
  onItemClick,
  onUpdated,
}: QuestionsTabViewProps) {
  return (
    <div className="flex flex-col gap-4">
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Memuat pertanyaan...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2 bg-gray-50 border border-gray-200 rounded-xl">
          <Search size={32} className="text-gray-300" />
          <p className="text-sm font-semibold text-gray-600">
            Tidak ada pertanyaan ditemukan
          </p>
        </div>
      )}

      {!isLoading && !error && posts.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl divide-y divide-gray-100">
          {posts.map((post) => (
            <QuestionsTabItem
              key={post.id}
              post={post}
              onClick={() => onItemClick(post.id)}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
