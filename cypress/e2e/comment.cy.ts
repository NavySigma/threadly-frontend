const API = "https://navysigma.alwaysdata.net/api";

const MOCK_USER = {
  id: "user-1", username: "eris", email: "eris@gmail.com", avatar_url: null, bio: "Bio saya",
  reputation_points: 120, level: 2,
  created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z",
  roles: [] as { id: string; name: string }[],
};

const POST_OTHER = {
  id: "post-1", title: "Cara menggunakan React hooks?", body: "Saya bingung dengan hooks.",
  status: "open", view_count: 120, vote_score: 5, is_answered: false, accepted_answer_id: null,
  created_at: "2025-06-10T08:30:00.000Z", updated_at: "2025-06-10T08:30:00.000Z",
  user: { id: "user-2", username: "navyz", avatar_url: null, reputation_points: 500 },
  category: { id: "cat-1", name: "Pemrograman", slug: "pemrograman" },
  tags: [{ id: "tag-1", name: "React", color: "#61DAFB" }],
};

const POST_OWN = { ...POST_OTHER, id: "post-2", user: { id: "user-1", username: "eris", avatar_url: null, reputation_points: 120 } };

const EMPTY = { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
const ERIS_C = { id: "c-1", body: "Komentar dari eris", parent_id: null, vote_score: 0, likes_count: 0, user_liked: false, user_vote: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user: { id: "user-1", username: "eris", avatar_url: null }, replies: [], edits_count: 0 };
const NAVYZ_C = { id: "c-2", body: "Coba cek dokumentasi resmi React di react.dev", parent_id: null, vote_score: 3, likes_count: 1, user_liked: false, user_vote: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user: { id: "user-2", username: "navyz", avatar_url: null }, replies: [], edits_count: 0 };
const C_WITH_ERIS = { data: [ERIS_C], current_page: 1, last_page: 1, per_page: 20, total: 1 };
const C_WITH_NAVYZ = { data: [NAVYZ_C], current_page: 1, last_page: 1, per_page: 20, total: 1 };

function login() {
  cy.intercept("GET", `${API}/me`, { statusCode: 200, body: { data: MOCK_USER } }).as("meApi");
  cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
  cy.visit("/"); cy.window().then((win) => win.localStorage.setItem("token", "cypress-fake-token"));
  cy.wait("@meApi");
  cy.get(".navbar-avatar", { timeout: 10000 }).should("exist");
}

function globalIntercepts() {
  cy.intercept("GET", `${API}/notifications*`, { statusCode: 200, body: { data: [], meta: { unread_count: 0 } } }).as("g1");
  cy.intercept("GET", `${API}/stats/community`, { statusCode: 200, body: { data: { users_online: 5, questions: 10, answers: 20, upvotes: 30 } } }).as("g2");
  cy.intercept("GET", `${API}/posts?*`, { statusCode: 200, body: { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } } }).as("g3");
  cy.intercept("GET", `${API}/tags*`, { statusCode: 200, body: { data: [] } }).as("g4");
}

function visitPost(postId: string, cb: unknown) {
  cy.intercept("GET", `${API}/posts/${postId}`, { statusCode: 200, body: { data: postId === "post-2" ? POST_OWN : POST_OTHER } }).as("getP");
  cy.intercept("GET", `${API}/posts/${postId}/comments*`, { statusCode: 200, body: cb }).as("getC");
  cy.window().then((w) => w.localStorage.setItem("token", "cypress-fake-token"));
  cy.visit(`/posts/${postId}`);
  cy.window().then((w) => w.localStorage.setItem("token", "cypress-fake-token"));
  cy.wait("@getP"); cy.wait("@getC");
}

function clickSubmit(label: string) {
  cy.contains("button", "Batal").parent().contains("button", label).click({ force: true });
}

const REPLY_META = { vote_score: 0, likes_count: 0, user_liked: false, user_vote: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user: { id: "user-1", username: "eris", avatar_url: null }, replies: [], edits_count: 0 };

describe("Comments", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    globalIntercepts();
    cy.clearLocalStorage();
    login();
  });

  it("coba komentar — menambahkan komentar baru", () => {
    visitPost("post-1", EMPTY);
    cy.contains("Belum ada komentar. Jadilah yang pertama!").should("exist");
    cy.get("textarea[placeholder='Tulis komentar kamu di sini...']").type("Komentar test");
    cy.intercept("POST", `${API}/posts/post-1/comments`, { statusCode: 201, body: { message: "OK", data: { id: "c-3", body: "Komentar test", parent_id: null, vote_score: 0, likes_count: 0, user_liked: false, user_vote: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user: { id: "user-1", username: "eris", avatar_url: null }, replies: [], edits_count: 0 } } }).as("cc");
    cy.contains("button", "Kirim").click();
    cy.wait("@cc");
    cy.contains("Komentar test").should("exist");
    cy.contains("1 Komentar").should("exist");
  });

  it("coba komentar lebih dari 2x — batas tercapai", () => {
    visitPost("post-1", C_WITH_ERIS);
    cy.contains("Komentar dari eris").should("exist");
    cy.contains("Batas komentar tercapai (maks. 1)").should("exist");
    cy.get("textarea").should("not.exist");
  });

  it("coba reply komentar — membalas komentar orang lain", () => {
    visitPost("post-1", C_WITH_NAVYZ);
    cy.contains("Coba cek dokumentasi resmi React di react.dev").should("exist");
    cy.contains("button", "Balas").first().click();
    cy.get("textarea[placeholder='Tulis balasan...']").type("Makasih sarannya!");
    cy.intercept("POST", `${API}/posts/post-1/comments`, { statusCode: 201, body: { message: "OK", data: { id: "r-1", body: "Makasih sarannya!", parent_id: "c-2", ...REPLY_META } } }).as("cr");
    clickSubmit("Balas");
    cy.wait("@cr").its("request.body").should("deep.include", { body: "Makasih sarannya!", parent_id: "c-2" });
    cy.get("textarea[placeholder='Tulis balasan...']").should("not.exist");
  });

  it("coba reply komentar lebih dari 2x — beberapa balasan", () => {
    visitPost("post-1", C_WITH_NAVYZ);
    cy.contains("Coba cek dokumentasi resmi React di react.dev").should("exist");
    let rId = 0;
    cy.intercept("POST", `${API}/posts/post-1/comments`, (req) => {
      rId++;
      req.reply(201, { message: "OK", data: { id: `r-${rId}`, body: req.body.body, parent_id: "c-2", ...REPLY_META } });
    }).as("cr");
    for (const t of ["Makasih!", "Sangat membantu!", "Coba praktekan"]) {
      cy.contains("button", "Balas").first().click();
      cy.get("textarea[placeholder='Tulis balasan...']").type(t);
      clickSubmit("Balas");
      cy.wait("@cr").its("request.body").should("deep.include", { body: t, parent_id: "c-2" });
      cy.get("textarea[placeholder='Tulis balasan...']").should("not.exist");
    }
  });

  it("Edit komentar sendiri — mengedit komentar milik sendiri", () => {
    visitPost("post-1", C_WITH_ERIS);
    cy.contains("Komentar dari eris").should("exist");
    cy.contains("button", "Edit").click();
    cy.get("textarea[placeholder='Edit komentar...']").clear();
    cy.get("textarea[placeholder='Edit komentar...']").type("Komentar yg sudah diedit");
    cy.intercept("PUT", `${API}/comments/c-1`, { statusCode: 200, body: { message: "OK", data: { ...ERIS_C, body: "Komentar yg sudah diedit" } } }).as("ec");
    clickSubmit("Simpan");
    cy.wait("@ec");
    cy.get("textarea[placeholder='Edit komentar...']").should("not.exist");
    cy.contains("Komentar yg sudah diedit").should("exist");
    cy.contains("Komentar dari eris").should("not.exist");
  });

  it("Edit reply komentar — mengedit balasan milik sendiri", () => {
    const DATA = {
      data: [{ ...NAVYZ_C, replies: [{ id: "r-1", body: "Terima kasih!", parent_id: "c-2", vote_score: 0, likes_count: 0, user_liked: false, user_vote: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user: { id: "user-1", username: "eris", avatar_url: null }, replies: [], edits_count: 0 }] }],
      current_page: 1, last_page: 1, per_page: 20, total: 1,
    };
    visitPost("post-1", DATA);
    cy.contains("Terima kasih!").should("exist");
    cy.contains("button", "Edit").click();
    cy.get("textarea[placeholder='Edit komentar...']").clear();
    cy.get("textarea[placeholder='Edit komentar...']").type("Sama-sama!");
    cy.intercept("PUT", `${API}/comments/r-1`, { statusCode: 200, body: { message: "OK", data: { id: "r-1", body: "Sama-sama!", parent_id: "c-2", vote_score: 0, likes_count: 0, user_liked: false, user_vote: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user: { id: "user-1", username: "eris", avatar_url: null }, replies: [], edits_count: 0 } } }).as("er");
    clickSubmit("Simpan");
    cy.wait("@er");
    cy.get("textarea[placeholder='Edit komentar...']").should("not.exist");
    cy.contains("Sama-sama!").should("exist");
    cy.contains("Terima kasih!").should("not.exist");
  });

  it("mark as accepted comment — menandai komentar sebagai jawaban", () => {
    visitPost("post-2", C_WITH_NAVYZ);
    cy.contains("Coba cek dokumentasi resmi React di react.dev").should("exist");
    cy.contains("button", "Terima sebagai jawaban").should("exist");
    cy.intercept("POST", `${API}/posts/post-2/comments/c-2/accept`, { statusCode: 200, body: { message: "Jawaban diterima" } }).as("aa");
    cy.contains("button", "Terima sebagai jawaban").click();
    cy.wait("@aa");
    cy.contains("✓ Diterima").should("exist");
    cy.contains("✓ Jawaban Diterima").should("exist");
  });
});
