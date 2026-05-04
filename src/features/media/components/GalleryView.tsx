import type { Person } from "@/lib/models";

type Props = {
  people: Person[];
};

export default function GalleryView({ people }: Props) {
  const withAvatar = people.filter((p) => p.avatar_url);

  if (!withAvatar.length) {
    return <p className="p-4 text-sm text-slate-500">Chưa có ảnh nào trong thư viện.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3">
      {withAvatar.map((person) => (
        <div key={person.id} className="overflow-hidden rounded-lg border bg-white">
          <img
            src={person.avatar_url ?? ""}
            alt={person.full_name}
            className="h-36 w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/fallback-avatar.png";
            }}
          />
          <p className="p-2 text-sm">{person.full_name}</p>
        </div>
      ))}
    </div>
  );
}

