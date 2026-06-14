import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { reportApi } from "../api/report.api";

export function usePostReport(postId: string) {
  const [reported, setReported] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      reportApi.create({
        target_type: "post",
        target_id: postId,
        reason: "string",
        description: "Dilaporkan oleh pengguna",
      }),

    onSuccess: () => {
      setReported(true);
    },

    onError: (error) => {
      console.error("Report error:", error);
    },
  });

  return {
    reported,
    reportPost: mutation.mutate,
    isReporting: mutation.isPending,
  };
}