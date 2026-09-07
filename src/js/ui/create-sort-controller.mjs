import { $, timbre } from "../vendor.mjs";
import { scales } from "../midi/scales.ts";
import { min, max } from "d3-array";
import { scaleLinear } from "d3-scale";
import { saveAs } from "file-saver";
import { createHelpers } from "./create-helpers.mjs";
import { connectPlaybackSettings } from "./connect-playback-settings.ts";
import { connectAudioSettings } from "./connect-audio-settings.ts";
import { connectSortSettings } from "./connect-sort-settings.ts";
import { createPlayerFactory } from "./create-player-factory.mjs";
import { MidiExport } from "../midi/midi-export.mjs";
import { instruments } from "../midi/instruments.ts";
import { createStore } from "jotai/vanilla";
import { defaults, settingsAtom, updateSettingAtom } from "../state/settings.ts";
import { waveformDefaults, waveformsAtom, updateEnvelopeAtom } from "../state/waveforms.ts";
import { playbackPreferencesAtom, toggleAutoPlayAtom } from "../state/playback-preferences.ts";
import {
  algorithmCatalogAtom,
  editAlgorithmAtom,
  addAlgorithmAtom,
} from "../state/algorithm-overrides.ts";

let nextControllerId = 0;

export function createSortController(generators, settingsStore = createStore()) {
  const Sort = {};
  const eventNamespace = ".audioSortController" + ++nextControllerId;
  let initialized = false;
  let destroyed = false;
  let suspended = false;
  const Helper = createHelpers(Sort);
  const createPlayer = createPlayerFactory(Sort, Helper, settingsStore);
  let disconnectSettings = () => {};
  let volumeSlider;
  let tempoSlider;
  let centerNoteSlider;
  let dataSizeSlider;
  // Read the current atom value on demand; do not keep a second settings cache.
  const getSelected = () => settingsStore.get(settingsAtom);
  const setSelected = (key, value) => settingsStore.set(updateSettingAtom, { key, value });
  const getWaveform = () => settingsStore.get(waveformsAtom)[getSelected().waveform];
  const waveformSliders = {};
  // Audio players
  const players = {
    base: null,
    sort: null,
  };
  // Ace Editor
  let aceEditor;
  // AutoPlay
  let triggerAutoPlay = false;
  // Helper Variables
  const displayCache = {};
  let baseData = [];
  let maxData = [];
  // Prevent clicks from spawing too many web workers
  let clickTimer = null;
  const clickDelay = 250;
  // Web Workers
  let worker = null;
  let workerKey;
  let createWorker;
  const getAlgorithms = () => settingsStore.get(algorithmCatalogAtom);
  let createSortRequest;
  let runSortRequest;
  let getSource;
  let loadCodeEditor;
  let editorRequest = 0;
  let activeEditorModal = null;

  const buildSortOptions = function (selector) {
    const algorithms = getAlgorithms();
    if (algorithms) {
      const $container = $(selector);
      $container.empty();
      for (const sortKey in algorithms) {
        if (algorithms.hasOwnProperty(sortKey)) {
          const sortObject = algorithms[sortKey];
          const $li = $("<li></li>");
          const $a = $('<a href="javascript:void(0);"></a>');
          $a.attr("data-sort", sortKey);
          $a.text(sortObject.display);
          $li.append($a);
          $container.append($li);
        }
      }
    }
  };

  const populateWaveformButtons = function () {
    let html = "";
    $.each(waveformDefaults, function (waveformName) {
      html += $("<button />")
        .addClass("btn btn-mini" + (waveformName === getSelected().waveform ? " active" : ""))
        .attr("type", "button")
        .attr("data-waveform", waveformName)
        .text(waveformName)
        .wrap("<div />")
        .parent()
        .html();
    });
    $("#waveform .btn-group").html(html);
  };

  const onWaveformButtonClick = function () {
    const $this = $(this);
    setSelected("waveform", $this.attr("data-waveform"));
  };

  const getBaseDataAsPlayableObjects = function (playIndex) {
    const objectArray = [];
    // convert baseData to an array of drawable/playable objects
    for (let i = 0; i < baseData.length; i++) {
      objectArray.push({
        value: baseData[i],
        play: i === playIndex,
        mark: false,
        swap: false,
        justSwapped: false,
        compare: false,
        highlight: false,
      });
    }
    return objectArray;
  };

  const getBaseDataAsFrames = function () {
    const frameArray = [];

    // convert to "frame data"
    for (let i = 0; i < baseData.length; i++) {
      frameArray.push({
        arr: getBaseDataAsPlayableObjects(i),
        compareCount: 0,
        swapCount: 0,
      });
    }
    return frameArray;
  };

  const clickPlayButton = function () {
    $('#sort-player .btn[data-action="play"]').click();
  };

  const getNoteName = function (midiNumber) {
    const notes = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
    const len = notes.length;
    const octave = Math.floor(midiNumber / len) - 1;
    const idx = midiNumber % len;
    const note = notes[idx];
    return "(" + note.charAt(0) + octave + note.charAt(1) + ") " + midiNumber;
  };

  const updateDisplayCache = function (selector, value, fnFormat) {
    if (!displayCache.hasOwnProperty(selector)) {
      displayCache[selector] = $(selector);
    }
    if (typeof fnFormat === "function") {
      value = fnFormat(value);
    }
    displayCache[selector].text(value);
  };

  const onAudioTypeButtonClick = function () {
    setSelected("audioType", $(this).attr("data-audio-type"));
  };

  const onAudioTypeTabLinkClick = function () {
    $("#settings li[data-audio-type]:visible a").click();
  };

  const onSliderVolume = function (e) {
    setSelected("volume", e.value);
  };

  const onSliderTempo = function (e) {
    setSelected("tempo", e.value);
  };

  const onSliderCenterNote = function (e) {
    setSelected("centerNote", e.value);
  };

  const onSliderDataSize = function (e) {
    setSelected("dataSize", e.value);
  };

  const onSliderWaveform = function (e) {
    const $slider = $(e.target);
    const $container = $slider.parents("[data-adshr]:first");
    const adshr = $container.attr("data-adshr");
    settingsStore.set(updateEnvelopeAtom, {
      waveform: getSelected().waveform,
      key: adshr,
      value: e.value,
    });
  };

  const onAudioDataButton = function () {
    const action = $(this).data("action");
    if (generators.hasOwnProperty(action)) {
      generateData(true, action);
      doSort();
    }
  };

  const onSortOptionSelected = function () {
    const $item = $(this);
    if ($item.hasClass("disabled")) {
      return;
    }
    const id = $item.find("a").data("sort");
    if (id === getSelected().sort) {
      triggerAutoPlay = settingsStore.get(playbackPreferencesAtom).autoPlay;
      doSort();
    } else setSelected("sort", id);
  };

  const updateWaveformDisplays = function () {
    updateDisplayCache("#waveform-adshr-attack-display", getWaveform().a);
    updateDisplayCache("#waveform-adshr-decay-display", getWaveform().d);
    updateDisplayCache("#waveform-adshr-sustain-display", getWaveform().s);
    updateDisplayCache("#waveform-adshr-hold-display", getWaveform().h);
    updateDisplayCache("#waveform-adshr-release-display", getWaveform().r);
  };

  const setSliderWaveformFromSelected = function () {
    $.each(["a", "d", "s", "h", "r"], function (index, key) {
      waveformSliders[key].slider("setValue", getWaveform()[key]);
    });
    updateWaveformDisplays();
  };

  const getScale = function (domainMin, domainMax, rangeMin, rangeMax) {
    return scaleLinear().domain([domainMin, domainMax]).range([rangeMin, rangeMax]);
  };

  const generateData = function (regenerateMaxData, action) {
    if (regenerateMaxData) {
      if (generators.hasOwnProperty(action)) {
        baseData = generators[action](getSelected().dataSize);
        maxData = generators[action](defaults.dataSize.max);
        const slice = maxData.slice(0, getSelected().dataSize);
        const scale = getScale(0, baseData.length - 1, min(slice), max(slice));
        // we always want our current "baseData" when re-sizing
        for (let i = 0; i < baseData.length; i++) {
          maxData[i] = Math.round(scale(baseData[i]));
        }
      }
    } else {
      baseData = maxData.slice(0, getSelected().dataSize);
      const scale = getScale(min(baseData), max(baseData), 0, baseData.length - 1);
      // normalize data
      for (let i = 0; i < baseData.length; i++) {
        baseData[i] = Math.round(scale(maxData[i]));
      }
    }
    players.base.setData(getBaseDataAsFrames());
    preloadSoundfonts();
  };

  const addAceEditor = async function (container, modal, source = "") {
    if (destroyed || suspended) return;
    const request = ++editorRequest;
    activeEditorModal = modal;
    const $modal = $(modal);
    const $container = $(container);
    const $save = $modal.find(".btn-primary");
    $save.addClass("disabled").attr("aria-disabled", "true");
    if (aceEditor) {
      aceEditor.destroy();
      aceEditor.getSession().destroy();
      aceEditor = null;
    }
    $container.empty();
    $modal.find(".editor-status").remove();
    const $status = $('<p class="editor-status" role="status"></p>')
      .text("Loading editor…")
      .appendTo($modal.find(".modal-body"));
    try {
      const { createCodeEditor } = await loadCodeEditor();
      if (request !== editorRequest) return;
      const $editor = $('<div class="js-editor"></div>').appendTo($container);
      aceEditor = createCodeEditor($editor.get(0));
      aceEditor.setValue(source);
      aceEditor.clearSelection();
      $status.remove();
      $save.removeClass("disabled").attr("aria-disabled", "false");
    } catch {
      if (request !== editorRequest) return;
      $status.attr("role", "alert").text("The editor could not load. ");
      $('<button type="button" class="btn btn-small">Reload page</button>')
        .on("click" + eventNamespace, () => window.location.reload())
        .appendTo($status);
    }
  };

  const onMidiExportClick = function () {
    const $modal = $("#modal-midi-export");

    // setup a default file name
    $("#midi-export-name")
      .attr("placeholder", "AudioSort_" + new Date().getTime())
      .val("");

    // populate channels
    MidiExport.populateChannels("#midi-export-channel");

    // populate instruments
    MidiExport.populateInstruments("#midi-export-instrument");

    // store the source of our data so onMidiSave() can use it
    $("#midi-export-btn").attr("data-midi-export", $(this).data("midiExport"));

    // open the modal
    $modal.modal();
  };

  const onMidiSave = function () {
    const playerType = $("#midi-export-btn").attr("data-midi-export");
    const $filename = $("#midi-export-name");
    let filename = $.trim($filename.val());

    // use placeholder if a filename wasn't entered
    if (filename === "") {
      filename = $filename.attr("placeholder");
    }
    filename += ".mid";

    // save file
    if (players.hasOwnProperty(playerType)) {
      const byteNumbers = $.map(
        players[playerType]
          .getMidiBytes(
            getSelected().tempo,
            $("#midi-export-channel").val(),
            $("#midi-export-instrument").val(),
          )
          .split(""),
        function (item) {
          return item.charCodeAt(0);
        },
      );
      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: "audio/midi",
      });
      saveAs(blob, filename);
    }
  };

  const onSortModalClick = function () {
    const $modal = $("#modal-sort");
    const selectedSort = getAlgorithms()[getSelected().sort];

    $modal.find(".sort-name").text(selectedSort.display);
    $modal.find(".nav-tabs a:first").tab("show");
    $modal.find("#sort-info-display").html(selectedSort.display || "&nbsp;");
    $modal.find("#sort-info-stable").html(selectedSort.stable ? "Yes" : "No");
    $modal.find("#sort-info-best").html(selectedSort.best || "&nbsp;");
    $modal.find("#sort-info-average").html(selectedSort.average || "&nbsp;");
    $modal.find("#sort-info-worst").html(selectedSort.worst || "&nbsp;");
    $modal.find("#sort-info-memory").html(selectedSort.memory || "&nbsp;");
    $modal.find("#sort-info-method").html(selectedSort.method || "&nbsp;");
    $modal.modal();
    void addAceEditor(
      "#sort-algorithm",
      "#modal-sort",
      getSource(getSelected().sort, selectedSort),
    );
  };

  const onSortVisualizationButton = function () {
    const $this = $(this);
    const type = $this.data("visualization");
    players.sort.setVisualization(type);
  };

  const onSaveAlgorithmEdit = function () {
    if (!aceEditor || activeEditorModal !== "#modal-sort") return;
    settingsStore.set(editAlgorithmAtom, { id: getSelected().sort, source: aceEditor.getValue() });
    $("#modal-sort").modal("hide");
  };

  const onSaveAlgorithmNew = function () {
    if (!aceEditor || activeEditorModal !== "#modal-add-algorithm") return;
    const name = $("#new-sort-name").val();
    const nameSafe = name.replace(/[^a-zA-Z]/gi, "");
    const id = nameSafe + "_id_" + new Date().getTime();
    if ($.trim(name).length) {
      settingsStore.set(addAlgorithmAtom, { id, name, source: aceEditor.getValue() });
    }
    $("#modal-add-algorithm").modal("hide");
  };

  const onAddAlgorithmModalClick = function () {
    const $modal = $("#modal-add-algorithm");
    $modal.find("#new-sort-name").val("");
    $modal.modal();
    void addAceEditor("#new-sort-algorithm", "#modal-add-algorithm");
  };

  const playerButtonCallback = function (player, action) {
    if (action === "play" || action === "reverse" || action === "stop") {
      player.stop();
    }
  };

  const setupPlayers = function () {
    players.base = createPlayer("#base-section", {
      id: "base",
      hasMarkers: false,
      allowHover: true,
      allowClick: true,
      onClick: function (index, value) {
        baseData[index] = value;
        maxData[index] = getScale(0, baseData.length - 1, 0, maxData.length - 1)(value);
        players.base.setData(getBaseDataAsFrames());
        clearTimeout(clickTimer);
        clickTimer = setTimeout(doSort, clickDelay);
      },
      onPlayerButtonClickCallback: function (e) {
        playerButtonCallback(players.sort, e.action);
      },
    });
    players.sort = createPlayer("#sort-section", {
      id: "sort",
      hasMarkers: true,
      onPlayerButtonClickCallback: function (e) {
        playerButtonCallback(players.base, e.action);
      },
    });
  };

  const getSortedScaleNames = function () {
    const names = Object.keys(scales).sort(function (o1, o2) {
      let ret = 0;
      const s1 = scales[o1];
      const s2 = scales[o2];
      ret = s1.pitchesPerOctave - s2.pitchesPerOctave;
      if (ret === 0) {
        ret = s1.degrees.length - s2.degrees.length;
        if (ret === 0) {
          ret = s1.name.localeCompare(s2.name);
        }
      }
      return ret;
    });
    return names;
  };

  const populateScaleOptions = function (selector) {
    let lastKey;

    const $ul = $(selector);
    let htmlString = "";

    const scaleNames = getSortedScaleNames();
    $.each(scaleNames, function (index, scaleName) {
      // loop variables
      const scale = scales[scaleName];
      const numPitches = scale.pitchesPerOctave;
      const numDegrees = scale.degrees.length;
      const currentKey = numPitches + "_" + numDegrees;
      if (currentKey !== lastKey) {
        lastKey = currentKey;
        const $li = $("<li />")
          .addClass("disabled")
          .wrapInner(
            $('<a href="javascript:void(0);"></a>').text(
              "Octave: " + numPitches + " / Notes: " + numDegrees,
            ),
          );
        htmlString += $li.wrap("<div />").parent().html();
      }
      const $li = $("<li />")
        .attr("data-scale", scaleName)
        .wrapInner($('<a href="javascript:void(0);"></a>').text(scale.name));
      htmlString += $li.wrap("<div />").parent().html();
    });
    $ul.empty().append(htmlString);
    $ul.on("click" + eventNamespace, "li", function () {
      const $this = $(this);
      if (!$this.hasClass("disabled")) {
        setSelected("scale", $this.data("scale"));
      }
    });
  };

  const populateSoundfontOptions = function (selector) {
    let group = "";
    const $ul = $(selector);
    let htmlString = "";
    for (let i = 0; i < instruments.length; i++) {
      const instrument = instruments[i];
      // output group
      if (group !== instrument.group) {
        group = instrument.group;
        const $li = $("<li />")
          .addClass("disabled")
          .wrapInner($('<a href="javascript:void(0);"></a>').text(instrument.group));
        htmlString += $li.wrap("<div />").parent().html();
      }
      // output instrument
      const $li = $("<li />")
        .attr("data-soundfont", instrument.val)
        .wrapInner($('<a href="javascript:void(0);"></a>').text(i + ": " + instrument.name));
      if (getSelected().soundfont === i) {
        $li.addClass("active");
      }
      htmlString += $li.wrap("<div />").parent().html();
    }
    $ul.empty().append(htmlString);
    $ul.on("click" + eventNamespace, "li", function () {
      const $this = $(this);
      if (!$this.hasClass("disabled")) {
        setSelected("soundfont", $this.data("soundfont"));
      }
    });
  };

  const preloadSoundfonts = function () {
    const midiNotes = [];

    if (getSelected().audioType === "soundfont") {
      for (let i = 0; i < baseData.length; i++) {
        const midi = Helper.getMidiNumber(baseData[i]);
        if (midiNotes.indexOf(midi) === -1 && midi >= 0 && midi < 128) {
          midiNotes.push(midi);
        }
      }
      timbre.soundfont.preload(midiNotes);
    }
  };

  const onOptionBoxFilter = function () {
    let show = false;
    const $this = $(this);
    const listId = $this.attr("data-list-id");
    const $listItems = $("#" + listId + " li");
    const val = $.trim($this.val());
    const regex = new RegExp(val, "i");
    if (val === "") {
      $listItems.show();
    } else {
      $.each($listItems.get().reverse(), function (index, item) {
        const $item = $(item);
        if ($item.hasClass("disabled")) {
          $item.css("display", show ? "block" : "none");
          show = false;
        } else {
          if (regex.test($item.text())) {
            $item.show();
            show = true;
          } else {
            $item.hide();
          }
        }
      });
    }
  };

  const workerOnMessage = function (event) {
    if (destroyed || suspended) return;
    if (event.data.key !== workerKey) return;
    const isSortPlaying = players.sort.isPlaying();
    if (Object.hasOwn(event.data, "error")) {
      workerOnError(event.data.error);
      triggerAutoPlay = false;
      return;
    }
    players.sort.setData(event.data.frames || []);
    players.sort.goToFirst();
    if (isSortPlaying || triggerAutoPlay) {
      clickPlayButton();
    }
    triggerAutoPlay = false;
  };

  const workerOnError = function (event) {
    console.log(event);
  };

  const doSort = function () {
    if (destroyed || suspended) return;
    workerKey = (workerKey || 0) + 1;
    const request = createSortRequest(
      workerKey,
      getSelected().sort,
      getAlgorithms()[getSelected().sort],
      baseData,
    );

    // browsers that don't support Web Workers will behave slowly
    if (typeof Worker === "undefined") {
      try {
        workerOnMessage({ data: runSortRequest(request) });
      } catch (error) {
        workerOnMessage({ data: { key: workerKey, error: String(error?.message ?? error) } });
      }
      return;
    }

    // we should terminate our previous worker
    if (worker !== null) {
      worker.removeEventListener("message", workerOnMessage, false);
      worker.removeEventListener("error", workerOnError, false);
      worker.terminate();
    }

    // perform sort in worker thread
    worker = createWorker();
    worker.addEventListener("message", workerOnMessage, false);
    worker.addEventListener("error", workerOnError, false);
    worker.postMessage(request);
  };

  Sort.getSelected = function (key, defaultValue) {
    return getSelected().hasOwnProperty(key) ? getSelected()[key] : defaultValue;
  };

  Sort.getSelectedWaveformInfo = function () {
    return getWaveform();
  };

  Sort.getTempoString = function () {
    return "bpm" + (parseFloat(getSelected().tempo) || defaults.tempo) + " l16";
  };

  Sort.disconnectSettings = function () {
    disconnectSettings();
    disconnectSettings = () => {};
  };

  Sort.connectSettings = function () {
    if (destroyed || suspended || !initialized) return;
    Sort.disconnectSettings();
    const disconnectPlayback = connectPlaybackSettings(settingsStore, {
      volume(value, gain) {
        volumeSlider.slider("setValue", value);
        updateDisplayCache("#volume-display", value.toFixed(2));
        players.base.setVolume(gain);
        players.sort.setVolume(gain);
      },
      tempo(value) {
        tempoSlider.slider("setValue", value);
        updateDisplayCache("#tempo-display", value);
        players.base.setTempo(Sort.getTempoString());
        players.sort.setTempo(Sort.getTempoString());
      },
      preferences(value) {
        $("#sort-autoplay")
          .toggleClass("active", value.autoPlay)
          .attr("aria-pressed", String(value.autoPlay));
        for (const id of ["base", "sort"]) {
          $("#" + id + '-section [data-action="loop"]')
            .toggleClass("active", value.loop[id])
            .attr("aria-pressed", String(value.loop[id]));
        }
      },
    });
    try {
      const disconnectAudio = connectAudioSettings(settingsStore, {
        render(value) {
          centerNoteSlider.slider("setValue", value.centerNote);
          updateDisplayCache("#center-note-display", value.centerNote, getNoteName);
          const $scale = $('#scale-options li[data-scale="' + value.scale + '"]');
          $("#scale-options li").removeClass("active");
          $scale.addClass("active");
          updateDisplayCache("#scale-display", $scale.text());
          const $instrument = $('#soundfont-options li[data-soundfont="' + value.soundfont + '"]');
          $("#soundfont-options li").removeClass("active");
          $instrument.addClass("active");
          updateDisplayCache("#soundfont-display", $instrument.text());
          $("#audio-type-container .btn").each(function () {
            const active = $(this).attr("data-audio-type") === value.audioType;
            $(this).toggleClass("active", active).attr("aria-pressed", String(active));
          });
          $("#waveform .btn-group .btn").each(function () {
            const active = $(this).attr("data-waveform") === value.waveform;
            $(this).toggleClass("active", active).attr("aria-pressed", String(active));
          });
          setSliderWaveformFromSelected();
          updateDisplayCache(
            "#audio-type-display",
            value.audioType === "waveform" ? "waveform: " + value.waveform : $instrument.text(),
          );
          $("#audio-type-tab-link").text(value.audioType + " settings");
          $("#settings li[data-audio-type]").each(function () {
            $(this).toggleClass("hidden", $(this).attr("data-audio-type") !== value.audioType);
          });
        },
        refreshWaveform() {
          players.base.refreshWaveGenerator();
          players.sort.refreshWaveGenerator();
          players.base.drawWaveformCanvases();
        },
        setInstrument: (instrument) => timbre.soundfont.setInstrument(instrument),
        preload: preloadSoundfonts,
      });
      try {
        const disconnectSort = connectSortSettings(settingsStore, {
          catalog() {
            buildSortOptions("#sort-options");
          },
          selection(id) {
            const $options = $("#sort-options li").removeClass("active");
            const $selected = $options.filter(function () {
              return $(this).find("a").data("sort") === id;
            });
            $selected.addClass("active");
            updateDisplayCache("#sort-display", $selected.text());
          },
          size(value, changed) {
            dataSizeSlider.slider("setValue", value);
            updateDisplayCache("#data-size-display", value);
            if (changed || baseData.length !== value) generateData(false);
          },
          sort(algorithmChanged) {
            triggerAutoPlay =
              algorithmChanged && settingsStore.get(playbackPreferencesAtom).autoPlay;
            doSort();
          },
        });
        disconnectSettings = () => {
          disconnectSort();
          disconnectAudio();
          disconnectPlayback();
        };
      } catch (error) {
        disconnectAudio();
        throw error;
      }
    } catch (error) {
      disconnectPlayback();
      throw error;
    }
  };

  const cancelWorker = () => {
    workerKey = (workerKey || 0) + 1;
    if (worker) {
      worker.removeEventListener("message", workerOnMessage);
      worker.removeEventListener("error", workerOnError);
      worker.terminate();
      worker = null;
    }
  };

  const closeModals = () => {
    $("#modal-sort, #modal-add-algorithm, #modal-midi-export").each(function () {
      const $modal = $(this);
      const modal = $modal.data("modal");
      if (!modal) return;
      $modal.removeClass("fade");
      modal.$backdrop?.removeClass("fade");
      $modal.modal("hide");
      modal.$backdrop?.remove();
      $modal.addClass("fade");
    });
  };

  Sort.suspend = function () {
    if (destroyed || suspended) return;
    suspended = true;
    Sort.disconnectSettings();
    clearTimeout(clickTimer);
    clickTimer = null;
    triggerAutoPlay = false;
    cancelWorker();
    players.base?.suspend();
    players.sort?.suspend();
    editorRequest++;
    activeEditorModal = null;
    if (initialized) closeModals();
  };

  Sort.resume = function () {
    if (destroyed || !suspended) return;
    suspended = false;
    Sort.connectSettings();
  };

  Sort.destroy = function () {
    if (destroyed) return;
    Sort.suspend();
    destroyed = true;
    if (!initialized) return;
    // The legacy controller owns a document-wide UI, but removes only its
    // uniquely namespaced handlers, never unrelated jQuery/plugin listeners.
    $("body").find("*").addBack().off(eventNamespace);
    players.base?.destroy();
    players.sort?.destroy();
    players.base = players.sort = null;
    Helper.destroySliders();
    if (aceEditor) {
      const session = aceEditor.getSession();
      aceEditor.destroy();
      session.destroy();
      aceEditor = null;
    }
    $("#modal-sort, #modal-add-algorithm, #modal-midi-export").each(function () {
      const $modal = $(this);
      const modal = $modal.data("modal");
      if (modal) {
        $modal.off(".modal").removeData("modal");
      }
      $modal.find(".editor-status, .js-editor").remove();
    });
    baseData = maxData = [];
    for (const key of Object.keys(displayCache)) delete displayCache[key];
  };

  Sort.init = function (options) {
    if (destroyed) throw new Error("Cannot initialize a destroyed controller");
    if (initialized) throw new Error("Controller is already initialized");
    initialized = true;
    try {
      createWorker = options.createWorker;
      createSortRequest = options.createSortRequest;
      runSortRequest = options.runSortRequest;
      getSource = options.getSource;
      loadCodeEditor = options.loadCodeEditor;
      // when using a mobile device, decrease samplerate.
      // idea taken from: http://mohayonao.github.io/timbre.js/misc/js/common.js
      if (timbre.envmobile) {
        timbre.setup({ samplerate: timbre.samplerate * 0.5 });
      }
      // build our sort options
      buildSortOptions("#sort-options");
      // build waveform buttons
      populateWaveformButtons();
      // setup audio and audio players
      setupPlayers();
      // setup base data
      generateData(true, "randomUnique");
      // populate our scale dropdown
      populateScaleOptions("#scale-options");
      updateDisplayCache(
        "#scale-display",
        $('#scale-options li[data-scale="' + getSelected().scale + '"]').text(),
      );
      $("#scale-filter")
        .on("keyup" + eventNamespace, onOptionBoxFilter)
        .on("focus" + eventNamespace, function () {
          $(this).val("");
          $("#scale-options li").show();
        });
      // populate our soundfont dropdown
      populateSoundfontOptions("#soundfont-options");
      updateDisplayCache(
        "#soundfont-display",
        $('#soundfont-options li[data-soundfont="' + getSelected().soundfont + '"]').text(),
      );
      $("#soundfont-filter")
        .on("keyup" + eventNamespace, onOptionBoxFilter)
        .on("focus" + eventNamespace, function () {
          $(this).val("");
          $("#soundfont-options li").show();
        });
      // create some of our sliders
      volumeSlider = Helper.createSlider("#volume-container", defaults.volume, onSliderVolume);
      tempoSlider = Helper.createSlider("#tempo-container", defaults.tempo, onSliderTempo);
      centerNoteSlider = Helper.createSlider(
        "#center-note-container",
        defaults.centerNote,
        onSliderCenterNote,
      );
      dataSizeSlider = Helper.createSlider(
        "#data-size-container",
        defaults.dataSize,
        onSliderDataSize,
      );
      // create our waveform sliders
      waveformSliders.a = Helper.createSlider(
        "#waveform-adshr-attack-container",
        {
          value: getWaveform().a,
          min: 10,
          max: 500,
          step: 5,
        },
        onSliderWaveform,
      );
      waveformSliders.d = Helper.createSlider(
        "#waveform-adshr-decay-container",
        {
          value: getWaveform().d,
          min: 10,
          max: 2000,
          step: 5,
        },
        onSliderWaveform,
      );
      waveformSliders.s = Helper.createSlider(
        "#waveform-adshr-sustain-container",
        {
          value: getWaveform().s,
          min: 0,
          max: 1,
          step: 0.01,
        },
        onSliderWaveform,
      );
      waveformSliders.h = Helper.createSlider(
        "#waveform-adshr-hold-container",
        {
          value: getWaveform().h,
          min: 10,
          max: 3000,
          step: 5,
        },
        onSliderWaveform,
      );
      waveformSliders.r = Helper.createSlider(
        "#waveform-adshr-release-container",
        {
          value: getWaveform().r,
          min: 10,
          max: 3000,
          step: 5,
        },
        onSliderWaveform,
      );
      // cache a few items
      const $sortAutoPlay = $("#sort-autoplay");
      $sortAutoPlay.on("click" + eventNamespace, () => {
        settingsStore.set(toggleAutoPlayAtom);
      });
      $("#modal-sort, #modal-add-algorithm").on("hide" + eventNamespace, function () {
        if (activeEditorModal !== "#" + this.id) return;
        editorRequest++;
        activeEditorModal = null;
      });
      // handle button clicks
      $("#audio-type-container .btn").on("click" + eventNamespace, onAudioTypeButtonClick);
      $("#audio-type-tab-link").on("click" + eventNamespace, onAudioTypeTabLinkClick);
      $("#waveform .btn-group .btn").on("click" + eventNamespace, onWaveformButtonClick);
      $("span[data-midi-export]").on("click" + eventNamespace, onMidiExportClick);
      $("#midi-export-btn").on("click" + eventNamespace, onMidiSave);
      $("#modal-sort-open").on("click" + eventNamespace, onSortModalClick);
      $("#add-algorithm-btn").on("click" + eventNamespace, onAddAlgorithmModalClick);
      $("#save-algorithm-edit").on("click" + eventNamespace, onSaveAlgorithmEdit);
      $("#save-algorithm-new").on("click" + eventNamespace, onSaveAlgorithmNew);
      $("#base-buttons").on("click" + eventNamespace, ".btn", onAudioDataButton);
      $("#sort-options").on("click" + eventNamespace, "li", onSortOptionSelected);
      $(".sort-visualization").on("click" + eventNamespace, onSortVisualizationButton);
      // draw envelope canvas
      players.base.drawWaveformCanvases();
      // update slider selction text
      updateDisplayCache("#data-size-display", getSelected().dataSize);
      Sort.connectSettings();
    } catch (error) {
      Sort.destroy();
      throw error;
    }
  };

  return Sort;
}
