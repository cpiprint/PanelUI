import { Kpi } from 'panelui-web/kpi';

export default function KpiPanel() {
  return (
    <div className="w-full max-w-md rounded-3xl border bg-card p-5 text-card-foreground">
      <Kpi.Group>
        <Kpi>
          <Kpi.Title>Sent</Kpi.Title>
          <Kpi.Value>112</Kpi.Value>
          <Kpi.Trend value={3.7} />
        </Kpi>
        <Kpi>
          <Kpi.Title>Replies</Kpi.Title>
          <Kpi.Value>386</Kpi.Value>
          <Kpi.Trend value={14.2} />
        </Kpi>
        <Kpi>
          <Kpi.Title>Bounces</Kpi.Title>
          <Kpi.Value>0.6%</Kpi.Value>
          <Kpi.Trend value={-0.4} goodDirection="down" />
        </Kpi>
      </Kpi.Group>
    </div>
  );
}
