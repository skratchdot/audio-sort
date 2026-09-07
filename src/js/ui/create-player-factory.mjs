import { $, timbre } from "../vendor.mjs";
import { select } from "d3-selection";
import { createMidiBytes } from "../midi/create-midi-bytes.mjs";
import { visualizations } from "../visualizations/visualization-registry.mjs";
import { playbackPreferencesAtom, toggleLoopAtom } from "../state/playback-preferences.ts";

export function createPlayerFactory(settings, Helper, settingsStore) {
  return function createPlayer(containerSelector, options) {
    const player = {};
    // Config Values
    const canvasBackground = "rgba(255, 255, 255, 0)";
    // State Variables
    const isLooping = () => settingsStore.get(playbackPreferencesAtom).loop[options.id];
    let isPlaying;
    let isReverse;
    let intervalIndex;
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
    let interval;
    let env;
    let waveGenerator;
    let visualization;
    let selectedVisualization = "bar";

    // Event Listeners
    let onPlayerButtonClickCallback;

    const _init = function () {
      options = options || {};

      // setup some more variables
      isPlaying = options.isPlaying || false;
      isReverse = options.isReverse || false;
      hasMarkers = options.hasMarkers || false;
      const allowHover = options.allowHover || false;
      const allowClick = options.allowClick || false;
      onClick = options.onClick;
      if (typeof onClick !== "function") {
        onClick = $.noop;
      }
      intervalIndex = 0;
      const $container = $(containerSelector || null);
      $compareCurrent = $container.find(".compare-current");
      $compareMax = $container.find(".compare-max");
      $swapCurrent = $container.find(".swap-current");
      $swapMax = $container.find(".swap-max");
      $positionCurrent = $container.find(".position-current");
      $positionMax = $container.find(".position-max");
      $svg = $container.find("svg");
      svg = select("#" + $svg.attr("id"));
      onPlayerButtonClickCallback = options.onPlayerButtonClickCallback || null;

      // setup audio envelopes/generators and interval
      player.refreshWaveGenerator();
      interval = timbre("interval", { interval: settings.getTempoString() }, intervalCallback);

      // listen for player button clicks
      $container.find(".player-buttons").on("click", ".btn", onPlayerButtonClick);

      // handle hovers
      if (allowHover) {
        $svg.on("mousemove", function (e) {
          if (visualization.onMouseMove) {
            visualization.onMouseMove(e);
          }
        });
        $svg.on("mouseout", function (e) {
          if (visualization.onMouseOut) {
            visualization.onMouseOut(e);
          }
        });
      }

      // handle clicks
      if (allowClick) {
        $svg.on("mousedown", function (e) {
          if (visualization.onMouseDown) {
            visualization.onMouseDown(e);
          }
        });
        $("body").on("mouseup", function (e) {
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
      ensureIntervalIndex();

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
        $slider.slider("setValue", intervalIndex);
      }
    };

    const ensureIntervalIndex = function () {
      // ensure current index is safe
      intervalIndex = Math.min(intervalIndex, data.length - 1);
      intervalIndex = Math.max(intervalIndex, 0);
    };

    const intervalCallback = function () {
      if (isPlaying) {
        ensureIntervalIndex();
        refreshSliderPosition();

        // play if possible
        if (data.length > 0) {
          const info = data[intervalIndex];
          const selectedAudioType = settings.getSelected("audioType");
          for (let i = 0; i < info.arr.length; i++) {
            const currentItem = info.arr[i];
            if (currentItem.play) {
              const midi = Helper.getMidiNumber(currentItem.value);
              if (midi >= 0 && midi < 128) {
                if (selectedAudioType === "waveform") {
                  waveGenerator.noteOn(midi, 64);
                } else if (selectedAudioType === "soundfont") {
                  timbre.soundfont.play(midi, false, {
                    mul: settings.getSelected("volume") * 1.5,
                  });
                }
              }
            }
          }
          drawSvg();
        }

        // we can advance now
        intervalIndex = isReverse ? intervalIndex - 1 : intervalIndex + 1;

        // we can stop if we are not looping
        if (!isLooping() && (intervalIndex < 0 || intervalIndex >= data.length)) {
          player.stop();
        }

        // we need to loop
        if (isLooping() && intervalIndex < 0) {
          intervalIndex = data.length - 1;
        } else if (isLooping() && intervalIndex >= data.length) {
          intervalIndex = 0;
        }
      } else {
        player.stop();
      }
    };

    const onPlayerButtonClick = function () {
      const $item = $(this);
      const action = $item.data("action");
      timbre.fn._audioContext.resume().then(function () {
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
      intervalIndex = parseInt(e.value, 10);
      ensureIntervalIndex();
      drawSvg();
    };

    player.setData = function (d) {
      const selector = containerSelector + " .position-container";
      data = d;
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
      interval.set({ interval: tempo });
    };

    player.setVolume = function (volume) {
      waveGenerator.set({ mul: volume });
    };

    player.play = function (reverse) {
      interval.stop();
      isPlaying = true;
      if (reverse === true) {
        isReverse = true;
        if (intervalIndex <= 0) {
          intervalIndex = data.length - 1;
        }
      } else {
        isReverse = false;
        if (intervalIndex >= data.length - 1) {
          intervalIndex = 0;
        }
      }
      isReverse = reverse === true ? true : false;
      if (settings.getSelected("audioType") === "waveform") {
        waveGenerator.play();
      }
      interval.start();
    };

    player.stop = function () {
      isPlaying = false;
      interval.stop();
    };

    player.isPlaying = function () {
      return isPlaying;
    };

    player.goToFirst = function () {
      intervalIndex = 0;
      ensureIntervalIndex();
      drawSvg();
    };

    player.goToLast = function () {
      intervalIndex = data.length - 1;
      ensureIntervalIndex();
      drawSvg();
    };

    player.getMidiBytes = function (tempo, channel, instrument) {
      return createMidiBytes(data, Helper.getMidiNumber, tempo, channel, instrument);
    };

    player.refreshWaveGenerator = function () {
      const waveInfo = settings.getSelectedWaveformInfo();
      $.each([env, waveGenerator], function (index, obj) {
        $.each(["pause", "removeAllListeners"], function (index, key) {
          if (obj && typeof obj[key] === "function") {
            obj[key]();
          }
        });
      });
      env = timbre("adshr", {
        a: waveInfo.a,
        d: waveInfo.d,
        s: waveInfo.s,
        h: waveInfo.h,
        r: waveInfo.r,
      });
      waveGenerator = timbre(waveInfo.gen, {
        env: env,
        mul: settings.getSelected("volume") * waveInfo.mul,
        poly: waveInfo.poly || 10,
      }).on("ended", function () {
        if (!isPlaying) {
          this.pause();
        }
      });
      if (waveInfo.gen === "OscGen") {
        waveGenerator.set("osc", timbre(settings.getSelected("waveform")));
      }
      if (isPlaying && settings.getSelected("audioType") === "waveform") {
        waveGenerator.play();
      }
    };

    player.drawEnvelopeCanvas = function () {
      const canvas = $("#waveform-adshr-canvas").get(0);
      // ADSHR
      clearCanvas(canvas);
      if (env && typeof env.plot === "function") {
        env.plot({
          target: canvas,
          background: canvasBackground,
        });
      }
    };

    player.drawWaveformCanvases = function () {
      const canvas = $("#waveform-canvas").get(0);
      // ADSHR
      player.drawEnvelopeCanvas();
      // Waveform
      clearCanvas(canvas);
      if (waveGenerator && waveGenerator.osc) {
        waveGenerator.osc.plot({
          target: canvas,
          background: canvasBackground,
        });
      }
    };

    // initialize player
    _init();

    return player;
  };
}
