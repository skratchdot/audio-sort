export default function cocktailShaker(AS) {
  let start = 0;
  let end = AS.length() - 1;
  while (start < end) {
    let swapped = false;
    for (let i = start; i < end; i++) {
      AS.play(i, i + 1);
      AS.mark(i, i + 1);
      if (AS.gt(i, i + 1)) {
        AS.swap(i, i + 1);
        swapped = true;
      }
    }
    if (!swapped) break;
    end--;
    swapped = false;
    for (let i = end; i > start; i--) {
      AS.play(i - 1, i);
      AS.mark(i - 1, i);
      if (AS.gt(i - 1, i)) {
        AS.swap(i - 1, i);
        swapped = true;
      }
    }
    if (!swapped) break;
    start++;
  }
}

cocktailShaker.display = "Cocktail shaker";
cocktailShaker.stable = true;
cocktailShaker.best = "n";
cocktailShaker.average = "n^2";
cocktailShaker.worst = "n^2";
cocktailShaker.memory = "1";
cocktailShaker.method = "exchanging";
