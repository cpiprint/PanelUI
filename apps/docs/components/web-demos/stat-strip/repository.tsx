import { StatStrip } from 'panelui-web/stat-strip';

export default function StatStripRepository() {
  return (
    // A frame: a band that names what is inside, round a panel that holds it.
    <div className="w-full max-w-md rounded-3xl bg-muted p-1.5">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
        <h3 className="text-sm font-medium">Repository</h3>
        <p className="text-sm text-muted-foreground">Against last month</p>
      </div>

      <div className="rounded-[1.125rem] border bg-card p-5 text-card-foreground shadow-xs">
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
    </div>
  );
}
