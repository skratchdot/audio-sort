export default function comb(AS) {
  const length = AS.length();
  let gap = length;
  let swapped = true;
  // Classic shrink factor; keep scanning at gap 1 until a pass makes no swaps.
  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / 1.3));
    swapped = false;
    for (let i = 0; i + gap < length; i++) {
      AS.play(i, i + gap);
      AS.mark(i, i + gap);
      if (AS.gt(i, i + gap)) {
        AS.swap(i, i + gap);
        swapped = true;
      }
    }
  }
}

comb.display = "Comb";
comb.stable = false;
comb.best = "nlogn";
// Conservative upper bound; a tight average bound is not claimed.
comb.average = "n^2";
comb.worst = "n^2";
comb.memory = "1";
comb.method = "exchanging";
