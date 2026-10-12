import { Kpi } from 'panelui-web/kpi';

const READERS = [31, 32, 30, 34, 36, 35, 38, 41];

export default function KpiThumb() {
  return (
    <Kpi className="w-60">
      <Kpi.Content layout="inline">
        <Kpi.Stat>
          <Kpi.Title>Readers</Kpi.Title>
          <Kpi.Value>4,120</Kpi.Value>
          <Kpi.Trend value={8.2} />
        </Kpi.Stat>
        <Kpi.Chart data={READERS} color="success" inline style={{ width: 96 }} />
      </Kpi.Content>
    </Kpi>
  );
}
