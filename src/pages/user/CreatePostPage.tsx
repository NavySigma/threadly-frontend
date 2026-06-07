import type { Tag } from "../../api/posts";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePost } from "../../hooks/useCreatePost";
import { useAuth } from "../../hooks/useAuth";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="form-error">
      <span>⚠</span> {message}
    </div>
  );
}

function TagBadge({
  tag,
  onRemove,
  onClick,
}: {
  tag: Tag;
  onRemove?: () => void;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className="tag-badge"
      style={{ backgroundColor: tag.color ?? "#6a737c" }}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="tag-badge-remove"
          aria-label={`Remove tag ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  const {
    form,
    categories,
    tags,
    tagSearch,
    isLoadingMeta,
    isSubmitting,
    errors,
    globalError,
    setField,
    setTagSearch,
    addTag,
    removeTag,
    submit,
    reset,
  } = useCreatePost();

  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in (wait for loading)
  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login", { replace: true });
  }, [loading, isAuthenticated, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(e.target as Node) &&
        !tagInputRef.current?.contains(e.target as Node)
      ) {
        setShowTagDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newId = await submit();
    if (newId) navigate(`/`);
  }

  const hasEnoughPoints = (user?.reputation_points ?? 0) >= 15;
  const filteredTags = tags.filter(
    (t) => !form.selectedTags.some((s) => s.id === t.id),
  );

  // Not enough points
  if (isAuthenticated && !hasEnoughPoints) {
    return (
      <main className="insufficient-points-page">
        <div className="insufficient-points-card">
          <div className="insufficient-points-icon">🔒</div>
          <h1 className="insufficient-points-title">Insufficient Points</h1>
          <p className="insufficient-points-text">
            You need at least{" "}
            <strong style={{ color: "var(--orange)" }}>
              15 reputation points
            </strong>{" "}
            to create a post.
          </p>
          <p className="insufficient-points-current">
            Your current points: <strong>{user?.reputation_points ?? 0}</strong>
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="create-post-page">
      <div className="create-post-header">
        <div className="create-post-header-top">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="create-post-header-back"
          >
            ← Back
          </button>
        </div>
        <h1 className="create-post-header">Create New Post</h1>
        <p>
          Ask a question to the community. Write clearly so it can be answered
          easily.
        </p>
      </div>

      {/* Global error */}
      {globalError && (
        <div
          style={{
            marginBottom: "24px",
            padding: "12px",
            background: "#fee",
            border: "1px solid #f99",
            borderRadius: "4px",
            color: "var(--red)",
            fontSize: "12px",
          }}
        >
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="create-post-form">
        {/* Category */}
        <div className="form-field">
          <label htmlFor="category">
            Category <span className="required">*</span>
          </label>
          {isLoadingMeta ? (
            <div
              style={{
                height: "36px",
                background: "var(--black-050)",
                borderRadius: "4px",
                animation: "pulse 2s infinite",
              }}
            />
          ) : (
            <select
              id="category"
              value={form.category_id}
              onChange={(e) => setField("category_id", e.target.value)}
              style={{
                borderColor: errors.category_id ? "var(--red)" : undefined,
              }}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent_id ? `  ↳ ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
          )}
          <FieldError message={errors.category_id} />
        </div>

        {/* Title */}
        <div className="form-field form-field-with-counter">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="Example: How to use useEffect in React?"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            maxLength={300}
            style={{
              borderColor: errors.title ? "var(--red)" : undefined,
            }}
          />
          <div className="form-field-counter">
            <div>
              <FieldError message={errors.title} />
            </div>
            <span>{form.title.length}/300</span>
          </div>
        </div>

        {/* Body */}
        <div className="form-field form-field-with-counter">
          <label htmlFor="body">
            Content <span className="required">*</span>
          </label>
          <textarea
            id="body"
            placeholder="Explain your question or problem in detail..."
            value={form.body}
            onChange={(e) => setField("body", e.target.value)}
            style={{
              borderColor: errors.body ? "var(--red)" : undefined,
            }}
          />
          <div className="form-field-counter">
            <div>
              <FieldError message={errors.body} />
            </div>
            <span>{form.body.length} characters</span>
          </div>
        </div>

        {/* Tags */}
        <div className="form-field">
          <label>
            Tags{" "}
            <span style={{ color: "var(--black-500)", fontWeight: 400 }}>
              (optional, max 5)
            </span>
          </label>

          {form.selectedTags.length > 0 && (
            <div className="tags-display">
              {form.selectedTags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  onRemove={() => removeTag(tag.id)}
                />
              ))}
            </div>
          )}

          {form.selectedTags.length < 5 && (
            <div className="tags-input-container">
              <input
                ref={tagInputRef}
                type="text"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => {
                  setTagSearch(e.target.value);
                  setShowTagDropdown(true);
                }}
                onFocus={() => setShowTagDropdown(true)}
              />

              {showTagDropdown && filteredTags.length > 0 && (
                <div ref={tagDropdownRef} className="tags-dropdown">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        addTag(tag);
                        setTagSearch("");
                        setShowTagDropdown(false);
                        tagInputRef.current?.focus();
                      }}
                      className="tags-dropdown-item"
                    >
                      <TagBadge tag={tag} />
                      {tag.usage_count > 0 && (
                        <span className="tags-dropdown-usage">
                          {tag.usage_count}×
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {showTagDropdown &&
                filteredTags.length === 0 &&
                tagSearch.length > 0 && (
                  <div ref={tagDropdownRef} className="tags-dropdown">
                    <div className="tags-empty-message">
                      Tag "{tagSearch}" not found.
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        <hr className="form-divider" />

        {/* Points info */}
        <div className="form-points-info">
          <span>
            ⬡ <strong>{user?.reputation_points ?? 0} points</strong>
          </span>
          <span>— minimum 15 points to post</span>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => {
              reset();
              navigate(-1);
            }}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-submit">
            {isSubmitting ? (
              <>
                <span className="spinner" />
                Submitting...
              </>
            ) : (
              "Create Post"
            )}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="create-post-tips">
        <h4>💡 Tips for writing a good post:</h4>
        <ul>
          <li>Write a specific and clear title</li>
          <li>Provide context: what have you already tried?</li>
          <li>Use relevant tags so it can be easily found</li>
          <li>Choose the appropriate category</li>
        </ul>
      </div>
    </main>
  );
}
