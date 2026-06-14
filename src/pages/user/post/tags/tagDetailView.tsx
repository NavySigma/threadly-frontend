import { Link } from "react-router-dom";
import type {
  Tag,
  Post,
  SortOption,
  PaginationMeta,
} from "../../../../types/tagDetail.types";
import { EmptyPosts, ErrorState, formatCount, Pagination, PostCard, PostCardSkeleton, SortTabs, TagHeaderSkeleton, TagPill } from "./tagDetailPage";


// ─── TagHeader ────────────────────────────────────────────────────────────────

function TagHeader({ tag }: { tag: Tag }) {
  const count = tag.posts_count ?? tag.usage_count ?? 0;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <TagPill tag={tag} size="md" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            <strong className="font-semibold text-gray-700 dark:text-gray-200">
              {formatCount(count)}
            </strong>{" "}
            question{count !== 1 ? "s" : ""}
          </span>
        </div>

        {tag.description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {tag.description}
          </p>
        ) : (
          <p className="text-sm italic text-gray-400 dark:text-gray-600">
            No description available for this tag yet.
          </p>
        )}
      </div>

      <div className="flex-shrink-0">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-indigo-600 px-5 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path
              fillRule="evenodd"
              d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41Z"
              clipRule="evenodd"
            />
          </svg>
          Watch tag
        </button>
      </div>
    </div>
  );
}

// ─── PostsToolbar ─────────────────────────────────────────────────────────────

interface PostsToolbarProps {
  total:      number;
  sort:       SortOption;
  onSort:     (s: SortOption) => void;
  isFetching: boolean;
  isLoading:  boolean;
}

function PostsToolbar({
  total,
  sort,
  onSort,
  isFetching,
  isLoading,
}: PostsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="leading-none">
        {isLoading ? (
          <div className="h-5 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ) : (
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {total.toLocaleString()} question{total !== 1 ? "s" : ""}
          </h2>
        )}
        {isFetching && !isLoading && (
          <span className="mt-0.5 block text-xs text-gray-400">
            Refreshing…
          </span>
        )}
      </div>
      <SortTabs current={sort} onChange={onSort} />
    </div>
  );
}

// ─── PostsList ────────────────────────────────────────────────────────────────

interface PostsListProps {
  posts:     Post[];
  isLoading: boolean;
  isError:   boolean;
  error:     string | null;
}

function PostsList({ posts, isLoading, isError, error }: PostsListProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="divide-y divide-gray-100 dark:divide-gray-800 px-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))
        ) : isError ? (
          <ErrorState message={error ?? "Failed to load posts."} />
        ) : posts.length === 0 ? (
          <EmptyPosts />
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}

// ─── TagDetailView ────────────────────────────────────────────────────────────

export interface TagDetailViewProps {
  tag:           Tag | undefined;
  tagLoading:    boolean;
  tagError:      boolean;
  tagErrMsg:     string | null;
  posts:         Post[];
  meta:          PaginationMeta;
  postsLoading:  boolean;
  postsFetching: boolean;
  postsError:    boolean;
  postsErrMsg:   string | null;
  sort:          SortOption;
  onSortChange:  (s: SortOption) => void;
  onPageChange:  (p: number) => void;
  onBack:        () => void;
}

export function TagDetailView({
  tag,
  tagLoading,
  tagError,
  tagErrMsg,
  posts,
  meta,
  postsLoading,
  postsFetching,
  postsError,
  postsErrMsg,
  sort,
  onSortChange,
  onPageChange,
  onBack,
}: TagDetailViewProps) {
  if (tagError) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mb-4 text-5xl">🏷️</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Tag not found
        </h1>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          {tagErrMsg ?? "This tag doesn't exist or has been removed."}
        </p>
        <Link
          to="/tags"
          className="inline-flex items-center gap-2 rounded-full border border-indigo-600 bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Browse all tags
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 text-sm font-semibold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        ← Back
      </button>

      <section className="mb-6">
        {tagLoading ? (
          <TagHeaderSkeleton />
        ) : tag ? (
          <TagHeader tag={tag} />
        ) : null}
      </section>

      <hr className="mb-6 border-gray-200 dark:border-gray-800" />

      <PostsToolbar
        total={meta.total}
        sort={sort}
        onSort={onSortChange}
        isFetching={postsFetching}
        isLoading={postsLoading}
      />

      <PostsList
        posts={posts}
        isLoading={postsLoading}
        isError={postsError}
        error={postsErrMsg}
      />

      {!postsLoading && !postsError && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </main>
  );
}