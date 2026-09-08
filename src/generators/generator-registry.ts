import sorted from "./patterns/sorted.ts";
import reverse from "./patterns/reverse.ts";
import randomUnique from "./patterns/random-unique.ts";
import randomDupes from "./patterns/random-dupes.ts";
import almostSorted from "./patterns/almost-sorted.ts";
import fewUnique from "./patterns/few-unique.ts";

export type Generator = (size: number) => number[];

export const generators = Object.freeze({
  sorted,
  reverse,
  randomUnique,
  randomDupes,
  almostSorted,
  fewUnique,
} satisfies Record<string, Generator>);

export type GeneratorId = keyof typeof generators;
