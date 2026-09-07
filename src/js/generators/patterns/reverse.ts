import sorted from "./sorted.ts";

export default function reverse(size: number): number[] {
  return sorted(size).reverse();
}
