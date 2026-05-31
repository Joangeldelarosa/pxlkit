import React, { useState } from 'react';
import { PixelAlertDialog } from './PixelAlertDialog';

export function Default() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Open alert dialog
      </button>
      <PixelAlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Save changes?"
        description="Your edits will be applied to the live document."
        actionLabel="Save"
        onAction={() => setOpen(false)}
      />
    </div>
  );
}

export function Destructive() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Delete item
      </button>
      <PixelAlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this item?"
        description="This action cannot be undone."
        cancelLabel="Keep"
        actionLabel="Delete"
        destructive
        onAction={() => setOpen(false)}
      />
    </div>
  );
}

export function AsyncAction() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button type="button" onClick={() => { setError(null); setOpen(true); }}>
        Submit
      </button>
      <PixelAlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Submit report?"
        description={error ?? 'The report will be sent for review.'}
        actionLabel="Submit"
        onAction={async () => {
          await new Promise((r) => setTimeout(r, 600));
        }}
        onError={(e) => setError(e instanceof Error ? e.message : 'Failed')}
      />
    </div>
  );
}
