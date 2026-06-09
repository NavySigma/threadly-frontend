import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { usePosts } from "../hooks/usePosts";
import type { Post } from "../api/posts";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function PostCard({ post }: { post: Post }) {
  return (
    <div className="post-item">
      <div className="post-votes">
        <span className="vote-count">{post.vote_score}</span>
        <span className="vote-label">votes</span>
        <span className={`vote-count${post.is_answered ? " green" : ""}`}>
          {/* jumlah answer tidak ada di tipe Post, tampilkan status answered */}
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
            <span
              key={tag.id}
              className="tag"
              style={{ backgroundColor: tag.color ?? undefined }}
            >
              {tag.name}
            </span>
          ))}
        </div>
        <div className="post-meta">
          <div className="post-author">
            <div className="post-author-avatar">
              {post.user.avatar_url ? (
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
                post.user.username[0].toUpperCase()
              )}
            </div>
            <Link to={`/users/${post.user.id}`}>{post.user.username}</Link>
            <span className="post-date">{timeAgo(post.created_at)}</span>
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
  } = usePosts();

  return (
    <div>
      {/* Header */}
      <div className="home-header">
        <h1>All Questions</h1>
        {user ? (
          <Link to="/posts/create" className="btn btn-orange">
            Ask Question
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Log in to Ask
          </Link>
        )}
      </div>

      {/* Stats + filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span className="post-stats">
          {isLoading ? "Loading..." : `${total.toLocaleString()} questions`}
        </span>
        <div className="filter-bar">
          {(["newest", "votes", "unanswered"] as const).map((s) => (
            <button
              key={s}
              className={`filter-btn${sortBy === s ? " active" : ""}`}
              onClick={() => setSortBy(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
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

      {/* Posts list */}
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
      ) : posts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "#6a737c",
            fontSize: 14,
          }}
        >
          Belum ada postingan. Jadilah yang pertama bertanya!
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}

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
          >
            ← Prev
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
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
