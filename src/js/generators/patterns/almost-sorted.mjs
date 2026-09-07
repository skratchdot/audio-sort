import sorted from "./sorted.mjs";
import random from "../../utilities/random.ts";
import swap from "../../utilities/swap.mjs";

const almostSortedFactor = 2;

export default function almostSorted(size) {
  const ret = sorted(size);
  const used = [];

  const len = ret.length;
  for (let i = 0; i < len; i++) {
    const swapTry = random(i, Math.min(i + almostSortedFactor, len - 1));
    if (used.indexOf(i) < 0 && used.indexOf(swapTry) < 0) {
      used.push(i);
      used.push(swapTry);
      swap(ret, i, swapTry);
    }
  }
  return ret;
}
