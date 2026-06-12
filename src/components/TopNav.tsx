import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Icon } from "./Icon";

const linkBase = "font-label-md text-label-md transition-colors duration-200";
const linkInactive = "text-on-surface-variant hover:text-primary";
const linkActive = "text-primary border-b-2 border-primary pb-1";

function navClass({ isActive }: { isActive: boolean }) {
  return `${linkBase} ${isActive ? linkActive : linkInactive}`;
}

const ROUTES = [
  { to: "/", label: "Home", end: true },
  { to: "/recipes", label: "Vegan Recipes" },
  { to: "/scan", label: "My Pantry" },
];

export function TopNav() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-surface-container-low w-full sticky top-0 z-50 shadow-[0_1px_0_0_rgba(223,228,220,0.6)]">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full max-w-[1280px] mx-auto">
        <NavLink
          to="/"
          className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2 tracking-tight"
        >
          <Icon name="restaurant_menu" filled />
          Vegan Chef
        </NavLink>

        {/* 데스크톱 내비 */}
        <ul className="hidden md:flex gap-gutter items-center">
          {ROUTES.map((r) => (
            <li key={r.to}>
              <NavLink to={r.to} end={r.end} className={navClass}>
                {r.label}
              </NavLink>
            </li>
          ))}
          <li>
            <Link to="/#sustainable" className={`${linkBase} ${linkInactive}`}>
              Sustainable Tips
            </Link>
          </li>
        </ul>

        <button
          onClick={() => navigate("/scan")}
          className="hidden md:flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-full hover:bg-secondary transition-colors duration-200 shadow-[0_4px_12px_rgba(0,69,13,0.15)]"
        >
          <Icon name="document_scanner" className="text-[18px]" />
          Scan Vegan Fridge
        </button>

        {/* 모바일 햄버거 */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-primary p-1 -mr-1"
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <Icon name={open ? "close" : "menu"} className="text-[28px]" />
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-surface-container-high bg-surface-container-low px-margin-mobile pb-4 pt-2 flex flex-col gap-1 animate-lockin"
        >
          {ROUTES.map((r) => (
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
            Sustainable Tips
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              navigate("/scan");
            }}
            className="mt-2 flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-md py-3 rounded-full"
          >
            <Icon name="document_scanner" className="text-[18px]" />
            Scan Vegan Fridge
          </button>
        </div>
      )}
    </nav>
  );
}
