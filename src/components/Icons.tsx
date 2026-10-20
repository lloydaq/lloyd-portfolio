import type { SVGProps } from 'react';

// One stroke icon set, 24px grid, 1.75 stroke. Brand marks are simplified
// single-colour glyphs. All decorative: the surrounding control is labelled.
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowUpRight = (p: IconProps) => (
  <Base data-icon="arrow-up-right" {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Base>
);

export const ArrowDown = (p: IconProps) => (
  <Base data-icon="arrow-down" {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Base>
);

export const ArrowLeft = (p: IconProps) => (
  <Base data-icon="arrow-left" {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Base>
);

export const Sun = (p: IconProps) => (
  <Base data-icon="sun" {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </Base>
);

export const Moon = (p: IconProps) => (
  <Base data-icon="moon" {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </Base>
);

export const Menu = (p: IconProps) => (
  <Base data-icon="menu" {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const Close = (p: IconProps) => (
  <Base data-icon="close" {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const Copy = (p: IconProps) => (
  <Base data-icon="copy" {...p}>
    <rect x="9" y="9" width="11" height="11" rx="1.5" />
    <path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" />
  </Base>
);

export const Check = (p: IconProps) => (
  <Base data-icon="check" {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Base>
);

export const Mail = (p: IconProps) => (
  <Base data-icon="mail" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </Base>
);

export const GitHub = (p: IconProps) => (
  <Base data-icon="github" {...p}>
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  </Base>
);

export const LinkedIn = (p: IconProps) => (
  <Base data-icon="linkedin" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 10.5V16M8 7.5v.01M12 16v-5.5M12 13a2.5 2.5 0 0 1 5 0v3" />
  </Base>
);
