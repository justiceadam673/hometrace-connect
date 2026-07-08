import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { faqsQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  component: AdminFaqs,
});

function AdminFaqs() {
  const qc = useQueryClient();
  const { data } = useQuery(faqsQuery());
  const [form, setForm] = useState({ question: "", answer: "", category: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return toast.error("Question and answer required");
    const { error } = await supabase.from("faqs").insert({
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category.trim() || null,
      sort_order: (data?.length ?? 0) + 1,
    });
    if (error) return toast.error(error.message);
    toast.success("FAQ added");
    setForm({ question: "", answer: "", category: "" });
    qc.invalidateQueries({ queryKey: ["faqs"] });
  }
  async function remove(id: string) {
    await supabase.from("faqs").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["faqs"] });
  }
  async function toggle(id: string, active: boolean) {
    await supabase.from("faqs").update({ active: !active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["faqs"] });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>New FAQ</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <div><Label>Question</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
            <div><Label>Answer</Label><Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
            <div><Label>Category (optional)</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Buyers, Agents, Payments…" /></div>
            <Button type="submit" className="rounded-full">Add FAQ</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>FAQs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data?.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
              <div>
                <p className="font-medium">{f.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
                {f.category ? <p className="mt-1 text-xs text-muted-foreground">Category: {f.category}</p> : null}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(f.id, f.active)}>{f.active ? "Hide" : "Show"}</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(f.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
