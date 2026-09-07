import shuffle from "../../utilities/shuffle.mjs";

const fewUniqueSize = 4;

export default function fewUnique(size) {
  const ret = [];
  for (let i = 0; i < size; i++) {
    ret.push(size - 1 - Math.floor(size / fewUniqueSize) * (i % fewUniqueSize));
  }
  return shuffle(ret);
}
