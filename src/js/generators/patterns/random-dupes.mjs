export default function randomDupes(size) {
  const ret = [];
  for (let i = 0; i < size; i++) {
    ret.push(Math.floor(Math.random() * size));
  }
  return ret;
}
