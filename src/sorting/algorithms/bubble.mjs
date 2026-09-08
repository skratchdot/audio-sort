export default function bubble(AS) {
  let i;
  let swapped;
  let endIndex = AS.length();
  do {
    swapped = false;
    for (i = 0; i < endIndex - 1; i++) {
      AS.play(i);
      AS.mark(i);
      if (AS.lt(i + 1, i)) {
        AS.swap(i + 1, i);
        swapped = true;
      }
    }
    endIndex--;
  } while (swapped);
  AS.play(i);
}

bubble.display = "Bubble";
bubble.stable = true;
bubble.best = "n";
bubble.average = "n^2";
bubble.worst = "n^2";
bubble.memory = "1";
bubble.method = "exchanging";
