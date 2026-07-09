import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/email-verified")({
  head: () => ({
    meta: [
      { title: "Email verified — HomeTrace" },
      { name: "description", content: "Your HomeTrace email address has been verified." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmailVerifiedPage,
});

function EmailVerifiedPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function run() {
      // Supabase appends tokens in the URL hash on confirmation redirects.
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hash);
      const search = new URLSearchParams(window.location.search);

      const errorDesc = hashParams.get("error_description") ?? search.get("error_description");
      if (errorDesc) {
        if (!mounted) return;
        setStatus("error");
        setMessage(errorDesc);
        return;
      }

      // New-style verification: ?token_hash=...&type=email (or signup)
      const tokenHash = search.get("token_hash");
      const type = (search.get("type") ?? "email") as
        | "email"
        | "signup"
        | "recovery"
        | "invite"
        | "email_change"
        | "magiclink";
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (!mounted) return;
        if (error) {
          setStatus("error");
          setMessage(error.message);
        } else {
          await supabase.auth.signOut();
          setStatus("ok");
        }
        return;
      }

      // Legacy hash-based flow — session is already set by the SDK.
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        await supabase.auth.signOut();
        setStatus("ok");
      } else {
        // No tokens present — assume the user just landed here.
        setStatus("ok");
      }

      // Clean the URL so tokens don't linger.
      window.history.replaceState({}, "", window.location.pathname);
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-surface p-6">
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
        {status === "loading" ? (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-muted-foreground" />
            <h1 className="mt-4 text-xl font-semibold">Verifying your email…</h1>
          </>
        ) : status === "ok" ? (
          <>
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50">
              <CheckCircle2 className="size-8 text-emerald-600" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold">Email verified</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your email address has been confirmed. You can now sign in to HomeTrace.
            </p>
            <Button asChild className="mt-6 w-full" size="lg">
              <Link to="/auth">Sign in</Link>
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-red-50">
              <XCircle className="size-8 text-red-600" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold">Verification failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {message || "The verification link is invalid or has expired."}
            </p>
            <Button asChild variant="outline" className="mt-6 w-full" size="lg">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
