// API used from jsmidgen 0.1.8. File.toBytes returns a binary string,
// unlike Track.toBytes and the return type in @types/jsmidgen.
declare module "jsmidgen" {
  class MetaEvent {
    static COPYRIGHT: number;
    constructor(options: { type: number; data: number[]; time: number });
  }
  class Track {
    setTempo(tempo: number): void;
    setInstrument(channel: number, instrument: number): void;
    noteOn(channel: number, note: number, time: number, velocity: number): void;
    noteOff(channel: number, note: number, time: number, velocity: number): void;
    addEvent(event: MetaEvent): void;
  }
  class File {
    addTrack(track: Track): void;
    toBytes(): string;
  }
  const Midi: { File: typeof File; Track: typeof Track; MetaEvent: typeof MetaEvent };
  export default Midi;
}
