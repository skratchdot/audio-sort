import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlIcon } from "@/components/control-icon";
import type { PlayerId } from "../runtime/workspace-types";

export function WorkspaceSection({
  id,
  title,
  description,
  onExport,
  children,
}: {
  id: PlayerId;
  title: string;
  description: string;
  onExport: () => void;
  children: ReactNode;
}) {
  return (
    <section id={`${id}-section`} className="mx-auto my-4 w-[calc(100%-2rem)] max-w-7xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-2">
        <h2 className="my-0 text-lg font-bold">
          {title}{" "}
          <small className="block text-sm font-normal text-muted-foreground lg:inline">
            {description}
          </small>
        </h2>
        <Button data-midi-export={id} onClick={onExport}>
          <span>Export As Midi</span>
          <ControlIcon icon={Download} />
        </Button>
      </div>
      {children}
    </section>
  );
}
