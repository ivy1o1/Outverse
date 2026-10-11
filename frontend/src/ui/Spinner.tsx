type Props = { label?: string; className?: string };

export function Spinner({ label, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} role="status">
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        aria-hidden="true"
        className="animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="2"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {label ? <span className="text-sm tracking-wide">{label}</span> : null}
    </span>
  );
}
