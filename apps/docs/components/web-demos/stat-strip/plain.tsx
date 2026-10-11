import { StatStrip } from 'panelui-web/stat-strip';

export default function StatStripPlain() {
  return (
    <StatStrip className="max-w-md">
      <StatStrip.Item label="Distance">
        42.2 <StatStrip.Unit>km</StatStrip.Unit>
      </StatStrip.Item>
      <StatStrip.Item label="Climb">
        310 <StatStrip.Unit>m</StatStrip.Unit>
      </StatStrip.Item>
      <StatStrip.Item label="Finished">11:48</StatStrip.Item>
    </StatStrip>
  );
}
