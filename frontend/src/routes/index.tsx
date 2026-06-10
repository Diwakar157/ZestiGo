import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, ShieldCheck, Truck } from "lucide-react";
import heroImage from "@/assets/hero/zestigo-hero.jpg";
import { CategoryCard } from "@/components/CategoryCard";
import { RestaurantCard } from "@/components/RestaurantCard";
import { FoodCard } from "@/components/FoodCard";
import { OfferBanner } from "@/components/OfferBanner";
import { SkeletonGrid } from "@/components/Skeleton";
import { restaurantService } from "@/services/restaurantService";
import { foodService } from "@/services/foodService";
import { contentService } from "@/services/contentService";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zestigo — Fresh Food Delivered Fast" },
      {
        name: "description",
        content:
          "Order from top local restaurants with Zestigo. Fast delivery, great prices, and exclusive offers on every meal.",
      },
      { property: "og:title", content: "Zestigo — Fresh Food Delivered Fast" },
      {
        property: "og:description",
        content: "Order from top local restaurants and get it delivered in minutes.",
      },
    ],
  }),
  component: Landing,
});

const perks = [
  {
    icon: Truck,
    title: "Lightning delivery",
    desc: "Hot meals at your door in 30 minutes or less.",
  },
  {
    icon: ShieldCheck,
    title: "Secure UPI checkout",
    desc: "Safe payments and a smooth ordering flow.",
  },
  { icon: Clock, title: "Live tracking", desc: "Follow your order from kitchen to doorstep." },
];

function Landing() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => restaurantService.getCategories(),
  });
  const { data: popular, isLoading: loadingPopular } = useQuery({
    queryKey: ["popular"],
    queryFn: () => restaurantService.getPopular(),
  });
  const { data: featured, isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured"],
    queryFn: () => foodService.getFeatured(),
  });
  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => contentService.getTestimonials(),
  });

  return (
    <div className="bg-background">
      {/* Diagnostics banner */}
      <div className="mx-auto max-w-7xl px-4 py-2 mt-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-mono text-amber-800">
        <b>[Diagnostics]</b> Categories: {categories ? `Loaded (${categories.length})` : "Pending/Error"} | 
        Popular Restaurants: {popular ? `Loaded (${popular.length})` : "Pending/Error"} | 
        Featured Dishes: {featured ? `Loaded (${featured.length})` : "Pending/Error"}
      </div>
      {/* Hero — Cinematic full-bleed background */}
      <section className="hero-cinematic relative overflow-hidden flex items-center" style={{ minHeight: "85vh" }}>
        {/* Background image — fills the entire hero */}
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Subtle dark scrim for overall contrast */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />

        {/* Cinematic gradient overlay — dark left → clear right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(12,35,25,0.95) 0%, rgba(12,35,25,0.85) 18%, rgba(12,35,25,0.65) 38%, rgba(12,35,25,0.30) 58%, rgba(12,35,25,0.00) 80%)",
          }}
        />

        {/* Content — sits above overlays */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
          <div className="max-w-xl animate-fade-in">
            {/* Tagline pill */}
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-1.5 text-xs font-semibold tracking-wider text-white/90 uppercase mb-6">
              🍛 Premium Food Delivery
            </span>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Fresh Food{" "}
              <br className="hidden sm:inline" />
              <span className="text-[#95D5B2]">Delivered Faster</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
              Discover top-rated restaurants, exclusive offers, and lightning-fast
              delivery with Zestigo. Your next great meal is minutes away.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/restaurants" search={{ search: undefined, category: undefined }}>
                <button className="hero-btn-primary h-13 rounded-xl px-8 text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                  Order Now
                </button>
              </Link>
              <Link to="/restaurants" search={{ search: undefined, category: undefined }}>
                <button className="hero-btn-outline h-13 rounded-xl px-8 text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                  Explore Restaurants
                </button>
              </Link>
            </div>

            {/* Trust strip */}
            <div className="mt-10 flex items-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Truck className="size-4" /> 30 min delivery
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4" /> Secure payments
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" /> Live tracking
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {perks.map((p) => (
            <div
              key={p.title}
              className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-soft"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                <p.icon className="size-6" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading title="What are you craving?" subtitle="Explore food categories" />
        <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-8">
          {categories?.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Popular restaurants */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          title="Popular restaurants"
          subtitle="Trending near you"
          action={
            <Link to="/restaurants" search={{ search: undefined, category: undefined }} className="text-sm font-semibold text-primary hover:underline">
              See all
            </Link>
          }
        />
        <div className="mt-8">
          {loadingPopular ? (
            <SkeletonGrid count={3} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popular?.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured dishes */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading title="Featured dishes" subtitle="Handpicked favorites" />
        <div className="mt-8">
          {loadingFeatured ? (
            <SkeletonGrid count={3} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured?.slice(0, 4).map((f) => (
                <FoodCard key={f.id} food={f} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Offers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading title="Exclusive offers" subtitle="Save more on every order" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <OfferBanner title="Flat ₹100 Off" subtitle="On orders above ₹299" code="FLAT100" />
          <OfferBanner title="Free Delivery" subtitle="On orders above ₹199" code="FREEDEL" />
          <OfferBanner title="50% OFF" subtitle="Up to ₹120 off" code="HALF50" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading title="Loved by food lovers" subtitle="What our customers say" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials?.map((t) => (
            <figure key={t.name} className="rounded-3xl bg-card p-6 shadow-soft">
              <div className="mb-3 text-2xl text-primary">★★★★★</div>
              <blockquote className="text-sm text-foreground">"{t.text}"</blockquote>
              <figcaption className="mt-4">
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {subtitle && (
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{subtitle}</p>
        )}
        <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
