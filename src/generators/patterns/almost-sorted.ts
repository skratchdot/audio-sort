import sorted from "./sorted.ts";
import random from "../../utilities/random.ts";
import swap from "../../utilities/swap.ts";

const almostSortedFactor = 2;

export default function almostSorted(size: number): number[] {
  const ret = sorted(size);
  const used: number[] = [];

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
