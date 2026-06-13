import { useTags } from "../../../../hooks/useTags";
import TagsView from "./TagsView";

export default function TagsPage() {
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

  return (
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
    />
  );
}
