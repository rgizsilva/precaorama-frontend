import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, useRouterState,
  HeadContent, Scripts, Link,
} from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useT } from "@/lib/i18n";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  const { t } = useT();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("common.notFoundTitle")}</p>
        <Link to="/" className="mt-6 inline-flex rounded-md gradient-neon px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          {t("common.back")}
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const { t } = useT();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold">{t("common.errorTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md gradient-neon px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {t("common.tryAgain")}
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
      { title: "PREÇORAMA — Collectible Price Index" },
      { name: "description", content: "Track real-time prices for retro games, Pokémon cards, Yu-Gi-Oh!, Funko Pops and geek collectibles. Loose, CIB, sealed, graded — historical charts and recent sales." },
      { property: "og:title", content: "PREÇORAMA — Collectible Price Index" },
      { property: "og:description", content: "The modern next-gen price tracker for geek collectibles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isAuthRoute = ["/login", "/register", "/forgot-password"].includes(path);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {isAuthRoute ? (
          <Outlet />
        ) : (
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex flex-1 flex-col">
                <Topbar />
                <main className="flex-1">
                  <Outlet />
                </main>
              </div>
            </div>
          </SidebarProvider>
        )}
        <Toaster />
      </I18nProvider>
    </QueryClientProvider>
  );
}
