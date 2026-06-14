import { Link } from "react-router-dom";
import type {
  Tag,
  Post,
  Author,
  SortOption,
  PaginationMeta,
} from "../../../../types/tagDetail.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const mos  = Math.floor(days / 30);
  if (mos < 12)  return `${mos}mo ago`;
  return `${Math.floor(mos / 12)}y ago`;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

// ─── TagPill ──────────────────────────────────────────────────────────────────

interface TagPillProps {
  tag:   Tag;
  size?: "sm" | "md";
}

export function TagPill({ tag, size = "sm" }: TagPillProps) {
  const cls =
    size === "md"
      ? "px-4 py-1.5 text-sm font-bold"
      : "px-2.5 py-0.5 text-xs font-semibold";
  return (
    <Link
      to={`/tags/${tag.id}`}
      className={`inline-flex items-center rounded-full text-white transition-opacity hover:opacity-80 ${cls}`}
      style={{ backgroundColor: tag.color ?? "#6a737c" }}
    >
      {tag.name}
    </Link>
  );
}

// ─── UserAvatar ───────────────────────────────────────────────────────────────

export function UserAvatar({ author }: { author: Author }) {
  if (author.avatar) {
    return (
      <img
        src={author.avatar}
        alt={author.name}
        className="w-5 h-5 rounded-sm object-cover flex-shrink-0"
      />
    );
  }
  const initials = author.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = (author.id * 47) % 360;
  return (
    <span
      className="w-5 h-5 rounded-sm inline-flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
      style={{ backgroundColor: `hsl(${hue},55%,42%)` }}
    >
      {initials}
    </span>
  );
}

// ─── StatBox ──────────────────────────────────────────────────────────────────

type StatVariant = "default" | "accepted" | "active";

interface StatBoxProps {
  value:    number;
  label:    string;
  variant?: StatVariant;
}

export function StatBox({ value, label, variant = "default" }: StatBoxProps) {
  const variants: Record<StatVariant, string> = {
    default:  "text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    accepted: "text-green-700 dark:text-green-400 border-green-400 dark:border-green-700 bg-green-50 dark:bg-green-950/30",
    active:   "text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30",
  };
  return (
    <div
      className={`flex flex-col items-center justify-center w-16 rounded-md border px-1 py-1.5 text-center ${variants[variant]}`}
    >
      <span className="text-base font-bold leading-none">
        {value.toLocaleString()}
      </span>
      <span className="text-[10px] mt-0.5 leading-none">{label}</span>
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

export function PostCard({ post }: { post: Post }) {
  const hasAccepted = !!post.accepted_comment_id;
  const excerpt     = post.body.replace(/<[^>]*>/g, "").slice(0, 160);

  return (
    <article className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="hidden sm:flex flex-col gap-1.5 flex-shrink-0 pt-0.5">
        <StatBox
          value={post.votes_count}
          label="votes"
          variant={post.votes_count > 0 ? "active" : "default"}
        />
        <StatBox
          value={post.comments_count}
          label="answers"
          variant={hasAccepted ? "accepted" : "default"}
        />
        <StatBox value={post.views_count} label="views" />
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/posts/${post.slug ?? post.id}`}
          className="block text-base font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 leading-snug mb-1"
        >
          {post.is_closed && (
            <span className="mr-1.5 inline-block rounded border border-gray-300 dark:border-gray-600 px-1 py-px text-[10px] font-medium text-gray-500">
              closed
            </span>
          )}
          {post.title}
        </Link>

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2">
          {excerpt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} />
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
            <UserAvatar author={post.author} />
            <Link
              to={`/users/${post.author.id}`}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {post.author.name}
            </Link>
            <span className="font-semibold text-yellow-600 dark:text-yellow-500">
              {post.author.reputation_points.toLocaleString()}
            </span>
            <span>·</span>
            <time dateTime={post.created_at}>
              {formatTimeAgo(post.created_at)}
            </time>
            <span>in</span>
            <Link
              to={`/categories/${post.category.id}`}
              className="hover:underline"
            >
              {post.category.name}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

export function PostCardSkeleton() {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 animate-pulse">
      <div className="hidden sm:flex flex-col gap-1.5 flex-shrink-0">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-16 h-12 rounded-md bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      <div className="flex-1 space-y-2.5">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 w-14 bg-gray-100 dark:bg-gray-800 rounded-full" />
          <div className="h-5 w-10 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TagHeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-5 w-28 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full max-w-xl" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3 max-w-lg" />
    </div>
  );
}

// ─── SortTabs ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest",     label: "Newest"     },
  { key: "active",     label: "Active"     },
  { key: "votes",      label: "Votes"      },
  { key: "unanswered", label: "Unanswered" },
];

interface SortTabsProps {
  current:  SortOption;
  onChange: (s: SortOption) => void;
}

export function SortTabs({ current, onChange }: SortTabsProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-0.5">
      {SORT_OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            current === key
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  meta:         PaginationMeta;
  onPageChange: (p: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { current_page: current, last_page: last } = meta;
  if (last <= 1) return null;

  const pages: (number | "…")[] = [];
  if (last <= 7) {
    for (let i = 1; i <= last; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(last - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }
    if (current < last - 2) pages.push("…");
    pages.push(last);
  }

  const base   = "px-3 py-1.5 rounded text-sm font-medium border transition-colors";
  const idle   = "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800";
  const active = "border-indigo-600 bg-indigo-600 text-white";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-6">
      <button
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
        className={`${base} ${idle} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        ‹ Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-2 text-sm text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === current ? "page" : undefined}
            className={`${base} ${p === current ? active : idle}`}
          >
            {p}
          </button>
        )
      )}

      <button
        disabled={current === last}
        onClick={() => onPageChange(current + 1)}
        className={`${base} ${idle} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        Next ›
      </button>
    </nav>
  );
}

// ─── EmptyPosts ───────────────────────────────────────────────────────────────

export function EmptyPosts() {
  return (
    <div className="py-16 text-center">
      <div className="text-4xl mb-3">📭</div>
      <p className="font-medium text-gray-600 dark:text-gray-400">
        No questions tagged with this topic yet.
      </p>
      <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
        Be the first to ask one!
      </p>
      <Link
        to="/posts/create"
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-indigo-600 bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
      >
        Ask a question
      </Link>
    </div>
  );
}

// ─── ErrorState ───────────────────────────────────────────────────────────────

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="font-medium text-gray-700 dark:text-gray-300">
        Something went wrong
      </p>
      <p className="mt-1 text-sm text-red-500">{message}</p>
    </div>
  );
}