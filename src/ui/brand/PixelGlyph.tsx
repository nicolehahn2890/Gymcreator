import { pixelRuns, type PixelPattern } from './pixels';

interface Props {
  pattern: PixelPattern;
  size: number;
  className?: string;
}

export function PixelGlyph({ pattern, size, className }: Props) {
  const width = pattern[0]?.length ?? 0;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${width} ${pattern.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {pixelRuns(pattern).map(({ x, y, w }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} fill="currentColor" />
      ))}
    </svg>
  );
}
