import { usePostFilter } from "../../contexts/PostFilterContext";

export function PostFilterBar() {
  const {
    filter,
    setCategory,
    resetFilter,
    hasActiveFilter,
  } = usePostFilter();

  const categories = [
    {
      id: "",
      name: "All",
    },
    {
      id: "frontend",
      name: "Frontend",
    },
    {
      id: "backend",
      name: "Backend",
    },
    {
      id: "react",
      name: "React",
    },
    {
      id: "laravel",
      name: "Laravel",
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Filter Questions
        </h2>

        {hasActiveFilter && (
          <button
            onClick={resetFilter}
            className="rounded-lg border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setCategory(category.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter.category_id === category.id
                ? "bg-orange-500 text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-orange-50"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}