import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ClerkProvider } from "@clerk/tanstack-react-start";
import { ClerkTokenInjector } from "../components/ClerkTokenInjector";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { ThemeProvider } from "../context/ThemeContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toaster } from "../components/ui/sonner";
import { FloatingTracker } from "../components/FloatingTracker";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zestigo — Fresh Food Delivered Fast" },
      {
        name: "description",
        content:
          "Zestigo delivers fresh meals from your favorite local restaurants, fast. Browse, order, and track in one beautiful app.",
      },
      { name: "author", content: "Zestigo" },
      { property: "og:title", content: "Zestigo — Fresh Food Delivered Fast" },
      {
        property: "og:description",
        content: "Order from top local restaurants and get it delivered in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Zestigo" },
      { name: "twitter:title", content: "Zestigo — Fresh Food Delivered Fast" },
      {
        name: "description",
        content:
          "Zestigo Delight is a modern Indian food delivery web application for seamless online ordering.",
      },
      {
        property: "og:description",
        content:
          "Zestigo Delight is a modern Indian food delivery web application for seamless online ordering.",
      },
      {
        name: "twitter:description",
        content:
          "Zestigo Delight is a modern Indian food delivery web application for seamless online ordering.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/afaaa1e7-bbc0-4d0c-ac1c-f760ccf2c5b0/id-preview-ccc9fa30--b2f15b6f-a6b5-4fb3-bc66-a967dbe5b92e.lovable.app-1780774734630.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/afaaa1e7-bbc0-4d0c-ac1c-f760ccf2c5b0/id-preview-ccc9fa30--b2f15b6f-a6b5-4fb3-bc66-a967dbe5b92e.lovable.app-1780774734630.png",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_ZW5oYW5jZWQtbGFyay0yOC5jbGVyay5hY2NvdW50cy5kZXYk";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkTokenInjector />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
                <main className="flex-1">
                  <Outlet />
                </main>
                <Footer />
              </div>
              <Toaster position="top-center" richColors />
              <FloatingTracker />
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
