import React from "react";
import { useCategories } from "../../hooks";
import { Link } from "react-router-dom";

const CategoriesPage: React.FC = () => {
  const { categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Categories</h1>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-2xl font-bold mb-4">Categories</h1>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>
      
      <p className="text-gray-600 mb-8">
        Browse through different categories to find questions that interest you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <h2 className="text-xl font-semibold mb-2">
              <Link to={`/posts?category_id=${category.id}`} className="text-blue-600 hover:underline">
                {category.name}
              </Link>
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              {category.description || "No description available."}
            </p>
            {category.children && category.children.length > 0 && (
              <div className="mt-2">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Subcategories</h3>
                <div className="flex flex-wrap gap-2">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/posts?category_id=${child.id}`}
                      className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No categories found.
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
