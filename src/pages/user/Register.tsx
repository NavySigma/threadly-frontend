import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

export default function Register() {
  const { register } = useAuth();
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);

    try {
      await register({
        username: form.get("username") as string,
        email: form.get("email") as string,
        password: form.get("password") as string,
        password_confirmation: form.get("password_confirmation") as string,
      });
      alert("Register berhasil!");
    } catch (err: any) {
      setError(err?.message || "Gagal register");
    }
  };

  return (
    <div className="so-auth-page">
      <div className="so-register-wrapper">
        {/* Sisi Kiri: Pesan Sambutan */}
        <div className="so-register-left">
          <h1>Join the Threadly community</h1>
          <ul>
            <li>
              <span>&#128269;</span> Get unstuck — ask a question!
            </li>
            <li>
              <span>&#128278;</span> Save your favorite posts, tags, and filters
            </li>
            <li>
              <span>&#127942;</span> Answer questions and earn reputation
            </li>
          </ul>
        </div>

        {/* Sisi Kanan: Form Register */}
        <div className="so-register-right">
          <div className="so-auth-card">
            {error && <p className="so-error-msg">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="so-form-group">
                <label>Username</label>
                <input name="username" type="text" required />
              </div>
              <div className="so-form-group">
                <label>Email</label>
                <input name="email" type="email" required />
              </div>
              <div className="so-form-group">
                <label>Password</label>
                <input name="password" type="password" required />
                <small>
                  Must contain 8+ characters, including at least 1 letter and 1
                  number.
                </small>
              </div>
              <div className="so-form-group">
                <label>Confirm Password</label>
                <input name="password_confirmation" type="password" required />
              </div>

              <button type="submit" className="so-submit-btn">
                Sign up
              </button>
            </form>

            <div className="so-oauth-container" style={{ marginTop: "24px" }}>
              <button className="so-oauth-btn so-oauth-google" type="button">
                Sign up with Google
              </button>
            </div>
          </div>

          <div className="so-auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
