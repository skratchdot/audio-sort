import type {
  Marker,
  SortEngine,
  SortFrame,
  SortInput,
  SortItem,
  SortReference,
} from "./sort-types.ts";

// Each instance owns its arrays, frames, markers, and counters.
export function createSortEngine(): SortEngine {
  // internal arrays
  let _array: SortItem[] = [];
  let _frames: SortFrame[] = [];
  let _token: unknown = "";
  // state
  const recent: Record<Marker, SortItem["id"][]> = {
    play: [],
    mark: [],
    swap: [],
    compare: [],
    highlight: [],
  };
  // counters
  let compareCount = 0;
  let swapCount = 0;

  const copyObject = function (obj: SortInput): SortItem {
    const isObject = typeof obj === "object";
    const rand = parseInt(String(Math.random() * 10000000), 10);

    const result = {
      id: isObject ? obj.id : rand + "_" + obj,
      value: isObject ? obj.value : obj,
      play: isObject ? obj.play : false,
      mark: isObject ? obj.mark : false,
      swap: isObject ? obj.swap : false,
      justSwapped: isObject ? obj.justSwapped : false,
      compare: isObject ? obj.compare : false,
      highlight: isObject ? obj.highlight : false,
    };
    return result;
  };

  const frameCheck = function (type: Marker) {
    if (_frames.length === 0 || (recent.hasOwnProperty(type) && recent[type].length)) {
      addFrame();
    }
  };

  const addFrame = function () {
    const copy = [];

    for (let i = 0; i < _array.length; i++) {
      const obj = copyObject(_array[i]!);
      // justSwapped
      if (recent.swap.indexOf(obj.id) >= 0) {
        obj.justSwapped = true;
      }
      // highlight
      if (recent.highlight.indexOf(obj.id) >= 0) {
        obj.highlight = true;
      }
      copy.push(obj);
    }
    _frames.push({
      arr: copy,
      compareCount: compareCount,
      swapCount: swapCount,
    });
    recent.play = [];
    recent.mark = [];
    recent.swap = [];
    recent.compare = [];
  };

  const getIndexFromSortObject = function (obj: SortItem) {
    for (let i = 0; i < _array.length; i++) {
      if (_array[i]!.id === obj.id) {
        return i;
      }
    }
    return -1;
  };

  const getSortObjects = function (inputArray: readonly SortReference[]) {
    const ret = [];
    for (let i = 0; i < inputArray.length; i++) {
      let current = inputArray[i]!;
      if (typeof current === "number") {
        current = AS.get(current);
      }
      ret.push(current);
    }
    return ret;
  };

  const compare = function (one: SortReference, two: SortReference): [SortItem, SortItem] {
    const sortObjects = mark("compare", [one, two]);
    compareCount++;
    _frames[_frames.length - 1]!.compareCount = compareCount;
    return [sortObjects[0]!, sortObjects[1]!];
  };

  const mark = function (type: Marker, inputArray: readonly SortReference[]) {
    const sortObjects = getSortObjects(inputArray);
    frameCheck(type);
    const frameIndex = _frames.length - 1;
    const frame = _frames[frameIndex]!; // frameCheck always creates a frame.
    const len = frame.arr.length;
    for (let i = 0; i < sortObjects.length; i++) {
      const index = getIndexFromSortObject(sortObjects[i]!);
      if (index >= 0 && index < len) {
        frame.arr[index]![type] = true;
        if (recent.hasOwnProperty(type)) {
          recent[type].push(frame.arr[index]!.id);
        }
      }
    }
    return sortObjects;
  };

  const length = () => _array.length;
  const AS: SortEngine = {
    getFrames() {
      return _frames;
    },

    init(inputArray, token) {
      _array = [];
      _frames = [];
      _token = token;
      compareCount = 0;
      swapCount = 0;
      // Reusing an instance must not carry marker IDs into the next data set.
      for (const type of Object.keys(recent) as Marker[]) recent[type] = [];
      for (let i = 0; i < inputArray.length; i++) {
        _array.push(copyObject(inputArray[i]!));
      }
    },

    end(token) {
      if (_token === token) {
        // handle empty frames
        if (_frames.length === 0) {
          addFrame();
        }
        // Preserve legacy playback: the old ID-to-array comparison always
        // appended a final frame for nonempty inputs, even without changes.
        if (_array.length > 0) addFrame();
        return _frames;
      } else {
        // someone besides the worker was trying to call AS.end();
        return [];
      }
    },

    length,
    size: length,

    lt(one, two) {
      const sortObjects = compare(one, two);
      return sortObjects[0].value < sortObjects[1].value;
    },

    lte(one, two) {
      const sortObjects = compare(one, two);
      return sortObjects[0].value <= sortObjects[1].value;
    },

    gt(one, two) {
      const sortObjects = compare(one, two);
      return sortObjects[0].value > sortObjects[1].value;
    },

    gte(one, two) {
      const sortObjects = compare(one, two);
      return sortObjects[0].value >= sortObjects[1].value;
    },

    eq(one, two) {
      const sortObjects = compare(one, two);
      return sortObjects[0].value === sortObjects[1].value;
    },

    neq(one, two) {
      const sortObjects = compare(one, two);
      return sortObjects[0].value !== sortObjects[1].value;
    },

    play(...items) {
      mark("play", items);
    },

    mark(...items) {
      mark("mark", items);
    },

    clearHighlight() {
      recent.highlight = [];
    },

    highlight(...items) {
      AS.clearHighlight();
      mark("highlight", items);
    },

    get(index) {
      return copyObject(_array[index]!);
    },

    swap(one, two) {
      // mark as swapped
      const sortObjects = mark("swap", [one, two]);
      const indexOne = getIndexFromSortObject(sortObjects[0]!);
      const indexTwo = getIndexFromSortObject(sortObjects[1]!);
      // perform swap
      const tempOne = _array[indexOne];
      const tempTwo = _array[indexTwo];
      _array[indexOne] = tempTwo!;
      _array[indexTwo] = tempOne!;
      swapCount++;
      _frames[_frames.length - 1]!.swapCount = swapCount;
    },
  };

  return AS;
}
