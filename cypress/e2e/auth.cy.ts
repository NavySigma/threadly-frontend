const API = "https://navysigma.alwaysdata.net/api";
const TEST_EMAIL = "cypresstest@mail.com";
const TEST_PASS = "CypressTest1";

function toForm(body: Record<string, string>) {
  return Object.entries(body)
    .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
    .join("&");
}

let testToken = "";
const MOCK_USER = { id: 1, username: "cypresstest", email: TEST_EMAIL, avatar: null, is_admin: false, is_moderator: false };
const MOCK_LOGIN_RES = { access_token: "mock-token-xxx", user: MOCK_USER };

before(() => {
  cy.clearLocalStorage();
  cy.request({
    method: "POST",
    url: `${API}/register`,
    body: toForm({ username: "cypresstest", email: TEST_EMAIL, password: TEST_PASS, password_confirmation: TEST_PASS }),
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 201) {
      testToken = res.body.access_token ?? "";
    } else {
      cy.request({
        method: "POST",
        url: `${API}/login`,
        body: toForm({ email: TEST_EMAIL, password: TEST_PASS }),
        headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        failOnStatusCode: false,
      }).then((r) => {
        if (r.status === 200) testToken = r.body.access_token ?? "";
      });
    }
  });
});

describe("Login", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    cy.clearLocalStorage();
  });

  it("login berhasil — redirect ke / dan navbar avatar muncul", () => {
    cy.intercept("POST", `${API}/login`, { statusCode: 200, body: MOCK_LOGIN_RES }).as("loginOk");
    cy.intercept("GET", `${API}/me`, { statusCode: 200, body: { data: MOCK_USER } }).as("meOk");

    cy.window().then((win) => win.localStorage.setItem("token", testToken));
    cy.visit("/login");
    cy.get("#email").clear().type(TEST_EMAIL);
    cy.get("#password").clear().type(TEST_PASS);
    cy.get('button[type="submit"]').click();
    cy.wait("@loginOk");
    cy.wait("@meOk");
    cy.url({ timeout: 15000 }).should("not.include", "/login");
    cy.get(".navbar-avatar", { timeout: 15000 }).should("be.visible");
  });

  it("login gagal — pesan error tampil", () => {
    cy.intercept("POST", `${API}/login`, {
      statusCode: 401,
      body: { message: "Invalid credentials" },
    }).as("loginFail");

    cy.visit("/login");
    cy.get("#email").type("random@mail.com");
    cy.get("#password").type("wrongpassword");
    cy.get('button[type="submit"]').click();
    cy.wait("@loginFail");
    cy.contains("Invalid credentials", { timeout: 10000 }).should("be.visible");
    cy.url().should("include", "/login");
  });

  it("login field kosong — form tidak submit karena validasi HTML5", () => {
    cy.visit("/login");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/login");
  });

  it("login lalu logout — redirect ke /login", () => {
    cy.intercept("POST", `${API}/login`, { statusCode: 200, body: MOCK_LOGIN_RES }).as("loginOk");
    cy.intercept("GET", `${API}/me`, { statusCode: 200, body: { data: MOCK_USER } }).as("meOk");

    cy.window().then((win) => win.localStorage.setItem("token", testToken));
    cy.visit("/login");
    cy.get("#email").clear().type(TEST_EMAIL);
    cy.get("#password").clear().type(TEST_PASS);
    cy.get('button[type="submit"]').click();
    cy.wait("@loginOk");
    cy.wait("@meOk");
    cy.url({ timeout: 15000 }).should("not.include", "/login");
    cy.get(".navbar-avatar", { timeout: 15000 }).should("be.visible");

    cy.visit("/profile");
    cy.contains("button", "Activity").click();
    cy.contains("button", "Logout").click();
    cy.url({ timeout: 15000 }).should("include", "/login");
    cy.window().its("localStorage").invoke("getItem", "token").should("be.null");
  });

  it("user sudah login visit /login — tetap di /login", () => {
    cy.intercept("GET", `${API}/me`, { statusCode: 200, body: { data: MOCK_USER } }).as("meOk");

    cy.window().then((win) => win.localStorage.setItem("token", testToken));
    cy.visit("/login");
    cy.wait("@meOk");
    cy.get("#email").should("be.visible");
    cy.url().should("include", "/login");
  });
});

describe("Register", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    cy.clearLocalStorage();
  });

  const ts = Date.now();

  it("register berhasil — redirect ke / dan user langsung login", () => {
    cy.intercept("POST", `${API}/register`, {
      statusCode: 201,
      body: {
        message: "User registered.",
        data: { id: 99, username: "reg" + ts, email: "reg" + ts + "@test.com", avatar: null, is_admin: false, is_moderator: false },
      },
    }).as("regSuccess");

    cy.visit("/register");
    cy.get("#reg-username").clear().type("reg" + ts);
    cy.get("#reg-email").clear().type("reg" + ts + "@test.com");
    cy.get("#reg-password").clear().type("RegTest1");
    cy.get("#reg-confirm").clear().type("RegTest1");
    cy.get('button[type="submit"]').click();
    cy.wait("@regSuccess");
    cy.url({ timeout: 15000 }).should("not.include", "/register");
  });

  it("register email sudah dipakai — field error email tampil", () => {
    cy.intercept("POST", `${API}/register`, {
      statusCode: 422,
      body: { message: "The given data was invalid.", errors: { email: ["Email sudah digunakan."] } },
    }).as("regFail");

    cy.visit("/register");
    cy.get("#reg-username").clear().type("dupuser");
    cy.get("#reg-email").clear().type(TEST_EMAIL);
    cy.get("#reg-password").clear().type("Password1");
    cy.get("#reg-confirm").clear().type("Password1");
    cy.get('button[type="submit"]').click();
    cy.wait("@regFail");
    cy.contains("Email sudah digunakan.", { timeout: 10000 }).should("be.visible");
    cy.url().should("include", "/register");
  });

  it("password tidak memenuhi syarat — checklist merah dan form tidak submit", () => {
    cy.visit("/register");
    cy.get("#reg-username").type("testuser");
    cy.get("#reg-email").type("test@mail.com");
    cy.get("#reg-password").type("abc");
    cy.contains("Minimal 8 karakter").should("be.visible");
    cy.get("#reg-confirm").type("abc");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/register");
  });

  it("password tidak cocok — pesan error konfirmasi tampil", () => {
    cy.visit("/register");
    cy.get("#reg-username").type("testuser");
    cy.get("#reg-email").type("test@mail.com");
    cy.get("#reg-password").type("Password1");
    cy.get("#reg-confirm").type("Password2");
    cy.contains("Password tidak cocok.").should("be.visible");
    cy.get('button[type="submit"]').click();
    cy.contains("Password tidak cocok.").should("be.visible");
  });

  it("field wajib kosong — form tidak submit karena validasi HTML5", () => {
    cy.visit("/register");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/register");
  });
});

describe("Forgot Password", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    cy.clearLocalStorage();
  });

  it("kirim link reset berhasil — tampil halaman sukses", () => {
    cy.intercept("POST", `${API}/forgot-password`, {
      statusCode: 200,
      body: { message: "Reset link telah dikirim." },
    }).as("forgotPassword");

    cy.visit("/forgot-password");
    cy.contains("Lupa Password").should("be.visible");
    cy.get('input[type="email"]').type(TEST_EMAIL);
    cy.contains("button", "Kirim Link Reset").click();
    cy.wait("@forgotPassword");
    cy.contains("Cek Email Kamu!").should("be.visible");
  });

  it("email tidak terdaftar — pesan error dari server tampil", () => {
    cy.intercept("POST", `${API}/forgot-password`, {
      statusCode: 422,
      body: { message: "Email tidak ditemukan.", errors: { email: ["Email tidak ditemukan."] } },
    }).as("emailNotFound");

    cy.visit("/forgot-password");
    cy.get('input[type="email"]').type("notfound@mail.com");
    cy.contains("button", "Kirim Link Reset").click();
    cy.wait("@emailNotFound");
    cy.contains("Email tidak ditemukan", { timeout: 10000 }).should("be.visible");
  });
});

describe("Reset Password", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    cy.clearLocalStorage();
  });

  it("token/email tidak ada di URL — tampil halaman Link Tidak Valid", () => {
    cy.visit("/reset-password");
    cy.contains("Link Tidak Valid").should("be.visible");
    cy.contains("Minta link baru").should("be.visible");
  });

  it("reset password berhasil — redirect ke /login?reset=success", () => {
    cy.intercept("POST", `${API}/reset-password`, {
      statusCode: 200,
      body: { message: "Password berhasil direset." },
    }).as("resetPassword");

    cy.visit("/reset-password?token=valid-token&email=test%40mail.com");
    cy.contains("Reset Password").should("be.visible");
    cy.get('input[placeholder="Minimal 8 karakter"]').type("NewPassword1");
    cy.get('input[placeholder="Ulangi password baru"]').type("NewPassword1");
    cy.contains("button", "Reset Password").click();
    cy.wait("@resetPassword");
    cy.url().should("include", "/login");
    cy.url().should("include", "reset=success");
  });

  it("password tidak cocok — pesan error tampil dan tidak submit", () => {
    cy.visit("/reset-password?token=some-token&email=test%40mail.com");
    cy.contains("Reset Password").should("be.visible");
    cy.get('input[placeholder="Minimal 8 karakter"]').type("NewPassword1");
    cy.get('input[placeholder="Ulangi password baru"]').type("DifferentPass2");
    cy.contains("button", "Reset Password").click();
    cy.contains("Password tidak cocok.").should("be.visible");
  });
});

export {};
