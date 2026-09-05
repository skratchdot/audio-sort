import "./AS.js";
import { runSortRequest } from "./sort/requests.mjs";

globalThis.onmessage = ({ data }) => {
  try {
    globalThis.postMessage(runSortRequest(data, globalThis.AS));
  } catch (error) {
    globalThis.postMessage({ key: data?.key, error: String(error?.message ?? error) });
  }
};
