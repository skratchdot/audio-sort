import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function WorkspaceDialog({
  id,
  title,
  children,
  footer,
  onClose,
}: {
  id: string;
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}) {
  const [trigger] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        id={id}
        finalFocus={() => trigger}
        className="max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100%-2rem))] max-w-none overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="pr-8">{title}</DialogTitle>
        </DialogHeader>
        {children}
        <DialogFooter className="flex-row flex-wrap justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
