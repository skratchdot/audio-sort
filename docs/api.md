# Algorithm API

You can add or edit your own JavaScript sorting algorithm from the sorting controls on the [main page](/). Choose **Add Algorithm** to create one, or open the selected algorithm's information dialog to edit its source.

## Writing an algorithm

Enter the **body of a JavaScript function**, without a surrounding `function`
declaration. Audio Sort passes in an object named `AS` that lets your code inspect
the array, compare and swap items, and record sound and visualization markers.
You do not need to return the sorted array.

The algorithm runs first, recording steps for later playback. `AS.play()` records
which items should sound during playback; it does not produce sound immediately.
Use the `AS` comparison and swap methods so those operations appear in the
visualization and counters.

Methods that accept items take either **zero-based array indexes** or item objects
returned by `AS.get(index)`. A number refers to a position, not the value stored
there. For example, `AS.lt(0, 1)` compares the values of the first two items.
An item object keeps referring to the same item even after it moves during a swap.

## Example

Paste this insertion sort into the editor to try it. It compares neighboring
items, records both for playback, and swaps them until they are in order.

```js
for (let i = 1; i < AS.length(); i++) {
  let j = i;
  while (j > 0 && AS.lt(j, j - 1)) {
    AS.play(j, j - 1);
    AS.swap(j, j - 1);
    j--;
  }
}
```

## Reference

| Method                              | Description                                                                                                                                                                                      | Marker Color | Marker Level |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ------------ |
| **AS.length()**                     | Returns the number of items in the array.                                                                                                                                                        | N/A          | N/A          |
| **AS.size()**                       | Alias for AS.length().                                                                                                                                                                           | N/A          | N/A          |
| **AS.get(index)**                   | Returns a copy of the item at the given index. Pass it to other AS methods to reference that item. Changing the copy does not change the array.                                                  | N/A          | N/A          |
| **AS.play(item1, ..., itemN)**      | Records the given items to sound during playback. Accepts indexes or item objects returned by AS.get().                                                                                          | N/A          | N/A          |
| **AS.mark(item1, ..., itemN)**      | Will mark the given items. Items can be indexes or array items returned via AS.get() calls.                                                                                                      | White        | 1            |
| **AS.lt(itemOne, itemTwo)**         | Returns true if itemOne is less than itemTwo. Item can be an array index, or an array item (returned via an AS.get() call).                                                                      | Amber        | 2            |
| **AS.lte(itemOne, itemTwo)**        | Returns true if itemOne is less than or equal to itemTwo. Item can be an array index, or an array item (returned via an AS.get() call).                                                          | Amber        | 2            |
| **AS.gt(itemOne, itemTwo)**         | Returns true if itemOne is greater than itemTwo. Item can be an array index, or an array item (returned via an AS.get() call).                                                                   | Amber        | 2            |
| **AS.gte(itemOne, itemTwo)**        | Returns true if itemOne is greater than or equal to itemTwo. Item can be an array index, or an array item (returned via an AS.get() call).                                                       | Amber        | 2            |
| **AS.eq(itemOne, itemTwo)**         | Returns true if itemOne is equal to itemTwo. Item can be an array index, or an array item (returned via an AS.get() call).                                                                       | Amber        | 2            |
| **AS.neq(itemOne, itemTwo)**        | Returns true if itemOne is not equal to itemTwo. Item can be an array index, or an array item (returned via an AS.get() call).                                                                   | Amber        | 2            |
| **AS.swap(itemOne, itemTwo)**       | Will swap the positions of the two items.                                                                                                                                                        | Yellow       | 3            |
| N/A                                 | Items that were swapped in the last iteration, will show up below the "swapped" items. They appear as green circles, while items that are getting ready to be swapped show up as yellow circles. | Green        | 4            |
| **AS.highlight(item1, ..., itemN)** | Will highlight the given items. Highlighted items stay highlighted until the next AS.highlight() call, or until AS.clearHighlight() is called.                                                   | Purple       | 5            |
| **AS.clearHighlight()**             | Clears the currently highlighted items.                                                                                                                                                          | N/A          | N/A          |
