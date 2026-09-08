export default function heap(AS) {
  // Reference Introduction To Algorithms 3rd ed, Corment et al., Chapter 6

  // run heapsort! (pg 160 in book)
  function heapsort() {
    buildHeap();
    AS.clearHighlight();

    for (let size = AS.length(); size > 1; size--) {
      AS.mark(0);
      AS.play(0);
      AS.swap(0, size - 1); // First element is the maximum, stick it at the end

      // Re-heapify the remaining (0 to size-1) elements
      AS.highlight(size - 1);
      heapify(0, size - 1);
    }
  }

  // Build a max-heap of the whole array (pg 157 in book)
  function buildHeap() {
    const size = AS.length();
    for (let i = parent(size - 1); i >= 0; i--) {
      AS.highlight(i);
      heapify(i, size); // heapify over every element above the leaf nodes
    }
  }

  // heapify makes the subtree rooted at i obey the max-heap property (pg 154 in book)
  // i is the root of the subtree
  // size is the end of the heap
  function heapify(i, size) {
    const l = left(i);
    const r = right(i);
    let largest = i;

    AS.play(i);
    AS.mark(i);

    // Ensure the max-heap property holds for this subtree
    if (l < size) {
      AS.play(l);
      AS.mark(l);
      if (AS.gt(l, largest)) {
        largest = l;
      }
    }

    if (r < size) {
      AS.play(r);
      AS.mark(r);
      if (AS.gt(r, largest)) {
        largest = r;
      }
    }

    if (largest !== i) {
      AS.swap(i, largest);
      heapify(largest, size); // Ensure max-heap property still holds for the swapped sub-sub-tree
    }
  }

  // Get the left subtree element of i
  function left(i) {
    return (i + 1) * 2 - 1;
  }

  // Get the right subtree element of i
  function right(i) {
    return (i + 1) * 2;
  }

  // Get the parent element of i
  function parent(i) {
    return Math.floor((i + 1) / 2) - 1;
  }

  heapsort();
}

heap.display = "Heap";
heap.stable = false;
heap.best = "n";
heap.worst = "nlogn";
heap.average = "nlogn";
// Recursive heapify uses a logarithmic call stack.
heap.memory = "logn";
heap.method = "heap";
