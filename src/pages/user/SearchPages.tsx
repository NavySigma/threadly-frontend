import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  searchAll,
  searchPosts,
  searchTags,
  searchUsers,
  type SearchResults,
  type SearchPost,
  type SearchTag,
  type SearchUser,
} from "../../api/search";

export default function SearchPage() {
  const [params] = useSearchParams();

  const q = params.get("q") || "";
  const type = params.get("type") || "all";

  const { data, isLoading } = useQuery<SearchResults>({
    queryKey: ["search-page", type, q],
    queryFn: async () => {
      if (type === "posts") {
        const res = await searchPosts(q);
        return {
          posts: res.data,
          tags: [],
          users: [],
        };
      }

      if (type === "tags") {
        const res = await searchTags(q);
        return {
          posts: [],
          tags: res.data,
          users: [],
        };
      }

      if (type === "users") {
        const res = await searchUsers(q);
        return {
          posts: [],
          tags: [],
          users: res.data,
        };
      }

      return searchAll(q);
    },
    enabled: !!q,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Search Results</h1>

      <p>
        Keyword: <strong>{q}</strong>
      </p>

      <p>
        Type: <strong>{type}</strong>
      </p>

      <hr />

      <h2>Posts</h2>

      {data?.posts?.map((post: SearchPost) => (
        <div key={post.id}>{post.title}</div>
      ))}

      <h2>Tags</h2>

      {data?.tags?.map((tag: SearchTag) => (
        <div key={tag.id}>{tag.name}</div>
      ))}

      <h2>Users</h2>

      {data?.users?.map((user: SearchUser) => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  );
}
