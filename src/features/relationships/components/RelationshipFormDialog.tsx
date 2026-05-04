import { useMemo, useState } from "react";
import type { Person, RelationType } from "@/lib/models";

const relationOptions: RelationType[] = [
  "father",
  "mother",
  "sibling",
  "grandparent",
  "uncle_aunt",
  "cousin",
  "spouse",
  "child",
  "friend",
  "colleague",
  "manager",
  "employee",
];

const relationLabels: Record<RelationType, string> = {
  self: "Bản thân",
  father: "Bố",
  mother: "Mẹ",
  sibling: "Anh/chị/em ruột",
  grandparent: "Ông/bà",
  uncle_aunt: "Bác/cô/chú/dì/cậu",
  cousin: "Anh/chị/em họ",
  spouse: "Vợ/chồng",
  child: "Con",
  friend: "Bạn bè",
  colleague: "Đồng nghiệp",
  manager: "Quản lý",
  employee: "Nhân viên",
};

type Props = {
  open: boolean;
  people: Person[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: { sourceId: string; targetId: string; relationType: RelationType }) => Promise<void>;
};

export default function RelationshipFormDialog({ open, people, loading = false, onClose, onSubmit }: Props) {
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [relationType, setRelationType] = useState<RelationType>("child");
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => sourceId && targetId && relationType, [sourceId, targetId, relationType]);

  if (!open) return null;

  async function handleSubmit() {
    setError("");
    if (!sourceId || !targetId) {
      setError("Cần chọn đầy đủ 2 thành viên");
      return;
    }
    await onSubmit({ sourceId, targetId, relationType });
    setSourceId("");
    setTargetId("");
    setRelationType("child");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Thêm quan hệ</h3>
        <select aria-label="Nguồn quan hệ" className="w-full rounded-lg border p-2 text-sm" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
          <option value="">Chọn người nguồn</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
        <select aria-label="Đích quan hệ" className="w-full rounded-lg border p-2 text-sm" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
          <option value="">Chọn người đích</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
        <select aria-label="Loại quan hệ" className="w-full rounded-lg border p-2 text-sm" value={relationType} onChange={(e) => setRelationType(e.target.value as RelationType)}>
          {relationOptions.map((type) => <option key={type} value={type}>{relationLabels[type]}</option>)}
        </select>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-3 py-2 text-sm" onClick={onClose}>Hủy</button>
          <button disabled={loading || !canSubmit} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white disabled:opacity-60" onClick={() => void handleSubmit()}>
            {loading ? "Đang lưu..." : "Lưu quan hệ"}
          </button>
        </div>
      </div>
    </div>
  );
}

