import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import threadlyLogo from "../../assets/threadly-removebg-preview.jpeg";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Password validation checks
  const checks = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const passwordValid = checks.length && checks.letter && checks.number;
  const passwordMatch =
    password === passwordConfirmation && passwordConfirmation !== "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!passwordValid) {
      setFieldErrors({ password: "Password belum memenuhi syarat." });
      return;
    }
    if (!passwordMatch) {
      setFieldErrors({ password_confirmation: "Password tidak cocok." });
      return;
    }

    try {
      await register({
        username,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate("/");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const e = err as { errors: Record<string, string[]> };
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(e.errors)) {
          mapped[k] = v[0];
        }
        setFieldErrors(mapped);
      } else if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Gagal mendaftar. Coba lagi.");
      }
    }
  };

  return (
    <div className="so-auth-page">
      <div className="so-register-wrapper">
        {/* ── Kiri ── */}
        <div className="so-register-left">
          <div className="so-register-brand">
            <img
              src={threadlyLogo}
              alt="Threadly"
              style={{ width: 48, height: 48 }}
            />
            <span className="so-register-brand-name">Threadly</span>
          </div>
          <ul className="so-register-features">
            <li>
              <span className="so-feature-icon">&#128269;</span>
              <span>Get unstuck — ask a question!</span>
            </li>
            <li>
              <span className="so-feature-icon">&#128278;</span>
              <span>Save your favorite posts, tags, and filters</span>
            </li>
            <li>
              <span className="so-feature-icon">&#127942;</span>
              <span>Answer questions and earn reputation</span>
            </li>
          </ul>
        </div>

        {/* ── Kanan ── */}
        <div className="so-register-right">
          <div className="so-auth-card">
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 4,
                color: "#0c0d0e",
              }}
            >
              Create your account
            </h2>
            <p style={{ fontSize: 13, color: "#6a737c", marginBottom: 20 }}>
              By clicking "Sign up", you agree to our{" "}
              <a href="#" style={{ color: "#0a95ff" }}>
                terms of service
              </a>{" "}
              and acknowledge you have read our{" "}
              <a href="#" style={{ color: "#0a95ff" }}>
                privacy policy
              </a>
              .
            </p>

            {error && <p className="so-error-msg">{error}</p>}

            <form onSubmit={handleSubmit} noValidate>
              {/* Username */}
              <div className="so-form-group">
                <label htmlFor="reg-username">Username</label>
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className={fieldErrors.username ? "so-input-error" : ""}
                />
                {fieldErrors.username && (
                  <span className="so-field-error">{fieldErrors.username}</span>
                )}
              </div>

              {/* Email */}
              <div className="so-form-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={fieldErrors.email ? "so-input-error" : ""}
                />
                {fieldErrors.email && (
                  <span className="so-field-error">{fieldErrors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="so-form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="so-input-wrapper">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={fieldErrors.password ? "so-input-error" : ""}
                  />
                  <button
                    type="button"
                    className="so-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>

                {/* Password checklist */}
                {password.length > 0 && (
                  <ul className="so-password-checklist">
                    <li
                      className={
                        checks.length ? "so-check-ok" : "so-check-fail"
                      }
                    >
                      {checks.length ? "✓" : "✗"} Minimal 8 karakter
                    </li>
                    <li
                      className={
                        checks.letter ? "so-check-ok" : "so-check-fail"
                      }
                    >
                      {checks.letter ? "✓" : "✗"} Mengandung minimal 1 huruf
                      (a–z atau A–Z)
                    </li>
                    <li
                      className={
                        checks.number ? "so-check-ok" : "so-check-fail"
                      }
                    >
                      {checks.number ? "✓" : "✗"} Mengandung minimal 1 angka
                      (0–9)
                    </li>
                  </ul>
                )}

                {password.length === 0 && (
                  <small className="so-field-hint">
                    Minimal 8 karakter, mengandung huruf dan angka.
                  </small>
                )}

                {fieldErrors.password && (
                  <span className="so-field-error">{fieldErrors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="so-form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={
                    fieldErrors.password_confirmation
                      ? "so-input-error"
                      : passwordConfirmation && !passwordMatch
                        ? "so-input-error"
                        : ""
                  }
                />
                {passwordConfirmation && !passwordMatch && (
                  <span className="so-field-error">Password tidak cocok.</span>
                )}
                {passwordConfirmation && passwordMatch && (
                  <span className="so-field-ok">✓ Password cocok</span>
                )}
                {fieldErrors.password_confirmation && (
                  <span className="so-field-error">
                    {fieldErrors.password_confirmation}
                  </span>
                )}
              </div>

              <button type="submit" className="so-submit-btn">
                Sign up
              </button>
            </form>
          </div>

          <div className="so-auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
