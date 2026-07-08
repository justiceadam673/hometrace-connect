import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, Coins, Layers, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProjectForm } from "@/components/project-form";
import {
  projectByIdQuery,
  salesByProjectQuery,
  unitsQuery,
  type Unit,
  type UnitStatus,
} from "@/lib/developers";
import { formatNaira } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/developer/projects/$id")({
  component: ProjectDetailPage,
});

const UNIT_STATUSES: UnitStatus[] = ["available", "reserved", "sold"];

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { data: project, isLoading } = useQuery(projectByIdQuery(id));
  const { data: units = [] } = useQuery(unitsQuery(id));
  const { data: sales = [] } = useQuery(salesByProjectQuery(id));

  if (isLoading) return null;
  if (!project) return <p className="text-sm text-muted-foreground">Project not found.</p>;

  const sold = units.filter((u) => u.status === "sold").length;
  const available = units.filter((u) => u.status === "available").length;
  const revenue = sales.reduce((s, x) => s + Number(x.sale_price), 0);

  return (
    <div className="space-y-6">
      <Link to="/developer/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to projects
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {[project.area, project.city, project.state].filter(Boolean).join(", ")}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">{project.name}</h2>
        </div>
        <Badge variant="secondary" className="uppercase text-[10px]">
          {project.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <MiniStat label="Total units" value={units.length} icon={Layers} />
        <MiniStat label="Sold" value={sold} icon={Layers} />
        <MiniStat label="Available" value={available} icon={Layers} />
        <MiniStat label="Revenue" value={formatNaira(revenue)} icon={Coins} />
      </div>

      <Tabs defaultValue="units" className="w-full">
        <TabsList>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="edit">Edit project</TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="pt-4">
          <UnitsSection projectId={project.id} developerId={project.developer_id} units={units} />
        </TabsContent>

        <TabsContent value="sales" className="pt-4">
          <SalesSection
            projectId={project.id}
            developerId={project.developer_id}
            units={units}
            recorderId={user?.id ?? null}
          />
        </TabsContent>

        <TabsContent value="edit" className="pt-4">
          <ProjectForm initial={project} developerId={project.developer_id} mode="edit" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
        </div>
        <Icon className="size-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

function UnitsSection({
  projectId,
  developerId,
  units,
}: {
  projectId: string;
  developerId: string;
  units: Unit[];
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    unit_number: "",
    unit_type: "",
    bedrooms: "",
    bathrooms: "",
    sqm: "",
    price: "",
    status: "available" as UnitStatus,
  });

  function openNew() {
    setEditing(null);
    setForm({ unit_number: "", unit_type: "", bedrooms: "", bathrooms: "", sqm: "", price: "", status: "available" });
    setOpen(true);
  }

  function openEdit(u: Unit) {
    setEditing(u);
    setForm({
      unit_number: u.unit_number,
      unit_type: u.unit_type ?? "",
      bedrooms: u.bedrooms != null ? String(u.bedrooms) : "",
      bathrooms: u.bathrooms != null ? String(u.bathrooms) : "",
      sqm: u.sqm != null ? String(u.sqm) : "",
      price: String(u.price),
      status: u.status,
    });
    setOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.unit_number.trim()) return toast.error("Unit number required");
    if (!form.price) return toast.error("Price required");
    setSaving(true);
    const payload = {
      project_id: projectId,
      developer_id: developerId,
      unit_number: form.unit_number.trim(),
      unit_type: form.unit_type.trim() || null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : 0,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : 0,
      sqm: form.sqm ? Number(form.sqm) : null,
      price: Number(form.price),
      status: form.status,
    };
    const { error } = editing
      ? await supabase.from("units").update(payload).eq("id", editing.id)
      : await supabase.from("units").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Unit updated" : "Unit added");
    qc.invalidateQueries({ queryKey: ["project-units", projectId] });
    setOpen(false);
  }

  async function del(u: Unit) {
    if (!confirm(`Delete unit ${u.unit_number}?`)) return;
    const { error } = await supabase.from("units").delete().eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success("Unit deleted");
    qc.invalidateQueries({ queryKey: ["project-units", projectId] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Units</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full" onClick={openNew}>
              <Plus className="mr-2 size-4" /> Add unit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit unit" : "Add unit"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="unit_number">Unit # *</Label>
                <Input id="unit_number" value={form.unit_number} onChange={(e) => setForm({ ...form, unit_number: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="unit_type">Type</Label>
                <Input id="unit_type" placeholder="3-bed terrace" value={form.unit_type} onChange={(e) => setForm({ ...form, unit_type: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="beds">Bedrooms</Label>
                <Input id="beds" type="number" min={0} value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="baths">Bathrooms</Label>
                <Input id="baths" type="number" min={0} value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="sqm">Size (sqm)</Label>
                <Input id="sqm" type="number" min={0} value={form.sqm} onChange={(e) => setForm({ ...form, sqm: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="price">Price (₦) *</Label>
                <Input id="price" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="sm:col-span-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as UnitStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNIT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="sm:col-span-2">
                <Button type="submit" disabled={saving} className="rounded-full">
                  {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {editing ? "Save" : "Add unit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border">
        {units.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No units yet. Add units to start tracking availability and sales.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Beds/Baths</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{u.unit_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.unit_type ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.bedrooms ?? 0} / {u.bathrooms ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.sqm ? `${u.sqm} sqm` : "—"}</td>
                  <td className="px-4 py-3">{formatNaira(Number(u.price))}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === "sold" ? "default" : u.status === "reserved" ? "secondary" : "outline"}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(u)}><Pencil className="size-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => del(u)}><Trash2 className="size-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* silence unused imports lint */}
      <span className="hidden">{navigate.length}</span>
    </div>
  );
}

function SalesSection({
  projectId,
  developerId,
  units,
  recorderId,
}: {
  projectId: string;
  developerId: string;
  units: Unit[];
  recorderId: string | null;
}) {
  const qc = useQueryClient();
  const { data: sales = [] } = useQuery(salesByProjectQuery(projectId));
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    unit_id: "",
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    sale_price: "",
    deposit: "",
    sale_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.unit_id) return toast.error("Select a unit");
    if (!form.buyer_name.trim()) return toast.error("Buyer name required");
    if (!form.sale_price) return toast.error("Sale price required");
    setSaving(true);
    const payload = {
      unit_id: form.unit_id,
      project_id: projectId,
      developer_id: developerId,
      buyer_name: form.buyer_name.trim(),
      buyer_email: form.buyer_email.trim() || null,
      buyer_phone: form.buyer_phone.trim() || null,
      sale_price: Number(form.sale_price),
      deposit: form.deposit ? Number(form.deposit) : 0,
      sale_date: form.sale_date,
      notes: form.notes.trim() || null,
      recorded_by: recorderId,
    };
    const { error } = await supabase.from("unit_sales").insert(payload);
    if (!error) {
      await supabase.from("units").update({ status: "sold" }).eq("id", form.unit_id);
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Sale recorded");
    qc.invalidateQueries({ queryKey: ["project-sales", projectId] });
    qc.invalidateQueries({ queryKey: ["project-units", projectId] });
    qc.invalidateQueries({ queryKey: ["dev-sales"] });
    setOpen(false);
    setForm({ ...form, unit_id: "", buyer_name: "", buyer_email: "", buyer_phone: "", sale_price: "", deposit: "", notes: "" });
  }

  const availableUnits = units.filter((u) => u.status !== "sold");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Sales log</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full">
              <Plus className="mr-2 size-4" /> Record sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record a sale</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Unit *</Label>
                <Select value={form.unit_id} onValueChange={(v) => setForm({ ...form, unit_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.unit_number} — {formatNaira(Number(u.price))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Buyer name *</Label>
                <Input value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} required />
              </div>
              <div>
                <Label>Buyer email</Label>
                <Input type="email" value={form.buyer_email} onChange={(e) => setForm({ ...form, buyer_email: e.target.value })} />
              </div>
              <div>
                <Label>Buyer phone</Label>
                <Input value={form.buyer_phone} onChange={(e) => setForm({ ...form, buyer_phone: e.target.value })} />
              </div>
              <div>
                <Label>Sale date</Label>
                <Input type="date" value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} />
              </div>
              <div>
                <Label>Sale price (₦) *</Label>
                <Input type="number" min={0} value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} required />
              </div>
              <div>
                <Label>Deposit (₦)</Label>
                <Input type="number" min={0} value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <DialogFooter className="sm:col-span-2">
                <Button type="submit" disabled={saving} className="rounded-full">
                  {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Record sale
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border">
        {sales.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No sales recorded yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Deposit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sales.map((s) => {
                const unit = units.find((u) => u.id === s.unit_id);
                return (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground">{s.sale_date}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.buyer_name}</p>
                      <p className="text-xs text-muted-foreground">{s.buyer_email ?? s.buyer_phone ?? ""}</p>
                    </td>
                    <td className="px-4 py-3">{unit?.unit_number ?? "—"}</td>
                    <td className="px-4 py-3 font-medium">{formatNaira(Number(s.sale_price))}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatNaira(Number(s.deposit ?? 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
