import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { blogPostsQuery } from "@/lib/admin";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: AdminBlog,
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminBlog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery(blogPostsQuery());
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", cover_image: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return toast.error("Title and content required");
    const { error } = await supabase.from("blog_posts").insert({
      title: form.title.trim(),
      slug: `${slugify(form.title)}-${Date.now().toString(36)}`,
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      cover_image: form.cover_image.trim() || null,
      published: true,
      author_id: user?.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Post published");
    setForm({ title: "", excerpt: "", content: "", cover_image: "" });
    qc.invalidateQueries({ queryKey: ["blog-posts"] });
  }

  async function togglePublished(id: string, p: boolean) {
    await supabase.from("blog_posts").update({ published: !p }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["blog-posts"] });
  }
  async function remove(id: string) {
    await supabase.from("blog_posts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["blog-posts"] });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>New blog post</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Cover image URL</Label><Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} /></div>
            <div><Label>Excerpt</Label><Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div><Label>Content (Markdown supported)</Label><Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <Button type="submit" className="rounded-full">Publish post</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Posts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data?.map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{p.title}</p>
                  <Badge variant={p.published ? "default" : "secondary"}>{p.published ? "Published" : "Draft"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.excerpt}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => togglePublished(p.id, p.published)}>{p.published ? "Unpublish" : "Publish"}</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(p.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
