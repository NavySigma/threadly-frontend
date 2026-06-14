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
  showDelete: boolean;
  onClick: () => void;
  onUpdated: () => void;
  onDeleted: (postId: string) => void;
}

function QuestionsTabItem({
  post,
  showDelete,
  onClick,
  onUpdated,
  onDeleted,
}: QuestionsTabItemProps) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        cursor: "pointer",
        transition: "all 0.15s",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#f0fdfa";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff";
      }}
    >
      <div style={{ display: "flex", gap: 20, flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
            minWidth: 70,
            color: "#6b7280",
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          <div>
            <span style={{ fontWeight: 600, color: "#374151" }}>
              {post.vote_score}
            </span>{" "}
            votes
          </div>
          <div>
            <span
              style={{
                fontWeight: 600,
                color: post.is_answered ? "#16a34a" : "#374151",
              }}
            >
              {post.is_answered ? "✓" : "0"}
            </span>{" "}
            answers
          </div>
          <div style={{ color: "#9ca3af" }}>{post.view_count} views</div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#0d9488",
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: 0,
            }}
          >
            {post.status?.toLowerCase() !== "open" && (
              <span
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  background: "#f3f4f6",
                  color: "#6b7280",
                  border: "1px solid #e5e7eb",
                }}
              >
                Private
              </span>
            )}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {post.title}
            </span>
          </h3>

          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              lineHeight: 1.5,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.body}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  style={{
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#fff",
                    background: tag.color ?? "#4a5568",
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "#9ca3af",
              marginTop: 4,
            }}
          >
            <span style={{ fontWeight: 500, color: "#6b7280" }}>
              {post.user?.username ?? "anonymous"}
            </span>
            <span>•</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>

      <div
        style={{ flexShrink: 0, marginLeft: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <PostActionMenu
          postId={post.id}
          postStatus={post.status}
          closedAt={post.closed_at ?? null}
          showDelete={showDelete}
          onUpdated={onUpdated}
          onDeleted={() => onDeleted(post.id)}
        />
      </div>
    </div>
  );
}

interface QuestionsTabViewProps {
  posts: UserPost[];
  isLoading: boolean;
  error: string | null;
  showDelete?: boolean;
  onItemClick: (postId: string) => void;
  onUpdated: () => void;
  onDeleted?: (postId: string) => void;
}

export function QuestionsTabView({
  posts,
  isLoading,
  error,
  showDelete = false,
  onItemClick,
  onUpdated,
  onDeleted,
}: QuestionsTabViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 0",
            gap: 12,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid #e5e7eb",
              borderTopColor: "#0d9488",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
            Memuat pertanyaan...
          </p>
        </div>
      )}

      {!isLoading && error && (
        <div
          style={{
            padding: 16,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            fontSize: 14,
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 0",
            gap: 8,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
          }}
        >
          <Search size={32} color="#d1d5db" />
          <p style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", margin: 0 }}>
            Tidak ada pertanyaan ditemukan
          </p>
        </div>
      )}

      {!isLoading && !error && posts.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {posts.map((post) => (
            <QuestionsTabItem
              key={post.id}
              post={post}
              showDelete={showDelete}
              onClick={() => onItemClick(post.id)}
              onUpdated={onUpdated}
              onDeleted={onDeleted ?? (() => {})}
            />
          ))}
        </div>
      )}
    </div>
  );
}
