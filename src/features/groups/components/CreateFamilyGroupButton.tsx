type Props = {
  onCreateFamilyGroup: () => Promise<void>;
};

export default function CreateFamilyGroupButton({ onCreateFamilyGroup }: Props) {
  return (
    <button
      onClick={() => void onCreateFamilyGroup()}
      className="rounded-xl bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-500"
    >
      + Nhóm Gia đình
    </button>
  );
}

