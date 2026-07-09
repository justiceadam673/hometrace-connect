import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Upload, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { myProfileQuery } from "@/lib/profile";
import { uploadPropertyImage } from "@/lib/dashboard";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useQuery(myProfileQuery(user?.id));

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    whatsapp_number: "",
    email: "",
    company: "",
    location: "",
    bio: "",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        whatsapp_number: profile.whatsapp_number ?? "",
        email: profile.email ?? user?.email ?? "",
        company: profile.company ?? "",
        location: profile.location ?? "",
        bio: profile.bio ?? "",
        avatar_url: profile.avatar_url ?? "",
      });
    } else if (user) {
      setForm((f) => ({ ...f, email: f.email || user.email || "" }));
    }
  }, [profile, user]);

  async function handleAvatar(file: File) {
    if (!user) return;
    setUploading(true);
    try {
      const url = await uploadPropertyImage(user.id, file);
      setForm((f) => ({ ...f, avatar_url: url }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      id: user.id,
      full_name: form.full_name.trim() || null,
      phone: form.phone.trim() || null,
      whatsapp_number: form.whatsapp_number.trim() || null,
      email: form.email.trim() || null,
      company: form.company.trim() || null,
      location: form.location.trim() || null,
      bio: form.bio.trim() || null,
      avatar_url: form.avatar_url || null,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["my-profile"] });
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your contact details so buyers can reach you on WhatsApp or by phone directly from your listings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border bg-muted text-muted-foreground">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="Avatar" className="size-full object-cover" />
                  ) : (
                    <UserIcon className="size-8" />
                  )}
                </div>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                      {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                      Upload photo
                    </div>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])}
                    />
                  </Label>
                  <p className="mt-2 text-xs text-muted-foreground">Square image, at least 200×200.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    placeholder="+2348012345678 or 08012345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Used for the "Call agent" button.</p>
                </div>
                <div>
                  <Label htmlFor="whatsapp_number">WhatsApp number</Label>
                  <Input
                    id="whatsapp_number"
                    placeholder="+2348012345678 or 08012345678"
                    value={form.whatsapp_number}
                    onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Used for the "Chat with agent" button.</p>
                </div>
                <div>
                  <Label htmlFor="company">Company (optional)</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Lekki, Lagos"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">About you</Label>
                <Textarea
                  id="bio"
                  rows={5}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell buyers a bit about you — years of experience, areas you cover, specialties."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="rounded-full">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save profile
            </Button>
          </div>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}
