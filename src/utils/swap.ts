export default function swap<T>(
  arr: T[],
  one?: number | string | null,
  two?: number | string | null,
): T[] {
  const len = arr.length;

  one = parseInt(String(one), 10) || 0;
  two = parseInt(String(two), 10) || 0;
  if (one !== two && one >= 0 && two >= 0 && one < len && two < len) {
    // The bounds check above validates both array indices.
    const tempOne = arr[one]!;
    const tempTwo = arr[two]!;
    arr[one] = tempTwo;
    arr[two] = tempOne;
  }
  return arr;
}
