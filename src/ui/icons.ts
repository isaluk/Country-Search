const SVG_NS = 'http://www.w3.org/2000/svg';

const ICON_PATHS = {
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  arrowUpRight: 'M7 17 17 7M9 7h8v8',
  close: 'M6 6l12 12M18 6 6 18',
  retry: 'M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5',
} as const;

export type IconName = keyof typeof ICON_PATHS;

export const createIcon = (name: IconName, className = 'icon'): SVGElement => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const path = document.createElementNS(SVG_NS, 'path');

  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  path.setAttribute('d', ICON_PATHS[name]);
  svg.append(path);

  return svg;
};
