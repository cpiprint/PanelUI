import { StatStrip } from 'panelui-web/stat-strip';

export default function StatStripFour() {
  return (
    <div className="w-full max-w-2xl rounded-2xl border bg-card px-6 py-5 text-card-foreground">
      <StatStrip className="gap-6">
        <StatStrip.Item label="Distance">
          12.4 <StatStrip.Unit>km</StatStrip.Unit>
        </StatStrip.Item>
        <StatStrip.Item label="Moving time">48:12</StatStrip.Item>
        <StatStrip.Item label="Elevation">
          186 <StatStrip.Unit>m</StatStrip.Unit>
        </StatStrip.Item>
        <StatStrip.Item label="Average pace" accent>
          3:53 <StatStrip.Unit>/km</StatStrip.Unit>
        </StatStrip.Item>
      </StatStrip>
    </div>
  );
}
