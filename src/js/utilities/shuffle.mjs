import swap from "./swap.mjs";

// shuffle function is the fisherYates algorithm adapted from:
// http://sedition.com/perl/javascript-fy.html
export default function shuffle(arr) {
  let i = arr.length;

  if (i === 0) {
    return arr;
  }
  while (--i) {
    const j = Math.floor(Math.random() * (i + 1));
    arr = swap(arr, i, j);
  }
  return arr;
}
