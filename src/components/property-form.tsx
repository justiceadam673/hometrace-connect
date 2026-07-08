import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
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
import { X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveImage, type PropertyRow } from "@/lib/properties";
import { uploadPropertyImage } from "@/lib/dashboard";

const NIGERIAN_STATES = [
  "Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Kano", "Kaduna", "Enugu", "Delta",
  "Edo", "Anambra", "Ogun", "Cross River", "Akwa Ibom", "Imo", "Plateau",
  "Osun", "Ondo", "Ekiti", "Kwara", "Abia", "Adamawa", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Ebonyi", "Gombe", "Jigawa", "Katsina", "Kebbi", "Kogi",
  "Nasarawa", "Niger", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const schema = z.object({
  title: z.string().trim().min(4, "Title too short").max(140),
  description: z.string().trim().max(4000).optional(),
  price: z.number().int().positive("Price must be > 0"),
  listing_type: z.enum(["sale", "rent", "shortlet"]),
  property_type: z.enum(["house", "duplex", "apartment", "land", "commercial", "office", "warehouse", "estate"]),
  status: z.enum(["available", "reserved", "sold", "rented", "draft"]),
  state: z.string().min(1),
  city: z.string().trim().max(80).optional(),
  area: z.string().trim().max(120).optional(),
  address: z.string().trim().max(240).optional(),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  toilets: z.number().int().min(0).max(50).optional(),
  parking: z.number().int().min(0).max(50).optional(),
  sqm: z.number().int().min(0).optional(),
  year_built: z.number().int().min(1900).max(2100).optional(),
  amenities: z.array(z.string()).optional(),
});

export type PropertyFormValues = Partial<PropertyRow>;

export function PropertyForm({
  initial,
  userId,
  mode,
}: {
  initial?: PropertyRow;
  userId: string;
  mode: "create" | "edit";
}) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(() => {
    const cover = initial?.cover_image ? [initial.cover_image] : [];
    const gallery = initial?.gallery ?? [];
    return [...new Set([...cover, ...gallery])];
  });
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<PropertyFormValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    listing_type: initial?.listing_type ?? "sale",
    property_type: initial?.property_type ?? "house",
    status: initial?.status ?? "available",
    state: initial?.state ?? "Lagos",
    city: initial?.city ?? "",
    area: initial?.area ?? "",
    address: initial?.address ?? "",
    bedrooms: initial?.bedrooms ?? 0,
    bathrooms: initial?.bathrooms ?? 0,
    toilets: initial?.toilets ?? 0,
    parking: initial?.parking ?? 0,
    sqm: initial?.sqm ?? undefined,
    year_built: initial?.year_built ?? undefined,
  });

  const setField = <K extends keyof PropertyFormValues>(k: K, v: PropertyFormValues[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB`);
          continue;
        }
        const url = await uploadPropertyImage(userId, file);
        uploaded.push(url);
      }
      setImages((prev) => [...prev, ...uploaded]);
      if (uploaded.length) toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addAmenity() {
    const v = amenityInput.trim();
    if (!v) return;
    if (!amenities.includes(v)) setAmenities((a) => [...a, v]);
    setAmenityInput("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      amenities,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !next[path]) next[path] = issue.message;
      }
      setErrors(next);
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...parsed.data,
        agent_id: userId,
        cover_image: images[0] ?? null,
        gallery: images.slice(1),
        amenities,
      };
      if (mode === "create") {
        const { data, error } = await supabase
          .from("properties")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        toast.success("Property published");
        navigate({ to: "/properties/$id", params: { id: data.id } });
      } else if (initial) {
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", initial.id);
        if (error) throw error;
        toast.success("Property updated");
        navigate({ to: "/dashboard" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Basic details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title ?? ""} onChange={(e) => setField("title", e.target.value)} required maxLength={140} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} value={form.description ?? ""} onChange={(e) => setField("description", e.target.value)} maxLength={4000} />
          </div>
          <div>
            <Label htmlFor="price">Price (₦)</Label>
            <Input id="price" type="number" min={0} value={form.price ?? 0} onChange={(e) => setField("price", Number(e.target.value))} required />
          </div>
          <div>
            <Label>Listing type</Label>
            <Select value={form.listing_type} onValueChange={(v) => setField("listing_type", v as PropertyRow["listing_type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For sale</SelectItem>
                <SelectItem value="rent">For rent</SelectItem>
                <SelectItem value="shortlet">Shortlet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Property type</Label>
            <Select value={form.property_type} onValueChange={(v) => setField("property_type", v as PropertyRow["property_type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["house","duplex","apartment","land","commercial","office","warehouse","estate"].map((t) => (
                  <SelectItem key={t} value={t}>{t[0].toUpperCase()+t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setField("status", v as PropertyRow["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>State</Label>
            <Select value={form.state} onValueChange={(v) => setField("state", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {NIGERIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="city">City / LGA</Label>
            <Input id="city" value={form.city ?? ""} onChange={(e) => setField("city", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="area">Area / Neighborhood</Label>
            <Input id="area" value={form.area ?? ""} onChange={(e) => setField("area", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="address">Street address</Label>
            <Input id="address" value={form.address ?? ""} onChange={(e) => setField("address", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {(["bedrooms","bathrooms","toilets","parking","sqm","year_built"] as const).map((k) => (
            <div key={k}>
              <Label htmlFor={k}>{k === "sqm" ? "Size (sqm)" : k === "year_built" ? "Year built" : k[0].toUpperCase()+k.slice(1)}</Label>
              <Input id={k} type="number" min={0} value={(form[k] as number | undefined) ?? ""} onChange={(e) => set(k, e.target.value === "" ? undefined : Number(e.target.value))} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              placeholder="e.g. Swimming pool"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); } }}
            />
            <Button type="button" variant="secondary" onClick={addAmenity}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <span key={a} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
                {a}
                <button type="button" onClick={() => setAmenities((arr) => arr.filter((x) => x !== a))}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center cursor-pointer hover:bg-muted/40 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            {uploading ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : <Upload className="size-6 text-muted-foreground" />}
            <p className="mt-2 text-sm font-medium">Drag & drop images, or click to select</p>
            <p className="text-xs text-muted-foreground">First image is used as cover. Max 10MB each.</p>
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {images.map((src, i) => (
                <div key={src} className="group relative aspect-[4/3] overflow-hidden rounded-md border">
                  <img src={resolveImage(src)} alt="" className="size-full object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">COVER</span>}
                  <button
                    type="button"
                    onClick={() => setImages((arr) => arr.filter((x) => x !== src))}
                    className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-background/90 opacity-0 shadow group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/dashboard" })}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          {mode === "create" ? "Publish property" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
