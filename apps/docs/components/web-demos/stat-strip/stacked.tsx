import { StatStrip } from 'panelui-web/stat-strip';

export default function StatStripStacked() {
  return (
    <div className="w-full max-w-xs rounded-2xl border bg-card p-5 text-card-foreground">
      <StatStrip orientation="vertical">
        <StatStrip.Item label="Build queue">
          4 <StatStrip.Unit>jobs</StatStrip.Unit>
          <StatStrip.Trend value={0}>since this morning</StatStrip.Trend>
        </StatStrip.Item>
        <StatStrip.Item label="Longest wait">
          6 <StatStrip.Unit>min</StatStrip.Unit>
          <StatStrip.Trend
            value={-2}
            goodDirection="down"
            format={(minutes) => `${minutes} min`}
          >
            than yesterday
          </StatStrip.Trend>
        </StatStrip.Item>
      </StatStrip>
    </div>
  );
}
