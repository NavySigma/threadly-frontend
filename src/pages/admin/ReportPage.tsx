import { useParams } from "react-router-dom";
import ReportDetail from "./ReportDetail";
import ReportList from "./ReportList";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();

  if (id) return <ReportDetail id={id} />;
  return <ReportList />;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-zinc-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</span>
      <div className="text-sm font-medium text-zinc-900">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    resolved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };

  const colorClass =
    colorMap[status.toLowerCase()] ?? "bg-zinc-100 text-zinc-700 border-zinc-200";

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${colorClass}`}
    >
      {status}
    </span>
  );
}

export { DetailRow, StatusBadge };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export { formatDate };