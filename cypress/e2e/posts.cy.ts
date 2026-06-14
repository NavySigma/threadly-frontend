/**
 * E2E Tests — Posts
 *
 * Skenario yang diuji:
 * 1. halaman home tampil — daftar postingan ter-render
 * 2. klik postingan — navigasi ke halaman detail postingan
 * 3. buat postingan baru — form create post tampil, submit POST /posts berhasil
 * 4. validasi form create post — error tampil jika field kosong
 * 5. buat postingan dengan poin tidak cukup — halaman insufficient points tampil
 * 6. halaman detail postingan — judul, body, tag, dan info author tampil
 * 7. edit postingan — form edit tampil dengan data lama, submit PATCH /posts/:id berhasil
 * 8. filter sort postingan — tombol sort mengubah query param
 * 9. halaman home kosong — empty state tampil jika tidak ada postingan
 * 10. search postingan — hanya postingan yang cocok tampil
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

const MOCK_USER_LOW_POINTS = {
  ...MOCK_USER,
  id: "user-low",
  username: "newbie",
  reputation_points: 5,
};

const MOCK_POST = {
  id: "post-001",
  title: "Bagaimana cara menggunakan React hooks?",
  body: "Saya ingin belajar tentang useState dan useEffect di React.",
  status: "open",
  view_count: 42,
  vote_score: 5,
  is_answered: false,
  accepted_answer_id: null as string | null,
  comments_count: 2,
  is_liked: false,
  likes_count: 3,
  user_vote: null as string | null,
  created_at: "2024-06-01T10:00:00.000Z",
  updated_at: "2024-06-01T10:00:00.000Z",
  closed_at: null as string | null,
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
  tags: [
    { id: "tag-1", name: "react", slug: "react", color: "#61dafb" },
    { id: "tag-2", name: "hooks", slug: "hooks", color: "#0ea5e9" },
  ],
};

const MOCK_POST_OWNED = {
  ...MOCK_POST,
  id: "post-owned-001",
  title: "Postingan milik saya sendiri",
  body: "Isi postingan yang bisa saya edit.",
  user: {
    id: MOCK_USER.id,
    username: MOCK_USER.username,
    avatar_url: null,
    reputation_points: 120,
    level: 2,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
};

const MOCK_CATEGORIES = [
  { id: "cat-1", name: "React", slug: "react", description: null, parent_id: null },
  { id: "cat-2", name: "JavaScript", slug: "javascript", description: null, parent_id: null },
];

const MOCK_TAGS = [
  { id: "tag-1", name: "react", slug: "react", color: "#61dafb", usage_count: 10 },
  { id: "tag-2", name: "hooks", slug: "hooks", color: "#0ea5e9", usage_count: 5 },
];

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════

function doLogin(userOverride: Partial<typeof MOCK_USER> = {}) {
  const user = { ...MOCK_USER, ...userOverride };

  cy.intercept("POST", `${API}/login`, {
    statusCode: 200,
    body: {
      access_token: "cypress-fake-token-posts",
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

function stubHomePage(posts: object[] = [], total = posts.length) {
  cy.intercept("GET", `${API}/posts?*`, {
    statusCode: 200,
    body: {
      data: posts,
      meta: { current_page: 1, last_page: 1, per_page: 10, total },
    },
  }).as("getPostsList");

  cy.intercept("GET", `${API}/tags*`, {
    statusCode: 200,
    body: { data: MOCK_TAGS },
  }).as("getTags");
}

function visitHome() {
  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-posts");
  });
  cy.visit("/");
  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-posts");
  });
  cy.wait("@getPostsList");
}

function setupPostDetail(postOverride: object = {}) {
  const post = { ...MOCK_POST, ...postOverride };

  cy.intercept("GET", `${API}/me`, {
    statusCode: 200,
    body: { data: MOCK_USER },
  }).as("meApi");

  cy.intercept("GET", `${API}/posts/${post.id}`, {
    statusCode: 200,
    body: { data: post },
  }).as("getPost");

  cy.intercept("GET", `${API}/posts/${post.id}/comments*`, {
    statusCode: 200,
    body: {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    },
  }).as("getComments");

  cy.intercept("GET", `${API}/bookmarks/${post.id}/check`, {
    statusCode: 200,
    body: { is_bookmarked: false },
  }).as("checkBookmark");

  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-posts");
  });

  cy.visit(`/posts/${post.id}`);

  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-posts");
  });

  cy.wait("@getPost");
}

function stubCreatePostMeta() {
  cy.intercept("GET", `${API}/categories*`, {
    statusCode: 200,
    body: { data: MOCK_CATEGORIES },
  }).as("getCategories");

  cy.intercept("GET", `${API}/tags*`, {
    statusCode: 200,
    body: { data: MOCK_TAGS },
  }).as("getTagsMeta");
}

// ══════════════════════════════════════════════════════════════════════
// TEST SUITE
// ══════════════════════════════════════════════════════════════════════

describe("Posts", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);

    // Stub endpoint global/layout
    cy.intercept("GET", `${API}/notifications*`, {
      statusCode: 200,
      body: { data: [], meta: { unread_count: 0 } },
    }).as("globalNotifications");

    cy.intercept("GET", `${API}/stats/community`, {
      statusCode: 200,
      body: { data: { users_online: 5, questions: 10, answers: 20, upvotes: 30 } },
    }).as("globalStats");

    cy.intercept("GET", `${API}/me`, {
      statusCode: 200,
      body: { data: MOCK_USER },
    }).as("globalMe");
  });

  // ─────────────────────────────────────────────────────────────────
  // 1. halaman home tampil — daftar postingan ter-render
  // ─────────────────────────────────────────────────────────────────
  it("halaman home tampil — daftar postingan ter-render dengan benar", () => {
    cy.clearLocalStorage();
    doLogin();
    stubHomePage([MOCK_POST]);
    visitHome();

    // Judul postingan harus tampil
    cy.contains(MOCK_POST.title).should("be.visible");
    // Stats votes tampil
    cy.contains(`${MOCK_POST.vote_score}`).should("be.visible");
    // Username author tampil
    cy.contains(MOCK_POST.user.username).should("be.visible");
    // Tag react tampil
    cy.contains("react").should("be.visible");
  });

  // ─────────────────────────────────────────────────────────────────
  // 2. klik postingan — navigasi ke halaman detail
  // ─────────────────────────────────────────────────────────────────
  it("klik postingan — navigasi ke halaman detail postingan", () => {
    cy.clearLocalStorage();
    doLogin();
    stubHomePage([MOCK_POST]);

    cy.intercept("GET", `${API}/posts/${MOCK_POST.id}`, {
      statusCode: 200,
      body: { data: MOCK_POST },
    }).as("getPostDetail");

    cy.intercept("GET", `${API}/posts/${MOCK_POST.id}/comments*`, {
      statusCode: 200,
      body: { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } },
    }).as("getComments");

    cy.intercept("GET", `${API}/bookmarks/${MOCK_POST.id}/check`, {
      statusCode: 200,
      body: { is_bookmarked: false },
    }).as("checkBookmark");

    visitHome();

    // Klik judul post (link ke detail)
    cy.contains(MOCK_POST.title).click();

    cy.url().should("include", `/posts/${MOCK_POST.id}`);
    cy.wait("@getPostDetail");
    cy.contains(MOCK_POST.title).should("be.visible");
  });

  // ─────────────────────────────────────────────────────────────────
  // 3. buat postingan baru — submit POST /posts berhasil
  // ─────────────────────────────────────────────────────────────────
  it("buat postingan baru — form diisi dan request POST /posts dikirim dengan payload benar", () => {
    cy.clearLocalStorage();
    doLogin();
    stubHomePage([]);
    stubCreatePostMeta();

    const newPost = {
      title: "Pertanyaan test Cypress baru",
      body: "Ini adalah isi pertanyaan yang dibuat oleh Cypress untuk testing.",
    };

    cy.intercept("POST", `${API}/posts`, {
      statusCode: 201,
      body: {
        data: {
          ...MOCK_POST,
          id: "post-new-001",
          title: newPost.title,
          body: newPost.body,
        },
        message: "Postingan berhasil dibuat.",
      },
    }).as("createPost");

    visitHome();

    // Klik tombol Ask Question
    cy.contains("Ask Question").should("be.visible").click();
    cy.url().should("include", "/posts/create");

    // Tunggu form ter-render (pilih kategori)
    cy.get("#category", { timeout: 10000 }).should("be.visible").select("React");
    cy.get("#title").should("be.visible").type(newPost.title);
    cy.get("#body").should("be.visible").type(newPost.body);

    // Submit form
    cy.contains("button", "Create Post").click();

    // Verifikasi request ke API
    cy.wait("@createPost").then((interception) => {
      const body =
        typeof interception.request.body === "string"
          ? JSON.parse(interception.request.body)
          : interception.request.body;
      expect(body.title).to.equal(newPost.title);
      expect(body.body).to.equal(newPost.body);
      expect(body.category_id).to.equal("cat-1");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 4. validasi form create post — error tampil jika field kosong
  // ─────────────────────────────────────────────────────────────────
  it("validasi form create post — pesan error tampil jika title dan body kosong", () => {
    cy.clearLocalStorage();
    doLogin();
    stubHomePage([]);
    stubCreatePostMeta();
    visitHome();

    cy.contains("Ask Question").should("be.visible").click();
    cy.url().should("include", "/posts/create");

    // Langsung submit tanpa mengisi apapun
    cy.contains("button", "Create Post").click();

    // Pesan error validasi harus tampil
    cy.get(".form-error", { timeout: 5000 }).should("have.length.greaterThan", 0);
  });

  // ─────────────────────────────────────────────────────────────────
  // 5. poin tidak cukup — halaman insufficient points tampil
  // ─────────────────────────────────────────────────────────────────
  it("poin tidak cukup — halaman insufficient points tampil saat buat postingan", () => {
    cy.clearLocalStorage();

    // Login dengan user yang poin-nya < 15
    cy.intercept("POST", `${API}/login`, {
      statusCode: 200,
      body: {
        access_token: "cypress-fake-token-posts",
        token_type: "Bearer",
        user: MOCK_USER_LOW_POINTS,
      },
    }).as("loginApi");

    cy.intercept("GET", `${API}/me`, {
      statusCode: 200,
      body: { data: MOCK_USER_LOW_POINTS },
    }).as("meApi");

    cy.visit("/login");
    cy.get("#email").clear().type(TEST_EMAIL);
    cy.get("#password").clear().type(TEST_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.wait("@loginApi");

    stubHomePage([]);
    stubCreatePostMeta();

    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-posts");
    });
    cy.visit("/posts/create");
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-posts");
    });

    // Halaman insufficient points harus ter-render
    cy.get(".insufficient-points-page", { timeout: 10000 }).should("be.visible");
    cy.contains("Insufficient Points").should("be.visible");
    cy.contains("15 reputation points").should("be.visible");
    cy.contains(`${MOCK_USER_LOW_POINTS.reputation_points}`).should("be.visible");
  });

  // ─────────────────────────────────────────────────────────────────
  // 6. halaman detail postingan — konten lengkap tampil
  // ─────────────────────────────────────────────────────────────────
  it("halaman detail postingan — judul, body, tag, dan info author tampil", () => {
    cy.clearLocalStorage();
    doLogin();
    setupPostDetail();

    // Pastikan halaman detail sudah ter-load (tunggu title tampil dulu)
    cy.contains(MOCK_POST.title, { timeout: 10000 }).should("be.visible");

    // Body harus tampil
    cy.contains(MOCK_POST.body).should("be.visible");

    // Tags harus tampil — gunakan selector span dalam post body
    cy.contains("react").should("be.visible");
    cy.contains("hooks").should("be.visible");

    // Username author tampil
    cy.contains(MOCK_POST.user.username).should("be.visible");

    // View count tampil — UI render "{view_count}x" (huruf x kecil)
    cy.contains(`${MOCK_POST.view_count}x`).should("be.visible");

    // Kategori tampil
    cy.contains(MOCK_POST.category.name).should("be.visible");
  });

  // ─────────────────────────────────────────────────────────────────
  // 7. edit postingan — submit PATCH /posts/:id berhasil
  // ─────────────────────────────────────────────────────────────────
  it("edit postingan — form edit tampil dengan data lama dan submit PATCH berhasil", () => {
    cy.clearLocalStorage();
    doLogin();

    // Stub semua endpoint yang dibutuhkan EditPostPage sebelum visit
    cy.intercept("GET", `${API}/me`, {
      statusCode: 200,
      body: { data: MOCK_USER },
    }).as("meApiEdit");

    cy.intercept("GET", `${API}/posts/${MOCK_POST_OWNED.id}`, {
      statusCode: 200,
      body: { data: MOCK_POST_OWNED },
    }).as("getOwnedPost");

    cy.intercept("GET", `${API}/categories*`, {
      statusCode: 200,
      body: { data: MOCK_CATEGORIES },
    }).as("getCategories");

    // Stub tags dengan wildcard agar intercept semua variasi query
    cy.intercept("GET", `${API}/tags*`, {
      statusCode: 200,
      body: { data: MOCK_TAGS },
    }).as("getTagsMeta");

    // postsApi.update pakai method PUT (bukan PATCH)
    cy.intercept("PUT", `${API}/posts/${MOCK_POST_OWNED.id}`, {
      statusCode: 200,
      body: {
        data: {
          ...MOCK_POST_OWNED,
          title: "Postingan yang sudah diedit",
          body: "Isi yang sudah diperbarui.",
        },
        message: "Postingan berhasil diperbarui.",
      },
    }).as("updatePost");

    // Stub redirect target setelah update berhasil
    cy.intercept("GET", `${API}/posts/${MOCK_POST_OWNED.id}/comments*`, {
      statusCode: 200,
      body: { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } },
    }).as("getCommentsAfterEdit");

    cy.intercept("GET", `${API}/bookmarks/${MOCK_POST_OWNED.id}/check`, {
      statusCode: 200,
      body: { is_bookmarked: false },
    }).as("checkBookmarkAfterEdit");

    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-posts");
    });

    cy.visit(`/posts/${MOCK_POST_OWNED.id}/edit`);

    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-posts");
    });

    cy.wait("@getOwnedPost");

    // EditPostPage pakai id="title" dan id="body" di input
    // Form ter-isi data lama setelah originalPost loaded (enableReinitialize: true)
    cy.get("#title", { timeout: 10000 })
      .should("be.visible")
      .and("have.value", MOCK_POST_OWNED.title);

    cy.get("#body").should("be.visible").and("have.value", MOCK_POST_OWNED.body);

    // Edit isi form
    cy.get("#title").clear().type("Postingan yang sudah diedit");
    cy.get("#body").clear().type("Isi yang sudah diperbarui.");

    // Submit
    cy.contains("button", "Simpan Perubahan").click();

    cy.wait("@updatePost").then((interception) => {
      const body =
        typeof interception.request.body === "string"
          ? JSON.parse(interception.request.body)
          : interception.request.body;
      expect(body.title).to.equal("Postingan yang sudah diedit");
      expect(body.body).to.equal("Isi yang sudah diperbarui.");
    });

    // Setelah sukses, app navigate ke /posts/:id
    cy.url({ timeout: 10000 }).should("include", `/posts/${MOCK_POST_OWNED.id}`);
  });

  // ─────────────────────────────────────────────────────────────────
  // 8. filter sort postingan — dropdown sort mengubah urutan tampil
  // ─────────────────────────────────────────────────────────────────
  it("filter sort postingan — pilih 'highest_vote' mengurutkan post berdasarkan vote tertinggi", () => {
    cy.clearLocalStorage();
    doLogin();

    // Dua post dengan vote berbeda — sort dilakukan client-side oleh sortPosts()
    const MOCK_POST_LOW_VOTE  = { ...MOCK_POST, id: "post-low",  title: "Post vote rendah",   vote_score: 1  };
    const MOCK_POST_HIGH_VOTE = { ...MOCK_POST, id: "post-high", title: "Post vote tertinggi", vote_score: 99 };

    cy.intercept("GET", `${API}/posts*`, {
      statusCode: 200,
      body: {
        data: [MOCK_POST_LOW_VOTE, MOCK_POST_HIGH_VOTE],
        meta: { current_page: 1, last_page: 1, per_page: 10, total: 2 },
      },
    }).as("getPostsList");

    cy.intercept("GET", `${API}/tags*`, {
      statusCode: 200,
      body: { data: MOCK_TAGS },
    }).as("getTags");

    cy.intercept("GET", `${API}/categories*`, {
      statusCode: 200,
      body: { data: MOCK_CATEGORIES },
    }).as("getCategories");

    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-posts");
    });
    cy.visit("/posts");
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-posts");
    });

    cy.wait("@getPostsList");

    // Kedua post harus tampil dulu sebelum sort
    cy.contains("Post vote rendah").should("be.visible");
    cy.contains("Post vote tertinggi").should("be.visible");

    // Pilih sort "Vote Tertinggi" di PostFilterBar <select>
    cy.get("select").filter((_, el) => {
      return Array.from((el as HTMLSelectElement).options).some(
        (opt) => opt.text === "Vote Tertinggi"
      );
    }).select("Vote Tertinggi");

    // PostsPage render judul post dalam <Link> (bukan <h3>)
    // Ambil semua link judul post yang ada di dalam post-list container
    cy.get(".text-xl.font-extrabold").then(($links) => {
      const texts = [...$links].map((el) => el.textContent?.trim() ?? "");
      const idxHigh = texts.findIndex((t) => t.includes("Post vote tertinggi"));
      const idxLow  = texts.findIndex((t) => t.includes("Post vote rendah"));
      expect(idxHigh).to.be.lessThan(idxLow);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 9. halaman home kosong — empty state tampil
  // ─────────────────────────────────────────────────────────────────
  it("halaman home kosong — empty state tampil jika tidak ada postingan", () => {
    cy.clearLocalStorage();
    doLogin();
    stubHomePage([], 0);
    visitHome();

    cy.contains("Belum ada postingan").should("be.visible");
    cy.contains("Jadilah yang pertama bertanya").should("be.visible");
  });

  // ─────────────────────────────────────────────────────────────────
  // 10. search postingan — hanya postingan yang cocok tampil
  // ─────────────────────────────────────────────────────────────────
  it("search postingan — ketik di SearchBar dan halaman /search menampilkan hasil yang cocok", () => {
    cy.clearLocalStorage();
    doLogin();
    stubHomePage([MOCK_POST]);

    // SearchBar mengarah ke /search?search=<keyword>
    // SearchPage memanggil /api/search/posts?q=<keyword> (via searchPostsApi)
    cy.intercept("GET", `${API}/search/posts*`, (req) => {
      const url = new URL(req.url);
      const q = url.searchParams.get("q") ?? "";
      if (q.toLowerCase().includes("react")) {
        req.reply({
          statusCode: 200,
          body: { data: [MOCK_POST] },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: { data: [] },
        });
      }
    }).as("searchPostsApi");

    cy.intercept("GET", `${API}/search/tags*`, {
      statusCode: 200,
      body: { data: [] },
    }).as("searchTagsApi");

    cy.intercept("GET", `${API}/search/users*`, {
      statusCode: 200,
      body: { data: [] },
    }).as("searchUsersApi");

    visitHome();

    // SearchBar berada di Navbar — input dengan placeholder "Search…"
    cy.get('input[placeholder*="Search"]')
      .should("be.visible")
      .clear()
      .type("React");

    // Tekan Enter untuk navigasi ke /search
    cy.get('input[placeholder*="Search"]').type("{enter}");

    // Halaman search harus terbuka
    cy.url({ timeout: 10000 }).should("include", "/search");

    // Tunggu API search dipanggil
    cy.wait("@searchPostsApi");

    // Judul postingan yang cocok harus tampil di Search Results
    cy.contains(MOCK_POST.title, { timeout: 10000 }).should("be.visible");
  });
});

export {};
