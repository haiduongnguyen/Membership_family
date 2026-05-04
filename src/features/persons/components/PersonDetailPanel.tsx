import type { Person } from "@/lib/models";
import ImageUploader from "@/features/media/components/ImageUploader";

type Props = {
  person: Person | null;
  onChange: (person: Person) => void;
  onSave: () => Promise<void>;
  onUploadAvatar: (personId: string, file: File) => Promise<void>;
};

export default function PersonDetailPanel({ person, onChange, onSave, onUploadAvatar }: Props) {
  if (!person) {
    return <p className="text-sm text-slate-500">Chọn một node để xem/sửa thông tin.</p>;
  }

  return (
    <div className="space-y-2">
      <input className="w-full rounded-lg border p-2 text-sm" value={person.full_name} onChange={(e) => onChange({ ...person, full_name: e.target.value })} />
      <input className="w-full rounded-lg border p-2 text-sm" placeholder="Quan hệ với tôi" value={person.relationship_to_user ?? ""} onChange={(e) => onChange({ ...person, relationship_to_user: e.target.value })} />
      <input className="w-full rounded-lg border p-2 text-sm" placeholder="Số điện thoại" value={person.phone ?? ""} onChange={(e) => onChange({ ...person, phone: e.target.value })} />
      <input className="w-full rounded-lg border p-2 text-sm" placeholder="Nghề nghiệp" value={person.occupation ?? ""} onChange={(e) => onChange({ ...person, occupation: e.target.value })} />
      <textarea className="w-full rounded-lg border p-2 text-sm" rows={4} placeholder="Ghi chú" value={person.notes ?? ""} onChange={(e) => onChange({ ...person, notes: e.target.value })} />
      <ImageUploader label="Ảnh đại diện" onFileSelected={(file) => onUploadAvatar(person.id, file)} />
      <button className="w-full rounded-lg bg-cyan-600 p-2 text-white" onClick={() => void onSave()}>Lưu hồ sơ</button>
    </div>
  );
}

