import type { SVGProps } from "react";

/** One consistent line-icon set (24px grid, 1.9 stroke) used across the site instead of emoji. */
const paths = {
  plane: <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  hotel: <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h1M14 7h1M9 11h1M14 11h1M10 21v-4h4v4" />,
  bus: <path d="M8 6v6M16 6v6M4 12h16M6 18h.01M18 18h.01M4 17V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM6 18v3M18 18v3" />,
  suitcase: <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 7h16a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1zM8 7v14M16 7v14" />,
  lock: <path d="M6 11V8a6 6 0 1 1 12 0v3M5 11h14v10H5zM12 15v2" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  tag: <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" />,
  headset: <path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2zM20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2zM17 18c0 2-2 3-5 3" />,
  check: <path d="M5 12.5 9.5 17 19 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  alert: <path d="M12 9v4M12 17h.01M10.3 3.9 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />,
  shield: <path d="M12 3 4 6v6c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V6z" />,
  edit: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, strokeWidth = 1.9, ...props }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  );
}
