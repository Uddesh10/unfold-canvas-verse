import { usePhotographerStore } from "@/hooks/usePhotographerStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw, Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { resolveImageUrl } from "@/lib/imageUrl";

export const PhotographerEditor = () => {
  const { value, set, reset } = usePhotographerStore();

  const patch = (p: Partial<typeof value>) => set({ ...value, ...p });

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => { reset(); toast({ title: "Reset to defaults" }); }}>
          <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reset
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={value.name} onChange={(e) => patch({ name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input value={value.role} onChange={(e) => patch({ role: e.target.value })} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Portrait URL</Label>
          <Input value={value.portrait} onChange={(e) => patch({ portrait: e.target.value })} />
          {value.portrait && (
            <img src={resolveImageUrl(value.portrait)} alt="" className="mt-2 h-40 w-32 object-cover rounded-lg" />
          )}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Bio (use blank lines for paragraphs)</Label>
          <Textarea
            rows={6}
            value={value.bio}
            onChange={(e) => patch({ bio: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={value.location} onChange={(e) => patch({ location: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={value.email} onChange={(e) => patch({ email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Instagram URL</Label>
          <Input value={value.instagram} onChange={(e) => patch({ instagram: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Behance URL</Label>
          <Input value={value.behance} onChange={(e) => patch({ behance: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Stats</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => patch({ stats: [...value.stats, { label: "New", value: "0" }] })}
          >
            <Plus className="h-3.5 w-3.5 mr-2" /> Add stat
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {value.stats.map((s, i) => (
            <div key={i} className="flex gap-2 items-center glass rounded-xl p-3">
              <Input
                value={s.value}
                onChange={(e) => {
                  const stats = [...value.stats];
                  stats[i] = { ...s, value: e.target.value };
                  patch({ stats });
                }}
                className="w-24"
                placeholder="Value"
              />
              <Input
                value={s.label}
                onChange={(e) => {
                  const stats = [...value.stats];
                  stats[i] = { ...s, label: e.target.value };
                  patch({ stats });
                }}
                placeholder="Label"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => patch({ stats: value.stats.filter((_, j) => j !== i) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
