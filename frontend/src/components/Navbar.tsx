import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, Moon, ShoppingCart, Sun, User, UtensilsCrossed, X } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/tanstack-react-start";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { classNames } from "@/utils/format";
import { Button } from "./Button";

const links = [
  { to: "/", label: "Home" },
  { to: "/restaurants", label: "Restaurants" },
  { to: "/offers", label: "Offers" },
  { to: "/support", label: "Support" },
] as const;

export function Navbar() {
  const { isSignedIn } = useAuth();
  const { count } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
            <UtensilsCrossed className="size-5" />
          </span>
          <span className="text-lg font-bold text-foreground">
            Zesti<span className="text-primary">go</span>
          </span>
        </Link>

        <ul className="ml-6 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex size-10 items-center justify-center rounded-2xl text-foreground transition-colors hover:bg-secondary"
          >
            {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hidden size-10 items-center justify-center rounded-2xl text-foreground transition-colors hover:bg-secondary sm:flex"
          >
            <Heart className="size-5" />
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative flex size-10 items-center justify-center rounded-2xl text-foreground transition-colors hover:bg-secondary"
          >
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          {/* Auth controls — desktop */}
          <div className="hidden md:flex items-center gap-2">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <Button size="sm" variant="outline" id="navbar-sign-in-btn">
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" id="navbar-sign-up-btn">
                    Sign up
                  </Button>
                </SignUpButton>
              </>
            ) : (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-9 rounded-2xl",
                  },
                }}
                userProfileMode="navigation"
                userProfileUrl="/profile"
              />
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex size-10 items-center justify-center rounded-2xl text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <ul className="space-y-1 px-4 py-3">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/wishlist"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Wishlist
              </Link>
            </li>
            <li className="pt-2 space-y-2">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <Button block id="mobile-sign-in-btn">
                      <User className="size-4" /> Sign in
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button block variant="outline" id="mobile-sign-up-btn">
                      Create account
                    </Button>
                  </SignUpButton>
                </>
              ) : (
                <div className="flex items-center gap-3 px-1 py-2">
                  <UserButton
                    appearance={{ elements: { avatarBox: "size-9 rounded-2xl" } }}
                    userProfileMode="navigation"
                    userProfileUrl="/profile"
                  />
                  <span className="text-sm font-medium text-foreground">My account</span>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
