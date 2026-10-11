'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RollingNumber } from 'panelui-web/rolling-number';

const WEEKS = [
  { visitors: 18420, conversion: 0.031, revenue: 46200 },
  { visitors: 21960, conversion: 0.038, revenue: 61850 },
  { visitors: 19310, conversion: 0.027, revenue: 39400 },
];

export default function RollingNumberFormats() {
  const [week, setWeek] = useState(0);
  const { visitors, conversion, revenue } = WEEKS[week];

  return (
    <div className="flex flex-col items-center gap-6">
      <dl className="grid grid-cols-3 gap-8 text-center">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Visitors</dt>
          <dd className="text-2xl font-semibold">
            <RollingNumber value={visitors} />
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Conversion</dt>
          <dd className="text-2xl font-semibold">
            <RollingNumber
              value={conversion}
              format={{ style: 'percent', minimumFractionDigits: 1 }}
            />
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Revenue</dt>
          <dd className="text-2xl font-semibold">
            <RollingNumber
              value={revenue}
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
