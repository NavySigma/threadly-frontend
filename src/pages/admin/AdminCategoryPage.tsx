import { useState, Component, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi, type Category } from "../../api/category.api";
import { Pencil, Trash2, Plus, X, Check, ChevronRight } from "lucide-react";

// ── Error Boundary ─────────────────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 40px" }}>
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 12, padding: "24px 28px",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#dc2626", margin: "0 0 8px" }}>
              Terjadi kesalahan
            </h2>
            <p style={{ fontSize: 14, color: "#7f1d1d", margin: 0 }}>
              {(this.state.error as Error).message}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Modal Form ─────────────────────────────────────────────────────────
function CategoryForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  isLoading,
  error,
}: {
  initial?: Category;
  categories: Category[];
  onSubmit: (data: { name: string; description: string; parent_id: string | null }) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [parentId, setParentId] = useState<string | null>(initial?.parent_id ?? null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, parent_id: parentId || null });
  };

  // Hindari pilih diri sendiri sebagai parent
  const parentOptions = categories.filter((c) => c.id !== initial?.id);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 28,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 20px" }}>
          {initial ? "Edit Kategori" : "Tambah Kategori"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
              Nama <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nama kategori"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi kategori (opsional)"
              rows={3}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Parent */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
              Parent Kategori
            </label>
            <select
              value={parentId ?? ""}
              onChange={(e) => setParentId(e.target.value || null)}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="">— Tidak ada (root) —</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", border: "1px solid #e5e7eb",
                borderRadius: 8, background: "#fff", fontSize: 14,
                cursor: "pointer", color: "#374151",
              }}
            >
              <X size={14} /> Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", border: "none",
                borderRadius: 8, background: "#0d9488", color: "#fff",
                fontSize: 14, fontWeight: 500,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Check size={14} /> {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Konfirmasi Delete ──────────────────────────────────────────────────
function DeleteConfirm({
  category,
  onConfirm,
  onCancel,
  isLoading,
  error,
}: {
  category: Category;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff", borderRadius: 12, padding: 28,
          width: "100%", maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", color: "#111827" }}>
          Hapus Kategori
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px", lineHeight: 1.6 }}>
          Yakin ingin menghapus kategori <strong style={{ color: "#111827" }}>{category.name}</strong>?
          Sub-kategori akan dipindah ke root.
        </p>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px", border: "1px solid #e5e7eb",
              borderRadius: 8, background: "#fff", fontSize: 14,
              cursor: "pointer", color: "#374151",
            }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: "8px 16px", border: "none",
              borderRadius: 8, background: "#ef4444", color: "#fff",
              fontSize: 14, fontWeight: 500,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Row Kategori ───────────────────────────────────────────────────────
function CategoryRow({
  category,
  isChild,
  onEdit,
  onDelete,
}: {
  category: Category;
  isChild?: boolean;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  return (
    <>
      <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
        <td style={{ padding: "14px 16px", fontSize: 14, color: "#111827" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isChild && (
              <ChevronRight size={14} style={{ color: "#9ca3af", flexShrink: 0 }} />
            )}
            <span style={{ fontWeight: isChild ? 400 : 500 }}>{category.name}</span>
          </div>
        </td>
        <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280" }}>
          {category.slug}
        </td>
        <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280", maxWidth: 240 }}>
          <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {category.description ?? "—"}
          </span>
        </td>
        <td style={{ padding: "14px 16px" }}>
          {isChild ? (
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Sub-kategori</span>
          ) : (
            <span style={{
              fontSize: 12, fontWeight: 500,
              background: "#f0fdfa", color: "#0d9488",
              padding: "2px 8px", borderRadius: 99,
            }}>
              Root
            </span>
          )}
        </td>
        <td style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => onEdit(category)}
              title="Edit"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 8,
                border: "1px solid #e5e7eb", background: "#fff",
                cursor: "pointer", color: "#6b7280",
              }}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(category)}
              title="Hapus"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 8,
                border: "1px solid #fecaca", background: "#fff",
                cursor: "pointer", color: "#ef4444",
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      {/* Render children */}
      {category.children?.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          isChild
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
function AdminCategoryPageContent() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  });

  // Flatten untuk dropdown parent
  const flatCategories = categories.flatMap((c) => [c, ...(c.children ?? [])]);

  const createMutation = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowForm(false);
      setMutationError(null);
    },
    onError: (err: { message: string }) => setMutationError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof categoryApi.update>[1] }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditTarget(null);
      setMutationError(null);
    },
    onError: (err: { message: string }) => setMutationError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteTarget(null);
      setMutationError(null);
    },
    onError: (err: { message: string }) => setMutationError(err.message),
  });

  const handleEdit = (category: Category) => {
    setMutationError(null);
    setEditTarget(category);
  };

  const handleDelete = (category: Category) => {
    setMutationError(null);
    setDeleteTarget(category);
  };

  const handleOpenCreate = () => {
    setMutationError(null);
    setShowForm(true);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 40px", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px", color: "#111827" }}>
            Manajemen Kategori
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Kelola kategori dan sub-kategori konten
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", border: "none",
            borderRadius: 8, background: "#0d9488", color: "#fff",
            fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}
        >
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Nama", "Slug", "Deskripsi", "Tipe", "Aksi"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px", textAlign: "left",
                    fontSize: 12, fontWeight: 600,
                    color: "#6b7280", textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: "48px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#0d9488", animation: "spin 0.8s linear infinite" }} />
                    Memuat kategori...
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "48px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                  Belum ada kategori.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      {categories.length > 0 && (
        <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 12, textAlign: "right" }}>
          Total: {flatCategories.length} kategori
        </p>
      )}

      {/* Modal Create */}
      {showForm && (
        <CategoryForm
          categories={flatCategories}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => { setShowForm(false); setMutationError(null); }}
          isLoading={createMutation.isPending}
          error={mutationError}
        />
      )}

      {/* Modal Edit */}
      {editTarget && (
        <CategoryForm
          initial={editTarget}
          categories={flatCategories}
          onSubmit={(data) => updateMutation.mutate({ id: editTarget.id, data })}
          onCancel={() => { setEditTarget(null); setMutationError(null); }}
          isLoading={updateMutation.isPending}
          error={mutationError}
        />
      )}

      {/* Modal Delete */}
      {deleteTarget && (
        <DeleteConfirm
          category={deleteTarget}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => { setDeleteTarget(null); setMutationError(null); }}
          isLoading={deleteMutation.isPending}
          error={mutationError}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AdminCategoryPage() {
  return (
    <ErrorBoundary>
      <AdminCategoryPageContent />
    </ErrorBoundary>
  );
}