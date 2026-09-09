// The subset of Timbre's browser API used by the audio adapters.
declare module "timbre/timbre.dev.js" {
  export type PlotOptions = { target: HTMLCanvasElement; background: string };
  export type TimbreNode = {
    play(): TimbreNode;
    pause(): TimbreNode;
    bang(): TimbreNode;
    start(): TimbreNode;
    stop(): TimbreNode;
    noteOn(note: number, velocity: number): TimbreNode;
    set(properties: Record<string, unknown>): TimbreNode;
    set(name: string, value: unknown): TimbreNode;
    on(event: string, listener: (this: TimbreNode) => void): TimbreNode;
    removeAllListeners(): TimbreNode;
    removeAll(): TimbreNode;
    osc?: { plot(options: PlotOptions): void };
    _: { channels: number };
  };
  export type Timbre = {
    (name: string, options?: Record<string, unknown>, callback?: () => void): TimbreNode;
    fn: { _audioContext: AudioContext };
  };
  const timbre: Timbre;
  export default timbre;
}
