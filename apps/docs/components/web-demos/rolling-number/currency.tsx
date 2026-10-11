'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RollingNumber } from 'panelui-web/rolling-number';

export default function RollingNumberCurrency() {
  const [balance, setBalance] = useState(12582210.27);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-muted-foreground">Balance</span>
        <RollingNumber
          value={balance}
          format={{ style: 'currency', currency: 'USD' }}
          className="text-4xl font-semibold tracking-tight"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBalance((value) => value - 1840.5)}
        >
          Pay an invoice
        </Button>
        <Button size="sm" onClick={() => setBalance((value) => value + 25000)}>
          Add a deposit
        </Button>
      </div>
    </div>
  );
}
