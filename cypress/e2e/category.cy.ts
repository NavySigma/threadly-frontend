const API = "https://navysigma.alwaysdata.net/api";

const ADMIN_USER = {
  id: "admin-self",
  username: "superadmin",
  email: "admin@forum.com",
  avatar_url: null,
  bio: "Admin",
  reputation_points: 9999,
  level: 99,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  roles: [{ id: "role-admin", name: "admin" }],
};

const MOCK_CATEGORIES = [
  {
    id: "cat-1",
    name: "Web Development",
    slug: "web-development",
    description: "Diskusi seputar pengembangan web",
    parent_id: null,
    children: [
      {
        id: "cat-1-1",
        name: "Frontend",
        slug: "frontend",
        description: "Frontend development",
        parent_id: "cat-1",
        children: [],
      },
    ],
  },
  {
    id: "cat-2",
    name: "Mobile Development",
    slug: "mobile-development",
    description: null,
    parent_id: null,
    children: [],
  },
  {
    id: "cat-3",
    name: "DevOps & Cloud",
    slug: "devops-cloud",
    description: "CI/CD, Docker, Kubernetes",
    parent_id: null,
    children: [],
  },
];

function doAdminLogin() {
  cy.intercept("GET", `${API}/me`, {
    statusCode: 200,
    body: { data: ADMIN_USER },
  }).as("meApi");

  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-admin");
  });
  cy.visit("/");
  cy.window().then((win) => {
    win.localStorage.setItem("token", "cypress-fake-token-admin");
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
    body: { data: [] },
  }).as("globalTags");
}

describe("Category", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    setupGlobalIntercepts();
    cy.clearLocalStorage();
    doAdminLogin();
  });

  it("admin tambah category — modal form terisi dan request POST /categories terkirim", () => {
    cy.intercept("GET", `${API}/categories`, {
      statusCode: 200,
      body: { data: MOCK_CATEGORIES },
    }).as("getCategories");

    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-admin");
    });
    cy.visit("/admin/categories");
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-admin");
    });
    cy.wait("@getCategories");

    cy.contains("Manajemen Kategori").should("exist");
    cy.contains("Web Development").should("exist");
    cy.contains("Frontend").should("exist");

    cy.contains("Tambah Kategori").click();

    cy.contains("Tambah Kategori").should("exist");
    cy.get('input[placeholder="Nama kategori"]').should("exist");

    cy.get('input[placeholder="Nama kategori"]').clear().type("Data Science");
    cy.get('textarea[placeholder*="Deskripsi"]').clear().type("Machine learning dan AI");

    cy.intercept("POST", `${API}/categories`, {
      statusCode: 200,
      body: {
        data: {
          id: "cat-new",
          name: "Data Science",
          slug: "data-science",
          description: "Machine learning dan AI",
          parent_id: null,
          children: [],
        },
      },
    }).as("createCategory");

    cy.contains("button", "Simpan").click();
    cy.wait("@createCategory").then((interception) => {
      const body =
        typeof interception.request.body === "string"
          ? JSON.parse(interception.request.body)
          : interception.request.body;
      expect(body.name).to.equal("Data Science");
      expect(body.description).to.equal("Machine learning dan AI");
    });
  });

  it("admin edit category — modal form terisi dengan data awal dan request PUT terkirim", () => {
    cy.intercept("GET", `${API}/categories`, {
      statusCode: 200,
      body: { data: MOCK_CATEGORIES },
    }).as("getCategories");

    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-admin");
    });
    cy.visit("/admin/categories");
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-admin");
    });
    cy.wait("@getCategories");

    cy.get('button[title="Edit"]').first().click({ force: true });

    cy.contains("Edit Kategori").should("exist");
    cy.get('input[placeholder="Nama kategori"]').should("have.value", "Web Development");

    cy.get('input[placeholder="Nama kategori"]').clear().type("Web Dev");

    cy.intercept("PUT", `${API}/categories/cat-1`, {
      statusCode: 200,
      body: {
        data: {
          id: "cat-1",
          name: "Web Dev",
          slug: "web-dev",
          description: "Diskusi seputar pengembangan web",
          parent_id: null,
          children: [],
        },
      },
    }).as("updateCategory");

    cy.contains("button", "Simpan").click();
    cy.wait("@updateCategory").then((interception) => {
      const body =
        typeof interception.request.body === "string"
          ? JSON.parse(interception.request.body)
          : interception.request.body;
      expect(body.name).to.equal("Web Dev");
    });
  });

  it("admin hapus category — konfirmasi dan request DELETE terkirim", () => {
    cy.intercept("GET", `${API}/categories`, {
      statusCode: 200,
      body: { data: MOCK_CATEGORIES },
    }).as("getCategories");

    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-admin");
    });
    cy.visit("/admin/categories");
    cy.window().then((win) => {
      win.localStorage.setItem("token", "cypress-fake-token-admin");
    });
    cy.wait("@getCategories");

    cy.get('button[title="Hapus"]').first().click({ force: true });

    cy.contains("Hapus Kategori").should("exist");
    cy.contains("Web Development").should("exist");

    cy.intercept("DELETE", `${API}/categories/cat-1`, {
      statusCode: 200,
      body: { message: "Kategori berhasil dihapus" },
    }).as("deleteCategory");

    cy.contains("button", "Hapus").click();
    cy.wait("@deleteCategory");
  });
});
