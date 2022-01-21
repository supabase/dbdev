import { Badge } from "@supabase/ui";
import { Typography } from "@supabase/ui";

const packages = [
  { id: 1, name: "Package 1", tags: ["helper"] },
  { id: 2, name: "Package 2", tags: ["some-tag", "other-tag"] },
];

export default function PackageList() {
  return (
    <div className="divide-y">
      {packages.map((p) => (
        <div className="p-4" key={p.id}>
          <Typography.Title level={4}>{p.name}</Typography.Title>
          {p.tags.map((tag) => (
            <span key={tag} className="pr-2">
              <Badge color="green">{tag}</Badge>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
