import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { ClickSparkHost } from "../animations/ClickSpark";
import { TopNav } from "../navigation/TopNav";
export function AppLayout() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const reduce = useReducedMotion();

  // Scroll restoration: new navigations start at the top, back/forward
  // returns to where the user was.
  const scrollMemory = useRef(new Map<string, number>());
  useEffect(() => {
    const key = location.key;
    const memory = scrollMemory.current;
    if (navigationType === "POP") {
      window.scrollTo({ top: memory.get(key) ?? 0, behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    return () => {
      memory.set(key, window.scrollY);
    };
  }, [location.key, navigationType]);

  return (
    <ClickSparkHost>
      <div className="relative flex min-h-svh flex-col bg-forest-shadow">
        <a
          href="#main-content"
          className="sr-only rounded-md bg-ember px-4 py-2 text-forest-shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100"
        >
          Skip to content
        </a>

        <TopNav />

        <main id="main-content" className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: reduce ? 0.12 : 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-parchment/10 px-5 py-6 text-center sm:px-8">
          <p className="label-caps text-parchment/65">
            Outverse · your notes stay on this device
          </p>
        </footer>
      </div>
    </ClickSparkHost>
  );
}
