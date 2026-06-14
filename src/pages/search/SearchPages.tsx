import { useSearchResultsLogic } from "./SearchResultsLogic";
import { SearchResultsView } from "./SearchResultsView";

export default function SearchPage() {
  const searchData = useSearchResultsLogic();
  return <SearchResultsView {...searchData} />;
}
