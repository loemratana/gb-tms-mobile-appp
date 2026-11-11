type Point = { x: number; y: number };

export function getChartScale(
  values: number[],
  height: number,
  padding = { top: 16, bottom: 24 }
) {
  const max = Math.max(...values, 1);
  const plotHeight = height - padding.top - padding.bottom;

  return (value: number) =>
    padding.top + plotHeight - (value / max) * plotHeight;
}

export function buildSmoothPath(
  points: Point[],
  width: number,
  height: number,
  padding = { left: 20, right: 20, top: 16, bottom: 24 }
) {
  if (points.length === 0) return "";

  const plotWidth = width - padding.left - padding.right;
  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const coords = points.map((point, index) => ({
    x: padding.left + step * index,
    y: point.y,
  }));

  if (coords.length === 1) {
    return `M ${coords[0].x} ${coords[0].y}`;
  }

  let path = `M ${coords[0].x} ${coords[0].y}`;

  for (let i = 0; i < coords.length - 1; i++) {
    const current = coords[i];
    const next = coords[i + 1];
    const cx = (current.x + next.x) / 2;
    path += ` C ${cx} ${current.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
}

export function buildAreaPath(linePath: string, width: number, height: number) {
  if (!linePath) return "";
  const baseline = height - 24;
  const startX = linePath.match(/M\s*([\d.]+)/)?.[1] ?? "0";
  const endMatch = linePath.match(/([\d.]+)\s+([\d.]+)$/);
  const endX = endMatch?.[1] ?? String(width - 20);

  return `${linePath} L ${endX} ${baseline} L ${startX} ${baseline} Z`;
}

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

export function describeDonutSlice(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}
