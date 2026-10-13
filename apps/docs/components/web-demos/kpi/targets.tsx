import { BanknoteIcon, TargetIcon } from 'lucide-react';
import { Kpi } from 'panelui-web/kpi';

export default function KpiTargets() {
  return (
    // A frame: a band that names what is inside, round a panel that holds it.
    <div className="w-full max-w-md rounded-3xl bg-muted p-1.5">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
        <h3 className="text-sm font-medium">Targets</h3>
        <p className="text-sm text-muted-foreground">This quarter</p>
      </div>

      <div className="rounded-[1.125rem] border bg-card p-5 text-card-foreground shadow-xs">
        <Kpi.Group orientation="vertical">
          <Kpi>
            <Kpi.Header>
              <Kpi.Icon tone="good">
                <TargetIcon />
              </Kpi.Icon>
              <Kpi.Title>Paid members</Kpi.Title>
              <Kpi.Actions>
                <Kpi.Trend value={5.1} variant="badge" />
              </Kpi.Actions>
            </Kpi.Header>
            <Kpi.Value>1,463</Kpi.Value>
            <Kpi.Progress value={1463} maxValue={2000} label="of 2,000" showValueLabel />
            <Kpi.Footer>38 days left in the quarter</Kpi.Footer>
          </Kpi>
          <Kpi>
            <Kpi.Header>
              <Kpi.Icon>
                <BanknoteIcon />
              </Kpi.Icon>
              <Kpi.Title>Sponsorship</Kpi.Title>
              <Kpi.Actions>
                <Kpi.Trend value={-3.4} variant="badge" />
              </Kpi.Actions>
            </Kpi.Header>
            <Kpi.Value>€9,800</Kpi.Value>
            <Kpi.Progress
              value={9800}
              maxValue={24000}
              label="of €24,000"
              showValueLabel
              color="warning"
            />
          </Kpi>
        </Kpi.Group>
      </div>
    </div>
  );
}
