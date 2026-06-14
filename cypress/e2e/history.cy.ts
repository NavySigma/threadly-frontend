const API = "https://navysigma.alwaysdata.net/api";

// ── Constants ────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: "user-1",
  username: "eris",
  email: "eris@gmail.com",
  avatar_url: null,
  bio: "Bio saya",
  reputation_points: 120,
  level: 2,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  roles: [] as { id: string; name: string }[],
};

const ADMIN_USER = {
  id: "admin-self",
  username: "superadmin",
  email: "admin@forum.com",
  avatar_url: null,
  bio: "I am not a King I am not a God, I am Atomic.",
  reputation_points: 9999,
  level: 99,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  roles: [{ id: "role-admin", name: "admin" }],
};

// ── Mock Data ────────────────────────────────────────────────────────────

const MOCK_POINTS_HISTORY = {
  summary: { current_points: 120, total_earned: 45, total_deducted: 10 },
  data: [
    { id: 1, action_type: "create_post", description: "Membuat postingan baru", points: 10, created_at: "2025-06-10T08:30:00.000Z" },
    { id: 2, action_type: "upvote_received", description: "Postingan mendapat upvote", points: 5, created_at: "2025-06-09T14:00:00.000Z" },
    { id: 3, action_type: "accept_answer", description: "Jawaban diterima sebagai solusi", points: 15, created_at: "2025-06-08T10:00:00.000Z" },
    { id: 4, action_type: "create_comment", description: "Membuat komentar", points: 2, created_at: "2025-06-07T09:00:00.000Z" },
    { id: 5, action_type: "upvote_received", description: "Komentar mendapat upvote", points: 3, created_at: "2025-06-06T16:00:00.000Z" },
    { id: 6, action_type: "content_reported", description: "Konten dilaporkan", points: -10, created_at: "2025-06-05T11:00:00.000Z" },
    { id: 7, action_type: "create_post", description: "Postingan kedua", points: 10, created_at: "2025-06-04T08:00:00.000Z" },
    { id: 8, action_type: "upvote_received", description: "Postingan mendapat upvote lain", points: 5, created_at: "2025-06-03T12:00:00.000Z" },
    { id: 9, action_type: "create_comment", description: "Komentar kedua", points: 2, created_at: "2025-06-02T10:00:00.000Z" },
    { id: 10, action_type: "accept_answer", description: "Jawaban diterima lagi", points: 15, created_at: "2025-06-01T15:00:00.000Z" },
    { id: 11, action_type: "create_post", description: "Postingan ketiga", points: 3, created_at: "2025-05-30T09:00:00.000Z" },
  ],
};

const MOCK_EDIT_HISTORY = {
  data: [
    { id: "eh-1", type: "post", title: "Best practices React component structure?", author: "navyz", editor: "superadmin", editor_avatar: null, body_before: "Halo teman-teman, gua lagi mengerjakan project React", body_after: "Halo teman-teman, saya sedang mengerjakan project React", reason: "Perbaikan typo", edited_at: "2025-06-10T08:30:00.000Z" },
    { id: "eh-2", type: "comment", title: null, author: "eris", editor: "superadmin", editor_avatar: null, body_before: "Coba pake useMemo aja bro", body_after: "Coba pake useMemo saja", reason: "Sopan santun", edited_at: "2025-06-10T09:15:00.000Z" },
    { id: "eh-3", type: "post", title: "Tips animasi TailwindCSS biar smooth", author: "navyz", editor: "moderator1", editor_avatar: null, body_before: "Gua lagi explore animasi di TailwindCSS", body_after: "Saya sedang explore animasi di TailwindCSS", reason: null, edited_at: "2025-06-09T14:00:00.000Z" },
  ],
  meta: { current_page: 1, last_page: 1, per_page: 20, total: 3 },
};

const MOCK_POINTS_RESPONSE = {
  user: { id: "user-1", username: "navyz", avatar_url: null },
  summary: { current_points: 250, total_earned: 350, total_deducted: 100 },
  data: {
    data: [
      { id: 1, action_type: "create_post", description: "Membuat post: Best practices React", points: 10, created_at: "2025-06-01T10:00:00.000Z" },
      { id: 2, action_type: "upvote_received", description: "Mendapat upvote di post X", points: 5, created_at: "2025-06-02T11:00:00.000Z" },
      { id: 3, action_type: "content_reported", description: "Postingan dilaporkan oleh moderator", points: -10, created_at: "2025-06-03T12:00:00.000Z" },
      { id: 4, action_type: "accept_answer", description: "Jawaban diterima sebagai solusi", points: 15, created_at: "2025-06-04T13:00:00.000Z" },
      { id: 5, action_type: "create_comment", description: "Membuat komentar di post Y", points: 2, created_at: "2025-06-05T14:00:00.000Z" },
    ],
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────

function loginAs(user: typeof MOCK_USER) {
  cy.intercept("GET", `${API}/me`, {
    statusCode: 200,
    body: { data: user },
  }).as("meApi");

  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token");
  });
  cy.visit("/");
  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token");
  });
  cy.wait("@meApi");
  cy.get(".navbar-avatar", { timeout: 10000 }).should("exist");
}

function setupGlobalIntercepts() {
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
}

// ──────────────────────────────────────────────────────────────────────────
// 1. User's own Points History
// ──────────────────────────────────────────────────────────────────────────

describe("Points History", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    setupGlobalIntercepts();
    cy.clearLocalStorage();
    loginAs(MOCK_USER);
  });

  function visit() {
    cy.intercept("GET", `${API}/me/points`, {
      statusCode: 200,
      body: MOCK_POINTS_HISTORY,
    }).as("getPointsHistory");

    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/history");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.wait("@getPointsHistory");
  }

  it("menampilkan header dan 3 summary cards (current, earned, deducted)", () => {
    visit();
    cy.contains("Reputation History").should("exist");
    cy.contains("Current Reputation").should("exist");
    cy.contains("120").should("exist");
    cy.contains("Total Earned").should("exist");
    cy.contains("+45").should("exist");
    cy.contains("Total Deducted").should("exist");
  });

  it("menampilkan tabel riwayat dengan kolom Tanggal, Aktivitas, dan Poin", () => {
    visit();
    cy.contains("Tanggal").should("exist");
    cy.contains("Aktivitas").should("exist");
    cy.contains("Poin").should("exist");
    cy.contains("Membuat postingan baru").should("exist");
    cy.contains("Postingan mendapat upvote").should("exist");
    cy.contains("Jawaban diterima sebagai solusi").should("exist");
    cy.contains("Konten dilaporkan").should("exist");
    cy.contains("+10").should("exist");
    cy.contains("-10").should("exist");
  });

  it("filter Earned — hanya menampilkan riwayat poin positif", () => {
    visit();
    cy.contains("button", "Earned").click();
    cy.contains("+10").should("exist");
    cy.contains("+15").should("exist");
    cy.contains("-10").should("not.exist");
  });

  it("filter Deducted — hanya menampilkan riwayat poin negatif", () => {
    visit();
    cy.contains("button", "Deducted").click();
    cy.contains("-10").should("exist");
    cy.contains("Konten dilaporkan").should("exist");
    cy.contains("+10").should("not.exist");
  });

  it("pagination — menampilkan Previous/Next dan nomor halaman", () => {
    visit();
    cy.contains("Previous").should("exist");
    cy.contains("Next").should("exist");
    cy.contains("1").should("exist");
    cy.contains("2").should("exist");
    cy.contains("Next").click();
    cy.contains("Postingan ketiga").should("exist");
  });

  it("setiap item menampilkan action_type dan description", () => {
    visit();
    cy.contains("create_post").should("exist");
    cy.contains("upvote_received").should("exist");
    cy.contains("accept_answer").should("exist");
    cy.contains("content_reported").should("exist");
    cy.contains("create_comment").should("exist");
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 2. Admin - Edit History
// ──────────────────────────────────────────────────────────────────────────

describe("Admin - Edit History", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    setupGlobalIntercepts();
    cy.clearLocalStorage();
    loginAs(ADMIN_USER);
  });

  it("menampilkan daftar riwayat edit postingan dan komentar", () => {
    cy.intercept("GET", `${API}/admin/edit-history*`, { statusCode: 200, body: MOCK_EDIT_HISTORY }).as("getEditHistory");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/admin/edit-history");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.wait("@getEditHistory");

    cy.contains("Edit History").should("exist");
    cy.contains("3 riwayat edit").should("exist");
    cy.contains("Best practices React component structure?").should("exist");
    cy.contains("Tips animasi TailwindCSS biar smooth").should("exist");
    cy.contains("superadmin").should("exist");
    cy.contains("navyz").should("exist");
    cy.contains("eris").should("exist");
    cy.contains("Postingan").should("exist");
    cy.contains("Komentar").should("exist");
  });

  it("filter berdasarkan tipe Postingan", () => {
    const postOnly = { data: MOCK_EDIT_HISTORY.data.filter((h) => h.type === "post"), meta: { current_page: 1, last_page: 1, per_page: 20, total: 2 } };
    cy.intercept("GET", `${API}/admin/edit-history*`, { statusCode: 200, body: postOnly }).as("getPostEdits");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/admin/edit-history");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.wait("@getPostEdits");
    cy.contains("button", "Postingan").click();
    cy.contains("Best practices React component structure?").should("exist");
  });

  it("filter berdasarkan tipe Komentar", () => {
    const commentOnly = { data: MOCK_EDIT_HISTORY.data.filter((h) => h.type === "comment"), meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 } };
    cy.intercept("GET", `${API}/admin/edit-history*`, { statusCode: 200, body: commentOnly }).as("getCommentEdits");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/admin/edit-history");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.wait("@getCommentEdits");
    cy.contains("button", "Komentar").click();
    cy.contains("superadmin").should("exist");
  });

  it("menampilkan diff sebelum dan sesudah pada setiap item", () => {
    cy.intercept("GET", `${API}/admin/edit-history*`, { statusCode: 200, body: MOCK_EDIT_HISTORY }).as("getEditHistory");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/admin/edit-history");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.wait("@getEditHistory");
    cy.contains("Sebelum").should("exist");
    cy.contains("Sesudah").should("exist");
    cy.contains("Perbaikan typo").should("exist");
    cy.contains("Sopan santun").should("exist");
  });

  it("filter date — input date tersedia dan bisa digunakan", () => {
    cy.intercept("GET", `${API}/admin/edit-history*`, { statusCode: 200, body: MOCK_EDIT_HISTORY }).as("getEditHistory");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/admin/edit-history");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.wait("@getEditHistory");
    cy.get('input[type="date"]').should("exist");
  });
});

// ──────────────────────────────────────────────────────────────────────────
// 3. Admin - User Points History
// ──────────────────────────────────────────────────────────────────────────

describe("Admin - User Points History", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    setupGlobalIntercepts();
    cy.clearLocalStorage();
    loginAs(ADMIN_USER);
  });

  it("menampilkan halaman dengan form pencarian user", () => {
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/admin/user-points");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));

    cy.contains("Riwayat Poin User").should("exist");
    cy.get('input[placeholder="Cari user berdasarkan username..."]').should("be.visible");
    cy.contains("button", "Cari").should("be.visible");
    cy.contains("Silakan cari user terlebih dahulu").should("exist");
  });

  it("mencari user yang ada — menampilkan info user, summary, dan riwayat poin", () => {
    cy.intercept("GET", `${API}/users?search=navyz*`, { statusCode: 200, body: { data: [{ id: "user-1", username: "navyz" }], meta: { total: 1 } } }).as("searchUser");
    cy.intercept("GET", `${API}/users/user-1/points`, { statusCode: 200, body: MOCK_POINTS_RESPONSE }).as("getPoints");

    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/admin/user-points");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));

    cy.get('input[placeholder="Cari user berdasarkan username..."]').should("be.visible").clear().type("navyz");
    cy.contains("button", "Cari").click();
    cy.wait("@searchUser");
    cy.wait("@getPoints");

    cy.contains("navyz").should("exist");
    cy.contains("ID: user-1").should("exist");
    cy.contains("250").should("exist");
    cy.contains("Poin Saat Ini").should("exist");
    cy.contains("350").should("exist");
    cy.contains("Total Diperoleh").should("exist");
    cy.contains("100").should("exist");
    cy.contains("Total Dikurangi").should("exist");
    cy.contains("Membuat post").should("exist");
    cy.contains("Mendapat upvote").should("exist");
    cy.contains("Konten dilaporkan").should("exist");
    cy.contains("Jawaban diterima").should("exist");
    cy.contains("Membuat komentar").should("exist");
  });

  it("filter earned — hanya menampilkan riwayat poin positif", () => {
    cy.intercept("GET", `${API}/users?search=navyz*`, { statusCode: 200, body: { data: [{ id: "user-1", username: "navyz" }], meta: { total: 1 } } }).as("searchUser");
    cy.intercept("GET", `${API}/users/user-1/points`, { statusCode: 200, body: MOCK_POINTS_RESPONSE }).as("getPoints");

    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/admin/user-points");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));

    cy.get('input[placeholder="Cari user berdasarkan username..."]').should("be.visible").clear().type("navyz");
    cy.contains("button", "Cari").click();
    cy.wait("@searchUser");
    cy.wait("@getPoints");

    cy.contains("button", "Diperoleh").click();
    cy.contains("+10").should("exist");
    cy.contains("+5").should("exist");
    cy.contains("+15").should("exist");
    cy.contains("+2").should("exist");
    cy.contains("-10").should("not.exist");
  });

  it("filter deducted — hanya menampilkan riwayat poin negatif", () => {
    cy.intercept("GET", `${API}/users?search=navyz*`, { statusCode: 200, body: { data: [{ id: "user-1", username: "navyz" }], meta: { total: 1 } } }).as("searchUser");
    cy.intercept("GET", `${API}/users/user-1/points`, { statusCode: 200, body: MOCK_POINTS_RESPONSE }).as("getPoints");

    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/admin/user-points");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));

    cy.get('input[placeholder="Cari user berdasarkan username..."]').should("be.visible").clear().type("navyz");
    cy.contains("button", "Cari").click();
    cy.wait("@searchUser");
    cy.wait("@getPoints");

    cy.contains("button", "Dikurangi").click();
    cy.contains("-10").should("exist");
    cy.contains("Konten dilaporkan").should("exist");
    cy.contains("+10").should("not.exist");
  });

  it("mencari user yang tidak ada — menampilkan pesan error", () => {
    cy.intercept("GET", `${API}/users?search=takada*`, { statusCode: 200, body: { data: [], meta: { total: 0 } } }).as("searchNotFound");

    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
    cy.visit("/admin/user-points");
    cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));

    cy.get('input[placeholder="Cari user berdasarkan username..."]').should("be.visible").clear().type("takada");
    cy.contains("button", "Cari").click();
    cy.wait("@searchNotFound");
    cy.contains("User tidak ditemukan").should("exist");
  });
});
