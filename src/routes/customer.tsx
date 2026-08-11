import { createFileRoute } from "@tanstack/react-router";
import { CustomerShell } from "@/components/CustomerShell";

export const Route = createFileRoute("/customer")({
  head: () => ({
    meta: [
      { title: "Customer Dashboard — CleanConnect" },
      {
        name: "description",
        content: "Book cleaning services, track bookings, manage your wallet and rewards on CleanConnect.",
      },
      { property: "og:title", content: "Customer Dashboard — CleanConnect" },
      { property: "og:description", content: "Manage your CleanConnect bookings, wallet and rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: CustomerShell,
});
