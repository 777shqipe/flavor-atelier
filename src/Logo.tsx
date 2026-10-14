/** Cart-in-a-circle mark, as on the shop signs in the illustrations. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="24" fill="var(--logo-bg, currentColor)" />
      <g fill="none" stroke="var(--logo-fg, #fff)" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.5 14.5h4.3l3.2 14.6a1.7 1.7 0 0 0 1.7 1.3h12.2a1.7 1.7 0 0 0 1.7-1.3l2.4-10.4H17.2" />
      </g>
      <g className="logo-wheels">
        <circle cx="21.8" cy="35.4" r="2" fill="var(--logo-fg, #fff)" />
        <circle cx="32.6" cy="35.4" r="2" fill="var(--logo-fg, #fff)" />
      </g>
    </svg>
  );
}

const WORDS = [
  ["C", "HEAPER"],
  ["B", "UY"],
  ["M", "ILES"],
] as const;

/** Wordmark only: the full name, folding to its initials (CBM) once the header is stuck. */
export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button className="logo" type="button" onClick={onClick} aria-label="Cheaper Buy Miles, home">
      <span className="logo-word" aria-hidden="true">
        {WORDS.map(([first, rest]) => (
          <span key={first}>
            {first}
            <span className="logo-rest">{rest}</span>
          </span>
        ))}
      </span>
    </button>
  );
}
