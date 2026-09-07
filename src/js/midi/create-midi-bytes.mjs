import Midi from "jsmidgen";

// Keep the original export timing and velocity independent of library defaults.
export function createMidiBytes(data, getMidiNumber, tempo, channel, instrument) {
  var i,
    j,
    midiFile,
    midiTrack,
    duration = 64,
    totalDuration = 0,
    info,
    currentItem,
    midiNumber,
    play;

  // setup midi file
  midiFile = new Midi.File();
  midiTrack = new Midi.Track();
  midiTrack.setTempo(tempo);
  midiTrack.setInstrument(channel, instrument);
  midiFile.addTrack(midiTrack);

  // build midi track
  for (i = 0; i < data.length; i++) {
    info = data[i];
    play = [];
    totalDuration += duration;
    // get the notes we need to play
    for (j = 0; j < info.arr.length; j++) {
      currentItem = info.arr[j];
      if (currentItem.play) {
        midiNumber = getMidiNumber(currentItem.value);
        if (midiNumber >= 0 && midiNumber < 128) {
          play.push(midiNumber);
        }
      }
    }
    // note on
    for (j = 0; j < play.length; j++) {
      if (j === 0) {
        midiTrack.noteOn(channel, play[j], duration, 100);
      } else {
        midiTrack.noteOn(channel, play[j], 0, 100);
      }
    }
    // note off
    for (j = 0; j < play.length; j++) {
      midiTrack.noteOff(channel, play[j], 0, 100);
    }
  }

  // extend track so the last note plays
  midiTrack.addEvent(
    new Midi.MetaEvent({
      type: Midi.MetaEvent.COPYRIGHT,
      data: Array.from("Audio Sort <skratchdot.com>", (character) => character.charCodeAt(0)),
      time: totalDuration + 1024,
    }),
  );

  return midiFile.toBytes();
}
