# Sorting algorithm catalog

A broad implementation wishlist, not a promise to implement every entry. There is no
closed, exhaustive list of sorting algorithms: variants, hybrids, and new algorithms
keep appearing. This catalog covers the named sorts in Wikipedia's
[comparison tables](https://en.wikipedia.org/wiki/Sorting_algorithm#Comparison_of_algorithms),
plus additional variants, networks, and external sorts. Each algorithm name links to
its Wikipedia article or the relevant parent article when it has no separate page.

Implementation status checked against the [registry](../src/sorting/algorithm-registry.ts)
on 2026-09-08. Only registered built-ins count as implemented; historical files and
custom editor examples do not.

## Reading the tables

- Columns match the app's `display`, `stable`, `best`, `average`, `worst`, `memory`,
  and `method` metadata, with implementation status and fit added for planning.
- Time and auxiliary memory entries use **O(...)**, with the wrapper omitted.
  Bounds describe the stated algorithm variant, not measured animation speed.
  `log² n` means `(log n)²`. Memory includes recursion, but excludes the input and
  Audio Sort's recorded frames. Instrumentation can dominate both time and memory.
- `n`: item count; `k`: number of buckets or possible integer keys; `d`: number of
  digits per key; `b`: radix; `w`: maximum string length. Key comparisons are constant
  time unless a row explicitly discusses strings, I/O, or a physical model.
- Average cases generally assume randomly ordered inputs; distribution sorts need
  the additional assumptions in their notes. Randomized expected bounds are labeled.
- Stability means preserving the identities and relative order of equal-key items,
  not just producing the same numeric values. It applies to the specified variant.
- `Varies` means a family needs a concrete variant/model before assigning a bound;
  `Not established here` means this catalog does not claim a verified bound.
  `N/A` means the property does not apply. These are not zero-cost claims.
- Fit is a project assessment: **Direct** uses comparisons/swaps; **Adapt** needs
  buffering, writes, indexing, or additional visualization; **Specialized** targets
  a different data/hardware model; **Novelty** needs strict size and execution limits.
  Direct does not mean easy or prioritized.

## Current app metadata

These are the metadata values currently shipped (with notation normalized for reading),
not an endorsement of their accuracy.
The catalog below describes algorithm properties separately so stale labels do not
become requirements for new implementations.

| Name / source                                                    | Stable | Best    | Average          | Worst   | Memory | Method     |
| ---------------------------------------------------------------- | ------ | ------- | ---------------- | ------- | ------ | ---------- |
| [Bubble](../src/sorting/algorithms/bubble.mjs)                   | Yes    | n       | n²               | n²      | 1      | exchanging |
| [Cocktail shaker](../src/sorting/algorithms/cocktail-shaker.mjs) | Yes    | n       | n²               | n²      | 1      | exchanging |
| [Comb](../src/sorting/algorithms/comb.mjs)                       | No     | n log n | n² (upper bound) | n²      | 1      | exchanging |
| [Gnome](../src/sorting/algorithms/gnome.mjs)                     | Yes    | n       | n²               | n²      | 1      | exchanging |
| [Heap](../src/sorting/algorithms/heap.mjs)                       | No     | n       | n log n          | n log n | log n  | heap       |
| [Insertion](../src/sorting/algorithms/insertion.mjs)             | Yes    | n²      | n²               | n²      | 1      | insertion  |
| [Quick](../src/sorting/algorithms/quick.mjs)                     | No     | n log n | n log n          | n²      | n      | exchanging |
| [Selection](../src/sorting/algorithms/selection.mjs)             | No     | n²      | n²               | n²      | 1      | selection  |

Quick's memory bound includes its worst-case recursive stack; balanced partitions
use logarithmic space. Heap also includes its recursive heapify stack. Its linear
best case can occur with equal keys; distinct-key analyses commonly give n log n.
Insertion scans the entire prefix without an early exit, so this implementation's
best case is quadratic despite the usual algorithm's linear best case.
Comb uses a 1.3 shrink factor and stores a conservative quadratic average-case upper
bound in the chooser, not a claim of a tight average bound.

## Exchange, insertion, and selection sorts

| Algorithm                                                                      | Implemented            | Stable                             | Best           | Average              | Worst   | Auxiliary memory             | Method                      | Fit / notes                                                                                                                     |
| ------------------------------------------------------------------------------ | ---------------------- | ---------------------------------- | -------------- | -------------------- | ------- | ---------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [Bubble sort](https://en.wikipedia.org/wiki/Bubble_sort)                       | Yes: `bubble`          | Yes                                | n              | n²                   | n²      | 1                            | Exchanging                  | Direct; early-exit version.                                                                                                     |
| [Cocktail shaker sort](https://en.wikipedia.org/wiki/Cocktail_shaker_sort)     | Yes: `cocktail-shaker` | Yes                                | n              | n²                   | n²      | 1                            | Exchanging                  | Direct; bidirectional bubble sort, also called shaker sort.                                                                     |
| [Comb sort](https://en.wikipedia.org/wiki/Comb_sort)                           | Yes: `comb`            | No                                 | n log n        | Not established here | n²      | 1                            | Exchanging                  | Direct; shrinking gaps, then adjacent comparisons; shrink schedule matters.                                                     |
| [Gnome sort](https://en.wikipedia.org/wiki/Gnome_sort)                         | Yes: `gnome`           | Yes                                | n              | n²                   | n²      | 1                            | Exchanging                  | Direct; adjacent swaps walking backward after inversions.                                                                       |
| [Odd–even sort](https://en.wikipedia.org/wiki/Odd%E2%80%93even_sort)           | No                     | Yes                                | n              | n²                   | n²      | 1                            | Exchanging                  | Direct; serial, early-exit version; also called brick sort.                                                                     |
| [Insertion sort](https://en.wikipedia.org/wiki/Insertion_sort)                 | Yes: `insertion`       | Yes                                | n              | n²                   | n²      | 1                            | Insertion                   | Direct; standard early-exit variant shown; current app scans the full prefix (quadratic best case).                             |
| [Binary insertion sort](https://en.wikipedia.org/wiki/Insertion_sort#Variants) | No                     | Yes                                | n log n        | n²                   | n²      | 1                            | Insertion                   | Direct; unconditional binary search; n log n comparisons but quadratic moves. An ordered-tail shortcut gives linear best time.  |
| [Shellsort](https://en.wikipedia.org/wiki/Shellsort)                           | No                     | No                                 | Varies         | Varies               | Varies  | 1                            | Insertion                   | Direct; choose a gap sequence first. Original halving gaps have quadratic worst time; Pratt gaps give n log² n.                 |
| [Library sort](https://en.wikipedia.org/wiki/Library_sort)                     | No                     | No (randomized version)            | n log n        | n log n expected     | n²      | n                            | Gapped insertion            | Adapt; randomized insertion order and reserved gaps; [original analysis](https://arxiv.org/abs/cs/0407003).                     |
| [Selection sort](https://en.wikipedia.org/wiki/Selection_sort)                 | Yes: `selection`       | No                                 | n²             | n²                   | n²      | 1                            | Selection                   | Direct; ordinary swap-based variant. Stable shifting is a separate variant.                                                     |
| [Cycle sort](https://en.wikipedia.org/wiki/Cycle_sort)                         | No                     | No                                 | n²             | n²                   | n²      | 1                            | Selection                   | Adapt; write-minimizing version needs recorded writes, not just swaps; handle duplicate keys.                                   |
| [Heapsort](https://en.wikipedia.org/wiki/Heapsort)                             | Yes: `heap`            | No                                 | n (equal keys) | n log n              | n log n | 1 iterative; log n recursive | Heap / selection            | Direct; catalog distinguishes iterative and current recursive heapify.                                                          |
| [Smoothsort](https://en.wikipedia.org/wiki/Smoothsort)                         | No                     | No                                 | n              | n log n              | n log n | 1                            | Heap / selection            | Direct, advanced; Leonardo heaps. [Dijkstra's description](https://www.cs.utexas.edu/~EWD/transcriptions/EWD07xx/EWD796a.html). |
| [Tournament sort](https://en.wikipedia.org/wiki/Tournament_sort)               | No                     | Yes with leftmost tie-breaking     | n log n        | n log n              | n log n | n                            | Selection                   | Adapt; retain item identities in a tournament tree.                                                                             |
| [Tree sort](https://en.wikipedia.org/wiki/Tree_sort)                           | No                     | Yes with ordered duplicate storage | n log n        | n log n              | n²      | n                            | Tree insertion              | Adapt; ordinary unbalanced BST; random distinct-key insertion for average bound.                                                |
| [Balanced tree sort](https://en.wikipedia.org/wiki/Tree_sort#Efficiency)       | No                     | Yes with ordered duplicate storage | n log n        | n log n              | n log n | n                            | Tree insertion              | Adapt; balancing removes the unbalanced-tree worst case.                                                                        |
| [Splaysort](https://en.wikipedia.org/wiki/Splaysort)                           | No                     | Varies                             | n              | n log n              | n log n | n                            | Tree insertion              | Adapt; adaptive splay-tree sort; preserve duplicates explicitly.                                                                |
| [Patience sorting](https://en.wikipedia.org/wiki/Patience_sorting)             | No                     | No (usual pile version)            | n              | n log n              | n log n | n                            | Insertion / selection       | Adapt; requires pile construction and a merge to produce a full sort, not only an LIS.                                          |
| [Pancake sort](https://en.wikipedia.org/wiki/Pancake_sorting)                  | No                     | No                                 | n²             | n²                   | n²      | 1                            | Prefix reversal / selection | Direct; simple repeated maximum scan, not minimum-flip optimization; flips can be swaps.                                        |

## Merging and partitioning sorts

| Algorithm                                                                                   | Implemented  | Stable                | Best                | Average             | Worst               | Auxiliary memory       | Method                          | Fit / notes                                                                                                                                  |
| ------------------------------------------------------------------------------------------- | ------------ | --------------------- | ------------------- | ------------------- | ------------------- | ---------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [Merge sort (top-down)](https://en.wikipedia.org/wiki/Merge_sort)                           | No           | Yes                   | n log n             | n log n             | n log n             | n                      | Merging                         | Adapt; ordinary array merge with a buffer; no ordered-run shortcut assumed.                                                                  |
| [Merge sort (bottom-up)](https://en.wikipedia.org/wiki/Merge_sort#Bottom-up_implementation) | No           | Yes                   | n log n             | n log n             | n log n             | n                      | Merging                         | Adapt; iterative passes over runs.                                                                                                           |
| [Natural merge sort](https://en.wikipedia.org/wiki/Merge_sort#Natural_merge_sort)           | No           | Yes                   | n                   | n log n             | n log n             | n                      | Merging                         | Adapt; detect runs and use balanced merge passes.                                                                                            |
| [In-place merge sort](https://en.wikipedia.org/wiki/Merge_sort#In-place_merge_sort)         | No           | Yes                   | n                   | n log² n            | n log² n            | log n                  | Rotation / merging              | Direct, advanced; recursive rotation-based merge with an ordered-run shortcut; other variants have different bounds.                         |
| [Block sort](https://en.wikipedia.org/wiki/Block_sort)                                      | No           | Yes                   | n                   | n log n             | n log n             | 1                      | Block merging                   | Direct, advanced; constant-buffer variant; WikiSort and GrailSort are related implementations, not extra families here.                      |
| [Timsort](https://en.wikipedia.org/wiki/Timsort)                                            | No           | Yes                   | n                   | n log n             | n log n             | n                      | Insertion / merging             | Adapt; run detection, merge policy, and galloping. [Implementation notes](https://github.com/python/cpython/blob/main/Objects/listsort.txt). |
| [Powersort](https://en.wikipedia.org/wiki/Timsort)                                          | No           | Yes                   | n                   | n log n             | n log n             | n                      | Adaptive merging                | Adapt; merge-order strategy combined with buffered merging; [original paper](https://arxiv.org/abs/1805.04154).                              |
| [Strand sort](https://en.wikipedia.org/wiki/Strand_sort)                                    | No           | Yes                   | n                   | n²                  | n²                  | n                      | Selection / merging             | Adapt; extracts increasing subsequences, then merges them.                                                                                   |
| [Cubesort](https://en.wikipedia.org/wiki/Cubesort)                                          | No           | Yes                   | n                   | n log n             | n log n             | n                      | Insertion / merging             | Adapt, advanced; specialized multi-level structure.                                                                                          |
| [Quicksort](https://en.wikipedia.org/wiki/Quicksort)                                        | Yes: `quick` | No                    | n log n             | n log n             | n²                  | log n average; n worst | Partitioning                    | Direct; ordinary two-recursive-call version; smaller-side recursion can bound stack space.                                                   |
| [Three-way quicksort](https://en.wikipedia.org/wiki/Quicksort#Repeated_elements)            | No           | No                    | n (equal keys)      | n log n             | n²                  | log n average; n worst | Partitioning                    | Direct; separates less/equal/greater regions; handles duplicate-heavy input well.                                                            |
| [Dual-pivot quicksort](https://en.wikipedia.org/wiki/Quicksort#Multi-pivot_quicksort)       | No           | No                    | Varies              | n log n             | n²                  | log n average; n worst | Partitioning                    | Direct; pivot policy and duplicate handling determine best case; excludes introspective fallback.                                            |
| [Introsort](https://en.wikipedia.org/wiki/Introsort)                                        | No           | No                    | n log n             | n log n             | n log n             | log n                  | Partitioning / heap / insertion | Direct, advanced; depth limit triggers heapsort.                                                                                             |
| [Pattern-defeating quicksort (pdqsort)](https://en.wikipedia.org/wiki/Introsort#pdqsort)    | No           | No                    | n                   | n log n             | n log n             | log n                  | Adaptive partitioning / heap    | Direct, advanced; [author's implementation and bounds](https://github.com/orlp/pdqsort).                                                     |
| [Fluxsort](https://en.wikipedia.org/wiki/Sorting_algorithm#Comparison_sorts)                | No           | Yes                   | n                   | n log n             | n log n             | n                      | Partitioning / merging          | Adapt; [author's implementation](https://github.com/scandum/fluxsort).                                                                       |
| [Crumsort](https://en.wikipedia.org/wiki/Sorting_algorithm#Comparison_sorts)                | No           | No                    | n                   | n log n             | n log n             | log n                  | Partitioning / merging          | Adapt, advanced; fixed scratch buffer plus recursion; [author's implementation](https://github.com/scandum/crumsort).                        |
| [Merge-insertion sort (Ford–Johnson)](https://en.wikipedia.org/wiki/Merge-insertion_sort)   | No           | No (ordinary variant) | n log n comparisons | n log n comparisons | n log n comparisons | Varies                 | Merging / insertion             | Adapt, advanced; comparison counts are not total runtime; array insertion may require quadratic moves.                                       |

## Distribution and key-specific sorts

These need access to keys, not just an opaque comparator. Numeric output must still
preserve the original sort objects: rebuilding bare numbers loses identity and makes
stability untestable. Bounds assume the key range and digit operations stated here.

| Algorithm                                                                     | Implemented | Stable                    | Best                 | Average               | Worst                     | Auxiliary memory | Method                    | Fit / notes                                                                                                                                                                                              |
| ----------------------------------------------------------------------------- | ----------- | ------------------------- | -------------------- | --------------------- | ------------------------- | ---------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Counting sort](https://en.wikipedia.org/wiki/Counting_sort)                  | No          | Yes (buffered variant)    | n + k                | n + k                 | n + k                     | n + k            | Counting                  | Adapt; bounded integer range; scatter original items, not reconstructed values.                                                                                                                          |
| [Pigeonhole sort](https://en.wikipedia.org/wiki/Pigeonhole_sort)              | No          | Yes with FIFO holes       | n + k                | n + k                 | n + k                     | n + k            | Distribution              | Adapt; holes retain all original records, including duplicates.                                                                                                                                          |
| [Bucket sort](https://en.wikipedia.org/wiki/Bucket_sort)                      | No          | Yes with stable buckets   | n + k                | n + k expected        | n² + k                    | n + k            | Distribution / insertion  | Adapt; uniform distribution and insertion-sorted buckets; skew can be quadratic.                                                                                                                         |
| [LSD radix sort](https://en.wikipedia.org/wiki/Radix_sort)                    | No          | Yes                       | d(n + b)             | d(n + b)              | d(n + b)                  | n + b            | Digit distribution        | Adapt; fixed-length keys, stable counting pass per digit; define negative-key handling.                                                                                                                  |
| [MSD radix sort (buffered)](https://en.wikipedia.org/wiki/Radix_sort)         | No          | Yes                       | n + b                | d(n + b)              | d(n + b)                  | n + bd           | Digit distribution        | Adapt; early singleton termination; bound includes count arrays along recursive depth.                                                                                                                   |
| [Binary quicksort / radix exchange](https://en.wikipedia.org/wiki/Radix_sort) | No          | No                        | n                    | nd                    | nd                        | d                | Bit partitioning          | Direct with key access; in-place MSD variant; integer width must be explicit.                                                                                                                            |
| [American flag sort](https://en.wikipedia.org/wiki/American_flag_sort)        | No          | No                        | n + b                | d(n + b)              | d(n + b)                  | bd               | Digit distribution        | Adapt; in-place bucket permutation; recursive counter storage bound.                                                                                                                                     |
| [Flashsort](https://en.wikipedia.org/wiki/Flashsort)                          | No          | No                        | n                    | n + k expected        | n²                        | k                | Distribution / insertion  | Adapt; uniform numeric distribution for linear expectation; in-place permutation with class counters.                                                                                                    |
| [Proxmap sort](https://en.wikipedia.org/wiki/Proxmap_sort)                    | No          | Yes with stable insertion | n                    | n expected            | n²                        | n                | Distribution / insertion  | Adapt; linear number of bins and a well-distributed mapping.                                                                                                                                             |
| [Interpolation sort](https://en.wikipedia.org/wiki/Interpolation_sort)        | No          | Varies                    | Varies               | Varies                | Varies                    | Varies           | Distribution              | Adapt; family of numeric interpolation schemes; select a concrete version before implementation.                                                                                                         |
| [Spreadsort](https://en.wikipedia.org/wiki/Spreadsort)                        | No          | No                        | n                    | Varies with key width | Varies with key width     | Varies           | Radix / comparison hybrid | Adapt, advanced; use the [Boost variant's key-width-dependent analysis](https://www.boost.org/doc/libs/latest/libs/sort/doc/html/sort/single_thread/spreadsort.html), not an unconditional linear claim. |
| [Burstsort](https://en.wikipedia.org/wiki/Burstsort)                          | No          | Varies                    | Not established here | Varies                | Varies with bucket sorter | Varies           | Trie / distribution       | Specialized; strings, prefixes, and cache behavior are outside the current numeric-bar model.                                                                                                            |

## Networks, external sorting, and research models

Network rows report **serial comparator work**, not parallel depth. A fixed network
does the same comparisons regardless of input order; its depth can be much smaller.
Network memory excludes a precomputed comparator list and assumes an iterative
schedule unless noted. External-sort costs should not be compared directly with
in-memory time: disk transfers, buffer size, and merge fan-in matter.

| Algorithm                                                                                          | Implemented | Stable                     | Best                 | Average                      | Worst                | Auxiliary memory                | Method                   | Fit / notes                                                                                          |
| -------------------------------------------------------------------------------------------------- | ----------- | -------------------------- | -------------------- | ---------------------------- | -------------------- | ------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| [Bitonic sort](https://en.wikipedia.org/wiki/Bitonic_sorter)                                       | No          | No                         | n log² n             | n log² n                     | n log² n             | 1                               | Compare-exchange network | Direct; basic network assumes a power-of-two size; depth log² n.                                     |
| [Batcher odd–even mergesort](https://en.wikipedia.org/wiki/Batcher_odd%E2%80%93even_mergesort)     | No          | No                         | n log² n             | n log² n                     | n log² n             | 1                               | Compare-exchange network | Direct; not brick sort; power-of-two network, depth log² n.                                          |
| [Pairwise sorting network](https://en.wikipedia.org/wiki/Pairwise_sorting_network)                 | No          | No (ordinary network)      | n log² n             | n log² n                     | n log² n             | Varies with schedule            | Compare-exchange network | Direct, advanced; choose network size and generator.                                                 |
| [AKS sorting network](https://en.wikipedia.org/wiki/Sorting_network#Constructing_sorting_networks) | No          | No stability guarantee     | n log n              | n log n                      | n log n              | Varies with representation      | Compare-exchange network | Specialized; logarithmic parallel depth but impractical constants/construction.                      |
| [Samplesort](https://en.wikipedia.org/wiki/Samplesort)                                             | No          | Varies                     | Varies               | n log n expected serial work | Varies               | Varies                          | Sampling / partitioning  | Specialized; depends on sampling, bucket sorter, and processor count; can be demonstrated serially.  |
| [External merge sort](https://en.wikipedia.org/wiki/External_sorting)                              | No          | Yes with stable runs/merge | Varies (I/O model)   | Varies (I/O model)           | Varies (I/O model)   | Bounded RAM buffers; external n | External merging         | Specialized; disk-backed runs and streaming are absent from this app.                                |
| [Polyphase merge sort](https://en.wikipedia.org/wiki/Polyphase_merge_sort)                         | No          | Varies with run handling   | Varies (I/O model)   | Varies (I/O model)           | Varies (I/O model)   | Buffers plus external runs      | External merging         | Specialized; tape/run distribution, not a distinct bar-swap primitive.                               |
| [Funnelsort](https://en.wikipedia.org/wiki/Funnelsort)                                             | No          | Yes with stable mergers    | n log n              | n log n                      | n log n              | n                               | Cache-oblivious merging  | Specialized; serial work shown; cache-transfer advantage needs a separate model.                     |
| [Thorup's integer sorting](https://en.wikipedia.org/wiki/Integer_sorting)                          | No          | Not established here       | Not established here | n log log n expected         | Not established here | n                               | Integer sorting          | Specialized; word-RAM research model, not ordinary JavaScript arithmetic costs.                      |
| [Andersson–Hagerup–Nilsson–Raman sorting](https://en.wikipedia.org/wiki/Integer_sorting)           | No          | Not established here       | Not established here | n log log n upper bound      | n log log n          | Not established here            | Integer sorting          | Specialized; deterministic word-RAM bound; randomized wide-word variants have different assumptions. |

## Novelty and physical sorts

Do not enable unbounded sorts in the main chooser without cancellation, operation/frame
budgets, and tiny input limits. A worker alone does not impose a runtime limit; the
fallback path can also block the UI. Physical demonstrations need simulations, whose
costs are not the physical model's costs.

| Algorithm                                                                           | Implemented | Stable                     | Best                  | Average               | Worst                  | Auxiliary memory       | Method                         | Fit / notes                                                                                                                      |
| ----------------------------------------------------------------------------------- | ----------- | -------------------------- | --------------------- | --------------------- | ---------------------- | ---------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| [Bogosort (random shuffle)](https://en.wikipedia.org/wiki/Bogosort)                 | No          | No                         | n                     | n·n! expected         | Unbounded              | 1                      | Random permutation             | Novelty; distinct keys and uniform independent shuffles for expectation.                                                         |
| [Permutation sort (deterministic bogosort)](https://en.wikipedia.org/wiki/Bogosort) | No          | No                         | n                     | n·n! upper bound      | n·n!                   | Varies with enumerator | Permutation enumeration        | Novelty; finite only if permutations are enumerated without repetition.                                                          |
| [Bogobogosort](https://en.wikipedia.org/wiki/Bogosort#Related_algorithms)           | No          | No                         | Varies                | Not established here  | Unbounded (randomized) | Varies                 | Recursive random permutation   | Novelty; definitions vary; no useful default input size.                                                                         |
| [Stooge sort](https://en.wikipedia.org/wiki/Stooge_sort)                            | No          | No                         | n^2.7095…             | n^2.7095…             | n^2.7095…              | log n                  | Recursive exchanging           | Novelty; exponent is log(3)/log(3/2); easy to express with swaps.                                                                |
| [Slowsort](https://en.wikipedia.org/wiki/Slowsort)                                  | No          | No                         | T(n)                  | T(n)                  | T(n)                   | n                      | Recursive exchanging           | Novelty; T(n) = 2T(n/2) + T(n−1) + O(1), superpolynomial; same recursion for every input order.                                  |
| [Bead sort](https://en.wikipedia.org/wiki/Bead_sort)                                | No          | N/A for unlabelled beads   | Varies by model       | Varies by model       | Varies by model        | Varies by model        | Gravity / unary representation | Specialized; nonnegative integers; grid simulation can require n·max(key) cells, and does not inherently retain record identity. |
| [Spaghetti sort](https://en.wikipedia.org/wiki/Spaghetti_sort)                      | No          | N/A without a tie protocol | n physical operations | n physical operations | n physical operations  | n rods                 | Physical selection             | Specialized; simultaneous physical comparison is not a constant-time software primitive.                                         |

## Choosing what to implement

Cocktail shaker, Gnome, and Comb are implemented. Good next additions are Shell
(with a documented gap sequence) and Odd–even: both can show their intermediate work
through existing swaps.
Bitonic and Pancake add visibly different movement patterns without needing buffers.

Before buffered Merge, Counting, or Radix, decide how the engine should record writes
and auxiliary storage. Sorting a hidden copy and replaying only the final permutation
would hide the algorithm's actual work. A swap-only adaptation may change its time,
space, or write-count properties and should be labeled accordingly.

The fit labels are not permanent exclusions: even external algorithms can be simulated
on small inputs, but doing so meaningfully needs a visualization of their actual model.
Meme procedures that discard items or simply assume the input is sorted are not valid
general sorting implementations; the app requires an ordered permutation of the input.

When adding an algorithm, choose its exact variant, confirm the bounds from its paper
or reference implementation, test duplicate-key stability and identity preservation,
and update both this catalog and the app metadata. Follow [Adding algorithms](development.md#adding-algorithms).
