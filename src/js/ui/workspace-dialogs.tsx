import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useAtomValue } from "jotai";
import { settingsAtom } from "../state/settings.ts";
import {
  algorithmCatalogAtom,
  addAlgorithmAtom,
  editAlgorithmAtom,
} from "../state/algorithm-overrides.ts";
import { instruments } from "../midi/instruments.ts";
import { algorithms } from "../sorting/algorithm-registry.mjs";
import { sources } from "../sorting/algorithm-sources.mjs";
import { getFunctionBody } from "../sorting/sort-requests.ts";
import type { createCodeEditor } from "./create-code-editor.mjs";
import type { Props, PlayerId } from "./workspace-types.ts";
function Dialog({
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
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      onKeyDown={(event) => {
        if (event.key !== "Tab" || event.defaultPrevented) return;
        // Native modality makes the background inert; wrap the endpoints too,
        // rather than sending Tab from the last control into browser chrome.
        const items = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
          ),
        ).filter((element) => element.getClientRects().length > 0);
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <header className="modal-header">
        <h3 id={`${id}-title`}>{title}</h3>
        <button type="button" className="close" aria-label="Close dialog" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="modal-body">{children}</div>
      <footer className="modal-footer">
        <button type="button" className="button" onClick={onClose}>
          Close
        </button>
        {footer}
      </footer>
    </dialog>
  );
}

export function AlgorithmDialog({
  runtime,
  adding,
  onClose,
}: Props & { adding: boolean; onClose: () => void }) {
  const { sort } = useAtomValue(settingsAtom, { store: runtime.store });
  const catalog = useAtomValue(algorithmCatalogAtom, { store: runtime.store });
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
    void import("./create-code-editor.mjs")
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
        runtime.store.set(addAlgorithmAtom, {
          id: `custom_${crypto.randomUUID()}`,
          name: name.trim(),
          source: editor.current.getValue(),
        });
      } else runtime.store.set(editAlgorithmAtom, { id: sort, source: editor.current.getValue() });
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
        <button
          type="button"
          id={adding ? "save-algorithm-new" : "save-algorithm-edit"}
          className="button button-primary"
          disabled={status !== "ready" || (adding && !name.trim())}
          onClick={save}
        >
          Save changes
        </button>
      }
    >
      {adding ? (
        <label className="form-field" htmlFor="new-sort-name">
          Algorithm Name:
          <input
            id="new-sort-name"
            placeholder="New Sort Name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </label>
      ) : (
        <div className="tabs">
          {["information", "algorithm"].map((id) => (
            <button type="button" key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>
              {id === "information" ? "Information" : "Algorithm"}
            </button>
          ))}
        </div>
      )}
      {!adding && (
        <div id="sort-information" hidden={tab !== "information"}>
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
        </div>
      )}
      <div id={adding ? "new-sort-algorithm" : "sort-algorithm"} hidden={tab !== "algorithm"}>
        <div className="js-editor" ref={host} />
      </div>
      {saveError && <p role="alert">{saveError}</p>}
      {status === "loading" && <p role="status">Loading editor…</p>}
      {status === "error" && (
        <p role="alert">
          The editor could not load.{" "}
          <button type="button" className="button" onClick={() => location.reload()}>
            Reload page
          </button>
        </p>
      )}
    </Dialog>
  );
}

export function MidiDialog({
  runtime,
  id,
  onClose,
}: Props & { id: PlayerId; onClose: () => void }) {
  const [name, setName] = useState("");
  const [placeholder] = useState(() => `AudioSort_${Date.now()}`);
  const [channel, setChannel] = useState(0);
  const [instrument, setInstrument] = useState(0);
  return (
    <Dialog
      id="modal-midi-export"
      title="Midi Export"
      onClose={onClose}
      footer={
        <button
          type="button"
          id="midi-export-btn"
          className="button button-primary"
          onClick={() => runtime.exportMidi(id, name.trim() || placeholder, channel, instrument)}
        >
          Export As Midi
        </button>
      }
    >
      <label className="form-field" htmlFor="midi-export-name">
        File Name:
        <span>
          <input
            id="midi-export-name"
            placeholder={placeholder}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          .mid
        </span>
      </label>
      <label className="form-field" htmlFor="midi-export-channel">
        Midi Channel:
        <select
          id="midi-export-channel"
          value={channel}
          onChange={(e) => setChannel(Number(e.currentTarget.value))}
        >
          {Array.from({ length: 16 }, (_, i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field" htmlFor="midi-export-instrument">
        Midi Instrument:
        <select
          id="midi-export-instrument"
          value={instrument}
          onChange={(e) => setInstrument(Number(e.currentTarget.value))}
        >
          {[...new Set(instruments.map((item) => item.group))].map((group) => (
            <optgroup key={group} label={group}>
              {instruments
                .filter((item) => item.group === group)
                .map((item) => (
                  <option key={item.val} value={item.val}>
                    {item.val}: {item.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
    </Dialog>
  );
}
