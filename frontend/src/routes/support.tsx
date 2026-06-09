import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import { contentService } from "@/services/contentService";
import { classNames } from "@/utils/format";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Zestigo" },
      { name: "description", content: "Get help with Zestigo orders, payments, and delivery." },
    ],
  }),
  component: Support,
});

function Support() {
  const [open, setOpen] = useState<number | null>(0);
  const { data: faqs } = useQuery({ queryKey: ["faqs"], queryFn: () => contentService.getFaqs() });
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Support</h1>
      <p className="mt-1 text-muted-foreground">We're here to help. Find answers or reach out.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs?.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-card shadow-soft">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left font-medium text-foreground"
                >
                  {f.q}
                  <ChevronDown
                    className={classNames(
                      "size-5 shrink-0 transition-transform",
                      open === i && "rotate-180",
                    )}
                  />
                </button>
                {open === i && <p className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <MessageSquare className="size-5 text-primary" /> Contact us
          </h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message sent! We'll get back to you soon.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <InputField label="Name" required />
            <InputField label="Email" type="email" icon={<Mail className="size-4" />} required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
              <textarea
                required
                rows={4}
                className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                placeholder="How can we help?"
              />
            </div>
            <Button type="submit" block size="lg">
              Send message
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
