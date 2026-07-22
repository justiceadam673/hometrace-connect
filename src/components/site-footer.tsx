import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="max-w-xs space-y-4">
            <span className="text-lg font-semibold tracking-tight">HomeTrace</span>
            <p className="text-sm text-muted-foreground">
              Nigeria's verified property marketplace — from Lekki to Maitama.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/properties"
                  search={{ listing_type: "sale" }}
                  className="hover:text-primary"
                >
                  Homes for sale
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  search={{ listing_type: "rent" }}
                  className="hover:text-primary"
                >
                  Homes for rent
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  search={{ property_type: "land" }}
                  className="hover:text-primary"
                >
                  Land listings
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  search={{ property_type: "commercial" }}
                  className="hover:text-primary"
                >
                  Commercial
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Popular locations
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/properties" search={{ state: "Lagos" }} className="hover:text-primary">
                  Lagos
                </Link>
              </li>
              <li>
                <Link to="/properties" search={{ state: "FCT" }} className="hover:text-primary">
                  Abuja (FCT)
                </Link>
              </li>
              <li>
                <Link to="/properties" search={{ state: "Rivers" }} className="hover:text-primary">
                  Port Harcourt
                </Link>
              </li>
            </ul>
          </div>
          {/* <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary">About</a></li>
              <li><a href="#" className="hover:text-primary">Verification process</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
              <li><Link to="/auth" className="hover:text-primary">Become an agent</Link></li>
            </ul>
          </div> */}
        </div>
        <div className="mt-16 flex flex-col items-center justify-center gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} HomeTrace Nigeria. All rights reserved.</p>
          {/* <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Sitemap
            </a>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
