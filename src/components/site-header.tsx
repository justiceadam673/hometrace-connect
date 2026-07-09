import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { myRolesQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { data: roles } = useQuery(myRolesQuery(user?.id));
  const isAdmin = (roles ?? []).includes("admin");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Home className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">HomeTrace</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/properties"
            search={{ listing_type: "sale" }}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Buy
          </Link>
          <Link
            to="/properties"
            search={{ listing_type: "rent" }}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Rent
          </Link>
          <Link
            to="/properties"
            search={{}}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            All listings
          </Link>
          <Link
            to="/"
            hash="verified"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Verified agents
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link to="/developer">Developer</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link to="/profile">Profile</Link>
              </Button>
              {isAdmin ? (
                <Button asChild size="sm" variant="outline" className="hidden md:inline-flex border-primary/40 text-primary hover:bg-primary/10 hover:text-primary">
                  <Link to="/admin"><ShieldCheck className="mr-1 size-4" /> Admin</Link>
                </Button>
              ) : null}
              <Button asChild size="sm" className="rounded-full hidden sm:inline-flex">
                <Link to="/properties/new">Post property</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link to="/auth">Post property</Link>
              </Button>
            </>
          )}

          <button
            className="grid size-9 place-items-center rounded-md text-muted-foreground md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border/60 bg-background/95 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-3">
            <Link to="/properties" search={{ listing_type: "sale" }} className="rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>Buy</Link>
            <Link to="/properties" search={{ listing_type: "rent" }} className="rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>Rent</Link>
            <Link to="/properties" search={{}} className="rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>All listings</Link>
            <Link to="/" hash="verified" className="rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>Verified agents</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>Dashboard</Link>
                <Link to="/developer" className="rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>Developer</Link>
                {isAdmin ? (
                  <Link to="/admin" className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/15" onClick={() => setOpen(false)}>Admin</Link>
                ) : null}
                <Link to="/properties/new" className="rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>Post property</Link>
              </>
            ) : (
              <Link to="/auth" className="rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>Sign in</Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
