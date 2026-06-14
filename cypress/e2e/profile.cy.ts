/**
 * E2E Tests — Profile: Edit Profile, Ganti Password, Follow User
 *
 * Strategi login: mock POST /login dan GET /me dengan URL lengkap
 * backend (alwaysdata.net), lalu login via form UI agar AuthContext
 * menyimpan token secara normal.
 */

// ══════════════════════════════════════════════════════════════════════
// KONSTANTA
// ══════════════════════════════════════════════════════════════════════

const API = "https://navysigma.alwaysdata.net/api";

const TEST_EMAIL    = "eris@gmail.com";
const TEST_PASSWORD = "ErisRahma123";

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

const MOCK_OTHER_USER = {
  id: "user-other",
  username: "otheruser",
  email: "other@mail.com",
  avatar_url: null as string | null,
  bio: null as string | null,
  reputation_points: 80,
  level: 1,
  is_banned: 0,
  is_following: false,
  role_name: null as string | null,
  created_at: "2024-02-01T00:00:00.000Z",
  updated_at: "2024-02-01T00:00:00.000Z",
};

// ══════════════════════════════════════════════════════════════════════
// HELPER: SETUP MOCK + LOGIN
// ══════════════════════════════════════════════════════════════════════

/**
 * Mock POST /login dan GET /me dengan URL lengkap backend,
 * lalu login via form UI menggunakan credential eris@gmail.com.
 */
function doLogin(userOverride: Partial<typeof MOCK_USER> = {}) {
  const user = { ...MOCK_USER, ...userOverride };

  // Mock POST /login — kembalikan fake access_token + user
  cy.intercept("POST", `${API}/login`, {
    statusCode: 200,
    body: {
      access_token: "cypress-fake-token-eris",
      token_type: "Bearer",
      user,
    },
  }).as("loginApi");

  // Mock GET /me — dipanggil AuthContext saat mount & setelah login
  cy.intercept("GET", `${API}/me`, {
    statusCode: 200,
    body: {
      data: user,
    },
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
}

// ══════════════════════════════════════════════════════════════════════
// 1. EDIT PROFILE
// ══════════════════════════════════════════════════════════════════════

describe("Edit Profile", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    doLogin();
    cy.visit("/profile/edit");
    cy.contains("Pengaturan akun", { timeout: 10000 }).should("be.visible");
  });

  it("klik halaman edit profile — menampilkan form edit profil dengan data user", () => {
    cy.contains("Edit profil").should("be.visible");
    cy.get('input[name="username"]')
      .should("be.visible")
      .and("have.value", MOCK_USER.username);
    cy.get('textarea[name="bio"]')
      .should("be.visible")
      .and("have.value", MOCK_USER.bio);
    cy.contains("button", "Simpan perubahan").should("be.visible");
  });

  it("coba ganti avatar gagal — menampilkan error jika server menolak upload", () => {
    cy.intercept("PUT", `${API}/me`, {
      statusCode: 422,
      body: { message: "Format file tidak didukung." },
    }).as("updateFail");

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("not-an-image"),
        fileName: "broken.txt",
        mimeType: "text/plain",
      },
      { force: true }
    );

    cy.contains("button", "Simpan perubahan").click();
    cy.wait("@updateFail");
    cy.contains("Format file tidak didukung.").should("be.visible");
  });

  it("coba ganti avatar berhasil — preview langsung berubah setelah pilih file", () => {
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("fake-image-content"),
        fileName: "avatar.jpg",
        mimeType: "image/jpeg",
      },
      { force: true }
    );

    // Preview muncul langsung (blob URL)
    cy.get('img[alt]').should("exist");

    cy.intercept("PUT", `${API}/me`, {
      statusCode: 200,
      body: {
        message: "Profil berhasil diperbarui.",
        data: { ...MOCK_USER, avatar_url: "https://cdn.threadly.id/avatars/new.jpg" },
      },
    }).as("updateOk");

    cy.contains("button", "Simpan perubahan").click();
    cy.wait("@updateOk");
    cy.contains("Profil berhasil diperbarui.").should("be.visible");
  });

  it("coba klik simpan perubahan saat tidak ada perubahan — tidak mengirim request ke API", () => {
    cy.intercept("PUT", `${API}/me`).as("updateProfile");

    cy.contains("button", "Simpan perubahan").click();

    // Payload kosong → early return → tidak ada request
    cy.get("@updateProfile.all").should("have.length", 0);
  });

  it("coba klik simpan perubahan berhasil — menampilkan pesan sukses dan memperbarui data", () => {
    const newUsername = "eris_updated";

    cy.intercept("PUT", `${API}/me`, {
      statusCode: 200,
      body: {
        message: "Profil berhasil diperbarui.",
        data: { ...MOCK_USER, username: newUsername },
      },
    }).as("updateOk");

    cy.get('input[name="username"]').clear().type(newUsername);
    cy.contains("button", "Simpan perubahan").click();
    cy.wait("@updateOk");

    cy.contains("Profil berhasil diperbarui.").should("be.visible");
    cy.get('input[name="username"]').should("have.value", newUsername);
  });
});

// ══════════════════════════════════════════════════════════════════════
// 2. GANTI PASSWORD
// ══════════════════════════════════════════════════════════════════════

describe("Ganti Password", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    doLogin();
    cy.visit("/profile/edit");
    cy.contains("Pengaturan akun", { timeout: 10000 }).should("be.visible");

    // Pindah ke tab Ganti password
    cy.contains("button", "Ganti password").click();
    cy.contains("Password baru", { timeout: 5000 }).should("be.visible");
  });

  it("coba kunjungi halaman ganti password — form tampil dengan field yang kosong", () => {
    cy.contains("Password baru").should("be.visible");
    cy.contains("Konfirmasi password baru").should("be.visible");
    cy.contains("button", "Ganti password").should("be.visible");
    cy.get('input[autocomplete="new-password"]').first().should("have.value", "");
    cy.get('input[autocomplete="new-password"]').last().should("have.value", "");
  });

  it("coba langsung klik ganti password kosongan — validasi minimal 8 karakter muncul", () => {
    cy.intercept("PUT", `${API}/me/password`).as("changePw");

    cy.get('form button[type="submit"]').click();

    cy.contains("Password baru minimal 8 karakter.").should("be.visible");
    cy.get("@changePw.all").should("have.length", 0);
  });

  it("coba validasi current password salah — server kembalikan error", () => {
    cy.intercept("PUT", `${API}/me/password`, {
      statusCode: 422,
      body: { message: "Password saat ini tidak sesuai." },
    }).as("changePwFail");

    cy.get('input[autocomplete="new-password"]').first().type("NewPass123!");
    cy.get('input[autocomplete="new-password"]').last().type("NewPass123!");

    cy.get('form button[type="submit"]').click();
    cy.wait("@changePwFail");

    cy.contains("Password saat ini tidak sesuai.").should("be.visible");
  });

  it("coba validasi password baru gagal — error konfirmasi tidak cocok", () => {
    cy.intercept("PUT", `${API}/me/password`).as("changePw");

    cy.get('input[autocomplete="new-password"]').first().type("NewPass123!");
    cy.get('input[autocomplete="new-password"]').last().type("BedaPass999!");

    cy.get('form button[type="submit"]').click();

    cy.contains("Konfirmasi password baru tidak cocok.").should("be.visible");
    cy.get("@changePw.all").should("have.length", 0);
  });

  it("coba validasi password baru berhasil — indikator kekuatan tampil sesuai input", () => {
    cy.get('input[autocomplete="new-password"]').first().type("abc1");
    cy.contains("Lemah").should("be.visible");

    cy.get('input[autocomplete="new-password"]').first().clear().type("StrongP@ss1");
    cy.contains(/Kuat|Sangat kuat/).should("be.visible");

    cy.get('input[autocomplete="new-password"]').last().type("StrongP@ss1");
    cy.contains("Password tidak cocok").should("not.exist");
  });

  it("coba ganti password berhasil — pesan sukses muncul dan form direset", () => {
    cy.intercept("PUT", `${API}/me/password`, {
      statusCode: 200,
      body: { message: "Password berhasil diperbarui." },
    }).as("changePwOk");

    // Mock re-login otomatis yang dilakukan PasswordTab setelah sukses
    cy.intercept("POST", `${API}/login`, {
      statusCode: 200,
      body: {
        access_token: "cypress-new-token",
        token_type: "Bearer",
        user: MOCK_USER,
      },
    }).as("reLogin");

    cy.get('input[autocomplete="new-password"]').first().type("NewPass123!");
    cy.get('input[autocomplete="new-password"]').last().type("NewPass123!");

    cy.get('form button[type="submit"]').click();
    cy.wait("@changePwOk");

    cy.contains("Password berhasil diperbarui.").should("be.visible");
    cy.get('input[autocomplete="new-password"]').first().should("have.value", "");
    cy.get('input[autocomplete="new-password"]').last().should("have.value", "");
  });
});

// ══════════════════════════════════════════════════════════════════════
// 3. FOLLOW USER
// ══════════════════════════════════════════════════════════════════════

describe("Follow User", () => {
  const MOCK_USERS_RESPONSE = {
    current_page: 1,
    last_page: 1,
    total: 2,
    data: [
      MOCK_OTHER_USER,
      { ...MOCK_OTHER_USER, id: "user-another", username: "anotheruser", is_following: true },
    ],
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    doLogin();

    cy.intercept("GET", `${API}/users*`, {
      statusCode: 200,
      body: MOCK_USERS_RESPONSE,
    }).as("getUsers");

    cy.intercept("POST", `${API}/users/${MOCK_OTHER_USER.id}/follow`, {
      statusCode: 200,
      body: { message: "Berhasil follow user." },
    }).as("followUser");

    cy.intercept("DELETE", `${API}/users/${MOCK_OTHER_USER.id}/follow`, {
      statusCode: 200,
      body: { message: "Berhasil unfollow user." },
    }).as("unfollowUser");

    cy.visit("/users");
    cy.wait("@getUsers");
  });

  it("follow user — klik tombol Follow dan status berubah menjadi Following", () => {
    cy.contains("otheruser").should("be.visible");
    cy.contains("+ Follow").first().should("be.visible").click();
    cy.wait("@followUser");
    cy.contains("✓ Following").should("be.visible");
  });

  it("follow user — request POST dikirim ke endpoint yang benar", () => {
    cy.contains("+ Follow").first().click();
    cy.wait("@followUser").then((interception) => {
      expect(interception.request.method).to.equal("POST");
      expect(interception.request.url).to.include(`/users/${MOCK_OTHER_USER.id}/follow`);
    });
  });

  it("follow user — tombol disable saat request sedang berjalan", () => {
    cy.intercept("POST", `${API}/users/${MOCK_OTHER_USER.id}/follow`, (req) => {
      req.on("response", (res) => { res.setDelay(500); });
      req.reply({ statusCode: 200, body: { message: "OK" } });
    }).as("followDelayed");

    cy.contains("+ Follow").first().click();
    cy.contains(/Follow\.\.\.|Following\.\.\./).should("exist");
    cy.wait("@followDelayed");
    cy.contains("✓ Following").should("be.visible");
  });

  it("unfollow user — klik Following mengubah status kembali ke Follow", () => {
    cy.intercept("DELETE", `${API}/users/user-another/follow`, {
      statusCode: 200,
      body: { message: "Berhasil unfollow user." },
    }).as("unfollowAnother");

    cy.contains("✓ Following").first().click();
    cy.wait("@unfollowAnother");
    cy.contains("+ Follow").should("be.visible");
  });

  it("follow user — tidak ada tombol Follow untuk card milik diri sendiri", () => {
    cy.intercept("GET", `${API}/users*`, {
      statusCode: 200,
      body: {
        ...MOCK_USERS_RESPONSE,
        data: [
          ...MOCK_USERS_RESPONSE.data,
          { ...MOCK_OTHER_USER, id: MOCK_USER.id, username: MOCK_USER.username },
        ],
      },
    }).as("getUsersWithSelf");

    cy.visit("/users");
    cy.wait("@getUsersWithSelf");

    cy.contains(MOCK_USER.username)
      .closest('[class*="border"]')
      .within(() => {
        cy.contains("+ Follow").should("not.exist");
        cy.contains("✓ Following").should("not.exist");
      });
  });
});

export {};

