import { StatStrip } from 'panelui-web/stat-strip';

export default function StatStripRepository() {
  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-5 text-card-foreground">
      <StatStrip>
        <StatStrip.Item label="Issues">
          48
          <StatStrip.Trend value={-11} goodDirection="down" />
        </StatStrip.Item>
        <StatStrip.Item label="Review">
          3.2 <StatStrip.Unit>h</StatStrip.Unit>
          <StatStrip.Trend value={18} goodDirection="down" />
        </StatStrip.Item>
        <StatStrip.Item label="Coverage">
          81<StatStrip.Unit>%</StatStrip.Unit>
          <StatStrip.Trend value={7} />
        </StatStrip.Item>
      </StatStrip>
    </div>
  );
}
