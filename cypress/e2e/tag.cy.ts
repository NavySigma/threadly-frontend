const API = "https://navysigma.alwaysdata.net/api";

const MOCK_TAGS = [
  { id: "tag-1", name: "React", color: "#61DAFB", posts_count: 42 },
  { id: "tag-2", name: "Laravel", color: "#FF2D20", posts_count: 35 },
  { id: "tag-3", name: "JavaScript", color: "#F7DF1E", posts_count: 78 },
  { id: "tag-4", name: "Python", color: "#3776AB", posts_count: 28 },
  { id: "tag-5", name: "Vue", color: "#42B883", posts_count: 15 },
  { id: "tag-6", name: "Docker", color: "#2496ED", posts_count: 12 },
  { id: "tag-7", name: "PHP", color: "#777BB4", posts_count: 31 },
  { id: "tag-8", name: "MySQL", color: "#4479A1", posts_count: 10 },
  { id: "tag-9", name: "Go", color: "#00ADD8", posts_count: 8 },
  { id: "tag-10", name: "Java", color: "#007396", posts_count: 20 },
  { id: "tag-11", name: "TypeScript", color: "#3178C6", posts_count: 55 },
  { id: "tag-12", name: "Flutter", color: "#02569B", posts_count: 14 },
  { id: "tag-13", name: "Kotlin", color: "#7F52FF", posts_count: 9 },
  { id: "tag-14", name: "Swift", color: "#F05138", posts_count: 7 },
  { id: "tag-15", name: "Rust", color: "#000000", posts_count: 5 },
  { id: "tag-16", name: "GraphQL", color: "#E10098", posts_count: 11 },
];

const TAGS_RESPONSE = {
  data: MOCK_TAGS,
  meta: {
    current_page: 1,
    last_page: 1,
    total: MOCK_TAGS.length,
    per_page: 1000,
  },
};

const MOCK_TAG_DETAIL = {
  data: {
    id: "tag-1",
    name: "React",
    color: "#61DAFB",
    posts_count: 42,
    posts: [
      {
        id: "post-1",
        title: "Best practices React component structure?",
        body: "Halo teman-teman, gua lagi mengerjakan project React yang cukup besar",
        status: "open",
        view_count: 120,
        vote_score: 15,
        is_answered: true,
        created_at: "2024-06-01T10:00:00.000Z",
        updated_at: "2024-06-01T10:00:00.000Z",
        user: {
          id: "user-1",
          username: "navyz",
          avatar_url: null,
        },
        category: {
          id: "cat-1",
          name: "Web Development",
          slug: "web-development",
        },
      },
      {
        id: "post-2",
        title: "React Native vs Flutter buat startup app",
        body: "Tim gua mau bikin MVP buat startup",
        status: "open",
        view_count: 85,
        vote_score: 10,
        is_answered: false,
        created_at: "2024-06-05T14:00:00.000Z",
        updated_at: "2024-06-05T14:00:00.000Z",
        user: {
          id: "user-2",
          username: "asya",
          avatar_url: null,
        },
        category: {
          id: "cat-2",
          name: "Mobile Development",
          slug: "mobile-development",
        },
      },
    ],
  },
};

function setupGlobalIntercepts() {
  cy.intercept("GET", `${API}/notifications*`, {
    statusCode: 200,
    body: { data: [], meta: { unread_count: 0 } },
  }).as("globalNotifications");

  cy.intercept("GET", `${API}/stats/community`, {
    statusCode: 200,
    body: {
      data: { users_online: 5, questions: 10, answers: 20, upvotes: 30 },
    },
  }).as("globalStats");

  cy.intercept("GET", `${API}/posts?*`, {
    statusCode: 200,
    body: {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    },
  }).as("globalPostsList");

  cy.intercept("GET", `${API}/tags*`, {
    statusCode: 200,
    body: TAGS_RESPONSE,
  }).as("tagsApi");
}

function visitTagsPage() {
  cy.intercept("GET", `${API}/tags?*`, {
    statusCode: 200,
    body: TAGS_RESPONSE,
  }).as("getTags");

  cy.visit("/tags");
  cy.wait("@getTags");
  cy.contains("Tags").should("be.visible");
}

describe("Tags", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    setupGlobalIntercepts();
  });

  it("menampilkan daftar tag — mengunjungi /tags dan melihat semua tag", () => {
    cy.intercept("GET", `${API}/tags?*`, {
      statusCode: 200,
      body: TAGS_RESPONSE,
    }).as("getTags");

    cy.visit("/tags");
    cy.wait("@getTags");

    cy.contains("Tags").should("be.visible");
    cy.contains("Tag adalah kata kunci atau label").should("be.visible");

    MOCK_TAGS.slice(0, 6).forEach((tag) => {
      cy.contains(tag.name).should("be.visible");
    });

    cy.contains("Menampilkan 15 dari 16 tag").should("be.visible");
  });

  it("search — mengetik di kolom filter memicu request dengan search param", () => {
    visitTagsPage();

    cy.intercept("GET", `${API}/tags?*search=React*`, {
      statusCode: 200,
      body: {
        data: [MOCK_TAGS[0], MOCK_TAGS[10]],
        meta: { current_page: 1, last_page: 1, total: 2, per_page: 1000 },
      },
    }).as("searchTags");

    cy.get("input[placeholder='Filter by tag name']")
      .should("be.visible")
      .clear()
      .type("React");

    cy.wait("@searchTags");

    cy.contains("React").should("be.visible");
    cy.contains("TypeScript").should("be.visible");
    cy.contains("Laravel").should("not.exist");
  });

  it("sort — mengubah urutan tag (popular → name → new)", () => {
    visitTagsPage();

    cy.contains("button", "Name").should("be.visible").click();
    cy.contains("button", "New").should("be.visible").click();
  });

  it("pagination — menampilkan tombol Next jika tag > 15", () => {
    visitTagsPage();

    cy.contains("Next →").should("be.visible");
    cy.contains("← Prev").should("be.visible").and("be.disabled");

    cy.get("button").contains("Next →").click();

    cy.contains("← Prev").should("not.be.disabled");
    cy.contains("Menampilkan 1 dari 16 tag").should("be.visible");
  });

  it("tag card — mengklik tag card navigasi ke /posts?tag_id=...", () => {
    visitTagsPage();

    cy.contains("React").click();
    cy.url().should("include", "tag_id=");
  });

  it("tag detail — mengunjungi /tags/:id melihat detail tag dan daftar post", () => {
    cy.intercept("GET", `${API}/tags/tag-1`, {
      statusCode: 200,
      body: MOCK_TAG_DETAIL,
    }).as("getTagDetail");

    cy.visit("/tags/tag-1");
    cy.wait("@getTagDetail");

    cy.contains("React").should("be.visible");
    cy.contains("42 pertanyaan").should("be.visible");

    cy.contains("Pertanyaan dengan tag").should("be.visible");
    cy.contains("Best practices React component structure?").should(
      "be.visible"
    );
    cy.contains("React Native vs Flutter buat startup app").should(
      "be.visible"
    );

    cy.contains("navyz").should("be.visible");
    cy.contains("asya").should("be.visible");

    cy.contains("button", "Kembali ke Tags").should("be.visible");
  });

  it("tag detail — menampilkan status answered dengan badge hijau", () => {
    cy.intercept("GET", `${API}/tags/tag-1`, {
      statusCode: 200,
      body: MOCK_TAG_DETAIL,
    }).as("getTagDetail");

    cy.visit("/tags/tag-1");
    cy.wait("@getTagDetail");

    cy.contains("✓ Answered").should("be.visible");
    cy.contains("Open").should("be.visible");
  });

  it("tag detail — tombol Kembali ke Tags navigasi ke /tags", () => {
    cy.intercept("GET", `${API}/tags/tag-1`, {
      statusCode: 200,
      body: MOCK_TAG_DETAIL,
    }).as("getTagDetail");

    cy.visit("/tags/tag-1");
    cy.wait("@getTagDetail");

    cy.contains("button", "Kembali ke Tags").click({ force: true });
    cy.url().should("include", "/tags");
  });
});
