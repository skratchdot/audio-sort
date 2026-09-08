import shuffle from "../../utils/shuffle.ts";

const fewUniqueSize = 4;

export default function fewUnique(size: number): number[] {
  const ret = [];
  for (let i = 0; i < size; i++) {
    ret.push(size - 1 - Math.floor(size / fewUniqueSize) * (i % fewUniqueSize));
  }
  return shuffle(ret);
}
