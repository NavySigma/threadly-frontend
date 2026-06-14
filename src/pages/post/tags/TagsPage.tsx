import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { useTags } from "../../../hooks/useTags";
import { type Tag, updateTag, deleteTag } from "../../../api/tags";
import TagsView from "./TagsView";
import TagFormModal, {
  type TagPayload,
} from "../../../components/tags/TagFormModal";
import ConfirmDeleteModal from "../../../components/tags/ConfirmDeleteModal";

export default function TagsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((role) => role.name === "admin") ?? false;
  const queryClient = useQueryClient();

  const {
    tags,
    currentPage,
    lastPage,
    total,
    isLoading,
    error,
    search,
    setSearch,
    sort,
    setSort,
    goToPage,
  } = useTags();

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function openEditForm(tag: Tag) {
    setEditingTag(tag);
    setFormOpen(true);
  }

  function closeForm() {
    setEditingTag(null);
    setFormOpen(false);
  }

  async function handleFormSubmit(payload: TagPayload) {
    if (!editingTag) return;
    await updateTag(editingTag.id, payload);
    await queryClient.invalidateQueries(["tags", { search, sort }]);
    closeForm();
  }

  async function handleDeleteConfirm() {
    if (!deletingTag) return;
    await deleteTag(deletingTag.id);
    setDeletingTag(null);
    await queryClient.invalidateQueries(["tags", { search, sort }]);
  }

  return (
    <>
      <TagsView
        tags={tags}
        currentPage={currentPage}
        lastPage={lastPage}
        total={total}
        isLoading={isLoading}
        error={error}
        search={search}
        sort={sort}
        onSearch={setSearch}
        onSort={setSort}
        onPage={goToPage}
        isAdmin={isAdmin}
        onEdit={openEditForm}
        onDelete={setDeletingTag}
      />

      <TagFormModal
        open={formOpen}
        initialData={editingTag}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDeleteModal
        tag={deletingTag}
        onClose={() => setDeletingTag(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
