export default function randomDupes(size) {
  var i,
    ret = [];
  for (i = 0; i < size; i++) {
    ret.push(Math.floor(Math.random() * size));
  }
  return ret;
}
