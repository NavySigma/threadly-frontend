import { useNavigate } from "react-router-dom";
import { useUserTags } from "../../hooks/useUserTags";
import { getTagColor } from "../../lib/tagColor";

interface TagsTabProps {
  userId: string;
}

function Pagination({
  current,
  last,
  onPage,
}: {
  current: number;
  last: number;
  onPage: (p: number) => void;
}) {
  if (last <= 1) return null;

  return (
    <div style={{ display: "flex", gap: 4, marginTop: 20, justifyContent: "center" }}>
      <button
        onClick={() => onPage(current - 1)}
        disabled={current === 1}
        style={{
          padding: "4px 10px",
          border: "1px solid #e5e7eb",
          borderRadius: 4,
          background: "#fff",
          cursor: current === 1 ? "not-allowed" : "pointer",
          fontSize: 13,
        }}
      >
        Prev
      </button>
      {Array.from({ length: last }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          style={{
            padding: "4px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: 4,
            background: p === current ? "#4f46e5" : "#fff",
            color: p === current ? "#fff" : "#374151",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(current + 1)}
        disabled={current === last}
        style={{
          padding: "4px 10px",
          border: "1px solid #e5e7eb",
          borderRadius: 4,
          background: "#fff",
          cursor: current === last ? "not-allowed" : "pointer",
          fontSize: 13,
        }}
      >
        Next
      </button>
    </div>
  );
}

export function TagsTab({ userId }: TagsTabProps) {
  const { tags, total, currentPage, lastPage, isLoading, error, goToPage } = useUserTags(userId);
  const navigate = useNavigate();

  if (isLoading) return <div style={{ fontSize: 14, color: "#6b7280" }}>Memuat tag...</div>;
  if (error) return <div style={{ fontSize: 14, color: "#dc2626" }}>{error}</div>;

  if (tags.length === 0) {
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
        Belum menggunakan tag apapun.
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Tags ({total})</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        {tags.map((tag) => {
          const color = getTagColor(tag);
          return (
            <div
              key={tag.id}
              onClick={() => navigate(`/tags/${tag.id}`)}
              style={{
                padding: "12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.15s",
                background: "#fff",
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: color,
                  color: "#fff",
                  marginBottom: 4,
                }}
              >
                {tag.name}
              </span>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {tag.count} kali digunakan
              </div>
            </div>
          );
        })}
      </div>
      <Pagination current={currentPage} last={lastPage} onPage={goToPage} />
    </div>
  );
}
