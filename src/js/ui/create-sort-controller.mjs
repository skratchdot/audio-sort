import { $, timbre } from "../vendor.mjs";
import { scales } from "../midi/scales.mjs";
import { min, max } from "d3-array";
import { scaleLinear } from "d3-scale";
import { saveAs } from "file-saver";
import { createHelpers } from "./create-helpers.mjs";
import { createPlayerFactory } from "./create-player-factory.mjs";
import { MidiExport } from "../midi/midi-export.mjs";
import { instruments } from "../midi/instruments.mjs";

export function createSortController(generators) {
  const Sort = {};
  const Helper = createHelpers(Sort);
  const createPlayer = createPlayerFactory(Sort, Helper);
  // Default Settings
  const defaults = {
    volume: { value: 0.25, min: 0, max: 1, step: 0.01 },
    tempo: { value: 90, min: 20, max: 300, step: 1 },
    centerNote: { value: 69, min: 0, max: 127, step: 1 },
    scale: { value: "chromatic" },
    sort: { value: "bubble" },
    dataSize: { value: 12, min: 4, max: 48, step: 1 },
    audioType: { value: "waveform" },
    waveform: { value: "string" },
    soundfont: { value: 0 },
  };
  // Currently Selected Items
  const selected = {
    volume: defaults.volume.value,
    tempo: defaults.tempo.value,
    centerNote: defaults.centerNote.value,
    scale: defaults.scale.value,
    sort: defaults.sort.value,
    dataSize: defaults.dataSize.value,
    audioType: defaults.audioType.value,
    waveform: defaults.waveform.value,
    soundfont: defaults.soundfont.value,
  };
  // Waveform Data
  const waveform = {
    string: { gen: "PluckGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 500, r: 2500 },
    sin: { gen: "OscGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
    cos: { gen: "OscGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
    pulse: { gen: "OscGen", poly: 10, mul: 0.25, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
    tri: { gen: "OscGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
    saw: { gen: "OscGen", poly: 10, mul: 0.25, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
    fami: { gen: "OscGen", poly: 10, mul: 1, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
    konami: { gen: "OscGen", poly: 10, mul: 0.4, a: 50, d: 300, s: 0.5, h: 200, r: 300 },
  };
  const waveformSliders = {};
  // Audio players
  const players = {
    base: null,
    sort: null,
  };
  // Ace Editor
  let aceEditor;
  // AutoPlay
  let $sortAutoPlay;
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
  let algorithms;
  let createSortRequest;
  let runSortRequest;
  let getSource;
  let createCodeEditor;

  const buildSortOptions = function (selector) {
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
    $.each(waveform, function (waveformName) {
      html += $("<button />")
        .addClass("btn btn-mini" + (waveformName === selected.waveform ? " active" : ""))
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
    selected.waveform = $this.attr("data-waveform");
    // update slider values
    setSliderWaveformFromSelected();
    // update text on audio tab
    updateDisplayCache("#audio-type-display", "waveform: " + selected.waveform);
    // start using new selection
    players.base.refreshWaveGenerator();
    players.sort.refreshWaveGenerator();
    players.base.drawWaveformCanvases();
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
    const $this = $(this);
    const $tabs = $("#settings li[data-audio-type]");
    const $tabLink = $("#audio-type-tab-link");
    const audioType = $this.attr("data-audio-type");
    const audioTypeName = $this.text();

    // set selected type
    selected.audioType = audioType;
    let displayName = audioType;
    if (selected.audioType === "waveform") {
      displayName += ": " + selected.waveform;
      players.base.refreshWaveGenerator();
      players.sort.refreshWaveGenerator();
    } else if (selected.audioType === "soundfont") {
      displayName = $("#soundfont-options li.active").text();
    }
    updateDisplayCache("#audio-type-display", displayName);
    // update settings link
    $tabLink.text(audioTypeName.toLowerCase() + " settings");
    // show correct tab
    $tabs.removeClass("hidden");
    $tabs.filter('[data-audio-type!="' + audioType + '"]').addClass("hidden");
    preloadSoundfonts();
  };

  const onAudioTypeTabLinkClick = function () {
    $("#settings li[data-audio-type]:visible a").click();
  };

  const onSlider = function (key, selector, event, fnFormat) {
    if (event) {
      selected[key] = event.value;
    }
    updateDisplayCache(selector, selected[key], fnFormat);
  };

  const onSliderVolume = function (e) {
    onSlider("volume", "#volume-display", e, function (val) {
      return val.toFixed(2);
    });
    const volume = waveform[selected.waveform].mul * selected.volume;
    players.base.setVolume(volume);
    players.sort.setVolume(volume);
  };

  const onSliderTempo = function (e) {
    const tempo = Sort.getTempoString();
    onSlider("tempo", "#tempo-display", e);
    players.base.setTempo(tempo);
    players.sort.setTempo(tempo);
  };

  const onSliderCenterNote = function (e) {
    onSlider("centerNote", "#center-note-display", e, getNoteName);
    preloadSoundfonts();
  };

  const onSliderDataSize = function (e) {
    onSlider("dataSize", "#data-size-display", e);
    generateData(false);
    doSort();
  };

  const onSliderWaveform = function (e) {
    const $slider = $(e.target);
    const $container = $slider.parents("[data-adshr]:first");
    const adshr = $container.attr("data-adshr");
    waveform[selected.waveform][adshr] = adshr === "s" ? parseFloat(e.value.toFixed(2)) : e.value;
    updateWaveformDisplays();
    players.base.refreshWaveGenerator();
    players.sort.refreshWaveGenerator();
    players.base.drawEnvelopeCanvas();
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
    const $parent = $item.parent();
    if ($item.hasClass("disabled")) {
      return;
    }
    $parent.find("li").removeClass("active");
    $item.addClass("active");
    updateDisplayCache("#sort-display", $item.text());
    selected.sort = $item.find("a").data("sort");
    if ($sortAutoPlay.hasClass("active")) {
      triggerAutoPlay = true;
    }
    doSort();
  };

  const updateWaveformDisplays = function () {
    updateDisplayCache("#waveform-adshr-attack-display", waveform[selected.waveform].a);
    updateDisplayCache("#waveform-adshr-decay-display", waveform[selected.waveform].d);
    updateDisplayCache("#waveform-adshr-sustain-display", waveform[selected.waveform].s);
    updateDisplayCache("#waveform-adshr-hold-display", waveform[selected.waveform].h);
    updateDisplayCache("#waveform-adshr-release-display", waveform[selected.waveform].r);
  };

  const setSliderWaveformFromSelected = function () {
    $.each(["a", "d", "s", "h", "r"], function (index, key) {
      waveformSliders[key].slider("setValue", waveform[selected.waveform][key]);
    });
    updateWaveformDisplays();
  };

  const getScale = function (domainMin, domainMax, rangeMin, rangeMax) {
    return scaleLinear().domain([domainMin, domainMax]).range([rangeMin, rangeMax]);
  };

  const generateData = function (regenerateMaxData, action) {
    if (regenerateMaxData) {
      if (generators.hasOwnProperty(action)) {
        baseData = generators[action](selected.dataSize);
        maxData = generators[action](defaults.dataSize.max);
        const slice = maxData.slice(0, selected.dataSize);
        const scale = getScale(0, baseData.length - 1, min(slice), max(slice));
        // we always want our current "baseData" when re-sizing
        for (let i = 0; i < baseData.length; i++) {
          maxData[i] = Math.round(scale(baseData[i]));
        }
      }
    } else {
      baseData = maxData.slice(0, selected.dataSize);
      const scale = getScale(min(baseData), max(baseData), 0, baseData.length - 1);
      // normalize data
      for (let i = 0; i < baseData.length; i++) {
        baseData[i] = Math.round(scale(maxData[i]));
      }
    }
    players.base.setData(getBaseDataAsFrames());
    preloadSoundfonts();
  };

  const addAceEditor = function (container) {
    const $container = $(container);
    const id = "id_" + new Date().getTime();
    if (aceEditor) {
      aceEditor.destroy();
      aceEditor.getSession().destroy();
    }
    $container.empty().append('<div class="js-editor" id="' + id + '"></div>');
    aceEditor = createCodeEditor(id);
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
            selected.tempo,
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
    const selectedSort = algorithms[selected.sort];

    $modal.find(".sort-name").text(selectedSort.display);
    $modal.find(".nav-tabs a:first").tab("show");
    $modal.find("#sort-info-display").html(selectedSort.display || "&nbsp;");
    $modal.find("#sort-info-stable").html(selectedSort.stable ? "Yes" : "No");
    $modal.find("#sort-info-best").html(selectedSort.best || "&nbsp;");
    $modal.find("#sort-info-average").html(selectedSort.average || "&nbsp;");
    $modal.find("#sort-info-worst").html(selectedSort.worst || "&nbsp;");
    $modal.find("#sort-info-memory").html(selectedSort.memory || "&nbsp;");
    $modal.find("#sort-info-method").html(selectedSort.method || "&nbsp;");
    addAceEditor("#sort-algorithm");
    const fnText = getSource(selected.sort, selectedSort);
    aceEditor.setValue(fnText);
    aceEditor.clearSelection();
    $modal.modal();
  };

  const onSortVisualizationButton = function () {
    const $this = $(this);
    const type = $this.data("visualization");
    players.sort.setVisualization(type);
  };

  const onSaveAlgorithmEdit = function () {
    algorithms[selected.sort] = Object.assign(
      new Function("AS", aceEditor.getValue()),
      algorithms[selected.sort],
    );
    $("#modal-sort").modal("hide");
  };

  const onSaveAlgorithmNew = function () {
    const name = $("#new-sort-name").val();
    const nameSafe = name.replace(/[^a-zA-Z]/gi, "");
    const id = nameSafe + "_id_" + new Date().getTime();
    if ($.trim(name).length) {
      algorithms[id] = new Function("AS", aceEditor.getValue());
      algorithms[id].display = name;
      algorithms[id].stable = true;
      algorithms[id].best = "";
      algorithms[id].average = "";
      algorithms[id].worst = "";
      algorithms[id].memory = "";
      algorithms[id].method = "";
    }
    $("#modal-add-algorithm").modal("hide");
    buildSortOptions("#sort-options");
  };

  const onAddAlgorithmModalClick = function () {
    const $modal = $("#modal-add-algorithm");
    $modal.find("#new-sort-name").val("");
    addAceEditor("#new-sort-algorithm");
    $modal.modal();
  };

  const playerButtonCallback = function (player, action) {
    if (action === "play" || action === "reverse" || action === "stop") {
      player.stop();
    }
  };

  const setupPlayers = function () {
    players.base = createPlayer("#base-section", {
      isLooping: true,
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
      isLooping: true,
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
    $ul.append(htmlString);
    $ul.on("click", "li", function () {
      const $this = $(this);
      if (!$this.hasClass("disabled")) {
        $ul.find("li").removeClass("active");
        $this.addClass("active");
        selected.scale = $this.data("scale");
        updateDisplayCache("#scale-display", $this.text());
        preloadSoundfonts();
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
      if (selected.soundfont === i) {
        $li.addClass("active");
      }
      htmlString += $li.wrap("<div />").parent().html();
    }
    $ul.append(htmlString);
    $ul.on("click", "li", function () {
      const $this = $(this);
      if (!$this.hasClass("disabled")) {
        $ul.find("li").removeClass("active");
        $this.addClass("active");
        selected.soundfont = $this.data("soundfont");
        timbre.soundfont.setInstrument(selected.soundfont);
        updateDisplayCache("#soundfont-display", $this.text());
        updateDisplayCache("#audio-type-display", $this.text());
        preloadSoundfonts();
      }
    });
  };

  const preloadSoundfonts = function () {
    const midiNotes = [];

    if (selected.audioType === "soundfont") {
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
    workerKey = (workerKey || 0) + 1;
    const request = createSortRequest(
      workerKey,
      selected.sort,
      algorithms[selected.sort],
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
    return selected.hasOwnProperty(key) ? selected[key] : defaultValue;
  };

  Sort.getSelectedWaveformInfo = function () {
    return waveform[selected.waveform];
  };

  Sort.getTempoString = function () {
    return "bpm" + (parseFloat(selected.tempo) || defaults.tempo) + " l16";
  };

  Sort.init = function (options) {
    createWorker = options.createWorker;
    algorithms = options.algorithms;
    createSortRequest = options.createSortRequest;
    runSortRequest = options.runSortRequest;
    getSource = options.getSource;
    createCodeEditor = options.createCodeEditor;
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
      $('#scale-options li[data-scale="' + selected.scale + '"]').text(),
    );
    $("#scale-filter")
      .on("keyup", onOptionBoxFilter)
      .on("focus", function () {
        $(this).val("");
        $("#scale-options li").show();
      });
    // populate our soundfont dropdown
    populateSoundfontOptions("#soundfont-options");
    updateDisplayCache(
      "#soundfont-display",
      $('#soundfont-options li[data-soundfont="' + selected.soundfont + '"]').text(),
    );
    $("#soundfont-filter")
      .on("keyup", onOptionBoxFilter)
      .on("focus", function () {
        $(this).val("");
        $("#soundfont-options li").show();
      });
    // create some of our sliders
    Helper.createSlider("#volume-container", defaults.volume, onSliderVolume);
    Helper.createSlider("#tempo-container", defaults.tempo, onSliderTempo);
    Helper.createSlider("#center-note-container", defaults.centerNote, onSliderCenterNote);
    Helper.createSlider("#data-size-container", defaults.dataSize, onSliderDataSize);
    // create our waveform sliders
    waveformSliders.a = Helper.createSlider(
      "#waveform-adshr-attack-container",
      {
        value: waveform[selected.waveform].a,
        min: 10,
        max: 500,
        step: 5,
      },
      onSliderWaveform,
    );
    waveformSliders.d = Helper.createSlider(
      "#waveform-adshr-decay-container",
      {
        value: waveform[selected.waveform].d,
        min: 10,
        max: 2000,
        step: 5,
      },
      onSliderWaveform,
    );
    waveformSliders.s = Helper.createSlider(
      "#waveform-adshr-sustain-container",
      {
        value: waveform[selected.waveform].s,
        min: 0,
        max: 1,
        step: 0.01,
      },
      onSliderWaveform,
    );
    waveformSliders.h = Helper.createSlider(
      "#waveform-adshr-hold-container",
      {
        value: waveform[selected.waveform].h,
        min: 10,
        max: 3000,
        step: 5,
      },
      onSliderWaveform,
    );
    waveformSliders.r = Helper.createSlider(
      "#waveform-adshr-release-container",
      {
        value: waveform[selected.waveform].r,
        min: 10,
        max: 3000,
        step: 5,
      },
      onSliderWaveform,
    );
    // cache a few items
    $sortAutoPlay = $("#sort-autoplay");
    // handle button clicks
    $("#audio-type-container .btn").on("click", onAudioTypeButtonClick);
    $("#audio-type-tab-link").on("click", onAudioTypeTabLinkClick);
    $('#audio-type-container .btn[data-audio-type="' + selected.audioType + '"]').click();
    $("#waveform .btn-group .btn").on("click", onWaveformButtonClick);
    $("span[data-midi-export]").on("click", onMidiExportClick);
    $("#midi-export-btn").on("click", onMidiSave);
    $("#modal-sort-open").on("click", onSortModalClick);
    $("#add-algorithm-btn").on("click", onAddAlgorithmModalClick);
    $("#save-algorithm-edit").on("click", onSaveAlgorithmEdit);
    $("#save-algorithm-new").on("click", onSaveAlgorithmNew);
    $("#base-buttons").on("click", ".btn", onAudioDataButton);
    $("#sort-options").on("click", "li", onSortOptionSelected);
    $(".sort-visualization").on("click", onSortVisualizationButton);
    $("#sort-options [data-sort=" + selected.sort + "]").click();
    // draw envelope canvas
    players.base.drawWaveformCanvases();
    // update slider selction text
    updateDisplayCache("#volume-display", selected.volume);
    updateDisplayCache("#tempo-display", selected.tempo);
    updateDisplayCache("#center-note-display", selected.centerNote, getNoteName);
    updateDisplayCache("#data-size-display", selected.dataSize);
  };

  return Sort;
}
