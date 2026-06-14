/**
 * E2E Tests — Report (Buat Laporan & Admin/Mod Kelola Laporan)
 *
 * Skenario yang diuji:
 * === User biasa ===
 * 1. laporkan postingan — klik tombol report, submit form, POST /reports dikirim dengan payload benar
 * 2. laporkan komentar  — idem untuk comment
 * 3. laporan gagal       — server 422, pesan error tampil
 *
 * === Admin / Moderator ===
 * 4. lihat daftar laporan    — GET /reports → tabel tampil dengan data laporan
 * 5. paginasi laporan        — klik "Next" → GET /reports?page=2
 * 6. lihat detail laporan    — klik baris laporan → navigasi ke /admin/reports/:id
 * 7. resolve laporan         — klik "Setujui & Hapus Konten", PATCH /reports/:id/resolve dipanggil
 * 8. hapus laporan           — klik "Hapus Laporan", DELETE /reports/:id dipanggil
 * 9. non-admin diblock       — redirect ke / jika bukan mod/admin
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

const MOCK_MOD_USER = {
  ...MOCK_USER,
  id: "user-mod",
  username: "moderator_eris",
  roles: [{ id: "role-mod", name: "moderator" }],
};

const MOCK_POST = {
  id: "post-report-001",
  title: "Postingan untuk test report",
  body: "Isi postingan yang akan dilaporkan.",
  status: "open",
  view_count: 5,
  vote_score: 0,
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
    id: "user-other",
    username: "otheruser",
    avatar_url: null,
    reputation_points: 50,
    level: 1,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  category: { id: "cat-1", name: "React", slug: "react", description: null },
  tags: [],
};

const MOCK_COMMENT = {
  id: "comment-report-001",
  body: "Komentar yang akan dilaporkan.",
  vote_score: 0,
  user_vote: null as string | null,
  is_accepted: false,
  created_at: "2024-06-01T11:00:00.000Z",
  updated_at: "2024-06-01T11:00:00.000Z",
  user: {
    id: "user-commenter",
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

const MOCK_REPORT = {
  id: "report-001",
  reporter_id: "user-self",
  target_id: MOCK_POST.id,
  target_type: "post",
  reason: "spam",
  description: "Postingan ini berisi konten spam.",
  status: "pending",
  resolved_by: null,
  created_at: "2024-06-01T12:00:00.000Z",
  resolved_at: null,
  reporter: { id: "user-self", username: "eris", avatar_url: null },
  resolver: null,
};

const MOCK_REPORT_RESOLVED = {
  ...MOCK_REPORT,
  id: "report-002",
  status: "resolved",
  resolved_by: "user-mod",
  resolved_at: "2024-06-02T10:00:00.000Z",
  resolver: { id: "user-mod", username: "moderator_eris", avatar_url: null },
};

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════

function doLogin(user = MOCK_USER) {
  cy.intercept("POST", `${API}/login`, {
    statusCode: 200,
    body: {
      access_token: "cypress-fake-token-report",
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

function setupPostPage(withComment = false) {
  cy.intercept("GET", `${API}/me`, {
    statusCode: 200,
    body: { data: MOCK_USER },
  }).as("meApi");

  cy.intercept("GET", `${API}/posts/${MOCK_POST.id}`, {
    statusCode: 200,
    body: { data: MOCK_POST },
  }).as("getPost");

  cy.intercept("GET", `${API}/posts/${MOCK_POST.id}/comments*`, {
    statusCode: 200,
    body: {
      data: withComment ? [MOCK_COMMENT] : [],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: withComment ? 1 : 0 },
    },
  }).as("getComments");

  cy.intercept("GET", `${API}/bookmarks/${MOCK_POST.id}/check`, {
    statusCode: 200,
    body: { is_bookmarked: false },
  }).as("checkBookmark");

  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-report");
  });

  cy.visit(`/posts/${MOCK_POST.id}`);

  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-report");
  });

  cy.wait("@getPost");
  cy.contains(MOCK_POST.title).should("be.visible");
  cy.get(".navbar-avatar", { timeout: 10000 }).should("be.visible");
}

function visitAdminReports() {
  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-report");
  });
  cy.visit("/admin/reports");
  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-report");
  });
}

// ══════════════════════════════════════════════════════════════════════
// TEST SUITE
// ══════════════════════════════════════════════════════════════════════

describe("Report — User Biasa", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);

    cy.intercept("GET", `${API}/notifications*`, {
      statusCode: 200,
      body: { data: [], meta: { unread_count: 0, total_count: 0 } },
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

  // 1. laporkan postingan ─────────────────────────────────────────────
  it("laporkan postingan — submit form report, POST /reports dikirim dengan payload benar", () => {
    cy.clearLocalStorage();
    doLogin();
    setupPostPage(false);

    cy.intercept("POST", `${API}/reports`, {
      statusCode: 201,
      body: { message: "Laporan berhasil dikirim." },
    }).as("createReport");

    // Stub window.alert agar tidak block
    cy.window().then((win) => {
      cy.stub(win, "alert").as("alertStub");
    });

    // Buka tombol report post (bukan owner — user-self vs user-other)
    cy.get("[data-cy=post-report-btn]").should("be.visible").click();

    // Form report muncul — input text alasan
    cy.get("[data-cy=report-reason-input]").should("be.visible").type("spam");

    // Submit
    cy.get("[data-cy=report-submit-btn]").should("not.be.disabled").click();

    // Verifikasi payload
    cy.wait("@createReport").then((interception) => {
      const body =
        typeof interception.request.body === "string"
          ? JSON.parse(interception.request.body)
          : interception.request.body;
      expect(body.target_type).to.equal("post");
      expect(body.target_id).to.equal(MOCK_POST.id);
      expect(body.reason).to.equal("spam");
    });

    // Alert sukses muncul
    cy.get("@alertStub").should("have.been.calledWithMatch", /berhasil/i);
  });

  // 2. laporkan komentar ──────────────────────────────────────────────
  it("laporkan komentar — submit form report komentar, POST /reports dikirim dengan target_type=comment", () => {
    cy.clearLocalStorage();
    doLogin();
    setupPostPage(true); // withComment = true

    cy.intercept("POST", `${API}/reports`, {
      statusCode: 201,
      body: { message: "Laporan berhasil dikirim." },
    }).as("createReport");

    cy.window().then((win) => {
      cy.stub(win, "alert").as("alertStub");
    });

    // Pastikan komentar ter-render
    cy.contains(MOCK_COMMENT.body).should("be.visible");

    // Buka tombol report komentar
    cy.get("[data-cy=comment-report-btn]").first().should("be.visible").click();

    // Input alasan
    cy.get("[data-cy=report-reason-input]").should("be.visible").type("harassment");

    // Submit
    cy.get("[data-cy=report-submit-btn]").should("not.be.disabled").click();

    // Verifikasi payload
    cy.wait("@createReport").then((interception) => {
      const body =
        typeof interception.request.body === "string"
          ? JSON.parse(interception.request.body)
          : interception.request.body;
      expect(body.target_type).to.equal("comment");
      expect(body.target_id).to.equal(MOCK_COMMENT.id);
      expect(body.reason).to.equal("harassment");
    });

    cy.get("@alertStub").should("have.been.calledWithMatch", /berhasil/i);
  });

  // 3. laporan gagal — server 422 ─────────────────────────────────────
  it("laporan gagal — server 422, alert error tampil", () => {
    cy.clearLocalStorage();
    doLogin();
    setupPostPage(false);

    cy.intercept("POST", `${API}/reports`, {
      statusCode: 422,
      body: { message: "Kamu sudah melaporkan konten ini sebelumnya." },
    }).as("createReportFail");

    cy.window().then((win) => {
      cy.stub(win, "alert").as("alertStub");
    });

    cy.get("[data-cy=post-report-btn]").should("be.visible").click();
    cy.get("[data-cy=report-reason-input]").should("be.visible").type("spam");
    cy.get("[data-cy=report-submit-btn]").should("not.be.disabled").click();

    cy.wait("@createReportFail");

    // Alert error muncul dengan pesan dari server
    cy.get("@alertStub").should(
      "have.been.calledWithMatch",
      /sudah melaporkan|kesalahan/i
    );
  });
});

// ══════════════════════════════════════════════════════════════════════

describe("Report — Admin / Moderator", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);

    cy.intercept("GET", `${API}/notifications*`, {
      statusCode: 200,
      body: { data: [], meta: { unread_count: 0, total_count: 0 } },
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

  // 4. lihat daftar laporan ───────────────────────────────────────────
  it("lihat daftar laporan — tabel laporan tampil dengan data yang benar", () => {
    cy.clearLocalStorage();
    doLogin(MOCK_MOD_USER);

    cy.intercept("GET", `${API}/reports*`, {
      statusCode: 200,
      body: {
        current_page: 1,
        data: [MOCK_REPORT, MOCK_REPORT_RESOLVED],
        first_page_url: `${API}/reports?page=1`,
        from: 1,
        last_page: 1,
        last_page_url: `${API}/reports?page=1`,
        links: [],
        next_page_url: null,
        path: `${API}/reports`,
        per_page: 10,
        prev_page_url: null,
        to: 2,
        total: 2,
      },
    }).as("getReports");

    visitAdminReports();
    cy.wait("@getReports");

    // Judul halaman
    cy.contains("Laporan Masuk").should("be.visible");
    cy.contains("2 laporan ditemukan").should("be.visible");

    // Pelapor tampil
    cy.contains("eris").should("be.visible");

    // Status badge tampil
    cy.contains("pending").should("be.visible");
    cy.contains("resolved").should("be.visible");

    // Alasan tampil
    cy.contains("spam").should("be.visible");
  });

  // 5. paginasi laporan ────────────────────────────────────────────────
  it("paginasi laporan — klik Next memuat halaman 2", () => {
    cy.clearLocalStorage();
    doLogin(MOCK_MOD_USER);

    cy.intercept("GET", `${API}/reports*`, (req) => {
      const url = new URL(req.url);
      const page = url.searchParams.get("page") ?? "1";

      if (page === "2") {
        req.reply({
          statusCode: 200,
          body: {
            current_page: 2,
            data: [{ ...MOCK_REPORT, id: "report-p2-001" }],
            first_page_url: `${API}/reports?page=1`,
            from: 11,
            last_page: 2,
            last_page_url: `${API}/reports?page=2`,
            links: [],
            next_page_url: null,
            path: `${API}/reports`,
            per_page: 10,
            prev_page_url: `${API}/reports?page=1`,
            to: 11,
            total: 11,
          },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: {
            current_page: 1,
            data: Array.from({ length: 10 }, (_, i) => ({ ...MOCK_REPORT, id: `report-p1-00${i}` })),
            first_page_url: `${API}/reports?page=1`,
            from: 1,
            last_page: 2,
            last_page_url: `${API}/reports?page=2`,
            links: [],
            next_page_url: `${API}/reports?page=2`,
            path: `${API}/reports`,
            per_page: 10,
            prev_page_url: null,
            to: 10,
            total: 11,
          },
        });
      }
    }).as("getReports");

    visitAdminReports();
    cy.wait("@getReports");

    // Halaman 1: paginasi muncul
    cy.contains("Halaman 1 dari 2").should("be.visible");

    // Klik Next
    cy.contains("button", "Next").click();
    cy.wait("@getReports");

    // Halaman 2
    cy.contains("Halaman 2 dari 2").should("be.visible");
  });

  // 6. lihat detail laporan ───────────────────────────────────────────
  it("lihat detail laporan — klik baris laporan membuka halaman detail", () => {
    cy.clearLocalStorage();
    doLogin(MOCK_MOD_USER);

    cy.intercept("GET", `${API}/reports*`, {
      statusCode: 200,
      body: {
        current_page: 1,
        data: [MOCK_REPORT],
        first_page_url: `${API}/reports?page=1`,
        from: 1,
        last_page: 1,
        last_page_url: `${API}/reports?page=1`,
        links: [],
        next_page_url: null,
        path: `${API}/reports`,
        per_page: 10,
        prev_page_url: null,
        to: 1,
        total: 1,
      },
    }).as("getReports");

    cy.intercept("GET", `${API}/reports/${MOCK_REPORT.id}`, {
      statusCode: 200,
      body: {
        data: MOCK_REPORT,
        target: {
          id: MOCK_POST.id,
          title: MOCK_POST.title,
          body: MOCK_POST.body,
          user: { id: "user-other", username: "otheruser", avatar_url: null },
        },
      },
    }).as("getReportDetail");

    visitAdminReports();
    cy.wait("@getReports");

    // Klik baris laporan pertama
    cy.get("tbody tr").first().click();
    cy.wait("@getReportDetail");

    cy.url().should("include", `/admin/reports/${MOCK_REPORT.id}`);
    cy.contains("Detail Laporan").should("be.visible");
    cy.contains(MOCK_REPORT.reason).should("be.visible");
    cy.contains(MOCK_POST.title).should("be.visible");
  });

  // 7. resolve laporan ────────────────────────────────────────────────
  it("resolve laporan — klik Setujui & Hapus Konten, PATCH /reports/:id/resolve dipanggil", () => {
    cy.clearLocalStorage();
    doLogin(MOCK_MOD_USER);

    // Intercept GET detail — pertama kali (pending), kedua kali setelah resolve (resolved)
    let detailCallCount = 0;
    cy.intercept("GET", `${API}/reports/${MOCK_REPORT.id}`, (req) => {
      detailCallCount++;
      if (detailCallCount === 1) {
        req.reply({
          statusCode: 200,
          body: {
            data: MOCK_REPORT,
            target: {
              id: MOCK_POST.id,
              title: MOCK_POST.title,
              body: MOCK_POST.body,
              user: { id: "user-other", username: "otheruser", avatar_url: null },
            },
          },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: {
            data: { ...MOCK_REPORT, status: "resolved" },
            target: null,
          },
        });
      }
    }).as("getReportDetail");

    cy.intercept("PATCH", `${API}/reports/${MOCK_REPORT.id}/resolve`, {
      statusCode: 200,
      body: { message: "Laporan berhasil diselesaikan." },
    }).as("resolveReport");

    cy.intercept("GET", `${API}/reports*`, {
      statusCode: 200,
      body: { current_page: 1, data: [], last_page: 1, total: 0 },
    }).as("getReports");

    // Stub confirm SEBELUM visit agar sudah aktif saat halaman load
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-report");
    });

    cy.visit(`/admin/reports/${MOCK_REPORT.id}`);

    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-report");
      cy.stub(win, "confirm").returns(true);
      cy.stub(win, "alert").returns(undefined);
    });

    cy.wait("@getReportDetail");
    cy.contains("Detail Laporan").should("be.visible");
    cy.contains("button", "Setujui & Hapus Konten").should("be.visible").click();

    cy.wait("@resolveReport").then((interception) => {
      expect(interception.request.method).to.equal("PATCH");
      expect(interception.request.url).to.include(`/reports/${MOCK_REPORT.id}/resolve`);
      const body =
        typeof interception.request.body === "string"
          ? JSON.parse(interception.request.body)
          : interception.request.body;
      expect(body.status).to.equal("resolved");
    });
  });

  // 8. hapus laporan ──────────────────────────────────────────────────
  it("hapus laporan — klik Hapus Laporan, DELETE /reports/:id dipanggil dan redirect ke daftar", () => {
    cy.clearLocalStorage();
    doLogin(MOCK_MOD_USER);

    cy.intercept("GET", `${API}/reports/${MOCK_REPORT.id}`, {
      statusCode: 200,
      body: {
        data: MOCK_REPORT,
        target: {
          id: MOCK_POST.id,
          title: MOCK_POST.title,
          body: MOCK_POST.body,
          user: { id: "user-other", username: "otheruser", avatar_url: null },
        },
      },
    }).as("getReportDetail");

    cy.intercept("DELETE", `${API}/reports/${MOCK_REPORT.id}`, {
      statusCode: 200,
      body: { message: "Laporan berhasil dihapus." },
    }).as("deleteReport");

    cy.intercept("GET", `${API}/reports*`, {
      statusCode: 200,
      body: {
        current_page: 1, data: [], last_page: 1, total: 0,
        first_page_url: null, from: null, last_page_url: null,
        links: [], next_page_url: null, path: `${API}/reports`,
        per_page: 10, prev_page_url: null, to: null,
      },
    }).as("getReports");

    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-report");
    });
    cy.visit(`/admin/reports/${MOCK_REPORT.id}`);
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-report");
      cy.stub(win, "confirm").returns(true);
      cy.stub(win, "alert").returns(undefined);
    });

    cy.wait("@getReportDetail");
    cy.contains("Detail Laporan").should("be.visible");

    cy.contains("button", "Hapus Laporan").should("be.visible").click();

    cy.wait("@deleteReport").then((interception) => {
      expect(interception.request.method).to.equal("DELETE");
      expect(interception.request.url).to.include(`/reports/${MOCK_REPORT.id}`);
    });

    // Redirect ke daftar laporan setelah hapus
    cy.url().should("include", "/admin/reports");
    cy.url().should("not.include", MOCK_REPORT.id);
  });

  // 9. non-admin diblock ─────────────────────────────────────────────
  it("non-admin diblock — user biasa redirect ke / saat akses /admin/reports", () => {
    cy.clearLocalStorage();
    doLogin(MOCK_USER); // roles: []

    cy.intercept("GET", `${API}/reports*`, {
      statusCode: 403,
      body: { message: "Forbidden." },
    }).as("getReportsForbidden");

    visitAdminReports();

    // Redirect ke home
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
  });
});

export {};
