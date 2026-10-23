"use client";

/**
 * Herramientas / Panel — espejo de `mobile/app/(tabs)/menu.tsx`. Lista las herramientas del rol
 * desde `ROLE_TOOLS` (fuente única). Solo pro/admin entran aquí.
 */
import Link from "next/link";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleTools, ROLE_PANEL_TITLE } from "@/constants/roleTools";
import { isProRole, normalizeRole } from "@/constants/roles";
import s from "../pages.module.css";

export default function MenuPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role_name);
  const tools = getRoleTools(role);
  const showTools = isProRole(role) || role === "admin";

  return (
    <ScreenContainer>
      <ScreenHeader
        title={role === "admin" ? "Admin" : "Herramientas"}
        subtitle={ROLE_PANEL_TITLE[role] || "Tus herramientas profesionales"}
        showBack={false}
      />
      {!showTools || tools.length === 0 ? (
        <div className={s.emptyWrap}>
          <EmptyState
            icon={<Briefcase size={28} />}
            title="Sin herramientas todavía"
            subtitle="Cuando actives tu cuenta profesional verás aquí tu panel de gestión."
          />
        </div>
      ) : (
        <div className={s.toolGrid}>
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.route} className={s.toolLink}>
              <span className={s.toolDot} style={{ background: tool.color }} aria-hidden />
              <span>{tool.label}</span>
            </Link>
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
