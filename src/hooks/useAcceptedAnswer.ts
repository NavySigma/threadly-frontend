import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { AcceptAnswerResponse, UnacceptAnswerResponse } from "../api/comments";

interface AcceptParams {
  postId: string;
  commentId: string;
}

interface UnacceptParams {
  postId: string;
}

export function useAcceptAnswer(postId: string) {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation<AcceptAnswerResponse, Error, AcceptParams>({
    mutationFn: ({ postId, commentId }) =>
      apiFetch<AcceptAnswerResponse>(`/posts/${postId}/comments/${commentId}/accept`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const unacceptMutation = useMutation<UnacceptAnswerResponse, Error, UnacceptParams>({
    mutationFn: ({ postId }) =>
      apiFetch<UnacceptAnswerResponse>(`/posts/${postId}/unaccept`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  return {
    acceptAnswer: acceptMutation.mutate,
    unacceptAnswer: unacceptMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isUnaccepting: unacceptMutation.isPending,
    acceptError: acceptMutation.error,
    unacceptError: unacceptMutation.error,
  };
}