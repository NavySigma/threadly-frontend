import type { SortOption, AnswerFilter } from "../../../../types";

export interface PostFilterValues {
  search: string;
  category_id: string;
  sort: SortOption;
  answer: AnswerFilter;
}