import { Link } from "react-router-dom";
import { type TagDetail, type TagDetailPost } from "../../../../api/tags";

type TagDetailViewProps = {
  tag: TagDetail;
  onBack: () => void;
};

export function DetailSkeleton() {
  const bar = (w: string, h: number, mb = 0) => (
    <div
      style={{
        width: w,
        height: h,
        background: "#e3e6e8",
        borderRadius: 4,
        marginBottom: mb,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      {bar("30%", 32, 12)}
      {bar("60%", 16, 24)}
      {bar("100%", 60, 24)}
      {bar("100%", 48, 8)}
      {bar("100%", 48, 8)}
      {bar("100%", 48, 8)}
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
    </div>
  );
}

function PostCard({ post }: { post: TagDetailPost }) {
  return (
    <Link
      to={`/posts/${post.id}`}
      style={{
        display: "block",
        padding: "16px 20px",
        borderBottom: "1px solid #e3e6e8",
        textDecoration: "none",
        color: "inherit",
        transition: "background .15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            minWidth: 56,
            fontSize: 12,
            color: "#6a737c",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, color: "#3b4045" }}>
            {post.vote_score}
          </div>
          <div>votes</div>
          <div
            style={{
              marginTop: 4,
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              background: post.is_answered ? "#2ea043" : "#e3e6e8",
              color: post.is_answered ? "#fff" : "#6a737c",
            }}
          >
            {post.is_answered ? "✓ Answered" : "Open"}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#0969da",
              margin: "0 0 6px",
              lineHeight: 1.4,
            }}
          >
            {post.title}
          </h3>
          <p
            style={{
              fontSize: 12,
              color: "#57606a",
              margin: 0,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.5,
            }}
          >
            {post.body.replace(/<[^>]*>/g, "").slice(0, 200)}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
              fontSize: 11,
              color: "#6a737c",
            }}
          >
            <span>
              by{" "}
              <strong style={{ color: "#3b4045" }}>{post.user.username}</strong>
            </span>
            {post.category && (
              <span
                style={{
                  padding: "1px 6px",
                  background: "#f0f0f0",
                  borderRadius: 3,
                  fontSize: 10,
                }}
              >
                {post.category.name}
              </span>
            )}
            <span>{new Date(post.created_at).toLocaleDateString("id-ID")}</span>
            <span>{post.view_count} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TagDetailView({ tag, onBack }: TagDetailViewProps) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#6a737c",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 16,
          padding: 0,
        }}
      >
        ← Kembali ke Tags
      </button>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e3e6e8",
          borderRadius: 8,
          padding: "24px",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              background: tag.color ?? "#e1ecf4",
              color: tag.color ? "#fff" : "#39739d",
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {tag.name}
          </span>
          <span style={{ fontSize: 13, color: "#6a737c" }}>
            {(tag.usage_count ?? tag.posts_count ?? 0).toLocaleString()}{" "}
            pertanyaan
          </span>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e3e6e8",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid #e3e6e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            Pertanyaan dengan tag "{tag.name}"
          </h2>
          <span style={{ fontSize: 12, color: "#6a737c" }}>
            {tag.posts.length} terbaru
          </span>
        </div>

        {tag.posts.length === 0 ? (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              color: "#6a737c",
              fontSize: 14,
            }}
          >
            Belum ada pertanyaan dengan tag ini.
          </div>
        ) : (
          tag.posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
