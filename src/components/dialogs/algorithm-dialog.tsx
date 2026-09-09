import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { settingsAtom } from "../../state/settings.ts";
import {
  algorithmCatalogAtom,
  addAlgorithmAtom,
  editAlgorithmAtom,
} from "../../state/algorithm-overrides.ts";
import { algorithms } from "../../sorting/algorithm-registry.ts";
import { sources } from "../../sorting/algorithm-sources.ts";
import { getFunctionBody } from "../../sorting/sort-requests.ts";
import type { createCodeEditor } from "./create-code-editor.ts";
import { PlayerDialog as Dialog } from "./player-dialog.tsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
export function AlgorithmDialog({ adding, onClose }: { adding: boolean; onClose: () => void }) {
  const addAlgorithm = useSetAtom(addAlgorithmAtom);
  const editAlgorithm = useSetAtom(editAlgorithmAtom);
  const { sort } = useAtomValue(settingsAtom);
  const catalog = useAtomValue(algorithmCatalogAtom);
  const algorithm = catalog[sort]!;
  const [name, setName] = useState("");
  const [tab, setTab] = useState(adding ? "algorithm" : "information");
  const [status, setStatus] = useState("loading");
  const [saveError, setSaveError] = useState("");
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<ReturnType<typeof createCodeEditor> | null>(null);
  useEffect(() => {
    let cancelled = false;
    let instance: ReturnType<typeof createCodeEditor> | undefined;
    void import("./create-code-editor.ts")
      .then(({ createCodeEditor }) => {
        if (cancelled) return;
        instance = createCodeEditor(host.current!);
        editor.current = instance;
        instance.setValue(
          adding
            ? ""
            : getFunctionBody(
                algorithm === algorithms[sort as keyof typeof algorithms]
                  ? sources[sort as keyof typeof sources]
                  : algorithm,
              ),
        );
        instance.clearSelection();
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
      editor.current = null;
      if (instance) {
        const session = instance.getSession();
        instance.destroy();
        session.destroy();
      }
    };
  }, [adding, algorithm, sort]);
  useEffect(() => {
    editor.current?.resize();
  }, [tab, status]);
  const save = () => {
    if (!editor.current) return;
    try {
      if (adding) {
        if (!name.trim()) return;
        addAlgorithm({
          id: `custom_${crypto.randomUUID()}`,
          name: name.trim(),
          source: editor.current.getValue(),
        });
      } else editAlgorithm({ id: sort, source: editor.current.getValue() });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    }
  };
  return (
    <Dialog
      id={adding ? "modal-add-algorithm" : "modal-sort"}
      title={adding ? "Add Algorithm" : `Sort Information: ${algorithm.display}`}
      onClose={onClose}
      footer={
        <Button
          type="button"
          id={adding ? "save-algorithm-new" : "save-algorithm-edit"}
          variant="default"
          disabled={status !== "ready" || (adding && !name.trim())}
          onClick={save}
        >
          Save changes
        </Button>
      }
    >
      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        {adding ? (
          <label className="mb-4 grid min-w-0 gap-2" htmlFor="new-sort-name">
            Algorithm Name:
            <Input
              id="new-sort-name"
              placeholder="New Sort Name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </label>
        ) : (
          <TabsList>
            {["information", "algorithm"].map((id) => (
              <TabsTrigger key={id} value={id}>
                {id === "information" ? "Information" : "Algorithm"}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        {!adding && (
          <TabsContent
            value="information"
            data-panel="sort-information"
            keepMounted
            className="min-h-72"
          >
            <table>
              <tbody>
                {(
                  [
                    ["Name", "display"],
                    ["Stable", "stable"],
                    ["Best Case", "best"],
                    ["Average Case", "average"],
                    ["Worst Case", "worst"],
                    ["Memory", "memory"],
                    ["Method", "method"],
                  ] as const
                ).map(([label, key]) => (
                  <tr key={key}>
                    <th>{label}:</th>
                    <td id={`sort-info-${key}`}>
                      {key === "stable"
                        ? algorithm.stable
                          ? "Yes"
                          : "No"
                        : String(algorithm[key] || "")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
        )}
        <TabsContent
          value="algorithm"
          data-panel={adding ? "new-sort-algorithm" : "sort-algorithm"}
          keepMounted
        >
          <div className="js-editor h-72 w-full" ref={host} />
        </TabsContent>
      </Tabs>
      {saveError && <p role="alert">{saveError}</p>}
      {status === "loading" && <p role="status">Loading editor…</p>}
      {status === "error" && (
        <p role="alert">
          The editor could not load.{" "}
          <Button
            type="button"
            variant="outline"
            className="aria-pressed:bg-muted aria-pressed:shadow-inner"
            onClick={() => location.reload()}
          >
            Reload page
          </Button>
        </p>
      )}
    </Dialog>
  );
}
