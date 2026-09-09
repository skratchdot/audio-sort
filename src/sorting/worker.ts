import { handleSortRequest } from "./sort-requests.ts";

globalThis.onmessage = ({ data }: MessageEvent<unknown>) => {
  globalThis.postMessage(handleSortRequest(data));
};
