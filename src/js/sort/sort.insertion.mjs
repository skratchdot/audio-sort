// slightly modified version of:
// https://github.com/nzakas/computer-science-in-javascript/blob/master/algorithms/sorting/insertion-sort/insertion-sort.js
export default function insertion(AS) {
  var len = AS.length(),
    i,
    j,
    firstValue,
    secondValue;

  for (i = 0; i < len; i++) {
    firstValue = AS.get(i);
    for (j = i - 1; j > -1; j--) {
      secondValue = AS.get(j);
      AS.play(j);
      if (AS.gt(secondValue, firstValue)) {
        AS.swap(j, j + 1);
      }
    }
  }
}

insertion.display = "Insertion";
insertion.stable = true;
insertion.best = "n";
insertion.average = "n^2";
insertion.worst = "n^2";
insertion.memory = "1";
insertion.method = "insertion";
