// Custom SVG charts without external libraries
import { useMemo } from "react";

const COLORS = {
  brand: "#1a66db",
  brandDark: "#1651b0",
  danger: "#e02424",
  warn: "#f59e0b",
  ok: "#10b981",
  gray400: "#94a3b8",
  gray500: "#64748b",
  gray600: "#475569",
  gray800: "#1f2937",
};

export function LineChart({ data, height = 200, color = COLORS.brand, label = "" }) {
  const { points, min, max, width } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0)
      return { points: [], min: 0, max: 0, width: 0 };

    const w = 600;
    const h = height - 30;
    const vals = data.map((d) => d.value);
    const min = Math.min(...vals, 0);
    const max = Math.max(...vals, 1);
    const range = max - min || 1;
    const stepX = w / Math.max(data.length - 1, 1);

    const points = data.map((d, i) => ({
      x: i * stepX,
      y: h - ((d.value - min) / range) * h + 15,
      label: d.label,
      value: d.value,
    }));

    return { points, min, max, width: w };
  }, [data, height]);

  if (!points.length)
    return <div className="text-xs text-gray-500 text-center py-8">No data</div>;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - 15} L 0 ${height - 15} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={color} />
          {i % Math.ceil(points.length / 6) === 0 && (
            <text x={p.x} y={height - 2} textAnchor="middle" fill={COLORS.gray500} fontSize="10">
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function BarChart({ data, height = 200, color = COLORS.brand }) {
  if (!Array.isArray(data) || data.length === 0)
    return <div className="text-xs text-gray-500 text-center py-8">No data</div>;

  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 600;
  const barW = w / data.length - 8;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const barH = (d.value / max) * (height - 30);
        const x = i * (w / data.length) + 4;
        const y = height - barH - 15;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={d.color || color} opacity="0.8" />
            <text x={x + barW / 2} y={height - 2} textAnchor="middle" fill={COLORS.gray500} fontSize="10">
              {d.label}
            </text>
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill={COLORS.gray500} fontSize="10">
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DonutChart({ data, size = 160 }) {
  if (!Array.isArray(data))
    return <div className="text-xs text-gray-500 text-center py-8">No data</div>;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0)
    return <div className="text-xs text-gray-500 text-center py-8">No data</div>;

  const radius = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;
  let cumulative = 0;

  const segments = data.map((d) => {
    const fraction = d.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += fraction;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;

    return {
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: d.color,
      label: d.label,
      value: d.value,
    };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity="0.8" />
        ))}
        <circle cx={cx} cy={cy} r={radius * 0.6} fill={COLORS.gray800} />
        <text x={cx} y={cy - 5} textAnchor="middle" fill={COLORS.gray500} fontSize="20" fontWeight="bold">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={COLORS.gray500} fontSize="10">
          Total
        </text>
      </svg>
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded" style={{ background: d.color }} />
            <span className="text-gray-600">{d.label}</span>
            <span className="text-gray-500 ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StackedBarChart({ data, height = 200 }) {
  if (!data || data.length === 0)
    return <div className="text-xs text-gray-500 text-center py-8">No data</div>;

  const w = 600;
  const max = Math.max(
    ...data.map((d) => d.segments.reduce((s, seg) => s + seg.value, 0)),
    1
  );
  const barW = w / data.length - 8;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const x = i * (w / data.length) + 4;
        let yOffset = height - 15;
        return (
          <g key={i}>
            {d.segments.map((seg, j) => {
              const barH = (seg.value / max) * (height - 30);
              yOffset -= barH;
              return (
                <rect
                  key={j}
                  x={x}
                  y={yOffset}
                  width={barW}
                  height={barH}
                  fill={seg.color}
                  opacity="0.8"
                />
              );
            })}
            <text x={x + barW / 2} y={height - 2} textAnchor="middle" fill={COLORS.gray500} fontSize="10">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
