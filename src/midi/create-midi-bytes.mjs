import Midi from "jsmidgen";

// Keep the original export timing and velocity independent of library defaults.
export function createMidiBytes(data, getMidiNumber, tempo, channel, instrument) {
  const duration = 64;
  let totalDuration = 0;

  // setup midi file
  const midiFile = new Midi.File();
  const midiTrack = new Midi.Track();
  midiTrack.setTempo(tempo);
  midiTrack.setInstrument(channel, instrument);
  midiFile.addTrack(midiTrack);

  // build midi track
  for (let i = 0; i < data.length; i++) {
    const info = data[i];
    const play = [];
    totalDuration += duration;
    // get the notes we need to play
    for (let j = 0; j < info.arr.length; j++) {
      const currentItem = info.arr[j];
      if (currentItem.play) {
        const midiNumber = getMidiNumber(currentItem.value);
        if (midiNumber >= 0 && midiNumber < 128) {
          play.push(midiNumber);
        }
      }
    }
    // note on
    for (let j = 0; j < play.length; j++) {
      if (j === 0) {
        midiTrack.noteOn(channel, play[j], duration, 100);
      } else {
        midiTrack.noteOn(channel, play[j], 0, 100);
      }
    }
    // note off
    for (let j = 0; j < play.length; j++) {
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
