import UserListTable from "../../components/UserListTable";

export default function ModeratorDashboard() {
  return (
    <div className="moderator-page">
      <h1>Panel Kerja Moderator Threadly</h1>
      
      {/* Komponen yang sama ditempel lagi di sini */}
      <div className="section">
        <UserListTable />
      </div>
    </div>
  );
}