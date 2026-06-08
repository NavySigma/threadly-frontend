// import { Link, useNavigate, useParams } from "react-router-dom";
// import { usePostDetail } from "../../hooks/usePostDetail";
// import type { Post } from "../../api/posts";


// // ── Dummy data ────────────────────────────────────────────────────────────────
// export default function PostDetailPage() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const { post, isLoading, error } = usePostDetail(id!);

//   // sementara masih dummy
//   const comments = DUMMY_COMMENTS;

//   const isOwner = true;
//   const isLoggedIn = true;

//   if (isLoading) {
//     return (
//       <div
//         style={{
//           maxWidth: 860,
//           margin: "0 auto",
//           padding: "40px 0",
//           textAlign: "center",
//         }}
//       >
//         Loading...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div
//         style={{
//           maxWidth: 860,
//           margin: "0 auto",
//           padding: "40px 0",
//           textAlign: "center",
//           color: "red",
//         }}
//       >
//         {error}
//       </div>
//     );
//   }

//   if (!post) {
//     return (
//       <div
//         style={{
//           maxWidth: 860,
//           margin: "0 auto",
//           padding: "40px 0",
//           textAlign: "center",
//         }}
//       >
//         Post tidak ditemukan
//       </div>
//     );
//   }

//   const acceptedComment = comments.find(
//     (c) => c.id === post.accepted_answer_id
//   );

//   const otherComments = comments.filter(
//     (c) => c.id !== post.accepted_answer_id
//   );

//   const sortedComments = acceptedComment
//     ? [acceptedComment, ...otherComments]
//     : otherComments;

//   return (
//     <div style={{ maxWidth: 860, margin: "0 auto" }}>
//       {/* Breadcrumb */}
//       <div
//         style={{
//           fontSize: 13,
//           color: "#6a737c",
//           marginBottom: 12,
//           display: "flex",
//           alignItems: "center",
//           gap: 6,
//         }}
//       >
//         <button
//           onClick={() => navigate(-1)}
//           style={{
//             background: "none",
//             border: "none",
//             color: "#0074cc",
//             cursor: "pointer",
//             fontSize: 13,
//             padding: 0,
//           }}
//         >
//           ← Back
//         </button>

//         <span>/</span>

//         <span>{post.category.name}</span>
//       </div>

//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//           gap: 16,
//           marginBottom: 16,
//           paddingBottom: 16,
//           borderBottom: "1px solid #e3e6e8",
//         }}
//       >
//         <div style={{ flex: 1 }}>
//           <h1
//             style={{
//               fontSize: 22,
//               fontWeight: 700,
//               color: "#3b4045",
//               lineHeight: 1.35,
//               margin: 0,
//             }}
//           >
//             {post.title}
//           </h1>

//           <div
//             style={{
//               display: "flex",
//               gap: 20,
//               marginTop: 8,
//               fontSize: 13,
//               color: "#6a737c",
//               flexWrap: "wrap",
//             }}
//           >
//             <span>
//               Asked <strong>{timeAgo(post.created_at)}</strong>
//             </span>

//             <span>
//               Modified <strong>{timeAgo(post.updated_at)}</strong>
//             </span>

//             <span>
//               Viewed{" "}
//               <strong>{post.view_count.toLocaleString()}</strong> times
//             </span>

//             {post.is_answered && (
//               <span
//                 style={{
//                   color: "#2d6a1f",
//                   fontWeight: 600,
//                 }}
//               >
//                 ✓ Answered
//               </span>
//             )}
//           </div>
//         </div>

//         {isLoggedIn && (
//           <Link
//             to="/posts/create"
//             className="btn btn-orange"
//             style={{
//               whiteSpace: "nowrap",
//               flexShrink: 0,
//             }}
//           >
//             Ask Question
//           </Link>
//         )}
//       </div>

//       {/* Post asli dari API */}
//       <PostSection post={post} />

//       {/* Dummy answer sementara */}
//       <div style={{ marginTop: 28 }}>
//         <h2
//           style={{
//             fontSize: 20,
//             fontWeight: 700,
//             color: "#3b4045",
//             marginBottom: 0,
//           }}
//         >
//           {comments.length} Answer
//           {comments.length !== 1 ? "s" : ""}
//         </h2>

//         <div
//           style={{
//             display: "flex",
//             gap: 6,
//             margin: "12px 0 4px",
//             borderBottom: "1px solid #e3e6e8",
//             paddingBottom: 12,
//           }}
//         >
//           {[
//             "Highest score",
//             "Trending",
//             "Date modified",
//             "Date created",
//           ].map((s, i) => (
//             <button
//               key={s}
//               className={`filter-btn${i === 0 ? " active" : ""}`}
//               style={{ fontSize: 12 }}
//             >
//               {s}
//             </button>
//           ))}
//         </div>

//         {sortedComments.map((comment) => (
//           <CommentCard
//             key={comment.id}
//             comment={comment}
//             isAccepted={comment.id === post.accepted_answer_id}
//             canAccept={isOwner}
//           />
//         ))}
//       </div>

//       {isLoggedIn ? (
//         <AnswerForm />
//       ) : (
//         <div
//           style={{
//             marginTop: 32,
//             padding: 20,
//             background: "#f8f9f9",
//             border: "1px solid #e3e6e8",
//             borderRadius: 4,
//             textAlign: "center",
//             fontSize: 14,
//             color: "#6a737c",
//           }}
//         >
//           <Link
//             to="/login"
//             className="btn btn-primary"
//             style={{ marginRight: 8 }}
//           >
//             Log in
//           </Link>
//           to post an answer.
//         </div>
//       )}

//       <div style={{ height: 48 }} />
//     </div>
//   );
// }

// interface Comment {
//   id: string;
//   body: string;
//   vote_score: number;
//   is_accepted: boolean;
//   created_at: string;
//   user: { id: string; username: string; avatar_url: string | null; reputation_points?: number };
//   user_vote?: 1 | -1 | null;
// }

// const DUMMY_COMMENTS: Comment[] = [
//   {
//     id: "c1",
//     body: `Masalahnya adalah kamu memasukkan \`count\` ke dalam dependency array, tapi di dalam efek kamu juga mengubah nilai \`count\`. Ini membuat efek berjalan → count berubah → efek berjalan lagi → dst.

// Solusinya: gunakan functional update form:

// useEffect(() => {
//   fetchData(userId);
//   setCount(prev => prev + 1);
// }, [userId]);`,
//     vote_score: 8,
//     is_accepted: false,
//     created_at: new Date(Date.now() - 3600 * 4 * 1000).toISOString(),
//     user: { id: "u2", username: "sari_react", avatar_url: null, reputation_points: 1450 },
//     user_vote: null,
//   },
//   {
//     id: "c2",
//     body: `Tambahan — pakai useCallback agar fetchData punya stable reference:

// const fetchData = useCallback((id) => {
//   // fetch logic
// }, []);

// useEffect(() => {
//   fetchData(userId);
// }, [userId, fetchData]);`,
//     vote_score: 15,
//     is_accepted: true,
//     created_at: new Date(Date.now() - 3600 * 2 * 1000).toISOString(),
//     user: { id: "u3", username: "mas_fullstack", avatar_url: null, reputation_points: 3820 },
//     user_vote: 1,
//   },
//   {
//     id: "c3",
//     body: `Jangan lupa cleanup kalau ada subscription atau timer:

// useEffect(() => {
//   const id = setInterval(() => fetchData(userId), 5000);
//   return () => clearInterval(id);
// }, [userId, fetchData]);`,
//     vote_score: 4,
//     is_accepted: false,
//     created_at: new Date(Date.now() - 1800 * 1000).toISOString(),
//     user: { id: "u4", username: "dian_code", avatar_url: null, reputation_points: 670 },
//     user_vote: null,
//   },
// ];

// // ── Helpers ───────────────────────────────────────────────────────────────────
// function timeAgo(dateStr: string): string {
//   const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
//   if (diff < 60) return `${diff}s ago`;
//   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//   if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
//   return new Date(dateStr).toLocaleDateString();
// }

// function Avatar({
//   user,
//   size = 32,
// }: {
//   user: { username: string; avatar_url: string | null };
//   size?: number;
// }) {
//   return (
//     <div
//       style={{
//         width: size,
//         height: size,
//         borderRadius: "50%",
//         background: "var(--orange)",
//         color: "#fff",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontSize: size * 0.45,
//         fontWeight: 700,
//         flexShrink: 0,
//         overflow: "hidden",
//       }}
//     >
//       {user.avatar_url ? (
//         <img
//           src={user.avatar_url}
//           alt={user.username}
//           style={{ width: "100%", height: "100%", objectFit: "cover" }}
//         />
//       ) : (
//         user.username[0].toUpperCase()
//       )}
//     </div>
//   );
// }

// // ── Vote Widget ───────────────────────────────────────────────────────────────
// function VoteWidget({
//   score,
//   userVote,
//   onUpvote,
//   onDownvote,
// }: {
//   score: number;
//   userVote?: 1 | -1 | null;
//   onUpvote: () => void;
//   onDownvote: () => void;
// }) {
//   return (
//     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
//       <button
//         onClick={onUpvote}
//         title="Upvote"
//         style={{
//           width: 36,
//           height: 36,
//           borderRadius: "50%",
//           border: `2px solid ${userVote === 1 ? "var(--orange)" : "#d6d9dc"}`,
//           background: userVote === 1 ? "#fff3e6" : "#fff",
//           color: userVote === 1 ? "var(--orange)" : "#6a737c",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: 16,
//           transition: "all .15s",
//         }}
//       >
//         ▲
//       </button>
//       <span
//         style={{
//           fontWeight: 700,
//           fontSize: 18,
//           color: score > 0 ? "#2d6a1f" : score < 0 ? "#c0392b" : "#3b4045",
//           minWidth: 24,
//           textAlign: "center",
//         }}
//       >
//         {score}
//       </span>
//       <button
//         onClick={onDownvote}
//         title="Downvote"
//         style={{
//           width: 36,
//           height: 36,
//           borderRadius: "50%",
//           border: `2px solid ${userVote === -1 ? "#c0392b" : "#d6d9dc"}`,
//           background: userVote === -1 ? "#fdf0ee" : "#fff",
//           color: userVote === -1 ? "#c0392b" : "#6a737c",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: 16,
//           transition: "all .15s",
//         }}
//       >
//         ▼
//       </button>
//     </div>
//   );
// }

// // ── Post Body Section ─────────────────────────────────────────────────────────
// function PostSection({ post }: { post: Post }) {
//   const isLiked = false;
//   const userVote: 1 | -1 | null = null;

//   return (
//     <div
//       style={{
//         display: "flex",
//         gap: 16,
//         paddingBottom: 24,
//         borderBottom: "1px solid #e3e6e8",
//       }}
//     >
//       {/* Vote + Bookmark column */}
//       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minWidth: 44 }}>
//         <VoteWidget
//           score={post.vote_score}
//           userVote={userVote}
//           onUpvote={() => {}}
//           onDownvote={() => {}}
//         />
//         <button
//           title="Bookmark"
//           style={{
//             width: 36,
//             height: 36,
//             borderRadius: "50%",
//             border: `2px solid ${isLiked ? "var(--orange)" : "#d6d9dc"}`,
//             background: isLiked ? "#fff3e6" : "#fff",
//             color: isLiked ? "var(--orange)" : "#6a737c",
//             cursor: "pointer",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: 16,
//           }}
//         >
//           🔖
//         </button>
//       </div>

//       {/* Content */}
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <div className="post-tags" style={{ marginBottom: 12 }}>
//           <span style={{ fontSize: 12, color: "#6a737c", marginRight: 8 }}>
//             📁 {post.category.name}
//           </span>
//           {post.tags.map((tag) => (
//             <span
//               key={tag.id}
//               className="tag"
//               style={{ backgroundColor: tag.color ?? undefined }}
//             >
//               {tag.name}
//             </span>
//           ))}
//         </div>

//         <div
//           style={{
//             fontSize: 15,
//             lineHeight: 1.7,
//             color: "#3b4045",
//             whiteSpace: "pre-wrap",
//             marginBottom: 20,
//           }}
//         >
//           {post.body}
//         </div>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-end",
//             flexWrap: "wrap",
//             gap: 8,
//           }}
//         >
//           <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#6a737c" }}>
//             <Link to={`/posts/${post.id}/edit`} style={{ color: "#6a737c", textDecoration: "none" }}>
//               Edit
//             </Link>
//             <button
//               style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 13, padding: 0 }}
//             >
//               Delete
//             </button>
//           </div>

//           <div
//             style={{
//               background: "#f0f8ff",
//               border: "1px solid #d0e3f0",
//               borderRadius: 4,
//               padding: "8px 12px",
//               display: "flex",
//               alignItems: "center",
//               gap: 10,
//               fontSize: 13,
//             }}
//           >
//             <div style={{ color: "#6a737c", fontSize: 12, marginBottom: 2 }}>
//               asked {timeAgo(post.created_at)}
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//               <Avatar user={post.user} size={28} />
//               <div>
//                 <Link
//                   to={`/users/${post.user.id}`}
//                   style={{ color: "#0074cc", fontWeight: 600, textDecoration: "none", fontSize: 13 }}
//                 >
//                   {post.user.username}
//                 </Link>
//                 {post.user.reputation_points !== undefined && (
//                   <div style={{ color: "#6a737c", fontSize: 11 }}>
//                     ⬡ {post.user.reputation_points} pts
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Comment Card ──────────────────────────────────────────────────────────────
// function CommentCard({
//   comment,
//   isAccepted,
//   canAccept,
// }: {
//   comment: Comment;
//   isAccepted: boolean;
//   canAccept: boolean;
// }) {
//   return (
//     <div
//       id={`comment-${comment.id}`}
//       style={{
//         display: "flex",
//         gap: 16,
//         padding: "20px 0",
//         borderBottom: "1px solid #e3e6e8",
//         background: isAccepted ? "#f6fff0" : "transparent",
//         borderLeft: isAccepted ? "4px solid #2d6a1f" : "4px solid transparent",
//         paddingLeft: isAccepted ? 16 : 0,
//         transition: "background .2s",
//       }}
//     >
//       {/* Vote column */}
//       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 44 }}>
//         <VoteWidget
//           score={comment.vote_score}
//           userVote={comment.user_vote}
//           onUpvote={() => {}}
//           onDownvote={() => {}}
//         />
//         {canAccept && (
//           <button
//             title={isAccepted ? "Batalkan jawaban terpilih" : "Pilih sebagai jawaban terbaik"}
//             style={{
//               width: 36,
//               height: 36,
//               borderRadius: "50%",
//               border: `2px solid ${isAccepted ? "#2d6a1f" : "#d6d9dc"}`,
//               background: isAccepted ? "#e8f5e1" : "#fff",
//               color: isAccepted ? "#2d6a1f" : "#6a737c",
//               cursor: "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: 18,
//             }}
//           >
//             ✓
//           </button>
//         )}
//         <button
//           title="Bookmark komentar"
//           style={{
//             background: "none",
//             border: "none",
//             color: "#b0b8c1",
//             cursor: "pointer",
//             fontSize: 16,
//             padding: 4,
//           }}
//         >
//           🔖
//         </button>
//       </div>

//       {/* Content */}
//       <div style={{ flex: 1, minWidth: 0 }}>
//         {isAccepted && (
//           <div
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 6,
//               background: "#2d6a1f",
//               color: "#fff",
//               fontSize: 12,
//               fontWeight: 600,
//               padding: "2px 10px",
//               borderRadius: 12,
//               marginBottom: 10,
//             }}
//           >
//             ✓ Accepted Answer
//           </div>
//         )}

//         <div
//           style={{
//             fontSize: 15,
//             lineHeight: 1.7,
//             color: "#3b4045",
//             whiteSpace: "pre-wrap",
//             marginBottom: 16,
//           }}
//         >
//           {comment.body}
//         </div>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: 8,
//           }}
//         >
//           <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
//             <button style={{ background: "none", border: "none", color: "#6a737c", cursor: "pointer", fontSize: 13, padding: 0 }}>
//               Edit
//             </button>
//             <button style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 13, padding: 0 }}>
//               Delete
//             </button>
//           </div>

//           <div
//             style={{
//               background: "#f8f9f9",
//               border: "1px solid #e3e6e8",
//               borderRadius: 4,
//               padding: "6px 10px",
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//               fontSize: 12,
//             }}
//           >
//             <span style={{ color: "#6a737c" }}>answered {timeAgo(comment.created_at)}</span>
//             <Avatar user={comment.user} size={24} />
//             <Link
//               to={`/users/${comment.user.id}`}
//               style={{ color: "#0074cc", fontWeight: 600, textDecoration: "none" }}
//             >
//               {comment.user.username}
//             </Link>
//             {comment.user.reputation_points !== undefined && (
//               <span style={{ color: "#6a737c" }}>⬡ {comment.user.reputation_points}</span>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Answer Form ───────────────────────────────────────────────────────────────
// function AnswerForm() {
//   return (
//     <div style={{ marginTop: 32 }}>
//       <h2 style={{ fontSize: 20, fontWeight: 700, color: "#3b4045", marginBottom: 16 }}>
//         Your Answer
//       </h2>
//       <textarea
//         placeholder="Tulis jawabanmu di sini..."
//         rows={10}
//         style={{
//           width: "100%",
//           padding: "12px",
//           border: "1px solid #d6d9dc",
//           borderRadius: 4,
//           fontSize: 14,
//           lineHeight: 1.6,
//           resize: "vertical",
//           fontFamily: "inherit",
//           color: "#3b4045",
//           outline: "none",
//           boxSizing: "border-box",
//           marginBottom: 12,
//         }}
//         onFocus={(e) => (e.currentTarget.style.borderColor = "var(--orange)")}
//         onBlur={(e) => (e.currentTarget.style.borderColor = "#d6d9dc")}
//       />
//       <div style={{ display: "flex", justifyContent: "flex-end" }}>
//         <button className="btn btn-orange">Post Your Answer</button>
//       </div>
//     </div>
//   );
// }

// // ── Main Page ─────────────────────────────────────────────────────────────────
// export default function PostDetailPage() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   // TODO: ganti dengan hook real → const { post, comments, isLoading } = usePostDetail(id!)
//   const post = DUMMY_POST;
//   const comments = DUMMY_COMMENTS;
//   const isOwner = true;   // ganti: user?.id === post.user.id
//   const isLoggedIn = true;

//   const acceptedComment = comments.find((c) => c.id === post.accepted_answer_id);
//   const otherComments = comments.filter((c) => c.id !== post.accepted_answer_id);
//   const sortedComments = acceptedComment ? [acceptedComment, ...otherComments] : otherComments;

//   return (
//     <div style={{ maxWidth: 860, margin: "0 auto" }}>
//       {/* Breadcrumb */}
//       <div style={{ fontSize: 13, color: "#6a737c", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
//         <button
//           onClick={() => navigate(-1)}
//           style={{ background: "none", border: "none", color: "#0074cc", cursor: "pointer", fontSize: 13, padding: 0 }}
//         >
//           ← Back
//         </button>
//         <span>/</span>
//         <span>{post.category.name}</span>
//       </div>

//       {/* Title row */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//           gap: 16,
//           marginBottom: 16,
//           paddingBottom: 16,
//           borderBottom: "1px solid #e3e6e8",
//         }}
//       >
//         <div style={{ flex: 1 }}>
//           <h1 style={{ fontSize: 22, fontWeight: 700, color: "#3b4045", lineHeight: 1.35, margin: 0 }}>
//             {post.title}
//           </h1>
//           <div style={{ display: "flex", gap: 20, marginTop: 8, fontSize: 13, color: "#6a737c", flexWrap: "wrap" }}>
//             <span>Asked <strong>{timeAgo(post.created_at)}</strong></span>
//             <span>Modified <strong>{timeAgo(post.updated_at)}</strong></span>
//             <span>Viewed <strong>{post.view_count.toLocaleString()}</strong> times</span>
//             {post.is_answered && (
//               <span style={{ color: "#2d6a1f", fontWeight: 600 }}>✓ Answered</span>
//             )}
//           </div>
//         </div>
//         {isLoggedIn && (
//           <Link to="/posts/create" className="btn btn-orange" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
//             Ask Question
//           </Link>
//         )}
//       </div>

//       {/* Post body */}
//       <PostSection post={post} />

//       {/* Answers */}
//       <div style={{ marginTop: 28 }}>
//         <h2 style={{ fontSize: 20, fontWeight: 700, color: "#3b4045", marginBottom: 0 }}>
//           {comments.length} Answer{comments.length !== 1 ? "s" : ""}
//         </h2>
//         <div style={{ display: "flex", gap: 6, margin: "12px 0 4px", borderBottom: "1px solid #e3e6e8", paddingBottom: 12 }}>
//           {["Highest score", "Trending", "Date modified", "Date created"].map((s, i) => (
//             <button key={s} className={`filter-btn${i === 0 ? " active" : ""}`} style={{ fontSize: 12 }}>
//               {s}
//             </button>
//           ))}
//         </div>
//         {sortedComments.map((comment) => (
//           <CommentCard
//             key={comment.id}
//             comment={comment}
//             isAccepted={comment.id === post.accepted_answer_id}
//             canAccept={isOwner}
//           />
//         ))}
//       </div>

//       {/* Answer form or login prompt */}
//       {isLoggedIn ? (
//         <AnswerForm />
//       ) : (
//         <div
//           style={{
//             marginTop: 32,
//             padding: 20,
//             background: "#f8f9f9",
//             border: "1px solid #e3e6e8",
//             borderRadius: 4,
//             textAlign: "center",
//             fontSize: 14,
//             color: "#6a737c",
//           }}
//         >
//           <Link to="/login" className="btn btn-primary" style={{ marginRight: 8 }}>Log in</Link>
//           to post an answer.
//         </div>
//       )}

//       <div style={{ height: 48 }} />
//     </div>
//   );
// }