import shuffle from "./fn.shuffle.mjs";

var fewUniqueSize = 4;

export default function fewUnique(size) {
  var i,
    ret = [];
  for (i = 0; i < size; i++) {
    ret.push(size - 1 - Math.floor(size / fewUniqueSize) * (i % fewUniqueSize));
  }
  return shuffle(ret);
}
