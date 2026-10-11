import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/missions/active", label: "Active Missions", end: false },
  { to: "/journal", label: "Field Journal", end: false },
] as const;

function NavItem({
  to,
  label,
  end,
  onNavigate,
  index = 0,
  mobile = false,
}: {
  to: string;
  label: string;
  end: boolean;
  onNavigate?: () => void;
  index?: number;
  mobile?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative block py-2 transition-colors duration-300 ${
          mobile ? "text-xl font-display" : "text-[0.95rem]"
        } ${isActive ? "text-parchment" : "text-parchment/70 hover:text-parchment"}`
      }
    >
      {({ isActive }) => (
        <motion.span
          className="relative inline-block will-change-transform"
          whileHover={reduce ? undefined : { y: -2 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
        >
          {label}
          {isActive && (
            <motion.span
              layoutId={mobile ? "nav-underline-mobile" : "nav-underline"}
              className="absolute -bottom-0.5 left-0 right-0 h-px bg-ember"
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            />
          )}
          {mobile && (
            <motion.span
              className="label-caps absolute -right-9 top-1/2 -translate-y-1/2 text-ember-glow/90"
              initial={reduce ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * index + 0.08 }}
            >
              0{index + 1}
            </motion.span>
          )}
        </motion.span>
      )}
    </NavLink>
  );
}

export function TopNav() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [openPath, setOpenPath] = useState(() => location.pathname);

  // Tie the panel to the path it was opened on: it closes automatically when
  // the route changes (including via browser back) without an effect.
  const isOpen = open && openPath === location.pathname;
  const toggle = () => {
    setOpenPath(location.pathname);
    setOpen((v) => !v);
  };
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-parchment/12 bg-forest-shadow/88 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="group font-display text-lg font-semibold tracking-[0.34em] text-parchment transition-colors duration-300 hover:text-ember"
          aria-label="Outverse — go to Home"
        >
          OUTVERSE
          <span
            aria-hidden="true"
            className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-0.35em] rounded-full bg-ember transition-transform duration-300 group-hover:scale-150"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-9 sm:flex">
          {NAV_ITEMS.map((item, i) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              end={item.end}
              index={i}
            />
          ))}
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-parchment/80 transition-colors hover:text-ember sm:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={toggle}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="mobile-nav"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-parchment/10 sm:hidden"
          >
            <nav aria-label="Primary mobile" className="flex flex-col gap-1 px-6 py-5">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={reduce ? false : { x: -22, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.06 * i + 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavItem
                    to={item.to}
                    label={item.label}
                    end={item.end}
                    index={i}
                    mobile
                    onNavigate={() => setOpen(false)}
                  />
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
