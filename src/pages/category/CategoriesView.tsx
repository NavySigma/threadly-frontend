import type { Category, PaginationMeta } from "../types/category.types";
import type { Post } from "../../types/post.type"; // sesuaikan path ke type Post asli
import {
  SearchBar,
  CategoryCard,
  CategoryCardSkeleton,
  EmptyCategories,
  ErrorState,
  Pagination,
} from "../ui/category.ui";

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface ToolbarProps {
  total:      number;
  search:     string;
  onSearch:   (v: string) => void;
  isFetching: boolean;
  isLoading:  boolean;
}

function Toolbar({ total, search, onSearch, isFetching, isLoading }: ToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        {isLoading ? (
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ) : (
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {total.toLocaleString()} categor{total !== 1 ? "ies" : "y"}
          </h2>
        )}
        {isFetching && !isLoading && (
          <span className="text-xs text-gray-400">Refreshing…</span>
        )}
      </div>

      <div className="sm:w-64">
        <SearchBar value={search} onChange={onSearch} />
      </div>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

interface GridProps {
  categories: Category[];
  isLoading:  boolean;
  isError:    boolean;
  error:      string | null;
  search:     string;
}

function Grid({ categories, isLoading, isError, error, search }: GridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading ? (
        Array.from({ length: 12 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))
      ) : isError ? (
        <ErrorState message={error ?? "Failed to load categories."} />
      ) : categories.length === 0 ? (
        <EmptyCategories search={search} />
      ) : (
        categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))
      )}
    </div>
  );
}

// ─── CategoriesView ───────────────────────────────────────────────────────────

export interface CategoriesViewProps {
  categories:  Category[];
  meta:        PaginationMeta;
  isLoading:   boolean;
  isFetching:  boolean;
  isError:     boolean;
  error:       string | null;
  search:      string;
  onSearch:    (v: string) => void;
  onPageChange:(p: number) => void;
}

export function CategoriesView({
  categories,
  meta,
  isLoading,
  isFetching,
  isError,
  error,
  search,
  onSearch,
  onPageChange,
}: CategoriesViewProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
          Categories
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Browse all topics and find questions that interest you.
        </p>
      </div>

      {/* Toolbar */}
      <Toolbar
        total={meta.total}
        search={search}
        onSearch={onSearch}
        isFetching={isFetching}
        isLoading={isLoading}
      />

      {/* Grid */}
      <Grid
        categories={categories}
        isLoading={isLoading}
        isError={isError}
        error={error}
        search={search}
      />

      {/* Pagination */}
      {!isLoading && !isError && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </main>
  );
}