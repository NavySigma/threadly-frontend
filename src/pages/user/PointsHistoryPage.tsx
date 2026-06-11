import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type PointHistory = {
  id: number;
  action_type: string;
  description: string;
  points: number;
  created_at: string;
};

export default function PostsHistoryPoints() {
  const token = localStorage.getItem("token");

  const [filter, setFilter] = useState<
    "all" | "earned" | "deducted"
  >("all");

  const histories: PointHistory[] = [
    {
      id: 1,
      action_type: "content_upvoted",
      description: "Konten kamu mendapat upvote",
      points: 2,
      created_at: "2026-06-08",
    },
    {
      id: 2,
      action_type: "answer_accepted",
      description: "Jawaban kamu diterima",
      points: 10,
      created_at: "2026-06-07",
    },
    {
      id: 3,
      action_type: "content_downvoted",
      description: "Konten kamu mendapat downvote",
      points: -2,
      created_at: "2026-06-06",
    },
    {
      id: 4,
      action_type: "downvote_given",
      description: "Kamu melakukan downvote",
      points: -1,
      created_at: "2026-06-05",
    },
  ];

  const filteredHistory = useMemo(() => {
    switch (filter) {
      case "earned":
        return histories.filter(
          (item) => item.points > 0
        );

      case "deducted":
        return histories.filter(
          (item) => item.points < 0
        );

      default:
        return histories;
    }
  }, [filter]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-4 text-center text-6xl">
            🔒
          </div>

          <h1 className="text-center text-2xl font-bold text-gray-800">
            Login Required
          </h1>

          <p className="mt-3 text-center text-gray-500">
            Kamu harus login terlebih dahulu
            untuk melihat riwayat poin.
          </p>

          <Link
            to="/login"
            className="mt-6 block rounded-xl bg-orange-500 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
          >
            Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Reputation History
        </h1>

        <p className="mt-2 text-orange-100">
          Riwayat perubahan reputasi akun kamu
        </p>
      </div>

      {/* Summary */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 p-6 text-white shadow">
          <p className="text-sm opacity-80">
            Current Reputation
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            120
          </h2>
        </div>

        <div className="rounded-2xl bg-green-50 p-6 shadow">
          <p className="text-sm text-gray-500">
            Total Earned
          </p>

          <h2 className="mt-2 text-4xl font-bold text-green-600">
            +150
          </h2>
        </div>

        <div className="rounded-2xl bg-red-50 p-6 shadow">
          <p className="text-sm text-gray-500">
            Total Deducted
          </p>

          <h2 className="mt-2 text-4xl font-bold text-red-500">
            -30
          </h2>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "all"
              ? "bg-orange-500 text-white"
              : "border bg-white"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter("earned")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "earned"
              ? "bg-orange-500 text-white"
              : "border bg-white"
          }`}
        >
          Earned
        </button>

        <button
          onClick={() => setFilter("deducted")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "deducted"
              ? "bg-orange-500 text-white"
              : "border bg-white"
          }`}
        >
          Deducted
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow">
        <div className="grid grid-cols-12 border-b bg-orange-50 px-6 py-4 text-sm font-semibold text-gray-700">
          <div className="col-span-2">Date</div>
          <div className="col-span-8">Activity</div>
          <div className="col-span-2 text-right">
            Points
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-3 text-5xl">📭</div>

            <p className="font-medium text-gray-700">
              Belum ada riwayat poin
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Aktivitas reputasi akan muncul di sini
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center border-b px-6 py-4 hover:bg-orange-50"
            >
              <div className="col-span-2 text-sm text-gray-500">
                {item.created_at}
              </div>

              <div className="col-span-8">
                <p className="font-medium text-gray-800">
                  {item.description}
                </p>

                <p className="text-sm text-gray-500">
                  {item.action_type}
                </p>
              </div>

              <div
                className={`col-span-2 text-right text-lg font-bold ${
                  item.points > 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {item.points > 0
                  ? `+${item.points}`
                  : item.points}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}