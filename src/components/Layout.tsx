import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "./TopNav";
import { Footer } from "./Footer";

export function Layout() {
  const { pathname, hash } = useLocation();

  // 페이지/해시 전환 처리: 해시가 있으면 해당 섹션으로, 없으면 상단으로 스크롤.
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      // 새 페이지가 렌더된 다음 프레임에 대상 요소를 찾는다.
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0 });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <TopNav />
      <Outlet />
      <Footer />
    </div>
  );
}
