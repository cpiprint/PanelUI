'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Feedback } from 'panelui-web/feedback';

const SCORES = [1, 2, 3, 4, 5];

export default function FeedbackScore() {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setScore(null);
      setMessage('');
    }
  };

  return (
    <Feedback open={open} onOpenChange={close} value={message} onValueChange={setMessage}>
      <Feedback.Trigger render={<Button variant="outline" />}>Rate the new editor</Feedback.Trigger>
      <Feedback.Content>
        {score === null ? (
          <>
            <Feedback.Panel>
              <Feedback.Title>How is the new editor?</Feedback.Title>
              <Feedback.Close />
              <div className="flex min-h-[120px] flex-col justify-center gap-3">
                <div className="flex justify-between gap-2">
                  {SCORES.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} out of 5`}
                      onClick={() => setScore(value)}
                      className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-foreground/10 text-lg font-semibold transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Worse</span>
                  <span>Much better</span>
                </div>
              </div>
            </Feedback.Panel>
            <Feedback.Footer>
              <Feedback.Cancel>Not now</Feedback.Cancel>
            </Feedback.Footer>
          </>
        ) : (
          <>
            <Feedback.Panel>
              <Feedback.Title>
                What made it a <span className={cn(score >= 4 && 'text-emerald-500')}>{score}</span>?
              </Feedback.Title>
              <Feedback.Close />
              <Feedback.Field autoFocus minHeight={120} placeholder="In your own words" />
            </Feedback.Panel>
            <Feedback.Footer>
              {/* Back, not Cancel: preventDefault keeps the dialog open. */}
              <Feedback.Cancel
                onClick={(event) => {
                  event.preventDefault();
                  setScore(null);
                }}
              >
                Back
              </Feedback.Cancel>
              <Feedback.Submit onSubmit={() => close(false)} />
            </Feedback.Footer>
          </>
        )}
      </Feedback.Content>
    </Feedback>
  );
}
