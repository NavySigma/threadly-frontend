/**
 * E2E Tests — Notifikasi
 *
 * Skenario yang diuji:
 * 1. halaman notifikasi tampil — inbox ter-render dengan daftar notifikasi
 * 2. badge unread count tampil — angka unread muncul di sidebar
 * 3. tandai satu notifikasi selesai — PATCH /notifications/:id/read dipanggil, notif pindah ke done
 * 4. tandai semua selesai — PATCH /notifications/read-all dipanggil
 * 5. switch ke tab "Done" — notif is_done=true tampil di box done
 * 6. kembalikan notif ke inbox — PATCH /notifications/:id/undone dipanggil
 * 7. filter kategori "Posts" — hanya notif kategori posts yang tampil
 * 8. notifikasi kosong — empty state tampil
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

const MOCK_NOTIF_UPVOTE = {
  id: "notif-001",
  type: "upvote_post",
  category: "posts",
  is_read: false,
  is_done: false,
  actor: { id: "user-other", username: "otheruser", email: "other@mail.com", avatar_url: null, bio: null, reputation_points: 50, level: 1, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  target_id: "post-abc",
  target_type: "post",
  target_title: "Bagaimana cara React hooks?",
  post_id: "post-abc",
  message: null,
  created_at: "2024-06-01T10:00:00.000Z",
  read_at: null,
};

const MOCK_NOTIF_FOLLOW = {
  id: "notif-002",
  type: "follow_user",
  category: "users",
  is_read: false,
  is_done: false,
  actor: { id: "user-follower", username: "follower", email: "f@mail.com", avatar_url: null, bio: null, reputation_points: 10, level: 1, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  target_id: null,
  target_type: null,
  target_title: null,
  post_id: null,
  message: null,
  created_at: "2024-06-01T09:00:00.000Z",
  read_at: null,
};

const MOCK_NOTIF_DONE = {
  id: "notif-003",
  type: "accepted_answer",
  category: "comments",
  is_read: true,
  is_done: true,
  actor: { id: "user-asker", username: "asker", email: "a@mail.com", avatar_url: null, bio: null, reputation_points: 30, level: 1, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  target_id: "comment-xyz",
  target_type: "comment",
  target_title: "Bagaimana cara React hooks?",
  post_id: "post-abc",
  message: null,
  created_at: "2024-05-31T10:00:00.000Z",
  read_at: "2024-05-31T11:00:00.000Z",
};

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════

function doLogin(userOverride: Partial<typeof MOCK_USER> = {}) {
  const user = { ...MOCK_USER, ...userOverride };

  cy.intercept("POST", `${API}/login`, {
    statusCode: 200,
    body: {
      access_token: "cypress-fake-token-notif",
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

function stubNotifications(
  inbox: object[],
  done: object[] = [],
  unreadCount = 0
) {
  // Inbox (is_done=false atau tanpa filter)
  cy.intercept("GET", `${API}/notifications*`, (req) => {
    const url = new URL(req.url);
    const isDone = url.searchParams.get("is_done");
    if (isDone === "true") {
      req.reply({
        statusCode: 200,
        body: {
          data: done,
          meta: { unread_count: 0, total_count: done.length },
        },
      });
    } else {
      req.reply({
        statusCode: 200,
        body: {
          data: inbox,
          meta: { unread_count: unreadCount, total_count: inbox.length },
        },
      });
    }
  }).as("getNotifications");
}

function visitNotifications() {
  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-notif");
  });
  cy.visit("/notifications");
  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-notif");
  });
  cy.wait("@getNotifications");
}

// ══════════════════════════════════════════════════════════════════════
// TEST SUITE
// ══════════════════════════════════════════════════════════════════════

describe("Notifikasi", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);

    // Stub global layout endpoints
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

  // ─────────────────────────────────────────────────────────────────
  // 1. halaman notifikasi tampil
  // ─────────────────────────────────────────────────────────────────
  it("halaman notifikasi tampil — inbox ter-render dengan daftar notifikasi", () => {
    cy.clearLocalStorage();
    doLogin();
    stubNotifications([MOCK_NOTIF_UPVOTE, MOCK_NOTIF_FOLLOW], [], 2);
    visitNotifications();

    cy.contains("Inbox Notifikasi").should("be.visible");
    // Notif upvote: teks "memberi upvote" & judul postingan
    cy.contains("memberi upvote").should("be.visible");
    cy.contains("Bagaimana cara React hooks?").should("be.visible");
    // Notif follow
    cy.contains("mulai mengikuti kamu").should("be.visible");
  });

  // ─────────────────────────────────────────────────────────────────
  // 2. badge unread count tampil di sidebar
  // ─────────────────────────────────────────────────────────────────
  it("badge unread count tampil — angka unread muncul di tombol Inbox sidebar", () => {
    cy.clearLocalStorage();
    doLogin();
    stubNotifications([MOCK_NOTIF_UPVOTE, MOCK_NOTIF_FOLLOW], [], 2);
    visitNotifications();

    cy.get(".badge-count").should("be.visible").and("contain.text", "2");
  });

  // ─────────────────────────────────────────────────────────────────
  // 3. tandai satu notifikasi selesai
  // ─────────────────────────────────────────────────────────────────
  it("tandai satu notifikasi selesai — PATCH /notifications/:id/read dipanggil", () => {
    cy.clearLocalStorage();
    doLogin();
    stubNotifications([MOCK_NOTIF_UPVOTE], [], 1);
    visitNotifications();

    cy.intercept("PATCH", `${API}/notifications/${MOCK_NOTIF_UPVOTE.id}/read`, {
      statusCode: 200,
      body: { message: "Notifikasi ditandai selesai." },
    }).as("markDone");

    // Klik tombol "Selesai" pada notifikasi pertama
    cy.contains("button", "Selesai").first().click();
    cy.wait("@markDone").then((interception) => {
      expect(interception.request.method).to.equal("PATCH");
      expect(interception.request.url).to.include(`/notifications/${MOCK_NOTIF_UPVOTE.id}/read`);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 4. tandai semua selesai
  // ─────────────────────────────────────────────────────────────────
  it("tandai semua selesai — PATCH /notifications/read-all dipanggil", () => {
    cy.clearLocalStorage();
    doLogin();
    stubNotifications([MOCK_NOTIF_UPVOTE, MOCK_NOTIF_FOLLOW], [], 2);
    visitNotifications();

    cy.intercept("PATCH", `${API}/notifications/read-all`, {
      statusCode: 200,
      body: { message: "Semua notifikasi sudah ditandai selesai." },
    }).as("markAllDone");

    cy.contains("button", "Tandai semua selesai").should("be.visible").click();
    cy.wait("@markAllDone").then((interception) => {
      expect(interception.request.method).to.equal("PATCH");
      expect(interception.request.url).to.include("/notifications/read-all");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 5. switch ke tab "Done" — notif is_done=true tampil
  // ─────────────────────────────────────────────────────────────────
  it("switch ke tab Done — notifikasi yang sudah selesai tampil", () => {
    cy.clearLocalStorage();
    doLogin();
    stubNotifications([MOCK_NOTIF_UPVOTE], [MOCK_NOTIF_DONE], 1);
    visitNotifications();

    // Klik tombol "Done" di sidebar
    cy.get(".sidebar-nav-btn").contains("Done").click();
    cy.wait("@getNotifications");

    cy.contains("Notifikasi Selesai").should("be.visible");
    cy.contains("Jawabanmu ditandai sebagai jawaban benar").should("be.visible");
  });

  // ─────────────────────────────────────────────────────────────────
  // 6. kembalikan notif ke inbox (undone)
  // ─────────────────────────────────────────────────────────────────
  it("kembalikan notif ke inbox — PATCH /notifications/:id/undone dipanggil", () => {
    cy.clearLocalStorage();
    doLogin();

    // Pasang intercept undone SEBELUM apapun
    cy.intercept("PATCH", `${API}/notifications/${MOCK_NOTIF_DONE.id}/undone`, {
      statusCode: 200,
      body: { message: "Notifikasi dikembalikan ke inbox." },
    }).as("markUndone");

    // inbox kosong, done berisi satu notif
    stubNotifications([], [MOCK_NOTIF_DONE], 0);
    visitNotifications();

    // Pindah ke tab Done
    cy.get(".sidebar-nav-btn").contains("Done").click();
    cy.wait("@getNotifications");

    // Notif done harus ter-render
    cy.contains("Jawabanmu ditandai sebagai jawaban benar").should("be.visible");

    // Klik tombol "Inbox" (undone) — gunakan title attribute untuk selector spesifik
    cy.get('.btn-action[title="Kembalikan ke Inbox"]').first().click();

    cy.wait("@markUndone").then((interception) => {
      expect(interception.request.method).to.equal("PATCH");
      expect(interception.request.url).to.include(`/notifications/${MOCK_NOTIF_DONE.id}/undone`);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 7. filter kategori "Posts"
  // ─────────────────────────────────────────────────────────────────
  it("filter kategori Posts — hanya notifikasi kategori posts yang tampil", () => {
    cy.clearLocalStorage();
    doLogin();

    // Stub: tanpa filter → semua notif; dengan filter category=posts → hanya upvote
    cy.intercept("GET", `${API}/notifications*`, (req) => {
      const url = new URL(req.url);
      const category = url.searchParams.get("category");
      if (category === "posts") {
        req.reply({
          statusCode: 200,
          body: {
            data: [MOCK_NOTIF_UPVOTE],
            meta: { unread_count: 1, total_count: 1 },
          },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: {
            data: [MOCK_NOTIF_UPVOTE, MOCK_NOTIF_FOLLOW],
            meta: { unread_count: 2, total_count: 2 },
          },
        });
      }
    }).as("getNotifications");

    visitNotifications();

    // Sebelum filter: kedua notif tampil
    cy.contains("memberi upvote").should("be.visible");
    cy.contains("mulai mengikuti kamu").should("be.visible");

    // Klik filter "Posts"
    cy.get(".sidebar-nav-btn").contains("Posts").click();
    cy.wait("@getNotifications");

    // Setelah filter: hanya notif posts
    cy.contains("memberi upvote").should("be.visible");
    cy.contains("mulai mengikuti kamu").should("not.exist");
  });

  // ─────────────────────────────────────────────────────────────────
  // 8. notifikasi kosong — empty state tampil
  // ─────────────────────────────────────────────────────────────────
  it("notifikasi kosong — empty state tampil dengan pesan yang sesuai", () => {
    cy.clearLocalStorage();
    doLogin();
    stubNotifications([], [], 0);
    visitNotifications();

    cy.contains("Tidak ada notifikasi").should("be.visible");
    cy.contains("Kamu sudah membaca semua notifikasi").should("be.visible");
  });
});

export {};
