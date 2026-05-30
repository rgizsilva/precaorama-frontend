import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Search, Star, Library, ShieldCheck, Flame, Gamepad2,
  Joystick, Cable, Sparkles, Swords, Wand2, Cat, ToyBrick, Drama,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";
import { useT } from "@/lib/i18n";

const main = [
  { key: "nav.home", url: "/", icon: LayoutDashboard },
  { key: "nav.catalog", url: "/catalog", icon: Search },
  { key: "nav.trending", url: "/catalog", icon: Flame, search: { sort: "trend-desc" } as const },
  { key: "nav.wishlist", url: "/watchlist", icon: Star },
  { key: "nav.collection", url: "/collection", icon: Library },
];

const cats = [
  { slug: "video-games", icon: Gamepad2 },
  { slug: "consoles", icon: Joystick },
  { slug: "accessories", icon: Cable },
  { slug: "pokemon-tcg", icon: Sparkles },
  { slug: "yu-gi-oh", icon: Swords },
  { slug: "mtg", icon: Wand2 },
  { slug: "funko-pop", icon: ToyBrick },
  { slug: "action-figures", icon: Drama },
  { slug: "anime", icon: Cat },
];

export function AppSidebar() {
  const { t } = useT();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const search = useRouterState({ select: (r) => r.location.search as Record<string, unknown> });
  const isActive = (url: string) => path === url;
  const isCatActive = (slug: string) => path === "/catalog" && (search?.cat as string) === slug;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg gradient-neon text-primary-foreground glow-neon">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-sm font-bold tracking-tight">PREÇORAMA</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
              {t("sidebar.tagline")}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.explore")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.key + item.url + (item.search ? "s" : "")}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} search={(item.search ?? undefined) as never}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.key)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.categories")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {cats.map((c) => (
                <SidebarMenuItem key={c.slug}>
                  <SidebarMenuButton asChild isActive={isCatActive(c.slug)}>
                    <Link to="/catalog" search={{ cat: c.slug } as never}>
                      <c.icon className="h-4 w-4" />
                      <span>{t(`cat.${c.slug}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.admin")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin")}>
                  <Link to="/admin">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{t("nav.adminPanel")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="h-7 w-7 rounded-full bg-sidebar-accent ring-1 ring-primary/30" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium">{t("sidebar.guest")}</span>
            <Link to="/login" className="text-[10px] text-sidebar-foreground/60 hover:text-primary">
              {t("sidebar.signin")}
            </Link>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
