import { usePostFilter } from "../../../contexts/PostFilterContext";

export default function PostFilterBar() {
  const {
    filter,
    setSearch,
    setTag,
    resetFilter,
  } = usePostFilter();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari pertanyaan..."
          value={filter.search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <input
          type="text"
          placeholder="Tag ID"
          value={filter.tag_id}
          onChange={(e) => setTag(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          onClick={resetFilter}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filter.search && (
          <span className="px-3 py-1 bg-teal-100 text-teal-600 rounded-full text-xs">
            Search: {filter.search}
          </span>
        )}

        {filter.tag_id && (
          <span className="px-3 py-1 bg-teal-100 text-teal-600 rounded-full text-xs">
            Tag: {filter.tag_id}
          </span>
        )}
      </div>
    </div>
  );
}