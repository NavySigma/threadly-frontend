import { useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";
import type { Tag, TagsParams } from "../../../api/tags";
import { getTagColor } from "../../../lib/tagColor";


type TagsViewProps = {
  tags: Tag[];
  currentPage: number;
  lastPage: number;
  total: number;
  isLoading: boolean;
  error: unknown;
  search: string;
  sort: TagsParams["sort"];
  onSearch: (value: string) => void;
  onSort: (sort: TagsParams["sort"]) => void;
  onPage: (page: number) => void;
};

function TagCard({ tag }: { tag: Tag }) {
  const navigate = useNavigate();
  const color = getTagColor(tag as any);

  return (
    <div
      style={{
        border: "1px solid #e3e6e8",
        borderRadius: 6,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: "#fff",
        transition: "box-shadow .15s",
        cursor: "default",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.1)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div>
        <button
          onClick={() => navigate(`/tags/${tag.id}`)}
          style={{
            background: color,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "4px 10px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {tag.name}
        </button>
      </div>

      <div style={{ fontSize: 12, color: "#6a737c" }}>
        <strong style={{ color: "#3b4045" }}>
          {(tag.usage_count ?? tag.posts_count ?? 0).toLocaleString()}
        </strong>{" "}
        pertanyaan
      </div>
    </div>
  );
}

function TagSkeleton() {
  const box = (w: string, h: number, mb = 0) => (
    <div
      style={{
        width: w,
        height: h,
        background: "#e3e6e8",
        borderRadius: 4,
        marginBottom: mb,
      }}
    />
  );

  return (
    <div
      style={{
        border: "1px solid #e3e6e8",
        borderRadius: 6,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: 0.55,
      }}
    >
      {box("35%", 24, 4)}
      {box("100%", 12)}
      {box("80%", 12)}
      {box("60%", 12, 8)}
      {box("40%", 12)}
    </div>
  );
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

  const pages = Array.from({ length: last }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === last || Math.abs(p - current) <= 2,
  );

  const btnStyle = (active: boolean): CSSProperties => ({
  padding: "5px 10px",
  border: active ? "1px solid #14b8a6" : "1px solid #99f6e4",
  borderRadius: 4,
  background: active ? "#14b8a6" : "#ffffff",
  color: active ? "#ffffff" : "#0f766e",
  cursor: active ? "default" : "pointer",
  fontWeight: active ? 700 : 400,
  fontSize: 13,
});

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 4,
        marginTop: 32,
        flexWrap: "wrap",
      }}
    >
      <button
        style={btnStyle(false)}
        disabled={current === 1}
        onClick={() => onPage(current - 1)}
      >
        ← Prev
      </button>

      {pages.map((p, idx, arr) => {
        const gap = idx > 0 && arr[idx - 1] !== p - 1;
        return (
          <span
            key={p}
            style={{ display: "inline-flex", gap: 4, alignItems: "center" }}
          >
            {gap && (
              <span style={{ padding: "5px 4px", color: "#6a737c" }}>…</span>
            )}
            <button
              style={btnStyle(p === current)}
              onClick={() => p !== current && onPage(p)}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        style={btnStyle(false)}
        disabled={current === last}
        onClick={() => onPage(current + 1)}
      >
        Next →
      </button>
    </div>
  );
}

export default function TagsView({
  tags,
  currentPage,
  lastPage,
  total,
  isLoading,
  error,
  search,
  sort,
  onSearch,
  onSort,
  onPage,
}: TagsViewProps) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Tags</h1>
      <p
        style={{
          fontSize: 14,
          color: "#3b4045",
          marginBottom: 20,
          lineHeight: 1.6,
        }}
      >
        Tag adalah kata kunci atau label yang mengkategorikan pertanyaan Anda
        dengan pertanyaan serupa. Menggunakan tag yang tepat membuat pertanyaan
        lebih mudah ditemukan.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6a737c",
              fontSize: 14,
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Filter by tag name"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            style={{
              paddingLeft: 34,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              border: "1px solid #9fa6ad",
              borderRadius: 4,
              fontSize: 13,
              width: 220,
              outline: "none",
              transition: "border-color .15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
            onBlur={(e) => (e.target.style.borderColor = "#9fa6ad")}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 0,
            border: "1px solid #d1d5db",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {(["popular", "name", "new"] as TagsParams["sort"][]).map((s) => (
            <button
              key={s}
              onClick={() => onSort(s)}
              style={{
                padding: "6px 14px",
                border: "none",
                borderRight: s !== "new" ? "1px solid #d1d5db" : "none",
                background: sort === s ? "#e9ecef" : "#fff",
                fontWeight: sort === s ? 700 : 400,
                fontSize: 13,
                cursor: "pointer",
                color: "#3b4045",
              }}
            >
              {s === "popular" ? "Popular" : s === "name" ? "Name" : "New"}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div
          style={{
            padding: 24,
            border: "1px solid #f5c6cb",
            borderRadius: 6,
            background: "#f8d7da",
            color: "#842029",
          }}
        >
          Terjadi kesalahan saat memuat tag. Silakan coba lagi.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            }}
          >
            {isLoading
              ? Array.from({ length: 8 }, (_, idx) => <TagSkeleton key={idx} />)
              : tags.map((tag) => <TagCard key={tag.id} tag={tag} />)}
          </div>

          {!isLoading && tags.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#6a737c" }}>
              Tidak ada tag yang sesuai dengan filter Anda.
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <div style={{ fontSize: 13, color: "#6a737c" }}>
              Menampilkan {tags.length} dari {total.toLocaleString()} tag
            </div>
            <Pagination current={currentPage} last={lastPage} onPage={onPage} />
          </div>
        </>
      )}
    </div>
  );
}
