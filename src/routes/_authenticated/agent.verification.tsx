import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, ChevronLeft, Loader2, ShieldCheck, Upload } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { myAgentQuery } from "@/lib/agent-kyc";
import { uploadPropertyImage } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/agent/verification")({
  component: AgentVerificationPage,
  head: () => ({ meta: [{ title: "Agent verification — HomeTrace" }, { name: "robots", content: "noindex" }] }),
});

function AgentVerificationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: agent } = useQuery(myAgentQuery(user?.id));

  const [form, setForm] = useState({
    business_name: "",
    company: "",
    license_number: "",
    nin_number: "",
    years_experience: "",
    kyc_address: "",
    bio: "",
  });
  const [ninUrl, setNinUrl] = useState("");
  const [cofoUrl, setCofoUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [uploading, setUploading] = useState<"nin" | "cofo" | "selfie" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (agent) {
      setForm({
        business_name: agent.business_name ?? "",
        company: agent.company ?? "",
        license_number: agent.license_number ?? "",
        nin_number: agent.nin_number ?? "",
        years_experience: agent.years_experience != null ? String(agent.years_experience) : "",
        kyc_address: agent.kyc_address ?? "",
        bio: agent.bio ?? "",
      });
      setNinUrl(agent.nin_document_url ?? "");
      setCofoUrl(agent.cofo_document_url ?? "");
      setSelfieUrl(agent.id_selfie_url ?? "");
    }
  }, [agent]);

  const submitted = !!agent?.kyc_submitted_at;

  async function upload(kind: "nin" | "cofo" | "selfie", file: File) {
    if (!user) return;
    setUploading(kind);
    try {
      const url = await uploadPropertyImage(user.id, file);
      if (kind === "nin") setNinUrl(url);
      else if (kind === "cofo") setCofoUrl(url);
      else setSelfieUrl(url);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.business_name.trim()) return toast.error("Business/agent name is required");
    if (!form.nin_number.trim() || form.nin_number.trim().length < 8) return toast.error("Enter a valid NIN");
    if (!ninUrl) return toast.error("Upload your NIN slip");
    if (!cofoUrl) return toast.error("Upload your C of O (or Governor's Consent) document");
    if (!selfieUrl) return toast.error("Upload a selfie holding your ID");

    setSaving(true);
    const payload = {
      id: user.id,
      business_name: form.business_name.trim(),
      company: form.company.trim() || null,
      license_number: form.license_number.trim() || null,
      nin_number: form.nin_number.trim(),
      years_experience: form.years_experience ? Number(form.years_experience) : null,
      kyc_address: form.kyc_address.trim() || null,
      bio: form.bio.trim() || null,
      nin_document_url: ninUrl,
      cofo_document_url: cofoUrl,
      id_selfie_url: selfieUrl,
      verification: (agent?.verification === "verified" ? "verified" : "pending") as
        | "verified"
        | "pending",
      kyc_submitted_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("agents").upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("KYC submitted — you can now post listings");
    qc.invalidateQueries({ queryKey: ["my-agent"] });
    navigate({ to: "/properties/new" });
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Back to dashboard
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Agent verification (one-time)</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete KYC once. After we approve, you can post unlimited listings without repeating this.
            </p>
          </div>
          {submitted ? (
            <Badge className="bg-emerald-500 text-white">
              <BadgeCheck className="mr-1 size-3.5" /> Submitted — {agent?.verification}
            </Badge>
          ) : (
            <Badge variant="outline">Not submitted</Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="bn">Business / agent name *</Label>
                <Input id="bn" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="co">Company (if any)</Label>
                <Input id="co" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="nin">NIN (National Identification Number) *</Label>
                <Input id="nin" value={form.nin_number} onChange={(e) => setForm({ ...form, nin_number: e.target.value })} placeholder="11-digit NIN" required />
              </div>
              <div>
                <Label htmlFor="lic">REDAN / license number</Label>
                <Input id="lic" value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="yr">Years of experience</Label>
                <Input id="yr" type="number" min={0} value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="addr">Business address</Label>
                <Input id="addr" value={form.kyc_address} onChange={(e) => setForm({ ...form, kyc_address: e.target.value })} placeholder="Street, LGA, State" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bio">Short bio</Label>
                <Textarea id="bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> KYC documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <DocUpload
                label="NIN slip *"
                hint="Photo of your NIN slip or NIMC card."
                url={ninUrl}
                uploading={uploading === "nin"}
                onFile={(f) => upload("nin", f)}
                onClear={() => setNinUrl("")}
              />
              <DocUpload
                label="C of O / Governor's Consent *"
                hint="Certificate of Occupancy or authorising land document for a property you legitimately represent."
                url={cofoUrl}
                uploading={uploading === "cofo"}
                onFile={(f) => upload("cofo", f)}
                onClear={() => setCofoUrl("")}
              />
              <DocUpload
                label="Selfie holding your ID *"
                hint="A clear selfie holding your NIN or a government-issued ID beside your face."
                url={selfieUrl}
                uploading={uploading === "selfie"}
                onFile={(f) => upload("selfie", f)}
                onClear={() => setSelfieUrl("")}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
            <p>
              We use your documents only to verify your identity. They are stored securely and are not shown publicly.
            </p>
            <Button type="submit" disabled={saving} className="rounded-full whitespace-nowrap">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {submitted ? "Resubmit KYC" : "Submit for verification"}
            </Button>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function DocUpload({
  label,
  hint,
  url,
  uploading,
  onFile,
  onClear,
}: {
  label: string;
  hint: string;
  url: string;
  uploading: boolean;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <div className="mt-2 flex items-center gap-4">
        <div className="size-24 shrink-0 overflow-hidden rounded-md border bg-muted">
          {url ? <img src={url} alt="" className="size-full object-cover" /> : null}
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {url ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/*,application/pdf"
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
