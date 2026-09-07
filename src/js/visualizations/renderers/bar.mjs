export default function bar(settings) {
  let hoverIndex = -1;
  let hoverValue = -1;
  let clickIndex = -1;
  let clickValue = -1;
  let isClicking = false;
  const bar = {};
  // settings
  let data;
  let svg;
  let hasMarkers;
  let onClick;
  // Keep pointer state when the base editor updates data during a drag.
  bar.setData = (nextData) => {
    data = nextData;
  };

  const _init = function (settings) {
    data = settings.data;
    svg = settings.svg;
    svg.attr("preserveAspectRatio", null).attr("viewBox", null);
    hasMarkers = settings.hasMarkers;
    onClick = settings.onClick;
  };

  const drawMarkers = function (info, level, property) {
    if (hasMarkers) {
      // select some items
      const circle = svg
        .selectAll("circle." + property)
        .data(info.arr)
        .join("circle");
      const len = info.arr.length;

      // determine our radius and our y position
      const radius = 100 / (Math.max(len, 20) * 4);
      const cy = 100 - level * 10 + "%";

      // update
      circle
        .attr("cy", cy)
        .attr("cx", function (d, i) {
          const width = 100 / (len * 2);
          return (i / len) * 100 + width + "%";
        })
        .attr("r", function () {
          return radius + "%";
        })
        .attr("class", property)
        .attr("style", function (d) {
          return d[property] ? "" : "display:none";
        });
    }
  };

  const getIndexAndValueFromMouse = function (e) {
    let n = 0;
    let min = 0;

    // set relative positions
    const bounds = svg.node().getBoundingClientRect();
    const relX = e.clientX - bounds.left;
    const relY = e.clientY - bounds.top;
    const w = bounds.width;
    const h = bounds.height;

    // get datasize
    if (data.length > 0) {
      n = data[0].arr.length;
      min = n - 1;
    }

    // set index/value
    let index = Math.floor((relX / w) * n);
    let value = Math.floor((relY / h) * n);

    // account for div/0
    index = isFinite(index) ? index : 0;
    value = isFinite(value) ? value : 0;

    // handle offset errors
    index = Math.max(0, Math.min(min, index));
    value = Math.max(0, Math.min(min, value));
    value = min - value;

    return {
      index: index,
      value: value,
    };
  };

  bar.onMouseMove = function (e) {
    const result = getIndexAndValueFromMouse(e);

    if (hoverIndex !== result.index) {
      hoverIndex = result.index;
      svg.selectAll("rect").attr("opacity", (_d, i) => (i === hoverIndex ? 0.5 : 1));
    }
    hoverValue = result.value;
    if (isClicking && (hoverIndex !== clickIndex || hoverValue !== clickValue)) {
      clickIndex = hoverIndex;
      clickValue = hoverValue;
      onClick(clickIndex, clickValue);
    }
  };

  bar.onMouseOut = function () {
    hoverIndex = -1;
    svg.selectAll("rect").attr("opacity", 1);
  };

  bar.onMouseDown = function (e) {
    const result = getIndexAndValueFromMouse(e);
    e.preventDefault();
    isClicking = true;
    clickIndex = result.index;
    clickValue = result.value;
    onClick(clickIndex, clickValue);
  };

  bar.onMouseUp = function () {
    isClicking = false;
    clickIndex = -1;
    clickValue = -1;
  };

  bar.draw = function (index) {
    let info;

    // draw it
    if (data.length > 0) {
      info = data[index];

      // select some items
      const rect = svg.selectAll("rect").data(info.arr).join("rect");
      const len = info.arr.length;

      // update
      rect
        .attr("width", function () {
          return 100 / len + "%";
        })
        .attr("height", function (d) {
          return (100 / len) * (d.value + 1) + "%";
        })
        .attr("x", function (d, i) {
          return (i / len) * 100 + "%";
        })
        .attr("y", function (d) {
          return 100 - (100 / len) * (d.value + 1) + "%";
        })
        .attr("class", function (d) {
          return d.play ? "play" : "";
        });

      // draw our markers
      drawMarkers(info, 1, "highlight");
      drawMarkers(info, 2, "justSwapped");
      drawMarkers(info, 3, "swap");
      drawMarkers(info, 4, "compare");
      drawMarkers(info, 5, "mark");
      //drawMarkers(info, 5, 'play');
    }

    return info;
  };

  _init(settings);
  return bar;
}
