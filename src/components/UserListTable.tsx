import { useEffect, useState } from "react";
import { useAuth } from "../contexts/useAuth";

interface ActiveUser {
  id: string;
  email: string;
  username: string;
  roles: string; // Menyesuaikan dengan deklarasi di auth.ts kamu
}

export default function UserListTable() {
  const { user } = useAuth(); 
  const [userList, setUserList] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string>("");

  // 1. PROTEKSI AWAL (Di luar useEffect): 
  // Jika user belum login, atau bukan admin/moderator, langsung tolak di sini.
  // Ini menghindari pemanggilan setState sinkron di dalam useEffect.
  if (!user || (user.roles !== "admin" && user.roles !== "moderator")) {
    return null; 
  }

  // 2. EFFECT HANYA UNTUK FETCH DATA EKSTERNAL
  useEffect(() => {
    let isMounted = true; // Kebiasaan baik untuk mencegah memory leak

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${user.token}`, // Pastikan properti token ada di user kamu
          },
        });
        
        if (!response.ok) throw new Error("Gagal mengambil data");
        
        const data = await response.json();
        
        if (isMounted) {
          setUserList(data);
        }
      } catch (error) {
        if (isMounted) {
          setFetchError("Gagal memuat data user dari server.");
          console.error(error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false; // Cleanup ketika komponen unmount
    };
  }, [user.token]); // useEffect hanya berjalan ulang jika token berubah

  // 3. RENDER UI BERDASARKAN STATE
  if (loading) return <p className="p-4 text-gray-500">Memuat data user aktif...</p>;
  if (fetchError) return <p className="p-4 text-red-500">{fetchError}</p>;

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Daftar User Terdaftar (Akses: {user.roles})
      </h3>
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-100 text-left text-sm text-gray-600">
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-600">
          {userList.map((u) => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{u.email}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  u.roles === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {u.roles}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}