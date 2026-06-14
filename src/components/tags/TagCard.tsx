import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tag } from "../../types/posts";
import { getTagColor } from "../../lib/tagColor";

interface TagCardProps {
  tag: Tag;
  isAdmin: boolean;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export default function TagCard({ tag, isAdmin, onEdit, onDelete }: TagCardProps) {
  const color = getTagColor(tag);

  return (
    <div className="relative flex flex-col justify-between rounded-xl border border-teal-100 p-4 transition-colors hover:border-teal-200">
      {isAdmin && (
        <div className="absolute right-3 top-3 flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(tag)}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
            title="Edit tag"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(tag)}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
            title="Hapus tag"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}

      <span
        className="mb-3 inline-block w-fit rounded-md border px-3 py-1 text-sm font-semibold"
        style={{
          color,
          backgroundColor: `${color}1A`,
          borderColor: `${color}40`,
        }}
      >
        {tag.name}
      </span>

      <p className="mb-4 text-sm text-gray-500">
        {tag.usage_count ?? 0} pertanyaan
      </p>

      <Link
        to={`/tags/${tag.slug}`}
        className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
      >
        Lihat selengkapnya »
      </Link>
    </div>
  );
}