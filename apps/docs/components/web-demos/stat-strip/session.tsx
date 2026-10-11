import { StatStrip } from 'panelui-web/stat-strip';

export default function StatStripSession() {
  return (
    <div className="dark w-full max-w-xl rounded-[36px] bg-card px-7 py-6 text-card-foreground">
      <StatStrip>
        <StatStrip.Item label="Average session">9 minutes</StatStrip.Item>
        <StatStrip.Item label="Current mood">Calm</StatStrip.Item>
        <StatStrip.Item label="Meditation time" accent>
          8:30 <StatStrip.Unit>PM</StatStrip.Unit>
        </StatStrip.Item>
      </StatStrip>
    </div>
  );
}
