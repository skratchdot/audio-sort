import shuffle from "../../utils/shuffle.ts";
import sorted from "./sorted.ts";

export default function randomUnique(size: number): number[] {
  return shuffle(sorted(size));
}
