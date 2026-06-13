import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, ShieldCheck, Truck, ArrowRight } from "lucide-react";
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
      {/* ─── Hero — full-width background-image banner ─── */}
      <section
        className="hero-banner"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Gradient overlay: dark-green left → transparent right */}
        <div className="hero-overlay" />

        {/* Text content — floats above overlay */}
        <div className="hero-inner">
          <div className="hero-content animate-fade-in">
            {/* Pill badge */}
            <span className="hero-badge">🍛 Premium Food Delivery</span>

            <h1 className="hero-heading mb-8">
              Fresh Food
              <br />
              <span className="hero-heading-accent">Delivered Faster</span>
            </h1>

            <p className="hero-subtext mb-10">
              Discover top-rated restaurants, exclusive offers, and lightning-fast
              delivery with Zestigo. Your next great meal is minutes away.
            </p>

            {/* CTA buttons */}
            <div className="hero-cta-row">
              <Link to="/restaurants" search={{ search: undefined, category: undefined }}>
                <button className="hero-btn-explore" id="hero-explore-btn">
                  Explore Restaurants
                  <ArrowRight className="size-5" />
                </button>
              </Link>
            </div>

            {/* Trust strip */}
            <div className="hero-trust-strip">
              <span className="hero-trust-item">
                <Truck className="size-4" /> 30 min delivery
              </span>
              <span className="hero-trust-divider" />
              <span className="hero-trust-item">
                <ShieldCheck className="size-4" /> Secure payments
              </span>
              <span className="hero-trust-divider" />
              <span className="hero-trust-item">
                <Clock className="size-4" /> Live tracking
              </span>
            </div>
          </div>
        </div>

        {/* Bottom transition and glow overlays */}
        <div className="hero-bottom-glow-radial" />
        <div className="hero-bottom-blur-layer" />
        <div className="hero-bottom-transition-green" />
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
