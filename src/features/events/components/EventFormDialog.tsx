import { useState } from "react";
import { eventCreateSchema } from "@/features/events/schema";
import type { Person } from "@/lib/models";

type Props = {
  open: boolean;
  people: Person[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    event_date: string;
    recurrence: "once" | "monthly" | "yearly";
    person_id: string | null;
    description?: string;
  }) => Promise<void>;
};

export default function EventFormDialog({
  open,
  people,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [recurrence, setRecurrence] = useState<"once" | "monthly" | "yearly">("yearly");
  const [personId, setPersonId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit() {
    setError("");
    const parsed = eventCreateSchema.safeParse({
      title,
      event_date: eventDate,
      recurrence,
      person_id: personId || null,
      description,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dữ liệu sự kiện không hợp lệ");
      return;
    }

    await onSubmit({
      ...parsed.data,
      person_id: parsed.data.person_id ?? null,
    });
    setTitle("");
    setEventDate("");
    setRecurrence("yearly");
    setPersonId("");
    setDescription("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Thêm sự kiện</h3>
        <input aria-label="Tên sự kiện" className="w-full rounded-lg border p-2 text-sm" placeholder="Tên sự kiện" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input aria-label="Ngày diễn ra" className="w-full rounded-lg border p-2 text-sm" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        <select aria-label="Chu kỳ lặp" className="w-full rounded-lg border p-2 text-sm" value={recurrence} onChange={(e) => setRecurrence(e.target.value as "once" | "monthly" | "yearly")}>
          <option value="once">Một lần</option>
          <option value="monthly">Hàng tháng</option>
          <option value="yearly">Hàng năm</option>
        </select>
        <select aria-label="Người liên quan" className="w-full rounded-lg border p-2 text-sm" value={personId} onChange={(e) => setPersonId(e.target.value)}>
          <option value="">Không gắn người cụ thể</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>{person.full_name}</option>
          ))}
        </select>
        <textarea aria-label="Mô tả sự kiện" className="w-full rounded-lg border p-2 text-sm" rows={3} placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-3 py-2 text-sm" onClick={onClose}>Hủy</button>
          <button disabled={loading} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white disabled:opacity-60" onClick={() => void handleSubmit()}>
            {loading ? "Đang lưu..." : "Lưu sự kiện"}
          </button>
        </div>
      </div>
    </div>
  );
}

