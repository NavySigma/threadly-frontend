import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyPosts } from "../../hooks/useMyPosts";
import { useAuth } from "../../hooks/useAuth";
import { QuestionsTabView } from "./QuestionsTabView";

interface QuestionsTabProps {
  userId: string;
}

export function QuestionsTab({ userId }: QuestionsTabProps) {
  const { posts, isLoading, error, refetch } = useMyPosts(userId);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Track deleted post IDs so they disappear immediately without re-fetch
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const isMod =
    user?.roles?.some((r) => r.name === "admin" || r.name === "moderator") ?? false;

  const handleDeleted = (postId: string) => {
    setDeletedIds((prev) => new Set(prev).add(postId));
  };

  const visiblePosts = posts.filter((p) => !deletedIds.has(p.id));

  return (
    <QuestionsTabView
      posts={visiblePosts}
      isLoading={isLoading}
      error={error}
      showDelete={isMod}
      onItemClick={(postId) => navigate(`/posts/${postId}`)}
      onUpdated={refetch}
      onDeleted={handleDeleted}
    />
  );
}
