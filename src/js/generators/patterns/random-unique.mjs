import shuffle from "../../utilities/shuffle.mjs";
import sorted from "./sorted.mjs";

export default function randomUnique(size) {
  return shuffle(sorted(size));
}
