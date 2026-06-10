import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AuthLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
