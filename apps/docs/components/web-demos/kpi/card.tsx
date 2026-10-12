import { UsersIcon } from 'lucide-react';
import { Kpi } from 'panelui-web/kpi';

const READERS = [310, 318, 305, 322, 340, 336, 351, 348, 366, 372, 369, 388, 401, 412];

export default function KpiCard() {
  return (
    <Kpi surface className="max-w-xs">
      <Kpi.Header>
        <Kpi.Icon>
          <UsersIcon />
        </Kpi.Icon>
        <Kpi.Title>Weekly readers</Kpi.Title>
        <Kpi.Actions>
          <Kpi.Trend value={8.2} variant="badge" />
        </Kpi.Actions>
      </Kpi.Header>
      <Kpi.Value>4,120</Kpi.Value>
      <Kpi.Chart data={READERS} color="info" filled height={72} />
      <Kpi.Footer>Counted every Monday</Kpi.Footer>
    </Kpi>
  );
}
