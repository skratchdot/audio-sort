import { runSortRequest } from "./sorting/sort-requests.mjs";

globalThis.onmessage = ({ data }) => {
  try {
    globalThis.postMessage(runSortRequest(data));
  } catch (error) {
    globalThis.postMessage({ key: data?.key, error: String(error?.message ?? error) });
  }
};
