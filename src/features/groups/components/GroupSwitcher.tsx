type Props = {
  groups: { id: string; name: string }[];
  activeGroupId: string | null;
  onChange: (groupId: string) => void;
};

export default function GroupSwitcher({ groups, activeGroupId, onChange }: Props) {
  return (
    <select
      value={activeGroupId ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      aria-label="Chọn nhóm"
    >
      <option value="">Chọn nhóm</option>
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  );
}

