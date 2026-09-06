import sorted from "./fn.datagen.sorted.mjs";
import random from "./fn.random.mjs";
import swap from "./fn.swap.mjs";

var almostSortedFactor = 2;

export default function almostSorted(size) {
  var ret = sorted(size),
    used = [],
    swapTry,
    i,
    len = ret.length;
  for (i = 0; i < len; i++) {
    swapTry = random(i, Math.min(i + almostSortedFactor, len - 1));
    if (used.indexOf(i) < 0 && used.indexOf(swapTry) < 0) {
      used.push(i);
      used.push(swapTry);
      swap(ret, i, swapTry);
    }
  }
  return ret;
}
