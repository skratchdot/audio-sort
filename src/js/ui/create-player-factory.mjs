import { createTimbreAudio } from "../audio/create-timbre-audio.mjs";
import { createTransport } from "../audio/create-transport.ts";
import { $, timbre } from "../vendor.mjs";
import { drawStringPreview } from "./string-preview.ts";
import { select } from "d3-selection";
import { createMidiBytes } from "../midi/create-midi-bytes.mjs";
import { visualizations } from "../visualizations/visualization-registry.mjs";
import { playbackPreferencesAtom, toggleLoopAtom } from "../state/playback-preferences.ts";

let nextPlayerId = 0;

export function createPlayerFactory(settings, Helper, settingsStore, soundfont) {
  return function createPlayer(containerSelector, options) {
    const player = {};
    const eventNamespace = ".audioSortPlayer" + ++nextPlayerId;
    let destroyed = false;
    let $container;
    // Config Values
    const canvasBackground = "rgba(255, 255, 255, 0)";
    // State Variables
    const isLooping = () => settingsStore.get(playbackPreferencesAtom).loop[options.id];
    let transport;
    let hasMarkers;
    let onClick;
    // Cached jQuery items
    let $svg;
    let $slider;
    let $compareCurrent;
    let $compareMax;
    let $swapCurrent;
    let $swapMax;
    let $positionCurrent;
    let $positionMax;
    // Cached d3 items
    let svg;
    // Data
    let data;
    const audio = createTimbreAudio(
      timbre,
      settings,
      Helper.getMidiNumber,
      () => transport?.isPlaying() || false,
      soundfont,
    );
    let visualization;
    let selectedVisualization = "bar";

    // Event Listeners
    let onPlayerButtonClickCallback;

    const _init = function () {
      options = options || {};

      // setup some more variables
      hasMarkers = options.hasMarkers || false;
      const allowHover = options.allowHover || false;
      const allowClick = options.allowClick || false;
      onClick = options.onClick;
      if (typeof onClick !== "function") {
        onClick = $.noop;
      }
      $container = $(containerSelector || null);
      $compareCurrent = $container.find(".compare-current");
      $compareMax = $container.find(".compare-max");
      $swapCurrent = $container.find(".swap-current");
      $swapMax = $container.find(".swap-max");
      $positionCurrent = $container.find(".position-current");
      $positionMax = $container.find(".position-max");
      $svg = $container.find(`#${options.id}-chart svg`);
      svg = select("#" + $svg.attr("id"));
      onPlayerButtonClickCallback = options.onPlayerButtonClickCallback || null;

      // setup audio envelopes/generators and interval
      player.refreshWaveGenerator();
      transport = createTransport({
        createClock: audio.createClock,
        isLooping,
        onFrame: playFrame,
        onStart: audio.start,
        onSuspend: audio.suspend,
      });

      // listen for player button clicks
      $container.find(".player-buttons").on("click" + eventNamespace, ".btn", onPlayerButtonClick);

      // handle hovers
      if (allowHover) {
        $svg.on("mousemove" + eventNamespace, function (e) {
          if (visualization.onMouseMove) {
            visualization.onMouseMove(e);
          }
        });
        $svg.on("mouseout" + eventNamespace, function (e) {
          if (visualization.onMouseOut) {
            visualization.onMouseOut(e);
          }
        });
      }

      // handle clicks
      if (allowClick) {
        $svg.on("mousedown" + eventNamespace, function (e) {
          if (visualization.onMouseDown) {
            visualization.onMouseDown(e);
          }
        });
        $("body").on("mouseup" + eventNamespace, function (e) {
          if (visualization.onMouseUp) {
            visualization.onMouseUp(e);
          }
        });
      }
    };

    const clearCanvas = function (canvas) {
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    };

    const drawSvg = function () {
      const len = data.length;
      const last = len - 1;

      // make sure we have a valid index
      const intervalIndex = transport.getPosition();

      // draw our visualization
      const info = visualization.draw(intervalIndex);

      if (info) {
        // compare: current
        if ($compareCurrent.length) {
          $compareCurrent.text(info.compareCount);
        }
        // compare: max
        if ($compareMax.length) {
          $compareMax.text(last > 0 ? data[last].compareCount : 0);
        }
        // swap: current
        if ($swapCurrent.length) {
          $swapCurrent.text(info.swapCount);
        }
        // swap: max
        if ($swapMax.length) {
          $swapMax.text(last > 0 ? data[last].swapCount : 0);
        }
        // position: current
        if ($positionCurrent.length) {
          $positionCurrent.text(intervalIndex + 1);
        }
        // position: max
        if ($positionMax.length) {
          $positionMax.text(len);
        }
      }
    };

    const refreshSliderPosition = function () {
      if ($slider.length) {
        $slider.slider("setValue", transport.getPosition());
      }
    };

    const playFrame = function (index) {
      refreshSliderPosition();
      audio.playFrame(data[index]);
      drawSvg();
    };

    const onPlayerButtonClick = function () {
      const $item = $(this);
      const action = $item.data("action");
      transport.whenReady(audio.resume(), function () {
        if (action === "stop") {
          player.stop();
        } else if (action === "play") {
          player.play();
        } else if (action === "reverse") {
          player.play(true);
        } else if (action === "goToFirst") {
          player.goToFirst();
        } else if (action === "goToLast") {
          player.goToLast();
        } else if (action === "loop") {
          settingsStore.set(toggleLoopAtom, options.id);
        }
        refreshSliderPosition();
        if (typeof onPlayerButtonClickCallback === "function") {
          onPlayerButtonClickCallback({
            item: $item,
            action: action,
          });
        }
      });
    };

    const onSliderPositionChange = function (e) {
      transport.seek(Number(e.value));
      drawSvg();
    };

    player.setData = function (d) {
      if (destroyed) return;
      const selector = containerSelector + " .position-container";
      data = d;
      transport.setLength(data.length);
      $slider = Helper.createSlider(
        selector,
        {
          value: 0,
          min: 0,
          max: data.length - 1,
          step: 1,
        },
        onSliderPositionChange,
      );
      player.setVisualization(selectedVisualization, true);
    };

    player.setVisualization = function (visualizationName, forceInit) {
      let shouldInit = false;
      if (
        visualizations.hasOwnProperty(visualizationName) &&
        selectedVisualization !== visualizationName
      ) {
        selectedVisualization = visualizationName;
        shouldInit = true;
      }
      if (shouldInit) {
        $svg.empty();
      }
      if (!shouldInit && forceInit && visualization?.setData) {
        visualization.setData(data);
        drawSvg();
        return;
      }
      if (shouldInit || forceInit) {
        visualization = visualizations[selectedVisualization]({
          data: data,
          svg: svg,
          $svg: $svg,
          hasMarkers: hasMarkers,
          onClick: onClick,
        });
        drawSvg();
      }
    };

    player.setTempo = function (tempo) {
      transport.setTempo(tempo);
    };

    player.setVolume = function (volume) {
      audio.setVolume(volume);
    };

    player.play = (reverse) => transport?.play(reverse === true);
    player.stop = () => transport?.stop();
    player.suspend = () => transport?.suspend();

    player.destroy = function () {
      if (destroyed) return;
      destroyed = true;
      transport?.dispose();
      audio.dispose();
      $container?.find(".player-buttons").off(eventNamespace);
      $svg?.off(eventNamespace).empty();
      $("body").off(eventNamespace);
      Helper.destroySlider($slider);
      data = [];
      visualization = null;
    };

    player.isPlaying = function () {
      return transport?.isPlaying() || false;
    };

    player.goToFirst = function () {
      transport.seek(0);
      drawSvg();
    };

    player.goToLast = function () {
      transport.seek(data.length - 1);
      drawSvg();
    };

    player.getMidiBytes = function (tempo, channel, instrument) {
      return createMidiBytes(data, Helper.getMidiNumber, tempo, channel, instrument);
    };

    player.refreshWaveGenerator = audio.refresh;

    player.drawWaveformCanvases = function () {
      const canvas = $("#waveform-canvas").get(0);
      // Waveform
      clearCanvas(canvas);
      const isString = settings.getSelected("waveform") === "string";
      const label = isString
        ? "String: illustrative decaying plucked tone (not a live audio trace)"
        : `${settings.getSelected("waveform")} oscillator waveform`;
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", label);
      canvas.title = label;
      if (isString) {
        drawStringPreview(canvas);
        return;
      }
      audio.plot({ target: canvas, background: canvasBackground });
    };

    // initialize player
    try {
      _init();
    } catch (error) {
      player.destroy();
      throw error;
    }

    return player;
  };
}
