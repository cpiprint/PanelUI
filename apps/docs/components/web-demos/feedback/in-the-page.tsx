'use client';

import { useState } from 'react';
import { Feedback } from 'panelui-web/feedback';

export default function FeedbackInThePage() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  // Inline, there is nothing to close. Cancel and the ✕ report here instead,
  // and this page takes that to mean "start again".
  const reset = () => {
    setMessage('');
    setSent(false);
  };

  return (
    <Feedback value={message} onValueChange={setMessage} onOpenChange={reset}>
      <Feedback.Content inline>
        <Feedback.Panel>
          {sent ? (
            <>
              <Feedback.Title>Thank you</Feedback.Title>
              <p className="min-h-[200px] text-[17px] leading-6 text-muted-foreground">
                We read every message. If yours needs a reply, you will have one
                within a working day.
              </p>
            </>
          ) : (
            <>
              <Feedback.Title>What should we fix first?</Feedback.Title>
              <Feedback.Close label="Clear the message" />
              <Feedback.Field placeholder="Tell us what got in your way" />
            </>
          )}
        </Feedback.Panel>
        <Feedback.Footer>
          {sent ? (
            <Feedback.Cancel>Write another</Feedback.Cancel>
          ) : (
            <>
              <Feedback.Cancel>Clear</Feedback.Cancel>
              <Feedback.Submit onSubmit={() => setSent(true)} />
            </>
          )}
        </Feedback.Footer>
      </Feedback.Content>
    </Feedback>
  );
}
