export default function gnome(AS) {
  let i = 1;
  while (i < AS.length()) {
    AS.play(i - 1, i);
    AS.mark(i - 1, i);
    if (AS.gt(i - 1, i)) {
      AS.swap(i - 1, i);
      i = Math.max(1, i - 1);
    } else {
      i++;
    }
  }
}

gnome.display = "Gnome";
gnome.stable = true;
gnome.best = "n";
gnome.average = "n^2";
gnome.worst = "n^2";
gnome.memory = "1";
gnome.method = "exchanging";
