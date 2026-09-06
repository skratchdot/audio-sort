// a slightly modified version of:
// https://github.com/nzakas/computer-science-in-javascript/blob/master/algorithms/sorting/selection-sort/selection-sort.js
export default function selection(AS) {
  var len = AS.length(),
    min,
    i,
    j;

  for (i = 0; i < len; i++) {
    min = i;
    for (j = i + 1; j < len; j++) {
      AS.play(j);
      AS.mark(i, j);
      if (AS.lt(j, min)) {
        min = j;
      }
    }
    if (i !== min) {
      AS.swap(i, min);
    }
  }
}

selection.display = "Selection";
selection.stable = false;
selection.best = "n^2";
selection.average = "n^2";
selection.worst = "n^2";
selection.memory = "1";
selection.method = "selection";
