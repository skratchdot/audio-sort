import shuffle from "./fn.shuffle.mjs";
import sorted from "./fn.datagen.sorted.mjs";

export default function randomUnique(size) {
  return shuffle(sorted(size));
}
