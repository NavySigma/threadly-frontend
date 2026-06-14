import { useNavigate } from "react-router-dom";
import { useMyPosts } from "../../hooks/useMyPosts";
import { QuestionsTabView } from "./QuestionsTabView";

interface QuestionsTabProps {
  userId: string;
}

export function QuestionsTab({ userId }: QuestionsTabProps) {
  const { posts, isLoading, error, refetch } = useMyPosts(userId);
  const navigate = useNavigate();

  return (
    <QuestionsTabView
      posts={posts}
      isLoading={isLoading}
      error={error}
      onItemClick={(postId) => navigate(`/posts/${postId}`)}
      onUpdated={refetch}
    />
  );
}
