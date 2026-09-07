import { rgb } from "d3-color";
import { line as createLine } from "d3-shape";

export default function flat(settings) {
  const flat = {};
  // settings
  let data = [];
  let svg;
  let flattenedLines = [];
  let numFlattenedLines = 0;
  let frameLength = 0;
  const dataColor = "steelblue";
  const playColor = "#c80000";
  let lines;

  const _init = function (settings) {
    data = settings.data;
    svg = settings.svg;
    const $svg = settings.$svg;
    // setup lengths
    if (data.length) {
      numFlattenedLines = data[0].arr.length;
      frameLength = data.length;
      initFlattenedLines();
    } else {
      numFlattenedLines = 0;
      frameLength = 0;
      flattenedLines = [];
    }
    $svg.empty();
    svg.attr("viewBox", "0 0 0 0");
    svg.attr("preserveAspectRatio", "none");
    svg.attr("viewBox", "0 0 " + (frameLength - 1) + " " + numFlattenedLines);
    $svg.empty();
    drawFlattenedLines();
  };

  const initFlattenedLines = function () {
    const ids = [];

    flattenedLines = [];
    if (data.length) {
      const lastFrameArray = data[data.length - 1].arr;
      const half = Math.floor(numFlattenedLines / 2);
      // build base arrays
      for (let i = 0; i < numFlattenedLines; i++) {
        const id = lastFrameArray[i].id;
        ids.push(id);
        flattenedLines[i] = {
          id: id,
          dataColor: rgb(dataColor)
            .darker((i - half) / half)
            .toString(),
          playColor: rgb(playColor)
            .darker((i - half) / half)
            .toString(),
          playIndexes: [],
          lineData: [],
        };
      }
      // build line data
      for (let i = 0; i < frameLength; i++) {
        const currentArray = data[i].arr;
        for (let j = 0; j < currentArray.length; j++) {
          const item = currentArray[j];
          const index = ids.indexOf(item.id);
          flattenedLines[index].lineData.push({
            x: i,
            y: j + 0.5,
          });
          if (item.play) {
            flattenedLines[index].playIndexes.push(i);
          }
        }
      }
      // darker items should be drawn first
      flattenedLines.reverse();
    }
  };

  const drawFlattenedLines = function (index) {
    // create our line function
    const line = createLine()
      .x(function (d) {
        return d.x;
      })
      .y(function (d) {
        return d.y;
      });

    // select our lines
    lines = svg.selectAll(".line").data(flattenedLines).join("path");

    // update
    lines
      .attr("class", "line")
      .attr("data-id", function (d) {
        return d.id;
      })
      .attr("stroke", function (d) {
        return d.playIndexes.indexOf(index) >= 0 ? d.playColor : d.dataColor;
      })
      .attr("fill", "none")
      .attr("stroke-width", 0.5)
      .attr("d", function (d) {
        return line(d.lineData);
      });
  };

  flat.draw = function (index) {
    lines.attr("stroke", function (d) {
      return d.playIndexes.indexOf(index) >= 0 ? d.playColor : d.dataColor;
    });

    if (data.length > 0) {
      return data[index];
    }
  };

  _init(settings);
  return flat;
}
