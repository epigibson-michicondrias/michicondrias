"use client";

/**
 * Shell de la app (espejo del comportamiento de `mobile/app/(tabs)/_layout.tsx`):
 * barra lateral en escritorio (≥768 px) y barra inferior de pestañas en móvil.
 * Inicio, Explorar, Tienda, Perfil y (solo pro/admin) Herramientas.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  Compass,
  Home,
  LogOut,
  PawPrint,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getRoleTools, ROLE_PANEL_TITLE } from "@/constants/roleTools";
import { isProRole, normalizeRole } from "@/constants/roles";
import NotificationBell from "@/components/notifications/NotificationBell";
import s from "./AppShell.module.css";

const MAIN_NAV = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Compass },
  { href: "/tienda", label: "Michi-Shop", icon: ShoppingBag },
  { href: "/perfil", label: "Perfil", icon: User },
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const role = normalizeRole(user?.role_name);
  const showTools = isProRole(role) || role === "admin";
  const ToolsIcon = role === "admin" ? ShieldCheck : Briefcase;
  const tools = getRoleTools(role);
  const toolsLabel = ROLE_PANEL_TITLE[role] || "Herramientas";

  const isActive = (href: string) =>
    href === "/inicio" ? pathname === "/inicio" || pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className={s.root}>
      {/* Sidebar escritorio */}
      <aside className={s.sidebar} aria-label="Navegación principal">
        <Link href="/inicio" className={s.brand}>
          <PawPrint size={24} className={s.brandMark} aria-hidden />
          <span className={s.brandName}>Michicondrias</span>
        </Link>

        <nav className={s.nav}>
          {MAIN_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${s.navLink} ${isActive(href) ? s.navLinkActive : ""}`}
              aria-current={isActive(href) ? "page" : undefined}
            >
              <Icon size={20} aria-hidden />
              <span>{label}</span>
              {href === "/tienda" && cartCount > 0 && <span className={s.badge}>{cartCount > 99 ? "99+" : cartCount}</span>}
            </Link>
          ))}

          {showTools && (
            <Link
              href="/menu"
              className={`${s.navLink} ${isActive("/menu") ? s.navLinkActive : ""}`}
              aria-current={isActive("/menu") ? "page" : undefined}
            >
              <ToolsIcon size={20} aria-hidden />
              <span>{role === "admin" ? "Admin" : "Panel"}</span>
            </Link>
          )}
        </nav>

        {showTools && tools.length > 0 && (
          <div className={s.toolsSection}>
            <p className={s.toolsTitle}>{toolsLabel}</p>
            <nav className={s.nav}>
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.route}
                  className={`${s.navLink} ${s.navLinkSm} ${isActive(tool.route) ? s.navLinkActive : ""}`}
                >
                  <span className={s.toolDot} style={{ background: tool.color }} aria-hidden />
                  <span>{tool.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        <div className={s.sidebarFooter}>
          <Link href="/perfil" className={s.navLink}>
            <User size={20} aria-hidden />
            <span className={s.userLine}>{user?.full_name || "Mi cuenta"}</span>
          </Link>
          <button type="button" className={`${s.navLink} ${s.logout}`} onClick={handleLogout}>
            <LogOut size={20} aria-hidden />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Drawer móvil (herramientas pro) */}
      {drawerOpen && (
        <div className={s.drawerBackdrop} onClick={() => setDrawerOpen(false)}>
          <aside className={s.drawer} onClick={(e) => e.stopPropagation()} aria-label="Herramientas">
            <div className={s.drawerHeader}>
              <p className={s.toolsTitle}>{toolsLabel}</p>
              <button type="button" className={s.iconClose} onClick={() => setDrawerOpen(false)} aria-label="Cerrar">
                <X size={22} />
              </button>
            </div>
            <nav className={s.nav}>
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.route}
                  className={`${s.navLink} ${s.navLinkSm} ${isActive(tool.route) ? s.navLinkActive : ""}`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <span className={s.toolDot} style={{ background: tool.color }} aria-hidden />
                  <span>{tool.label}</span>
                </Link>
              ))}
              <button type="button" className={`${s.navLink} ${s.logout}`} onClick={handleLogout}>
                <LogOut size={18} aria-hidden />
                <span>Cerrar sesión</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

      <div className={s.main}>
        <header className={s.topbar}>
          <Link href="/inicio" className={s.brandSm}>
            <PawPrint size={22} className={s.brandMark} aria-hidden />
            <span className={s.brandName}>Michicondrias</span>
          </Link>
          <div className={s.topActions}>
            <Link href="/busqueda" className={s.iconBtn} aria-label="Buscar">
              <Search size={20} />
            </Link>
            <NotificationBell />
          </div>
        </header>

        <div className={s.content}>{children}</div>

        {/* Barra inferior móvil */}
        <nav className={s.tabBar} aria-label="Pestañas">
          {MAIN_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${s.tab} ${isActive(href) ? s.tabActive : ""}`}
              aria-current={isActive(href) ? "page" : undefined}
            >
              <span className={s.tabIconWrap}>
                <Icon size={22} aria-hidden />
                {href === "/tienda" && cartCount > 0 && (
                  <span className={s.tabBadge}>{cartCount > 99 ? "99+" : cartCount}</span>
                )}
              </span>
              <span className={s.tabLabel}>{label}</span>
            </Link>
          ))}
          {showTools && (
            <button
              type="button"
              className={`${s.tab} ${isActive("/menu") ? s.tabActive : ""}`}
              onClick={() => (tools.length > 0 ? setDrawerOpen(true) : router.push("/menu"))}
            >
              <span className={s.tabIconWrap}>
                <ToolsIcon size={22} aria-hidden />
              </span>
              <span className={s.tabLabel}>{role === "admin" ? "Admin" : "Panel"}</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
