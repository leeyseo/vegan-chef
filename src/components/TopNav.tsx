import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { useMode } from "../state/ModeContext";

const linkBase = "font-label-md text-label-md transition-colors duration-200";
const linkInactive = "text-on-surface-variant hover:text-primary";
const linkActive = "text-primary border-b-2 border-primary pb-1";

function navClass({ isActive }: { isActive: boolean }) {
  return `${linkBase} ${isActive ? linkActive : linkInactive}`;
}

/** 일반 ↔ 비건 모드 토글 (테마·레시피 성격 전환) */
function ModeToggle() {
  const { mode, setMode } = useMode();
  const seg = (active: boolean) =>
    `px-3 py-1 rounded-full text-label-md font-label-md transition-colors flex items-center gap-1 ${
      active
        ? "bg-primary text-on-primary"
        : "text-on-surface-variant hover:text-primary"
    }`;
  return (
    <div
      className="inline-flex items-center rounded-full border border-outline-variant p-0.5 bg-surface-container-lowest"
      role="group"
      aria-label="요리 모드"
    >
      <button className={seg(mode === "general")} onClick={() => setMode("general")}>
        일반
      </button>
      <button className={seg(mode === "vegan")} onClick={() => setMode("vegan")}>
        <Icon name="eco" className="text-[15px]" />
        비건
      </button>
    </div>
  );
}

export function TopNav() {
  const navigate = useNavigate();
  const { brand, isVegan } = useMode();
  const [open, setOpen] = useState(false);

  const routes = [
    { to: "/", label: "Home", end: true },
    { to: "/recipes", label: isVegan ? "Vegan Recipes" : "Recipes" },
    { to: "/scan", label: "My Pantry" },
  ];
  const scanLabel = isVegan ? "Scan Vegan Fridge" : "Scan Fridge";

  return (
    <nav className="bg-surface-container-low w-full sticky top-0 z-50 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full max-w-[1280px] mx-auto gap-4">
        <NavLink
          to="/"
          className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2 tracking-tight shrink-0"
        >
          <Icon name="restaurant_menu" filled />
          {brand}
        </NavLink>

        {/* 데스크톱 내비 */}
        <ul className="hidden md:flex gap-gutter items-center">
          {routes.map((r) => (
            <li key={r.to}>
              <NavLink to={r.to} end={r.end} className={navClass}>
                {r.label}
              </NavLink>
            </li>
          ))}
          <li>
            <Link to="/#sustainable" className={`${linkBase} ${linkInactive}`}>
              Tips
            </Link>
          </li>
        </ul>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ModeToggle />
          <button
            onClick={() => navigate("/scan")}
            className="flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-full hover:bg-secondary transition-colors duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
          >
            <Icon name="document_scanner" className="text-[18px]" />
            {scanLabel}
          </button>
        </div>

        {/* 모바일 햄버거 */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-primary p-1 -mr-1 shrink-0"
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <Icon name={open ? "close" : "menu"} className="text-[28px]" />
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-surface-container-high bg-surface-container-low px-margin-mobile pb-4 pt-3 flex flex-col gap-1 animate-lockin"
        >
          <div className="pb-2">
            <ModeToggle />
          </div>
          {routes.map((r) => (
            <NavLink
              key={r.to}
              to={r.to}
              end={r.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `py-3 px-2 rounded-lg font-label-md text-label-md transition-colors ${
                  isActive
                    ? "text-primary bg-secondary-container/40"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`
              }
            >
              {r.label}
            </NavLink>
          ))}
          <Link
            to="/#sustainable"
            onClick={() => setOpen(false)}
            className="py-3 px-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Tips
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              navigate("/scan");
            }}
            className="mt-2 flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-md py-3 rounded-full"
          >
            <Icon name="document_scanner" className="text-[18px]" />
            {scanLabel}
          </button>
        </div>
      )}
    </nav>
  );
}
