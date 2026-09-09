export const DonutChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;

  const segments = data.map((d) => {
    const pct = d.value / total;
    const dashArray = `${pct * circumference} ${circumference}`;
    const dashOffset = -cumulative * circumference;
    cumulative += pct;
    return { ...d, dashArray, dashOffset, pct };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="20" />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={s.dashArray}
              strokeDashoffset={s.dashOffset}
              strokeLinecap="round"
              style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "all 0.6s ease" }}
            />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="currentColor" fontSize="22" fontWeight="bold">
            {total}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">
            Events
          </text>
        </svg>
      </div>
      <div className="space-y-3">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <p className="text-sm font-medium">{s.label}</p>
            </div>
            <p className="text-sm text-muted-foreground">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
