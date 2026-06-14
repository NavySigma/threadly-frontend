import { useNavigate } from "react-router-dom";
import { getTagColor } from "../../lib/tagColor";
import type { SearchPost, SearchTag, SearchUser } from "../../types/search";

export interface SearchPostCardProps {
  post: SearchPost;
}

export function SearchPostCard({ post }: SearchPostCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
      onClick={() => navigate(`/posts/${post.id}`)}
    >
      <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 line-clamp-2">
        {post.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
        {post.body}
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        {post.tags && post.tags.length > 0 && (
          <>
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 text-xs font-medium text-white rounded"
                style={{ backgroundColor: getTagColor(tag as any) }}
              >
                {tag.name}
              </span>
            ))}
          </>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        By {post.user.username} • {post.view_count} views • {post.vote_score}{" "}
        votes
      </p>
    </div>
  );
}

export interface SearchTagCardProps {
  tag: SearchTag;
}

export function SearchTagCard({ tag }: SearchTagCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
      onClick={() => navigate(`/tags/${tag.id}`)}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-4 h-4 rounded"
          style={{ backgroundColor: getTagColor(tag as any) }}
        ></span>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {tag.name}
        </h3>
      </div>
      {tag.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {tag.description}
        </p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {tag.usage_count ?? 0} posts
      </p>
    </div>
  );
}

export interface SearchUserCardProps {
  user: SearchUser;
}

export function SearchUserCard({ user }: SearchUserCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
      onClick={() => navigate(`/users/${user.id}`)}
    >
      <div className="flex items-center gap-2 mb-2">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-bold">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {user.username}
        </h3>
      </div>
      {user.bio && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {user.bio}
        </p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {user.posts_count ?? 0} posts
      </p>
    </div>
  );
}
