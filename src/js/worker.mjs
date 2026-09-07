import { handleSortRequest } from "./sorting/sort-requests.ts";

globalThis.onmessage = ({ data }) => {
  globalThis.postMessage(handleSortRequest(data));
};
