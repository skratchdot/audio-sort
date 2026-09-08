import { AppLink as Link } from "@/components/text-link";

export function Api() {
  return (
    <section className="mx-auto w-[calc(100%-2rem)] max-w-7xl">
      <h1 className="my-4 text-3xl font-bold">Algorithm API</h1>

      <p className="lead">
        You can add/edit your own javascript algorithm by clicking the "Add Algorithm" button at the
        bottom-left side of the <Link to="/">main page</Link>.
      </p>

      <p className="lead">
        When writing your algorithm, you have access to the <strong>AS</strong> (Audio Sort) global
        object. The methods on that object are described in the table below. The <strong>AS</strong>{" "}
        object gives you access to the current array, allows you to set visualization markers, and
        lets you "play" certain array elements.
      </p>

      <div
        className="max-w-full overflow-x-auto"
        role="region"
        aria-label="Algorithm API reference"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th style={{ width: 200 }}>Method</th>
              <th>Description</th>
              <th>Marker Color</th>
              <th>Marker Level</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>AS.length()</th>
              <td>Gets the length of the array.</td>
              <td>N/A</td>
              <td>N/A</td>
            </tr>
            <tr>
              <th>AS.size()</th>
              <td>Gets the length of the array.</td>
              <td>N/A</td>
              <td>N/A</td>
            </tr>
            <tr>
              <th>AS.get(index)</th>
              <td>
                Gets the sortItem object with the given array index. This sortItem can be passed to
                other AS method calls.
              </td>
              <td>N/A</td>
              <td>N/A</td>
            </tr>
            <tr>
              <th>AS.play(item1, ..., itemN)</th>
              <td>
                Will play the given items. Items can be indexes or array items returned via AS.get()
                calls.
              </td>
              <td>N/A</td>
              <td>N/A</td>
            </tr>
            <tr>
              <th>AS.mark(item1, ..., itemN)</th>
              <td>
                Will mark the given items. Items can be indexes or array items returned via AS.get()
                calls.
              </td>
              <td>
                <div className="size-10 border-2 border-neutral-700 bg-neutral-50">&nbsp;</div>
              </td>
              <td>1</td>
            </tr>
            <tr>
              <th>AS.lt(itemOne, itemTwo)</th>
              <td>
                Returns true if itemOne is less than itemTwo. Item can be an array index, or an
                array item (returned via an AS.get() call).
              </td>
              <td>
                <div className="size-10 border-2 border-neutral-700 bg-amber-400">&nbsp;</div>
              </td>
              <td>2</td>
            </tr>
            <tr>
              <th>AS.lte(itemOne, itemTwo)</th>
              <td>
                Returns true if itemOne is less than or equal to itemTwo. Item can be an array
                index, or an array item (returned via an AS.get() call).
              </td>
              <td>
                <div className="size-10 border-2 border-neutral-700 bg-amber-400">&nbsp;</div>
              </td>
              <td>2</td>
            </tr>
            <tr>
              <th>AS.gt(itemOne, itemTwo)</th>
              <td>
                Returns true if itemOne is greater than itemTwo. Item can be an array index, or an
                array item (returned via an AS.get() call).
              </td>
              <td>
                <div className="size-10 border-2 border-neutral-700 bg-amber-400">&nbsp;</div>
              </td>
              <td>2</td>
            </tr>
            <tr>
              <th>AS.gte(itemOne, itemTwo)</th>
              <td>
                Returns true if itemOne is greater than or equal to itemTwo. Item can be an array
                index, or an array item (returned via an AS.get() call).
              </td>
              <td>
                <div className="size-10 border-2 border-neutral-700 bg-amber-400">&nbsp;</div>
              </td>
              <td>2</td>
            </tr>
            <tr>
              <th>AS.eq(itemOne, itemTwo)</th>
              <td>
                Returns true if itemOne is equal to itemTwo. Item can be an array index, or an array
                item (returned via an AS.get() call).
              </td>
              <td>
                <div className="size-10 border-2 border-neutral-700 bg-amber-400">&nbsp;</div>
              </td>
              <td>2</td>
            </tr>
            <tr>
              <th>AS.neq(itemOne, itemTwo)</th>
              <td>
                Returns true if itemOne is not equal to itemTwo. Item can be an array index, or an
                array item (returned via an AS.get() call).
              </td>
              <td>
                <div className="size-10 border-2 border-neutral-700 bg-amber-400">&nbsp;</div>
              </td>
              <td>2</td>
            </tr>
            <tr>
              <th>AS.swap(itemOne, itemTwo)</th>
              <td>Will swap the positions of the two items.</td>
              <td>
                <div className="size-10 border-2 border-neutral-700 bg-yellow-300">&nbsp;</div>
              </td>
              <td>3</td>
            </tr>
            <tr>
              <th>N/A</th>
              <td>
                Items that were swapped in the last iteration, will show up below the "swapped"
                items. They appear as green circles, while items that are getting ready to be
                swapped show up as yellow circles.
              </td>
              <td>
                <div className="size-10 border-2 border-neutral-700 bg-green-500">&nbsp;</div>
              </td>
              <td>4</td>
            </tr>
            <tr>
              <th>AS.highlight(item1, ..., itemN)</th>
              <td>
                Will highlight the given items. Highlighted items stay highlighted until the next
                AS.highlight() call, or until AS.clearHighlight() is called.
              </td>
              <td>
                <div className="size-10 border-2 border-neutral-700 bg-purple-600">&nbsp;</div>
              </td>
              <td>5</td>
            </tr>
            <tr>
              <th>AS.clearHighlight()</th>
              <td>Clears the currently highlighted items.</td>
              <td>N/A</td>
              <td>N/A</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
