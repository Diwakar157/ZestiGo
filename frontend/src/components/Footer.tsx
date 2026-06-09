import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, UtensilsCrossed } from "lucide-react";

const columns = [
  {
    title: "Company",
    links: [
      { to: "/", label: "About Us" },
      { to: "/restaurants", label: "Restaurants" },
      { to: "/offers", label: "Offers" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/support", label: "Help Center" },
      { to: "/support", label: "Contact Us" },
      { to: "/support", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/profile", label: "My Profile" },
      { to: "/orders", label: "My Orders" },
      { to: "/wishlist", label: "Wishlist" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground">
              <UtensilsCrossed className="size-5" />
            </span>
            <span className="text-lg font-bold text-foreground">
              Zesti<span className="text-primary">go</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Fresh meals from your favorite local restaurants, delivered fast to your door.
          </p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-foreground transition-colors hover:bg-accent"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l, i) => (
                <li key={i}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Zestigo. Crafted with care for hungry humans.
      </div>
    </footer>
  );
}
