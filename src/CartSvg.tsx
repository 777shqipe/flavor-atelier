/** A real shopping cart, facing right. Groceries are revealed as the cart passes each stop. */
export function CartSvg() {
  return (
    <svg viewBox="0 -16 120 116" aria-hidden="true" focusable="false">
      <g className="goods">
        <g className="good g1">
          <circle cx="44" cy="16" r="11" fill="#e3261b" stroke="var(--cart-ink)" strokeWidth="2.5" />
          <path d="M44 6q0-5 6-7" fill="none" stroke="var(--cart-ink)" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="52" cy="3" rx="6" ry="3" fill="#6fd3b0" transform="rotate(-25 52 3)" />
        </g>
        <g className="good g2">
          <rect x="62" y="-4" width="16" height="30" rx="2" fill="#f6f0db" stroke="var(--cart-ink)" strokeWidth="2.5" />
          <path d="M62-4l8-9 8 9z" fill="#6bb8ff" stroke="var(--cart-ink)" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
        <g className="good g3">
          <g transform="rotate(-26 96 6)">
            <rect x="74" y="0" width="44" height="13" rx="6.5" fill="#f6b531" stroke="var(--cart-ink)" strokeWidth="2.5" />
            <path d="M86 1l4 11M97 1l4 11M108 2l3 9" stroke="var(--cart-ink)" strokeWidth="2" opacity="0.5" />
          </g>
        </g>
        <g className="good g4">
          <path d="M30 24C26 8 36-2 46 2 46 14 42 22 30 24z" fill="#6fd3b0" stroke="var(--cart-ink)" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M34 20C36 14 40 9 44 6" stroke="var(--cart-ink)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
        </g>
      </g>

      <path d="M26 22L15 6H3" fill="none" stroke="var(--cart-ink)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M42 62L37 76M88 62L93 76M37 74h56" fill="none" stroke="var(--cart-ink)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M24 22H104L95 62H34Z" fill="var(--cart-body)" stroke="var(--cart-ink)" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M44 24L40 60M64 24V60M84 24L88 60M30 38H99M33 50H96" stroke="var(--cart-ink)" strokeWidth="2" opacity="0.35" />
      <path d="M24 22H104" stroke="var(--cart-ink)" strokeWidth="5" strokeLinecap="round" />

      {[40, 92].map((cx) => (
        <g className="wheel" key={cx}>
          <circle cx={cx} cy="83" r="9" fill="var(--cart-ink)" />
          <circle cx={cx} cy="83" r="3.4" fill="var(--cart-hub)" />
          <path d={`M${cx - 7} 83h14M${cx} 76v14`} stroke="var(--cart-hub)" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
        </g>
      ))}
    </svg>
  );
}
