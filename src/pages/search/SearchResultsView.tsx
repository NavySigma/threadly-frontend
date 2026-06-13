import {
  SearchPostCard,
  SearchTagCard,
  SearchUserCard,
} from "../../components/search/SearchResultCards";
import type { SearchResultsLogicReturn } from "./SearchResultsLogic";

export interface SearchResultsViewProps extends SearchResultsLogicReturn {}

export function SearchResultsView({
  rawQuery,
  cleanQuery,
  searchType,
  results,
  isLoading,
  error,
  hasResults,
  showPosts,
  showTags,
  showUsers,
}: SearchResultsViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search Results
        </h1>
        {cleanQuery && (
          <p className="text-gray-600 dark:text-gray-400">
            {searchType === "all" ? "All results" : searchType} for{" "}
            <strong>"{cleanQuery}"</strong>
            {searchType !== "all" && ` (${searchType})`}
          </p>
        )}
        {rawQuery && !cleanQuery && (
          <p className="text-xs text-gray-400">Raw query: {rawQuery}</p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
          <p className="font-semibold">Search Error</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !cleanQuery && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Masukkan kata kunci untuk mencari...</p>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && cleanQuery && !hasResults && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Tidak ada hasil yang ditemukan untuk "{cleanQuery}"</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && hasResults && (
        <div className="space-y-8">
          {/* Posts Section */}
          {showPosts && results.posts.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Posts ({results.posts.length})
              </h2>
              <div className="grid gap-3">
                {results.posts.map((post) => (
                  <SearchPostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* Tags Section */}
          {showTags && results.tags.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Tags ({results.tags.length})
              </h2>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                {results.tags.map((tag) => (
                  <SearchTagCard key={tag.id} tag={tag} />
                ))}
              </div>
            </section>
          )}

          {/* Users Section */}
          {showUsers && results.users.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Users ({results.users.length})
              </h2>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                {results.users.map((user) => (
                  <SearchUserCard key={user.id} user={user} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
