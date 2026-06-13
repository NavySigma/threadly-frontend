import UserListTable from "../../components/UserListTable";

export default function AdminDashboard() {
  return (
    <div className="admin-page">
      <h1>Selamat Datang di Panel Utama Admin</h1>
      
      {/* Tinggal tempel di sini */}
      <div className="section">
        <UserListTable />
      </div>
    </div>
  );
}