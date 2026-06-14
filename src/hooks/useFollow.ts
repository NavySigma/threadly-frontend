import { useState, useCallback } from "react";
import { followUser, unfollowUser } from "../api/followApi";

interface UseFollowReturn {
  isFollowing: boolean;
  isLoading: boolean;
  toggle: (userId: string) => Promise<void>;
  setIsFollowing: (v: boolean) => void;
}

export function useFollow(initialIsFollowing: boolean): UseFollowReturn {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = useCallback(
    async (userId: string) => {
      setIsLoading(true);
      try {
        if (isFollowing) {
          await unfollowUser(userId);
          setIsFollowing(false);
        } else {
          await followUser(userId);
          setIsFollowing(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [isFollowing]
  );

  return { isFollowing, isLoading, toggle, setIsFollowing };
}