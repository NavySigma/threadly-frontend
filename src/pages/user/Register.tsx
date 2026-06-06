import { useState, type FormEvent } from "react";
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
      setError(err.message || "Gagal register");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Daftar</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input name="username" placeholder="Username" required />
      <input name="email" type="email" placeholder="Email" required />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        minLength={8}
      />
      <input
        name="password_confirmation"
        type="password"
        placeholder="Konfirmasi Password"
        required
      />

      <button type="submit">Daftar</button>
    </form>
  );
}
