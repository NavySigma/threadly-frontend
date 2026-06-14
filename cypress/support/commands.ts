/// <reference types="cypress" />

const API = "https://navysigma.alwaysdata.net/api";

function toForm(body: Record<string, string>) {
  return Object.entries(body)
    .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
    .join("&");
}

Cypress.Commands.add("apiLogin", (email: string, password: string) => {
  cy.request({
    method: "POST",
    url: `${API}/login`,
    body: toForm({ email, password }),
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 200) {
      const token = res.body.access_token ?? res.body.data?.token ?? res.body.token;
      if (token) {
        cy.window().then((win) => win.localStorage.setItem("token", token));
        cy.visit("/");
      }
    }
  });
});

Cypress.Commands.add("apiRegister", (username: string, email: string, password: string) => {
  cy.request({
    method: "POST",
    url: `${API}/register`,
    body: toForm({ username, email, password, password_confirmation: password }),
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 201) {
      const token = res.body.access_token ?? res.body.data?.token ?? res.body.token;
      if (token) {
        cy.window().then((win) => win.localStorage.setItem("token", token));
      }
    }
  });
});

Cypress.Commands.add("ensureTestUser", (email: string, password: string) => {
  const username = email.split("@")[0];
  cy.apiRegister(username, email, password).then(() => {
    cy.window().then((win) => {
      if (!win.localStorage.getItem("token")) {
        cy.apiLogin(email, password);
      }
    });
  });
});

Cypress.Commands.add("apiRequest", ({ method, path, body, token, failOnStatus }: {
  method: string;
  path: string;
  body?: unknown;
  token?: string;
  failOnStatus?: boolean;
}) => {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  cy.request({
    method,
    url: `${API}${path}`,
    body: body !== undefined ? toForm(body as Record<string, string>) : undefined,
    headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
    failOnStatusCode: failOnStatus ?? false,
  });
});

Cypress.Commands.add("getToken", () => {
  return cy.window().then((win) => win.localStorage.getItem("token") ?? "");
});

declare global {
  namespace Cypress {
    interface Chainable {
      apiLogin(email: string, password: string): Chainable<void>;
      apiRegister(username: string, email: string, password: string): Chainable<void>;
      ensureTestUser(email: string, password: string): Chainable<void>;
      apiRequest(opts: {
        method: string;
        path: string;
        body?: unknown;
        token?: string;
        failOnStatus?: boolean;
      }): Chainable<Response<unknown>>;
      getToken(): Chainable<string>;
    }
  }
}
