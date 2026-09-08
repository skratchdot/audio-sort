import { handleSortRequest } from "./sort-requests.ts";

globalThis.onmessage = ({ data }) => {
  globalThis.postMessage(handleSortRequest(data));
};
