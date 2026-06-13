import type { Post } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import { PostActionMenu } from "../post/PostActionMenu";

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: 8,
        padding: "32px 20px",
        textAlign: "center",
        color: "#9ca3af",
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
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
    <div className="post-item relative">
      <div
        style={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <PostActionMenu postId={post.id} postStatus={post.status} />
      </div>
      <div className="post-votes">
        <span className="vote-count">{post.vote_score}</span>
        <span className="vote-label">votes</span>
        <span className={`vote-count${post.is_answered ? " green" : ""}`}>
          {post.is_answered ? "✓" : "0"}
        </span>
        <span className="vote-label">answers</span>
        <span>{post.view_count}</span>
        <span className="vote-label">views</span>
      </div>

      <div className="post-body">
        <div className="post-title">
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </div>

        <div className="post-excerpt">
          {post.body.length > 180 ? post.body.slice(0, 180) + "..." : post.body}
        </div>

        <div className="post-tags">
          {post.tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() =>
                navigate(`/posts?tag=${encodeURIComponent(tag.name)}`)
              }
              className="tag"
              style={{
                backgroundColor: tag.color ?? undefined,
                cursor: "pointer",
                border: "none",
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>

        <div className="post-meta">
          <div className="post-author">
            <div className="post-author-avatar">
              {post.user?.avatar_url ? (
                <img
                  src={post.user.avatar_url}
                  alt={post.user.username}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                (post.user?.username ?? "?")[0].toUpperCase()
              )}
            </div>
            <Link to={`/users/${post.user?.id}`}>{post.user?.username}</Link>
            <span className="post-date">{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuestionsTabProps {
  posts: Post[];
  loadingPosts: boolean;
  postsError: string | null;
}

export function QuestionsTab({
  posts,
  loadingPosts,
  postsError,
}: QuestionsTabProps) {
  return (
    <div>
      <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>
        Questions
      </p>
      {loadingPosts ? (
        <div style={{ color: "#6b7280", fontSize: 14 }}>
          Memuat postingan...
        </div>
      ) : postsError ? (
        <div style={{ color: "#ef4444", fontSize: 14 }}>{postsError}</div>
      ) : posts.length === 0 ? (
        <EmptyState message="Belum ada pertanyaan." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
