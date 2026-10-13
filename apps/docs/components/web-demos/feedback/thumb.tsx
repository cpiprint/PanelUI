'use client';

import { Feedback } from 'panelui-web/feedback';

export default function FeedbackThumb() {
  return (
    <div className="w-80 shrink-0 scale-[0.62]">
      <Feedback defaultValue="The export button is hard to find.">
        <Feedback.Content inline>
          <Feedback.Panel>
            <Feedback.Title>What got in your way?</Feedback.Title>
            <Feedback.Field minHeight={72} />
          </Feedback.Panel>
          <Feedback.Footer>
            <Feedback.Cancel />
            <Feedback.Submit />
          </Feedback.Footer>
        </Feedback.Content>
      </Feedback>
    </div>
  );
}
