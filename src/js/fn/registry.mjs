import sorted from "./fn.datagen.sorted.mjs";
import reverse from "./fn.datagen.reverse.mjs";
import randomUnique from "./fn.datagen.randomUnique.mjs";
import randomDupes from "./fn.datagen.randomDupes.mjs";
import almostSorted from "./fn.datagen.almostSorted.mjs";
import fewUnique from "./fn.datagen.fewUnique.mjs";

export const generators = Object.freeze({
  sorted,
  reverse,
  randomUnique,
  randomDupes,
  almostSorted,
  fewUnique,
});
