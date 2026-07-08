import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadPropertyImage } from "@/lib/dashboard";
import type { Project, ProjectStatus } from "@/lib/developers";

const STATES = [
  "Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Kano", "Kaduna", "Enugu", "Delta",
  "Edo", "Anambra", "Ogun", "Cross River", "Akwa Ibom", "Imo", "Plateau",
];

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "pre_launch", label: "Pre-launch" },
  { value: "selling", label: "Selling" },
  { value: "sold_out", label: "Sold out" },
  { value: "completed", label: "Completed" },
];

export function ProjectForm({
  initial,
  developerId,
  mode,
}: {
  initial?: Project;
  developerId: string;
  mode: "create" | "edit";
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    state: initial?.state ?? "Lagos",
    city: initial?.city ?? "",
    area: initial?.area ?? "",
    address: initial?.address ?? "",
    total_units: initial?.total_units ? String(initial.total_units) : "",
    starting_price: initial?.starting_price ? String(initial.starting_price) : "",
    status: initial?.status ?? ("planning" as ProjectStatus),
    launch_date: initial?.launch_date ?? "",
    completion_date: initial?.completion_date ?? "",
    amenities: (initial?.amenities ?? []).join(", "),
    published: initial?.published ?? true,
  });
  const [cover, setCover] = useState<string>(initial?.cover_image ?? "");
  const [layout, setLayout] = useState<string>(initial?.layout_image ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [uploading, setUploading] = useState<"cover" | "layout" | "gallery" | null>(null);
  const [saving, setSaving] = useState(false);

  async function upload(kind: "cover" | "layout" | "gallery", file: File) {
    setUploading(kind);
    try {
      const url = await uploadPropertyImage(developerId, file);
      if (kind === "cover") setCover(url);
      else if (kind === "layout") setLayout(url);
      else setGallery((g) => [...g, url]);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("Project name is required");
    setSaving(true);
    const payload = {
      developer_id: developerId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      state: form.state,
      city: form.city.trim() || null,
      area: form.area.trim() || null,
      address: form.address.trim() || null,
      total_units: form.total_units ? Number(form.total_units) : null,
      starting_price: form.starting_price ? Number(form.starting_price) : null,
      status: form.status,
      launch_date: form.launch_date || null,
      completion_date: form.completion_date || null,
      amenities: form.amenities
        ? form.amenities.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      cover_image: cover || null,
      layout_image: layout || null,
      gallery,
      published: form.published,
    };

    const { data, error } =
      mode === "edit" && initial
        ? await supabase.from("projects").update(payload).eq("id", initial.id).select().single()
        : await supabase.from("projects").insert(payload).select().single();

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(mode === "edit" ? "Project updated" : "Project created");
    qc.invalidateQueries({ queryKey: ["dev-projects"] });
    qc.invalidateQueries({ queryKey: ["project", data?.id] });
    navigate({ to: "/developer/projects/$id", params: { id: data!.id } });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="name">Project name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <Label>State *</Label>
            <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="area">Area / neighbourhood</Label>
            <Input id="area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div>
            <Label htmlFor="units">Total units</Label>
            <Input
              id="units"
              type="number"
              min={0}
              value={form.total_units}
              onChange={(e) => setForm({ ...form, total_units: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="price">Starting price (₦)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              value={form.starting_price}
              onChange={(e) => setForm({ ...form, starting_price: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="launch">Launch date</Label>
            <Input
              id="launch"
              type="date"
              value={form.launch_date ?? ""}
              onChange={(e) => setForm({ ...form, launch_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="completion">Completion date</Label>
            <Input
              id="completion"
              type="date"
              value={form.completion_date ?? ""}
              onChange={(e) => setForm({ ...form, completion_date: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
            <Input
              id="amenities"
              placeholder="Pool, Gym, 24/7 Security, Playground"
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <MediaUpload
            label="Cover image"
            url={cover}
            uploading={uploading === "cover"}
            onFile={(f) => upload("cover", f)}
            onClear={() => setCover("")}
          />
          <MediaUpload
            label="Estate layout / masterplan"
            url={layout}
            uploading={uploading === "layout"}
            onFile={(f) => upload("layout", f)}
            onClear={() => setLayout("")}
          />
          <div>
            <Label>Gallery</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {gallery.map((g) => (
                <div key={g} className="relative size-24 overflow-hidden rounded-md border">
                  <img src={g} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setGallery((list) => list.filter((x) => x !== g))}
                    className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/70 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <label className="grid size-24 cursor-pointer place-items-center rounded-md border border-dashed text-muted-foreground hover:bg-muted">
                {uploading === "gallery" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && upload("gallery", e.target.files[0])}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Publish this project publicly
        </label>
        <Button type="submit" disabled={saving} className="rounded-full">
          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {mode === "edit" ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}

function MediaUpload({
  label,
  url,
  uploading,
  onFile,
  onClear,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex items-center gap-4">
        <div className="size-28 shrink-0 overflow-hidden rounded-md border bg-muted">
          {url ? <img src={url} alt="" className="size-full object-cover" /> : null}
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {url ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>
          {url ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
