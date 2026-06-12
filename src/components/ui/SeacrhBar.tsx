// src/components/ui/SearchBar.tsx
import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../hooks/useSearch";
import type { SearchPost, SearchTag, SearchUser } from "../../api/search";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const TYPE_BADGE: Record<string, { color: string }> = {
  users: { color: "#6366f1" },
  tags: { color: "#0ea5e9" },
  posts: { color: "#f59e0b" },
};

export default function SearchBar() {
  const navigate = useNavigate();
  const dropRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    cleanQuery,
    activeType,
    isOpen,
    setIsOpen,
    isLoading,
    posts,
    tags,
    users,
    hasResults,
    inputRef,
    handleChange,
    handleClear,
    handleClose,
  } = useSearch();

  // Tutup saat klik luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        handleClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [handleClose]);

  // Tutup saat Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClose]);

  // Enter → navigasi ke halaman utama dan tampilkan hasil pencarian di sana
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter" || !query.trim()) return;
      handleClose();
      const searchValue = activeType !== "all" ? cleanQuery : query.trim();
      const params = new URLSearchParams();
      params.set("search", searchValue);
      if (activeType !== "all") params.set("type", activeType);
      navigate(`/?${params.toString()}`);
    },
    [query, cleanQuery, activeType, navigate, handleClose],
  );

  function goToPost(id: number) {
    navigate(`/posts/${id}`);
    handleClose();
  }
  function goToTag(name: string) {
    navigate(`/posts?tag=${encodeURIComponent(name)}`);
    handleClose();
  }
  function goToUser(id: number) {
    navigate(`/users/${id}`);
    handleClose();
  }

  const justPrefix =
    query.endsWith(":") || (query.includes(":") && cleanQuery.length < 1);
  const showDropdown = isOpen && query.trim().length >= 1;
  const showResults = cleanQuery.length >= 1 && !justPrefix; // ← minimal 1 huruf

  const sectionHeader = (text: string, color: string) => (
    <div
      style={{
        padding: "8px 14px 6px",
        fontSize: 11,
        fontWeight: 700,
        color: "#fff",
        background: color,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {text}
    </div>
  );

  return (
    <div ref={dropRef} style={{ position: "relative", width: "100%" }}>
      {/* ── Input ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `1px solid ${isOpen ? "#4f46e5" : "#babfc4"}`,
          borderRadius: 6,
          background: "#fff",
          padding: "0 10px",
          gap: 6,
          transition: "border-color .15s",
        }}
      >
        <span style={{ color: "#6a737c", fontSize: 14, flexShrink: 0 }}>
          🔍︎
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Search… atau ketik users: tags: posts:"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "9px 0",
            fontSize: 14,
            background: "transparent",
            minWidth: 0,
          }}
        />

        {/* Hint Enter */}
        {query.trim().length >= 1 && (
          <span
            style={{
              fontSize: 11,
              color: "#9ca3af",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            ↵ Enter
          </span>
        )}

        {query && (
          <button
            onClick={handleClear}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6a737c",
              fontSize: 18,
              padding: "0 2px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #e3e6e8",
            borderRadius: 6,
            boxShadow: "0 4px 24px rgba(0,0,0,.13)",
            zIndex: 999,
            maxHeight: 520,
            overflowY: "auto",
          }}
        >
          {/* Hint saat user baru ketik "users:" tanpa query */}
          {justPrefix && (
            <div
              style={{
                padding: "14px 16px",
                color: "#6a737c",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Ketik kata kunci setelah{" "}
              <strong
                style={{ color: TYPE_BADGE[activeType]?.color ?? "#374151" }}
              >
                {activeType}:
              </strong>
            </div>
          )}

          {/* Shortcut chips — hanya muncul saat belum pakai prefix */}
          {!query.includes(":") && query.trim().length >= 1 && (
            <div
              style={{
                padding: "8px 10px",
                display: "flex",
                gap: 6,
                borderBottom: "1px solid #f0f0f0",
                flexWrap: "wrap",
              }}
            >
              {[
                { prefix: "users", color: "#6366f1" },
                { prefix: "tags", color: "#0ea5e9" },
                { prefix: "posts", color: "#f59e0b" },
              ].map((h) => (
                <button
                  key={h.prefix}
                  onClick={() => {
                    setQuery(`${h.prefix}:${query}`);
                    setIsOpen(true);
                    inputRef.current?.focus();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    borderRadius: 20,
                    border: `1px solid ${h.color}`,
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    color: h.color,
                    fontWeight: 600,
                    transition: "all .1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = h.color;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = h.color;
                  }}
                >
                  {h.prefix}:{query}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {showResults && isLoading && (
            <div
              style={{
                padding: 16,
                textAlign: "center",
                color: "#6a737c",
                fontSize: 13,
              }}
            >
              Mencari...
            </div>
          )}

          {/* Tidak ada hasil */}
          {showResults && !isLoading && !hasResults && (
            <div
              style={{
                padding: "20px 16px",
                textAlign: "center",
                color: "#6a737c",
                fontSize: 13,
              }}
            >
              Tidak ada hasil untuk <strong>"{cleanQuery}"</strong>
              {activeType !== "all" && (
                <span>
                  {" "}
                  di <strong>{activeType}</strong>
                </span>
              )}
            </div>
          )}

          {/* ── Users ── */}
          {users.length > 0 && (
            <div>
              {sectionHeader("Users", "#6366f1")}
              {users.map((user: SearchUser) => (
                <div
                  key={user.id}
                  onClick={() => goToUser(user.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f5f3ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "#6366f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0c0d0e",
                      }}
                    >
                      {user.username}
                    </div>
                    {user.bio && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6a737c",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.bio}
                      </div>
                    )}
                  </div>
                  {user.posts_count !== undefined && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 12,
                        color: "#6a737c",
                        flexShrink: 0,
                      }}
                    >
                      {user.posts_count} posts
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {users.length > 0 && tags.length > 0 && (
            <div style={{ height: 1, background: "#e3e6e8" }} />
          )}

          {/* ── Tags ── */}
          {tags.length > 0 && (
            <div>
              {sectionHeader("Tags", "#0ea5e9")}
              {tags.map((tag: SearchTag) => (
                <div
                  key={tag.id}
                  onClick={() => goToTag(tag.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 14px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0f9ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      background: tag.color ?? "#e1ecf4",
                      color: tag.color ? "#fff" : "#39739d",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {tag.name}
                  </span>
                  {tag.posts_count !== undefined && (
                    <span style={{ fontSize: 12, color: "#6a737c" }}>
                      {tag.posts_count.toLocaleString()} pertanyaan
                    </span>
                  )}
                  {tag.description && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "#6a737c",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      — {tag.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {(users.length > 0 || tags.length > 0) && posts.length > 0 && (
            <div style={{ height: 1, background: "#e3e6e8" }} />
          )}

          {/* ── Posts ── */}
          {posts.length > 0 && (
            <div>
              {sectionHeader("Pertanyaan", "#f59e0b")}
              {posts.map((post: SearchPost) => (
                <div
                  key={post.id}
                  onClick={() => goToPost(post.id)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fffbeb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#0c0d0e",
                      marginBottom: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {post.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#6a737c" }}>
                      {post.vote_score} votes · {post.view_count} views
                    </span>
                    {post.is_answered && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#2e7d32",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Terjawab
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: "#6a737c" }}>
                      {timeAgo(post.created_at)}
                    </span>
                    <span style={{ fontSize: 12, color: "#6a737c" }}>
                      oleh {post.user.username}
                    </span>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          style={{
                            background: tag.color ?? "#e1ecf4",
                            color: tag.color ? "#fff" : "#39739d",
                            padding: "1px 6px",
                            borderRadius: 3,
                            fontSize: 11,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer: lihat semua */}
          {showResults && (
            <div
              onClick={() => {
                handleClose();
                const searchValue =
                  activeType !== "all" ? cleanQuery : query.trim();
                const params = new URLSearchParams();
                params.set("search", searchValue);
                if (activeType !== "all") params.set("type", activeType);
                navigate(`/?${params.toString()}`);
              }}
              style={{
                padding: "10px 14px",
                textAlign: "center",
                fontSize: 13,
                color: "#4f46e5",
                cursor: "pointer",
                borderTop: "1px solid #e3e6e8",
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f8f9fa")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Lihat semua hasil untuk "{cleanQuery}"
              {activeType !== "all" && ` di ${activeType}`} →
            </div>
          )}
        </div>
      )}
    </div>
  );
}
