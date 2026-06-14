/**
 * E2E Tests — Vote (Post & Komentar)
 *
 * Skenario yang diuji:
 * 1. klik vote tanpa login      — skor tidak berubah (API return 401)
 * 2. klik upvote postingan      — skor post naik +1, payload benar
 * 3. klik upvote komentar       — skor komentar naik +1, payload benar
 * 4. klik downvote postingan    — skor post turun -1, payload benar
 * 5. klik upvote postingan      — skor naik +1, tombol berubah ke aktif
 *
 * Strategi login: sama seperti profile.cy.ts — mock POST /login & GET /me
 * dengan URL lengkap backend agar AuthContext menyimpan token secara normal.
 */

// ══════════════════════════════════════════════════════════════════════
// KONSTANTA
// ══════════════════════════════════════════════════════════════════════

const API = "https://navysigma.alwaysdata.net/api";

const TEST_EMAIL    = "eris@gmail.com";
const TEST_PASSWORD = "ErisRahma123";

// ── Fixtures ─────────────────────────────────────────────────────────

const MOCK_USER = {
  id: "user-self",
  username: "eris",
  email: TEST_EMAIL,
  avatar_url: null as string | null,
  bio: "Bio saya",
  reputation_points: 120,
  level: 2,
  level_title: "Explorer",
  next_level_points: 300,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  roles: [] as { id: string; name: string }[],
};

const MOCK_POST = {
  id: "post-abc123",
  title: "Bagaimana cara menggunakan React hooks?",
  body: "Saya ingin belajar tentang useState dan useEffect.",
  status: "open",
  view_count: 42,
  vote_score: 5,
  is_answered: false,
  accepted_answer_id: null,
  comments_count: 1,
  is_liked: false,
  likes_count: 0,
  user_vote: null as string | null,
  created_at: "2024-06-01T10:00:00.000Z",
  updated_at: "2024-06-01T10:00:00.000Z",
  closed_at: null,
  user: {
    id: "user-other",       // berbeda dari MOCK_USER.id agar isOwner = false
    username: "otheruser",
    avatar_url: null,
    reputation_points: 50,
    level: 1,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  category: { id: "cat-1", name: "React", slug: "react", description: null },
  tags: [{ id: "tag-1", name: "react", slug: "react", color: "#61dafb" }],
};

// Komentar dibuat oleh user-commenter agar canVote = true saat MOCK_USER login
const MOCK_COMMENT = {
  id: "comment-xyz",
  body: "Ini adalah komentar test.",
  vote_score: 3,
  user_vote: null as string | null,
  is_accepted: false,
  created_at: "2024-06-01T11:00:00.000Z",
  updated_at: "2024-06-01T11:00:00.000Z",
  user: {
    id: "user-commenter",   // berbeda dari MOCK_USER.id agar canVote = true
    username: "commenter",
    avatar_url: null,
    reputation_points: 20,
    level: 1,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  likes_count: 0,
  is_liked: false,
  post_id: MOCK_POST.id,
  replies: [],
};

// ══════════════════════════════════════════════════════════════════════
// HELPER: SETUP MOCK + LOGIN (sama persis dengan profile.cy.ts)
// ══════════════════════════════════════════════════════════════════════
function doLogin(userOverride: Partial<typeof MOCK_USER> = {}) {
  const user = { ...MOCK_USER, ...userOverride };

  // Mock POST /login — kembalikan fake access_token + user
  cy.intercept("POST", `${API}/login`, {
    statusCode: 200,
    body: {
      access_token: "cypress-fake-token-vote",
      token_type: "Bearer",
      user,
    },
  }).as("loginApi");

  // Mock GET /me — dipanggil AuthContext saat mount & setelah login
  cy.intercept("GET", `${API}/me`, {
    statusCode: 200,
    body: { data: user },
  }).as("meApi");

  // Buka halaman login
  cy.visit("/login");
  cy.get("#email").should("be.visible").clear().type(TEST_EMAIL);
  cy.get("#password").should("be.visible").clear().type(TEST_PASSWORD);
  cy.get('button[type="submit"]').click();

  // Tunggu request login selesai
  cy.wait("@loginApi");

  // Pastikan sudah redirect keluar dari /login
  cy.url().should("not.include", "/login");

  // Pastikan user avatar / profile link di navbar sudah terlihat (indikasi session sudah dimuat di React state)
  cy.get(".navbar-avatar", { timeout: 10000 }).should("be.visible");
}

function setupPostPage(withComment = false, isLoggedIn = true) {
  if (isLoggedIn) {
    // Mock /me agar AuthContext tahu user sudah login
    cy.intercept("GET", `${API}/me`, {
      statusCode: 200,
      body: { data: MOCK_USER },
    }).as("meApi");
  } else {
    cy.intercept("GET", `${API}/me`, {
      statusCode: 401,
      body: {},
    }).as("meApi");
  }

  cy.intercept("GET", `${API}/posts/${MOCK_POST.id}`, {
    statusCode: 200,
    body: { data: { ...MOCK_POST, user_vote: null } },
  }).as("getPost");

  cy.intercept("GET", `${API}/posts/${MOCK_POST.id}/comments*`, {
    statusCode: 200,
    body: {
      data: withComment ? [MOCK_COMMENT] : [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: withComment ? 1 : 0,
        from: withComment ? 1 : null,
        to: withComment ? 1 : null,
      },
    },
  }).as("getComments");

  // Set token di localStorage SEBELUM visit agar AuthContext bisa baca saat mount
  if (isLoggedIn) {
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-vote");
    });
  }

  cy.visit(`/posts/${MOCK_POST.id}`);

  // Set token lagi di window baru SETELAH visit (untuk memastikan token ada di window yang aktif)
  if (isLoggedIn) {
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-vote");
    });
  }

  cy.wait("@getPost");
  if (withComment) cy.wait("@getComments");

  // Pastikan judul postingan sudah muncul di layar (menandakan loading selesai)
  cy.contains(MOCK_POST.title).should("be.visible");

  // Jika login, pastikan session navbar juga termuat sebelum lanjut pengetesan
  if (isLoggedIn) {
    cy.get(".navbar-avatar", { timeout: 10000 }).should("be.visible");
  }
}
// ══════════════════════════════════════════════════════════════════════
// TEST SUITE
// ══════════════════════════════════════════════════════════════════════

describe("Vote", () => {
  beforeEach(() => {
    // Intercept endpoint global/layout untuk mencegah error API unhandled/pending saat redirect
    cy.intercept("GET", `${API}/notifications*`, {
      statusCode: 200,
      body: { data: [], meta: { unread_count: 0 } },
    }).as("globalNotifications");

    cy.intercept("GET", `${API}/stats/community`, {
      statusCode: 200,
      body: { data: { users_online: 5, questions: 10, answers: 20, upvotes: 30 } },
    }).as("globalStats");

    cy.intercept("GET", `${API}/posts?*`, {
      statusCode: 200,
      body: { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } },
    }).as("globalPostsList");

    cy.intercept("GET", `${API}/tags*`, {
      statusCode: 200,
      body: { data: [] },
    }).as("globalTags");
  });

  // 1. klik vote tanpa login —————————————————————————————————————————
  it("klik vote tanpa login — skor tidak berubah karena API return 401", () => {
    cy.clearLocalStorage();

    // Mock vote API mengembalikan 401 (unauthorized)
    cy.intercept("POST", `${API}/votes`, {
      statusCode: 401,
      body: { message: "Unauthenticated." },
    }).as("postVote");

    setupPostPage(false, false);

    const initialScore = MOCK_POST.vote_score;

    // Klik upvote — request dikirim tapi gagal (401)
    cy.get("[data-cy=post-upvote]").should("be.visible").click();
    cy.wait("@postVote");

    // Skor tidak berubah
    cy.get("[data-cy=post-upvote]").parent().within(() => {
      cy.get("span").should("have.text", initialScore.toString());
    });
  });

  // 2. klik upvote postingan ————————————————————————————————————————
  it("klik upvote postingan — skor bertambah +1 dan request dikirim ke API", () => {
    cy.clearLocalStorage();
    doLogin();
    setupPostPage(false, true);

    cy.intercept("POST", `${API}/votes`, {
      statusCode: 200,
      body: { message: "Vote berhasil", success: true },
    }).as("postVote");

    const initialScore = MOCK_POST.vote_score;

    // Klik upvote post
    cy.get("[data-cy=post-upvote]").should("be.visible").click();
    cy.wait("@postVote").then((interception) => {
      const body = typeof interception.request.body === "string"
        ? JSON.parse(interception.request.body)
        : interception.request.body;
      expect(body.vote_type).to.equal("upvote");
      expect(body.target_type).to.equal("post");
      expect(body.target_id).to.equal(MOCK_POST.id);
    });

    // Skor naik +1
    cy.get("[data-cy=post-upvote]").parent().within(() => {
      cy.get("span").should("have.text", (initialScore + 1).toString());
    });
  });

  // 3. klik upvote komentar —————————————————————————————————————————
  it("klik upvote komentar — skor komentar bertambah +1 dan request dikirim ke API", () => {
    cy.clearLocalStorage();
    doLogin();
    setupPostPage(true, true);  // withComment = true

    cy.intercept("POST", `${API}/votes`, {
      statusCode: 200,
      body: { message: "Vote berhasil", success: true },
    }).as("commentVote");

    const initialCommentScore = MOCK_COMMENT.vote_score;

    // Pastikan komentar sudah ter-render di layar
    cy.contains(MOCK_COMMENT.body).should("be.visible");

    // Pastikan tombol upvote komentar ada (canVote = true karena user login & bukan pemilik komentar)
    cy.get("[data-cy=comment-upvote]").should("be.visible").click();
    cy.wait("@commentVote").then((interception) => {
      const body = typeof interception.request.body === "string"
        ? JSON.parse(interception.request.body)
        : interception.request.body;
      expect(body.vote_type).to.equal("upvote");
      expect(body.target_type).to.equal("comment");
      expect(body.target_id).to.equal(MOCK_COMMENT.id);
    });

    // Skor komentar naik +1
    cy.get("[data-cy=comment-upvote]").parent().within(() => {
      cy.get("span").should("have.text", (initialCommentScore + 1).toString());
    });
  });

  // 4. klik downvote postingan —————————————————————————————————————─
  it("klik downvote postingan — skor berkurang -1 dan request dikirim ke API", () => {
    cy.clearLocalStorage();
    doLogin();
    setupPostPage(false, true);

    cy.intercept("POST", `${API}/votes`, {
      statusCode: 200,
      body: { message: "Vote berhasil", success: true },
    }).as("postVote");

    const initialScore = MOCK_POST.vote_score;

    // Klik downvote post
    cy.get("[data-cy=post-downvote]").should("be.visible").click();
    cy.wait("@postVote").then((interception) => {
      const body = typeof interception.request.body === "string"
        ? JSON.parse(interception.request.body)
        : interception.request.body;
      expect(body.vote_type).to.equal("downvote");
      expect(body.target_type).to.equal("post");
      expect(body.target_id).to.equal(MOCK_POST.id);
    });

    // Skor berkurang -1
    cy.get("[data-cy=post-downvote]").parent().within(() => {
      cy.get("span").should("have.text", (initialScore - 1).toString());
    });
  });

  // 5. klik upvote postingan (ulang) ————————————————————————————————
  it("klik upvote postingan (ulang) — skor konsisten +1 dan tombol berubah ke aktif", () => {
    cy.clearLocalStorage();
    doLogin();
    setupPostPage(false, true);

    cy.intercept("POST", `${API}/votes`, {
      statusCode: 200,
      body: { message: "Vote berhasil", success: true },
    }).as("postVote");

    const initialScore = MOCK_POST.vote_score;

    cy.get("[data-cy=post-upvote]").should("be.visible").click();
    cy.wait("@postVote");

    // Skor naik +1
    cy.get("[data-cy=post-upvote]").parent().within(() => {
      cy.get("span").should("have.text", (initialScore + 1).toString());
    });

    // Tombol upvote berubah ke style aktif hijau
    // Browser konversi hex ke RGB: #16a34a → rgb(22, 163, 74), #dcfce7 → rgb(220, 252, 231)
    cy.get("[data-cy=post-upvote]").should(($btn) => {
      const style = $btn.attr("style") ?? "";
      expect(style).to.match(/16a34a|dcfce7|22,\s*163,\s*74|220,\s*252,\s*231/);
    });
  });

});

export {};
