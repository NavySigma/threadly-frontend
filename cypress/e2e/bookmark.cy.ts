/**
 * E2E Tests — Bookmark
 *
 * Skenario yang diuji:
 * 1. bookmark postingan   — klik tombol bookmark, payload POST /bookmarks benar, status berubah menjadi "Disimpan"
 * 2. lihat halaman bookmark user — navigasi ke profil -> tab bookmarks, list postingan yang di-bookmark tampil
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
  id: "post-bookmark-001",
  title: "Postingan untuk test bookmark",
  body: "Isi postingan test bookmark.",
  status: "open",
  view_count: 10,
  vote_score: 0,
  is_answered: false,
  accepted_answer_id: null,
  comments_count: 0,
  is_liked: false,
  likes_count: 0,
  user_vote: null as string | null,
  created_at: "2024-06-01T10:00:00.000Z",
  updated_at: "2024-06-01T10:00:00.000Z",
  closed_at: null,
  user: {
    id: "user-other",
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

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════

function doLogin(userOverride: Partial<typeof MOCK_USER> = {}) {
  const user = { ...MOCK_USER, ...userOverride };

  cy.intercept("POST", `${API}/login`, {
    statusCode: 200,
    body: {
      access_token: "cypress-fake-token-like",
      token_type: "Bearer",
      user,
    },
  }).as("loginApi");

  cy.intercept("GET", `${API}/me`, {
    statusCode: 200,
    body: { data: user },
  }).as("meApi");

  cy.visit("/login");
  cy.get("#email").should("be.visible").clear().type(TEST_EMAIL);
  cy.get("#password").should("be.visible").clear().type(TEST_PASSWORD);
  cy.get('button[type="submit"]').click();
  cy.wait("@loginApi");
  cy.url().should("not.include", "/login");
  cy.get(".navbar-avatar", { timeout: 10000 }).should("be.visible");
}

function setupPostPage(isBookmarked = false) {
  cy.intercept("GET", `${API}/me`, {
    statusCode: 200,
    body: { data: MOCK_USER },
  }).as("meApi");

  cy.intercept("GET", `${API}/posts/${MOCK_POST.id}`, {
    statusCode: 200,
    body: { data: { ...MOCK_POST } },
  }).as("getPost");

  cy.intercept("GET", `${API}/posts/${MOCK_POST.id}/comments*`, {
    statusCode: 200,
    body: {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    },
  }).as("getComments");

  // Intercept check bookmark status
  cy.intercept("GET", `${API}/bookmarks/${MOCK_POST.id}/check`, {
    statusCode: 200,
    body: { is_bookmarked: isBookmarked },
  }).as("checkBookmark");

  // Set token sebelum visit
  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-like");
  });

  cy.visit(`/posts/${MOCK_POST.id}`);

  // Set token lagi di window baru setelah visit
  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-like");
  });

  cy.wait("@getPost");
  cy.wait("@checkBookmark");

  cy.contains(MOCK_POST.title).should("be.visible");
  cy.get(".navbar-avatar", { timeout: 10000 }).should("be.visible");
}

// ══════════════════════════════════════════════════════════════════════
// TEST SUITE
// ══════════════════════════════════════════════════════════════════════

describe("Bookmark", () => {
  beforeEach(() => {
    // Prevent application errors from failing the test
    cy.on("uncaught:exception", (err) => {
      return false;
    });

    // Mock endpoint global agar tidak error saat redirect
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

  // 1. bookmark postingan ─────────────────────────────────────────────
  it("bookmark postingan — klik tombol bookmark, request POST /bookmarks dikirim dengan payload benar", () => {
    cy.clearLocalStorage();
    doLogin();
    setupPostPage(false); // checkBookmark returns { is_bookmarked: false }

    cy.intercept("POST", `${API}/bookmarks`, {
      statusCode: 200,
      body: { message: "Bookmark berhasil disimpan" },
    }).as("addBookmark");

    // Pastikan tombol bookmark terlihat dan memiliki teks default "Simpan"
    cy.get("[data-cy=post-bookmark-btn]")
      .should("be.visible")
      .and("contain.text", "Simpan");

    // Klik tombol bookmark
    cy.get("[data-cy=post-bookmark-btn]").click();

    // Verifikasi payload yang dikirim ke API
    cy.wait("@addBookmark").then((interception) => {
      const body =
        typeof interception.request.body === "string"
          ? JSON.parse(interception.request.body)
          : interception.request.body;
      expect(body.post_id).to.equal(MOCK_POST.id);
    });

    // Verifikasi tombol berubah status menjadi "Disimpan" dan style warnanya berubah ke indigo (#4f46e5 / rgb(79, 70, 229))
    cy.get("[data-cy=post-bookmark-btn]")
      .should("contain.text", "Disimpan")
      .should(($btn) => {
        const style = $btn.attr("style") ?? "";
        // browser konversi hex #4f46e5 -> rgb(79, 70, 229)
        expect(style).to.match(/4f46e5|79,\s*70,\s*229/);
      });
  });

  // 2. lihat halaman bookmark user ─────────────────────────────────────
  it("lihat halaman bookmark user — navigasi ke profil dan tab bookmarks menampilkan postingan yang di-bookmark", () => {
    cy.clearLocalStorage();
    doLogin();

    // Mock API get bookmarks list
    cy.intercept("GET", `${API}/me/bookmarks`, {
      statusCode: 200,
      body: {
        current_page: 1,
        data: [
          {
            id: "bookmark-1",
            user_id: "user-self",
            post_id: MOCK_POST.id,
            created_at: "2024-06-01T12:00:00.000Z",
            post: MOCK_POST,
          },
        ],
        first_page_url: null,
        from: 1,
        last_page_url: null,
        last_page: 1,
        links: [],
        next_page_url: null,
        path: "/me/bookmarks",
        per_page: 10,
        prev_page_url: null,
        to: 1,
        total: 1,
      },
    }).as("meBookmarks");

    // Visit halaman profil
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-like");
    });
    cy.visit("/profile");
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-like");
    });

    // Klik tab bookmarks
    cy.get("[data-cy=profile-tab-bookmarks]").should("be.visible").click();

    // Tunggu data ter-fetch
    cy.wait("@meBookmarks");

    // Pastikan judul postingan yang di-bookmark tampil di halaman tersebut
    cy.contains(MOCK_POST.title).should("be.visible");
  });
});

export {};
