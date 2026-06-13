import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTag, type TagDetail } from "../../../api/tags";
import TagDetailView, { DetailSkeleton } from "./tagDetailView";

export default function TagDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: tag,
    isLoading,
    error,
  } = useQuery<TagDetail>({
    queryKey: ["tag-detail", id],
    queryFn: () => fetchTag(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <DetailSkeleton />;

  if (error || !tag) {
    return (
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "32px 16px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏷️</div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 8,
            color: "#c0392b",
          }}
        >
          Tag tidak ditemukan
        </h2>
        <p style={{ color: "#6a737c", marginBottom: 20, fontSize: 14 }}>
          {(error as Error)?.message ?? "Tag yang Anda cari tidak tersedia."}
        </p>
        <button
          onClick={() => navigate("/tags")}
          style={{
            padding: "8px 20px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Kembali ke Tags
        </button>
      </div>
    );
  }

  return <TagDetailView tag={tag} onBack={() => navigate("/tags")} />;
}
