'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RollingNumber } from 'panelui-web/rolling-number';

/** Three weeks after a launch. */
const WEEKS = [
  { downloads: 18420, paid: 0.031, sales: 46200 },
  { downloads: 21960, paid: 0.038, sales: 61850 },
  { downloads: 19310, paid: 0.027, sales: 39400 },
];

export default function RollingNumberFormats() {
  const [week, setWeek] = useState(0);
  const { downloads, paid, sales } = WEEKS[week];

  return (
    <div className="flex flex-col items-center gap-6">
      <dl className="grid grid-cols-3 gap-8 text-center">
        <div className="flex flex-col gap-1">
          <dt className="text-sm font-medium text-muted-foreground">Downloads</dt>
          <dd className="text-2xl font-bold">
            <RollingNumber value={downloads} />
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm font-medium text-muted-foreground">Trial to paid</dt>
          <dd className="text-2xl font-bold">
            <RollingNumber
              value={paid}
              format={{ style: 'percent', minimumFractionDigits: 1 }}
            />
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm font-medium text-muted-foreground">Sales</dt>
          <dd className="text-2xl font-bold">
            <RollingNumber
              value={sales}
              format={{
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 1,
              }}
            />
          </dd>
        </div>
      </dl>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setWeek((current) => (current + 1) % WEEKS.length)}
      >
        Next week
      </Button>
    </div>
  );
}
