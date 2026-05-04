import { useState } from "react";
import { personCreateSchema } from "@/features/persons/schema";

type Props = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: { full_name: string; relationship_to_user: string }) => Promise<void>;
};

export default function PersonFormDialog({ open, loading = false, onClose, onSubmit }: Props) {
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit() {
    setError("");
    const parsed = personCreateSchema.safeParse({ full_name: fullName, relationship_to_user: relationship });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
      return;
    }

    await onSubmit(parsed.data);
    setFullName("");
    setRelationship("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Thêm thành viên</h3>
        <input aria-label="Họ tên" className="w-full rounded-lg border p-2 text-sm" placeholder="Họ tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input aria-label="Quan hệ" className="w-full rounded-lg border p-2 text-sm" placeholder="Quan hệ với tôi" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-3 py-2 text-sm" onClick={onClose}>Hủy</button>
          <button disabled={loading} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white disabled:opacity-60" onClick={() => void handleSubmit()}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

