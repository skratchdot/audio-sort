export default function swap(arr, one, two) {
  const len = arr.length;

  one = parseInt(one, 10) || 0;
  two = parseInt(two, 10) || 0;
  if (one !== two && one >= 0 && two >= 0 && one < len && two < len) {
    const tempOne = arr[one];
    const tempTwo = arr[two];
    arr[one] = tempTwo;
    arr[two] = tempOne;
  }
  return arr;
}
