// slightly modified version of:
// https://github.com/nzakas/computer-science-in-javascript/blob/master/algorithms/sorting/insertion-sort/insertion-sort.js
export default function insertion(AS) {
  const len = AS.length();

  for (let i = 0; i < len; i++) {
    const firstValue = AS.get(i);
    for (let j = i - 1; j > -1; j--) {
      const secondValue = AS.get(j);
      AS.play(j);
      if (AS.gt(secondValue, firstValue)) {
        AS.swap(j, j + 1);
      }
    }
  }
}

insertion.display = "Insertion";
insertion.stable = true;
// This version scans the entire prefix even when it is already sorted.
insertion.best = "n^2";
insertion.average = "n^2";
insertion.worst = "n^2";
insertion.memory = "1";
insertion.method = "insertion";
