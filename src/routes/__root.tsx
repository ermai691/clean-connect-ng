import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { consumeAuthLink } from "@/lib/auth-session";

function NotFoundComponent() {
  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <h1>404</h1>
        <p className="sub">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
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
    <div className="auth-shell">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p className="sub">Please try again or head back home.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="btn btn-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CleanConnect — Trusted Cleaning & Laundry Pros in Abuja" },
      {
        name: "description",
        content:
          "Book verified cleaning and laundry professionals across Abuja. Home, office, deep and post-construction cleaning — trusted, insured, and on-demand.",
      },
      { name: "author", content: "CleanConnect" },
      { property: "og:title", content: "CleanConnect — Trusted Cleaning & Laundry Pros in Abuja" },
      {
        property: "og:description",
        content: "Verified cleaners and laundry pros, on-demand across Abuja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
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

/** Email links often land on the site root. Consume tokens here, then route. */
function AuthLinkBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const hashParams = new URLSearchParams(hash);
    const type = hashParams.get("type");
    const path = window.location.pathname;
    const hasLink = hash.includes("access_token") || window.location.search.includes("code=") || hash.includes("error");
    if (!hasLink) return;

    void consumeAuthLink().then((result) => {
      if (result.error) {
        sessionStorage.setItem("cc_auth_link_error", result.error);
        if (!path.startsWith("/auth/") && !path.startsWith("/reset-password")) {
          navigate({ to: "/auth/$role", params: { role: "customer" }, replace: true });
        }
        return;
      }
      if (type === "recovery" && !path.startsWith("/reset-password")) {
        navigate({ to: "/reset-password", search: { role: "customer" }, replace: true });
        return;
      }
      if (result.session && (type === "signup" || type === "email" || type === "magiclink") && path === "/") {
        navigate({ to: "/auth/$role", params: { role: "customer" }, replace: true });
      }
    });
  }, [navigate]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthLinkBridge />
      <Outlet />
    </QueryClientProvider>
  );
}
