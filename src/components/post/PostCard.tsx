import type { Post } from "../../types";

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "baru saja";
  if (mins < 60)  return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 30)  return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

interface StatProps {
  value: number;
  label: string;
  highlight?: boolean;
  accepted?: boolean;
  muted?: boolean;
}

function Stat({ value, label, highlight, accepted, muted }: StatProps) {
  const base = "flex flex-col items-center px-2 py-1 rounded-md border min-w-[56px]";
  const cls = accepted
    ? `${base} bg-green-500 border-green-500 text-white`
    : highlight
    ? `${base} bg-green-50 border-green-400 text-green-700`
    : `${base} border-transparent`;

  return (
    <div className={cls}>
      <span className={`font-bold leading-tight ${muted ? "text-xs text-gray-400" : "text-sm text-gray-700"} ${accepted || highlight ? "!text-inherit" : ""}`}>
        {value}
      </span>
      <span className={`text-[10px] whitespace-nowrap ${accepted ? "text-white" : highlight ? "text-green-600" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}

export function PostCard({ post, onClick }: { post: Post; onClick?: (p: Post) => void }) {
  return (
    <article
      className={`flex gap-4 p-4 border-b border-gray-100 bg-white transition-colors last:border-b-0
        ${post.is_answered ? "border-l-2 border-l-green-400" : ""}
        ${onClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
      onClick={() => onClick?.(post)}
    >
      {/* Stats */}
      <div className="flex flex-col gap-1.5 items-end min-w-[64px] shrink-0">
        <Stat value={post.vote_score} label="vote" />
        <Stat
          value={0}
          label="jawaban"
          highlight={post.is_answered}
          accepted={post.accepted_answer_id !== null}
        />
        <Stat value={post.view_count} label="dilihat" muted />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <h3 className={`text-sm font-semibold text-blue-600 leading-snug ${onClick ? "group-hover:underline" : ""}`}>
          {post.status === "closed" && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 mr-2 border border-gray-200">
              PRIVATE
            </span>
          )}
          {post.title}
        </h3>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {post.body.replace(/<[^>]+>/g, "").slice(0, 150)}
          {post.body.length > 150 ? "..." : ""}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded text-[11px] font-medium border"
                style={tag.color
                  ? { background: tag.color + "22", borderColor: tag.color + "66", color: tag.color }
                  : { background: "#e8f0fe", borderColor: "#c5d8fd", color: "#1a56db" }
                }
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
          <span className="bg-gray-100 text-gray-500 font-medium rounded px-1.5 py-0.5">
            {post.category.name}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 text-gray-600 font-medium">
            <span className="w-4 h-4 rounded-full bg-teal-400 text-white text-[9px] font-bold flex items-center justify-center">
              {post.user.username.charAt(0).toUpperCase()}
            </span>
            {post.user.username}
          </span>
          <span>·</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>
      </div>
    </article>
  );
}