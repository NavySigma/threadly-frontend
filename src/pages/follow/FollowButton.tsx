import { useEffect } from "react";
import { useFollow } from "../../hooks/useFollow";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: "sm" | "md";
}

export default function FollowButton({
  userId,
  initialIsFollowing,
  onFollowChange,
  size = "md",
}: FollowButtonProps) {
  const { isFollowing, isLoading, toggle, setIsFollowing } = useFollow(initialIsFollowing);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const willFollow = !isFollowing;
    await toggle(userId);
    onFollowChange?.(willFollow);
  };

  const padding = size === "sm" ? "3px 10px" : "5px 14px";
  const fontSize = size === "sm" ? 11 : 13;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      style={{
        padding,
        fontSize,
        fontFamily: "var(--sans)",
        fontWeight: 500,
        borderRadius: 4,
        border: isFollowing ? "1px solid var(--black-200)" : "1px solid var(--orange)",
        background: isFollowing ? "transparent" : "var(--orange)",
        color: isFollowing ? "var(--black-500)" : "#fff",
        cursor: isLoading ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.6 : 1,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (isLoading) return;
        if (isFollowing) {
          e.currentTarget.style.borderColor = "#e74c3c";
          e.currentTarget.style.color = "#e74c3c";
        } else {
          e.currentTarget.style.opacity = "0.85";
        }
      }}
      onMouseLeave={(e) => {
        if (isLoading) return;
        e.currentTarget.style.borderColor = isFollowing ? "var(--black-200)" : "var(--orange)";
        e.currentTarget.style.color = isFollowing ? "var(--black-500)" : "#fff";
        e.currentTarget.style.opacity = "1";
      }}
    >
      {isLoading
        ? isFollowing ? "Unfollow..." : "Follow..."
        : isFollowing ? "✓ Following" : "+ Follow"}
    </button>
  );
}