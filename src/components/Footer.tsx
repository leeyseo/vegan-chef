import { Icon } from "./Icon";
import { useMode } from "../state/ModeContext";

export function Footer() {
  const { brand, isVegan } = useMode();
  return (
    <footer className="bg-surface-container-low w-full mt-auto border-t border-surface-container-highest">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-lg w-full max-w-[1280px] mx-auto gap-gutter">
        <div className="flex flex-col items-center md:items-start gap-sm">
          <div className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <Icon name="restaurant_menu" filled />
            {brand}
          </div>
          <p className="font-caption text-caption text-on-surface-variant">
            © 2026 {brand}.{" "}
            {isVegan ? "식물성 지능으로 만든 식탁." : "냉장고로 시작하는 똑똑한 요리."}
          </p>
        </div>
        <ul className="flex flex-wrap justify-center md:justify-end gap-md md:gap-gutter">
          <li>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200"
              href="#"
            >
              Ethical Sourcing
            </a>
          </li>
          <li>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200"
              href="#"
            >
              Privacy
            </a>
          </li>
          <li>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200"
              href="#"
            >
              Terms
            </a>
          </li>
          <li>
            <a
              className="font-body-md text-body-md text-primary font-bold hover:text-secondary transition-colors duration-200"
              href="#"
            >
              {isVegan ? "100% Plant-Based" : "AI Recipes"}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
