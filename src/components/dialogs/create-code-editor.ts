import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-searchbox";
import javascriptWorkerUrl from "ace-builds/src-min-noconflict/worker-javascript.js?url";

// Let Vite emit the worker and resolve it at both / and /audio-sort/.
ace.config.setModuleUrl("ace/mode/javascript_worker", javascriptWorkerUrl);

export function createCodeEditor(element: HTMLElement) {
  const editor = ace.edit(element);
  editor.setOptions({
    theme: "ace/theme/monokai",
    tabSize: 2,
    useSoftTabs: true,
  });
  const session = editor.getSession();
  session.on("changeMode", () => {
    // The editor contains a function body with AS supplied by the runner.
    // Ace creates this worker after setting the mode, but omits it from EditSession's types.
    const worker = (
      session as typeof session & {
        $worker?: { call(command: string, args: unknown[]): void };
      }
    ).$worker;
    worker?.call("changeOptions", [{ esversion: 11, globals: { AS: false } }]);
  });
  session.setMode("ace/mode/javascript");
  return editor;
}
