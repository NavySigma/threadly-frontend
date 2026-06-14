import { type ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { usePostFilter } from "../../contexts/PostFilterContext";
import { fetchTags } from "../../api/tags";
import { categoryApi } from "../../api/category.api";
import type { SortOption, AnswerFilter } from "../../types";

const SORT_OPTIONS = [
  { value: "latest"       as SortOption, label: "Terbaru" },
  { value: "oldest"       as SortOption, label: "Terlama" },
  { value: "highest_vote" as SortOption, label: "Vote Tertinggi" },
  { value: "most_viewed"  as SortOption, label: "Paling Banyak Dilihat" },
];

const ANSWER_OPTIONS = [
  { value: "all"        as AnswerFilter, label: "Semua" },
  { value: "answered"   as AnswerFilter, label: "Sudah Dijawab" },
  { value: "unanswered" as AnswerFilter, label: "Belum Dijawab" },
];

export function PostFilterBar() {
  const { filter, setSearch, setTag, setCategory, setSort, setAnswer, resetFilter, hasActiveFilter } = usePostFilter();

  const { data: tagsData, isLoading: loadingTags } = useQuery({
    queryKey: ["filter-tags"],
    queryFn: () => fetchTags({ sort: "name", per_page: 100 }),
    staleTime: 1000 * 60 * 5,
  });
  const tags = tagsData?.data ?? [];

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["filter-categories"],
    queryFn: () => categoryApi.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-xl p-4">

      {/* Search */}
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Cari pertanyaan..."
          value={filter.search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:bg-white transition"
        />
        {filter.search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
          ><X size={14} className="text-gray-400" /></button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-end">
        {/* Category */}
        <div className="flex flex-col gap-1 min-w-40 flex-1">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Kategori
          </label>
          <select
            value={filter.category_id}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loadingCategories}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 cursor-pointer disabled:opacity-50"
          >
            <option value="">Semua Kategori</option>
            {(categories ?? []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag */}
        <div className="flex flex-col gap-1 min-w-40 flex-1">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Tag
          </label>
          <select
            value={filter.tag_id}
            onChange={(e) => setTag(e.target.value)}
            disabled={loadingTags}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 cursor-pointer disabled:opacity-50"
          >
            <option value="">Semua Tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-1 min-w-40 flex-1">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Urutkan
          </label>
          <select
            value={filter.sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Answer */}
        <div className="flex flex-col gap-1 min-w-40 flex-1">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Status Jawaban
          </label>
          <select
            value={filter.answer}
            onChange={(e) => setAnswer(e.target.value as AnswerFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 cursor-pointer"
          >
            {ANSWER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilter && (
          <button
            onClick={resetFilter}
            className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-400 hover:text-teal-500 transition self-end"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Active badges */}
      {hasActiveFilter && (
        <div className="flex flex-wrap gap-1.5">
          {filter.search && (
            <Badge label={`"${filter.search}"`} onRemove={() => setSearch("")} />
          )}
          {filter.category_id && (
            <Badge
              label={categories?.find((c) => c.id === filter.category_id)?.name ?? "Kategori"}
              onRemove={() => setCategory("")}
            />
          )}
          {filter.tag_id && (
            <Badge
              label={tags.find((t) => t.id === filter.tag_id)?.name ?? "Tag"}
              onRemove={() => setTag("")}
            />
          )}
          {filter.sort !== "latest" && (
            <Badge
              label={SORT_OPTIONS.find((s) => s.value === filter.sort)?.label ?? ""}
              onRemove={() => setSort("latest")}
            />
          )}
          {filter.answer !== "all" && (
            <Badge
              label={ANSWER_OPTIONS.find((a) => a.value === filter.answer)?.label ?? ""}
              onRemove={() => setAnswer("all")}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-xs font-medium">
      {label}
      <button onClick={onRemove} className="text-teal-400 hover:text-teal-700">
        <X size={12} className="text-teal-400" />
      </button>
    </span>
  );
}