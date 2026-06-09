import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, ShieldCheck, Truck } from "lucide-react";
import heroFood from "@/assets/hero-food.jpg";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { RestaurantCard } from "@/components/RestaurantCard";
import { FoodCard } from "@/components/FoodCard";
import { OfferBanner } from "@/components/OfferBanner";
import { Button } from "@/components/Button";
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
      {/* Hero */}
      <div className="bg-premium-hero relative overflow-hidden border-b border-border/20">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 relative z-10">
          <div className="animate-fade-in flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              🍛 Authentic Indian Cuisines
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Fresh Food <br className="hidden sm:inline" />
              <span className="text-primary">Delivered Faster</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Order from the best restaurants near you with Zestigo. Fast delivery, premium experience, and exclusive offers.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/restaurants" search={{ search: undefined, category: undefined }}>
                <Button variant="primary" size="lg" className="h-12 rounded-xl px-8 font-semibold shadow-soft hover:shadow-card hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200">
                  Order Now
                </Button>
              </Link>
              <Link to="/restaurants" search={{ search: undefined, category: undefined }}>
                <Button variant="outline" size="lg" className="h-12 rounded-xl px-8 font-semibold border-border/80 hover:bg-secondary hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200">
                  Explore Restaurants
                </Button>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="mt-8 max-w-xl">
              <p className="text-sm font-medium text-foreground/80 mb-2.5">What are you craving today?</p>
              <SearchBar />
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end animate-scale-in mt-10 lg:mt-0">
            <div className="relative animate-float w-full max-w-md lg:max-w-none">
              <img
                src={heroFood}
                alt="A vibrant spread of Indian dishes"
                width={1280}
                height={1024}
                className="w-full h-auto rounded-[32px] object-cover shadow-elevated"
              />
              
              {/* Free Delivery Badge */}
              <div className="absolute -bottom-6 -left-6 sm:-left-8 flex items-center gap-3 rounded-2xl glass-card p-4 shadow-card">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Truck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Free delivery</p>
                  <p className="text-xs text-muted-foreground">On your first order</p>
                </div>
              </div>

              {/* Glassmorphism Stats Card */}
              <div className="absolute -top-6 -right-6 sm:-right-8 glass-card rounded-3xl p-5 shadow-elevated animate-float-delayed w-[240px] z-20">
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-semibold text-base">⭐</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">4.9 Rating</p>
                      <p className="text-xs text-muted-foreground">Customer reviews</p>
                    </div>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-base">🏪</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">1000+ Partner</p>
                      <p className="text-xs text-muted-foreground">Restaurants</p>
                    </div>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 font-semibold text-base">⏱️</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">30 min Delivery</p>
                      <p className="text-xs text-muted-foreground">Average wait time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

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
