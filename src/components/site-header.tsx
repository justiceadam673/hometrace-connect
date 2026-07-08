import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, signOut } = useAuth();
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
          <a
            href="#verified"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Verified agents
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email?.split("@")[0]}
              </span>
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
          </nav>
        </div>
      ) : null}
    </header>
  );
}
