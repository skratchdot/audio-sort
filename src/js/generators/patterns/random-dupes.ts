export default function randomDupes(size: number): number[] {
  const ret = [];
  for (let i = 0; i < size; i++) {
    ret.push(Math.floor(Math.random() * size));
  }
  return ret;
}
