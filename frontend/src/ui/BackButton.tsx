import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  label?: string;
  fallback?: string;
  className?: string;
  /** Match the surface the button sits on. */
  tone?: "dark" | "light";
};

/**
 * In-app back control. Uses real history so browser back/forward stay
 * consistent and state (stack, notes) survives the round trip.
 */
export function BackButton({
  label = "Back",
  fallback = "/",
  className = "",
  tone = "dark",
}: Props) {
  const navigate = useNavigate();

  const handle = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

  const toneClass =
    tone === "light"
      ? "text-ink/80 hover:text-ember-ink"
      : "text-parchment/75 hover:text-ember";

  return (
    <button
      type="button"
      onClick={handle}
      className={`group inline-flex items-center gap-2 py-2 -ml-1 pr-2 text-sm transition-colors duration-200 ${toneClass} ${className}`}
    >
      <ArrowLeft
        aria-hidden="true"
        size={17}
        className="transition-transform duration-300 group-hover:-translate-x-1"
      />
      {label}
    </button>
  );
}
