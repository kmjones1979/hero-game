type Props = { className?: string; size?: number };

export function Logo({ className, size = 22 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 20 L14.5 9.5" />
      <path d="M14.5 9.5 L17 7" />
      <path d="M17 7 L20 4" />
      <path d="M16 4 L20 4 L20 8" />
      <path d="M20 20 L9.5 9.5" />
      <path d="M9.5 9.5 L7 7" />
      <path d="M7 7 L4 4" />
      <path d="M8 4 L4 4 L4 8" />
      <circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
