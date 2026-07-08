import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { myDeveloperQuery } from "@/lib/developers";
import { uploadPropertyImage } from "@/lib/dashboard";

export const Route = createFileRoute("/_authenticated/developer/profile")({
  component: DeveloperProfilePage,
});

function DeveloperProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: dev } = useQuery(myDeveloperQuery(user?.id));

  const [form, setForm] = useState({
    company_name: "",
    website: "",
    email: "",
    phone: "",
    headquarters: "",
    established_year: "",
    description: "",
    logo_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (dev) {
      setForm({
        company_name: dev.company_name ?? "",
        website: dev.website ?? "",
        email: dev.email ?? "",
        phone: dev.phone ?? "",
        headquarters: dev.headquarters ?? "",
        established_year: dev.established_year ? String(dev.established_year) : "",
        description: dev.description ?? "",
        logo_url: dev.logo_url ?? "",
      });
    }
  }, [dev]);

  async function handleLogoUpload(file: File) {
    if (!user) return;
    setUploading(true);
    try {
      const url = await uploadPropertyImage(user.id, file);
      setForm((f) => ({ ...f, logo_url: url }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (form.company_name.trim().length < 2) {
      toast.error("Company name is required");
      return;
    }
    setSaving(true);
    const payload = {
      id: user.id,
      company_name: form.company_name.trim(),
      website: form.website.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      headquarters: form.headquarters.trim() || null,
      established_year: form.established_year ? Number(form.established_year) : null,
      description: form.description.trim() || null,
      logo_url: form.logo_url || null,
    };
    const { error } = await supabase.from("developers").upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(dev ? "Company updated" : "Company profile created");
    qc.invalidateQueries({ queryKey: ["my-developer"] });
    if (!dev) navigate({ to: "/developer" });
  }

  async function requestVerification() {
    if (!user || !dev) return;
    const { error } = await supabase
      .from("developers")
      .update({ verification: "pending" })
      .eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Verification request submitted");
    qc.invalidateQueries({ queryKey: ["my-developer"] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="size-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="size-full object-cover" />
                ) : null}
              </div>
              <div>
                <Label htmlFor="logo" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                    {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    Upload logo
                  </div>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                  />
                </Label>
                <p className="mt-2 text-xs text-muted-foreground">Square PNG or JPG, at least 200×200.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="company_name">Company name *</Label>
                <Input
                  id="company_name"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Contact email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Contact phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input
                  id="headquarters"
                  placeholder="Lekki Phase 1, Lagos"
                  value={form.headquarters}
                  onChange={(e) => setForm({ ...form, headquarters: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="year">Established (year)</Label>
                <Input
                  id="year"
                  type="number"
                  min={1900}
                  max={2100}
                  value={form.established_year}
                  onChange={(e) => setForm({ ...form, established_year: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">About</Label>
              <Textarea
                id="description"
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tell buyers about your company, notable projects, and what makes you different."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {dev ? "Save changes" : "Create company"}
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-primary" /> Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Verified developers get a badge across their projects and rank higher in search.</p>
            <div>
              <Badge variant={dev?.verification === "verified" ? "default" : "outline"}>
                {dev?.verification ?? "unverified"}
              </Badge>
            </div>
            {dev && dev.verification === "unverified" ? (
              <Button size="sm" variant="outline" onClick={requestVerification}>
                Request verification
              </Button>
            ) : null}
            {dev?.verification === "pending" ? (
              <p className="text-xs">Our team will review your company within 48 hours.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
