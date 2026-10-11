import type { ReactNode } from "react";
import { motion } from "motion/react";

type Props = {
  icon?: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
};

export function EmptyState({ icon, title, body, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-xl text-center px-6 py-16 sm:py-24"
    >
      <svg
        viewBox="0 0 240 90"
        className="mx-auto mb-8 w-56 text-parchment/20"
        aria-hidden="true"
        fill="none"
      >
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M-4 ${34 + i * 11} C 40 ${18 + i * 11}, 78 ${52 + i * 11}, 122 ${38 + i * 11} S 208 ${14 + i * 11}, 244 ${30 + i * 11}`}
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity={1 - i * 0.18}
          />
        ))}
      </svg>
      {icon ? <div className="mb-5 flex justify-center text-ember">{icon}</div> : null}
      <h3 className="text-2xl sm:text-3xl mb-3">{title}</h3>
      <p className="text-parchment/70 leading-relaxed">{body}</p>
      {children ? <div className="mt-8 flex justify-center gap-3">{children}</div> : null}
    </motion.div>
  );
}
