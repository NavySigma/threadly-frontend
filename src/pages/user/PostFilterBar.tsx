import { usePostFilter } from "../../contexts/PostFilterContext";

export default function PostFilterBar() {
  const {
    filter,
    setSearch,
    setCategory,
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
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="text"
          placeholder="Category ID"
          value={filter.category_id}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <button
          onClick={resetFilter}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filter.search && (
          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs">
            Search: {filter.search}
          </span>
        )}

        {filter.category_id && (
          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs">
            Category: {filter.category_id}
          </span>
        )}
      </div>
    </div>
  );
}