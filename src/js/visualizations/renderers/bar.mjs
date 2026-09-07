import { $ } from "../../vendor.mjs";

export default function bar(settings) {
  let hoverIndex = -1;
  let hoverValue = -1;
  let clickIndex = -1;
  let clickValue = -1;
  let isClicking = false;
  const bar = {};
  // settings
  let data;
  let $svg;
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
    $svg = settings.$svg;
    $svg.removeAttr("preserveAspectRatio");
    $svg.removeAttr("viewBox");
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
    const $this = $(e.currentTarget);
    const $parent = $this.parent();

    let n = 0;
    let min = 0;

    // set relative positions
    const parentOffset = $parent.offset();
    let relX = e.pageX - parentOffset.left;
    let relY = e.pageY - parentOffset.top;

    // account for border/margin/padding
    relX = relX - parseInt($parent.css("border-left-width"), 10);
    relX = relX - parseInt($parent.css("margin-left"), 10);
    relX = relX - parseInt($parent.css("padding-left"), 10);
    relY = relY - parseInt($parent.css("border-top-width"), 10);
    relY = relY - parseInt($parent.css("margin-top"), 10);
    relY = relY - parseInt($parent.css("padding-top"), 10);

    // store widths and heights
    const w = $this.parent().width();
    const h = $this.parent().height();

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
    index = Math.min(min, index);
    value = Math.min(min, value);
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
      const $rect = $svg.find("rect");
      $rect.attr("opacity", 1);
      $rect.eq(hoverIndex).attr("opacity", 0.5);
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
    $svg.find("rect").attr("opacity", 1);
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
