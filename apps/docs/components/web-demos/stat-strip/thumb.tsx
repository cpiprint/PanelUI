import { StatStrip } from 'panelui-web/stat-strip';

export default function StatStripThumb() {
  return (
    <StatStrip className="w-60">
      <StatStrip.Item label="Issues">
        48
        <StatStrip.Trend value={-11} goodDirection="down" />
      </StatStrip.Item>
      <StatStrip.Item label="Coverage">
        81<StatStrip.Unit>%</StatStrip.Unit>
        <StatStrip.Trend value={7} />
      </StatStrip.Item>
    </StatStrip>
  );
}
