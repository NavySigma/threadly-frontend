import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useComments } from "../../hooks/useComments";
import { useAuth } from "../../contexts/useAuth";
import { commentsApi } from "../../api/comments";
import type { Comment } from "../../api/comments";
import CommentVote from "../../pages/post/comment/CommentVote";
import CommentLike from "../../pages/post/comment/CommentLike";
import CommentReport from "../../pages/post/comment/CommentReport";

const MAX_COMMENTS_PER_USER = 1;
const MAX_EDITS_PER_COMMENT = 2;

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function Avatar({
  username,
  avatar_url,
  onClick,
}: {
  username: string;
  avatar_url: string | null;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#0d9488",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {avatar_url ? (
        <img
          src={avatar_url}
          alt={username}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        (username?.[0] ?? "?").toUpperCase()
      )}
    </div>
  );
}

function CommentBox({
  placeholder,
  initialValue = "",
  onSubmit,
  onCancel,
  submitLabel = "Kirim",
  isSubmitting,
}: {
  placeholder: string;
  initialValue?: string;
  onSubmit: (val: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting: boolean;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          fontSize: 14,
          lineHeight: 1.6,
          resize: "vertical",
          fontFamily: "inherit",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
      />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              padding: "6px 14px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              background: "none",
              fontSize: 13,
              cursor: "pointer",
              color: "#6a737c",
            }}
          >
            Batal
          </button>
        )}
        <button
          onClick={() => {
            if (value.trim()) onSubmit(value.trim());
          }}
          disabled={isSubmitting || !value.trim()}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "none",
            background: isSubmitting || !value.trim() ? "#c7d2fe" : "#4f46e5",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: isSubmitting || !value.trim() ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Mengirim..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

function SingleComment({
  comment,
  currentUserId,
  isReply = false,
  parentId,
  postOwnerId,
  isAccepted,
  canVote,
  editCount,
  isAcceptLoading,
  canDelete,
  onReply,
  onEdit,
  onAccept,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: string;
  isReply?: boolean;
  parentId?: string;
  postOwnerId: string;
  isAccepted: boolean;
  canVote: boolean;
  editCount: number;
  isAcceptLoading?: boolean;
  canDelete?: boolean;
  onReply?: () => void;
  onEdit: (
    commentId: string,
    newBody: string,
    isReply: boolean,
    parentId?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onAccept?: () => void;
  onDelete?: (commentId: string) => void;
}) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isOwner =
    !!currentUserId && currentUserId.trim() === comment.user.id.trim();
  const editLimitReached = editCount >= MAX_EDITS_PER_COMMENT;

  const goToProfile = () => navigate(`/profile/${comment.user.id}`);

  const handleEdit = async (newBody: string) => {
    setEditLoading(true);
    setEditError(null);
    const res = await onEdit(comment.id, newBody, isReply, parentId);
    setEditLoading(false);
    if (res.success) {
      setEditing(false);
    } else if (res.error) {
      setEditError(res.error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Hapus komentar ini? Tindakan tidak dapat dibatalkan.")) return;
    setDeleteLoading(true);
    try {
      await commentsApi.delete(comment.id);
      onDelete?.(comment.id);
    } catch {
      // silently fail — comment stays
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "14px 0",
        borderBottom: "2px solid #e5e7eb",
        position: "relative",
      }}
    >
      {isAccepted && (
        <div
          style={{
            position: "absolute",
            left: -16,
            top: 0,
            bottom: 0,
            width: 3,
            background: "#22c55e",
            borderRadius: 2,
          }}
        />
      )}

      <Avatar
        username={comment.user.username}
        avatar_url={comment.user.avatar_url}
        onClick={goToProfile}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 4,
          }}
        >
          <span
            onClick={goToProfile}
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "#111827",
              cursor: "pointer",
            }}
          >
            {comment.user.username}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {timeAgo(comment.created_at)}
          </span>
          {isAccepted && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#16a34a",
                background: "#dcfce7",
                padding: "2px 8px",
                borderRadius: 12,
              }}
            >
              ✓ Jawaban Diterima
            </span>
          )}
        </div>

        {editing ? (
          <>
            <CommentBox
              placeholder="Edit komentar..."
              initialValue={comment.body}
              onSubmit={handleEdit}
              onCancel={() => {
                setEditError(null);
                setEditing(false);
              }}
              submitLabel="Simpan"
              isSubmitting={editLoading}
            />
            {editError && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#dc2626" }}>
                ⚠️ {editError}
              </p>
            )}
          </>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.65,
              color: "#374151",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {comment.body}
          </p>
        )}

        {!editing && (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {!isReply && canVote && (
              <CommentVote
                commentId={comment.id}
                voteScore={comment.vote_score}
                initialUserVote={comment.user_vote ?? null}
              />
            )}

            {!isReply && canVote && (
              <CommentLike
                commentId={comment.id}
                initialLiked={comment.user_liked ?? false}
                initialCount={comment.likes_count ?? 0}
              />
            )}

            {!isReply && onReply && currentUserId && (
              <button
                onClick={onReply}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#6b7280",
                  padding: 0,
                }}
              >
                Balas
              </button>
            )}

            {currentUserId === postOwnerId &&
              currentUserId !== comment.user.id &&
              onAccept && (
                <button
                  onClick={onAccept}
                  disabled={isAcceptLoading}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: isAcceptLoading ? "not-allowed" : "pointer",
                    fontSize: 12,
                    color: isAccepted ? "#16a34a" : "#6b7280",
                    padding: 0,
                    fontWeight: isAccepted ? 600 : 400,
                    opacity: isAcceptLoading ? 0.6 : 1,
                  }}
                >
                  {isAcceptLoading
                    ? "..."
                    : isAccepted
                      ? "✓ Diterima"
                      : "Terima sebagai jawaban"}
                </button>
              )}

            {isOwner && !editLimitReached && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#4f46e5",
                  padding: 0,
                }}
              >
                Edit
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  background: "none",
                  border: "none",
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  fontSize: 12,
                  color: "#dc2626",
                  padding: 0,
                  opacity: deleteLoading ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginLeft: "auto",
                }}
              >
                {deleteLoading ? "Menghapus..." : "🗑 Hapus"}
              </button>
            )}

            {currentUserId && (
              <CommentReport commentId={comment.id} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentThread({
  comment,
  currentUserId,
  postOwnerId,
  acceptedAnswerId,
  isSubmitting,
  isAcceptLoading,
  editCounts,
  canDelete,
  onReply,
  onEdit,
  onAccept,
  onDeleteComment,
  replyError,
  onReplyErrorClear,
}: {
  comment: Comment;
  currentUserId?: string;
  postOwnerId: string;
  acceptedAnswerId: string | null;
  isSubmitting: boolean;
  isAcceptLoading?: boolean;
  editCounts: Record<string, number>;
  canDelete?: boolean;
  onReply: (parentId: string, body: string) => Promise<{ success: boolean; error?: string }>;
  onEdit: (
    commentId: string,
    body: string,
    isReply: boolean,
    parentId?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onAccept: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  replyError?: string | null;
  onReplyErrorClear?: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [localComment, setLocalComment] = useState(comment);

  useEffect(() => {
    setLocalComment(comment);
  }, [comment]);

  const isAccepted = acceptedAnswerId === localComment.id;
  const canVote =
    !!currentUserId && currentUserId.trim() !== localComment.user.id.trim();

  const handleReplySubmit = async (body: string) => {
    const result = await onReply(localComment.id, body);
    if (result.success) {
      setReplyOpen(false);
    }
  };

  // Remove a deleted reply from local state immediately
  const handleReplyDeleted = (replyId: string) => {
    setLocalComment((prev) => ({
      ...prev,
      replies: prev.replies.filter((r) => r.id !== replyId),
    }));
    onDeleteComment(replyId);
  };

  return (
    <div>
      <SingleComment
        comment={localComment}
        currentUserId={currentUserId}
        postOwnerId={postOwnerId}
        isAccepted={isAccepted}
        canVote={canVote}
        editCount={editCounts[localComment.id] ?? 0}
        isAcceptLoading={isAcceptLoading}
        canDelete={canDelete}
        onReply={() => setReplyOpen((p) => !p)}
        onEdit={onEdit}
        onAccept={() => onAccept(localComment.id)}
        onDelete={onDeleteComment}
      />

      {localComment.replies && localComment.replies.length > 0 && (
        <div
          style={{
            marginLeft: 42,
            borderLeft: "2px solid #0d9488",
            paddingLeft: 16,
          }}
        >
          {localComment.replies.map((reply) => (
            <SingleComment
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              postOwnerId={postOwnerId}
              isReply
              parentId={localComment.id}
              isAccepted={acceptedAnswerId === reply.id}
              canVote={false}
              editCount={editCounts[reply.id] ?? 0}
              isAcceptLoading={isAcceptLoading}
              canDelete={canDelete}
              onEdit={onEdit}
              onAccept={() => onAccept(reply.id)}
              onDelete={handleReplyDeleted}
            />
          ))}
        </div>
      )}

      {replyOpen && currentUserId && (
        <div style={{ marginLeft: 42, marginTop: 8 }}>
          <CommentBox
            placeholder="Tulis balasan..."
            onSubmit={handleReplySubmit}
            onCancel={() => {
              onReplyErrorClear?.();
              setReplyOpen(false);
            }}
            submitLabel="Balas"
            isSubmitting={isSubmitting}
          />
          {replyError && (
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#dc2626" }}>
              ⚠️ {replyError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface CommentSectionProps {
  postId: string;
  postOwnerId: string;
  acceptedAnswerId: string | null;
  postStatus: "open" | "closed";
}

export default function CommentSection({
  postId,
  postOwnerId,
  acceptedAnswerId: initialAcceptedAnswerId,
  postStatus,
}: CommentSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    comments,
    isLoading,
    error,
    isSubmitting,
    addComment,
    addReply,
    editComment,
    countUserComments,
  } = useComments(postId);
  const [acceptedAnswerId, setAcceptedAnswerId] = useState<string | null>(
    initialAcceptedAnswerId,
  );
  const [editCounts, setEditCounts] = useState<Record<string, number>>({});
  const [commentError, setCommentError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isAcceptLoading, setIsAcceptLoading] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const editCountsInitialized = useRef(false);

  // Mod/admin check
  const canDelete =
    user?.roles?.some((r) => r.name === "admin" || r.name === "moderator") ?? false;

  useEffect(() => {
    if (comments && !editCountsInitialized.current) {
      const initial: Record<string, number> = {};
      comments.forEach((c: any) => {
        initial[c.id] = c.edits_count ?? 0;
        if (c.replies) {
          c.replies.forEach((r: any) => {
            initial[r.id] = r.edits_count ?? 0;
          });
        }
      });
      setEditCounts(initial);
      editCountsInitialized.current = true;
    }
  }, [comments]);

  const isPostOpen = postStatus === "open";
  const myCommentCount = user ? countUserComments(user.id) : 0;
  const canAddComment =
    !!user && isPostOpen && myCommentCount < MAX_COMMENTS_PER_USER;

  const handleAddComment = async (body: string) => {
    setCommentError(null);
    const result = await addComment(body);
    if (!result.success && result.error) {
      setCommentError(result.error);
    }
    return result;
  };

  const handleAddReply = async (parentId: string, body: string) => {
    setReplyError(null);
    const result = await addReply(parentId, body);
    if (!result.success && result.error) {
      setReplyError(result.error);
    }
    return result;
  };

  const handleAccept = async (commentId: string) => {
    const newAccepted = acceptedAnswerId === commentId ? null : commentId;
    setIsAcceptLoading(true);
    try {
      if (newAccepted) {
        await commentsApi.accept(postId, commentId);
      } else {
        await commentsApi.unaccept(postId);
      }
      setAcceptedAnswerId(newAccepted);
    } catch {
      // gagal — state acceptedAnswerId tidak diubah
    } finally {
      setIsAcceptLoading(false);
    }
  };

  const handleEdit = async (
    commentId: string,
    body: string,
    isReply: boolean,
    parentId?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await editComment(commentId, body, isReply, parentId);
    if (result.success) {
      setEditCounts((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] ?? 0) + 1,
      }));
    } else if (result.error?.includes("maksimal 2 kali")) {
      setEditCounts((prev) => ({
        ...prev,
        [commentId]: MAX_EDITS_PER_COMMENT,
      }));
    }
    return result;
  };

  // Remove comment (or reply) from visible list immediately
  const handleDeleteComment = (commentId: string) => {
    setDeletedIds((prev) => new Set(prev).add(commentId));
  };

  const visibleComments = comments.filter((c) => !deletedIds.has(c.id));

  return (
    <div style={{ marginTop: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <h3
          style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}
        >
          {visibleComments.length} Komentar
        </h3>
        {!isPostOpen && (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Post ditutup — tidak bisa berkomentar
          </span>
        )}
      </div>

      {isLoading && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: "#9ca3af",
            fontSize: 14,
          }}
        >
          Memuat komentar...
        </div>
      )}

      {error && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: "#ef4444",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {visibleComments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              Belum ada komentar. Jadilah yang pertama!
            </div>
          ) : (
            <div>
              {visibleComments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  postOwnerId={postOwnerId}
                  acceptedAnswerId={acceptedAnswerId}
                  isSubmitting={isSubmitting}
                  isAcceptLoading={isAcceptLoading}
                  editCounts={editCounts}
                  canDelete={canDelete}
                  onReply={handleAddReply}
                  onEdit={handleEdit}
                  onAccept={handleAccept}
                  onDeleteComment={handleDeleteComment}
                  replyError={replyError}
                  onReplyErrorClear={() => setReplyError(null)}
                />
              ))}
            </div>
          )}

          {user && isPostOpen && (
            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <Avatar
                  username={user.username}
                  avatar_url={user.avatar_url ?? null}
                  onClick={() => navigate(`/profile/${user.id}`)}
                />
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                >
                  Tambah Komentar
                </span>
                {myCommentCount >= MAX_COMMENTS_PER_USER && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#ef4444",
                      background: "#fef2f2",
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    Batas komentar tercapai (maks. {MAX_COMMENTS_PER_USER})
                  </span>
                )}
              </div>
              {canAddComment && (
                <>
                  <CommentBox
                    placeholder="Tulis komentar kamu di sini..."
                    onSubmit={handleAddComment}
                    isSubmitting={isSubmitting}
                  />
                  {commentError && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#dc2626" }}>
                      ⚠️ {commentError}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {!user && (
            <div
              style={{
                marginTop: 24,
                padding: "16px 20px",
                background: "#f9fafb",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                textAlign: "center",
                fontSize: 14,
                color: "#6b7280",
              }}
            >
              <a
                href="/login"
                style={{
                  color: "#4f46e5",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Login
              </a>{" "}
              untuk berkomentar.
            </div>
          )}
        </>
      )}
    </div>
  );
}
