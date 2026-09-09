import { expect, test } from "vitest";
import { createMidiBytes } from "../src/midi/create-midi-bytes.ts";

const frames = [
  {
    arr: [
      { value: 60, play: true },
      { value: 64, play: true },
      { value: 67, play: false },
    ],
  },
  { arr: [] },
  {
    arr: [
      { value: 0, play: true },
      { value: 127, play: true },
      { value: -1, play: true },
      { value: 128, play: true },
    ],
  },
];
const identity = (value) => value;

test("preserves legacy MIDI notes, timing, channel, instrument and velocity", () => {
  // Captured from the former vendored implementation before its removal.
  // It emitted a single NUL byte instead of the copyright string.
  const legacy = Buffer.from(
    "4d546864000000060000000100804d54726b0000003400ff510307a12000c22840923c640092406400823c64008240644092006400927f640082006400827f648940ff02010000ff2f00",
    "hex",
  );
  const bytes = Buffer.from(createMidiBytes(frames, identity, 120, 2, 40), "binary");
  expect(bytes.subarray(0, 18)).toEqual(legacy.subarray(0, 18));
  const copyrightOffset = legacy.indexOf(Buffer.from([0xff, 0x02]));
  expect(bytes.subarray(22, copyrightOffset)).toEqual(legacy.subarray(22, copyrightOffset));
  const text = Buffer.from("Audio Sort <skratchdot.com>");
  expect(bytes.subarray(copyrightOffset)).toEqual(
    Buffer.concat([Buffer.from([0xff, 0x02, text.length]), text, Buffer.from([0, 0xff, 0x2f, 0])]),
  );
  expect(bytes.readUInt32BE(18)).toBe(bytes.length - 22);
});

test("maps values through the supplied scale helper without mutating frames", () => {
  const input = [{ arr: [{ value: 0, play: true }] }];
  const before = structuredClone(input);
  const bytes = Buffer.from(
    createMidiBytes(input, (value) => value + 60, 60, 15, 127),
    "binary",
  );
  expect(bytes.includes(Buffer.from([0xff, 0x51, 3, 0x0f, 0x42, 0x40]))).toBe(true);
  expect(bytes.includes(Buffer.from([0xcf, 127]))).toBe(true);
  expect(bytes.includes(Buffer.from([64, 0x9f, 60, 100, 0, 0x8f, 60, 100]))).toBe(true);
  expect(input).toEqual(before);
});

test("exports an empty sequence as a valid track with metadata and no notes", () => {
  const bytes = Buffer.from(createMidiBytes([], identity, 120, 0, 0), "binary");
  expect(bytes.readUInt32BE(18)).toBe(bytes.length - 22);
  expect(bytes.subarray(22, 32)).toEqual(
    Buffer.from([0, 0xff, 0x51, 3, 7, 0xa1, 0x20, 0, 0xc0, 0]),
  );
  expect(bytes.subarray(32, 36)).toEqual(Buffer.from([0x88, 0, 0xff, 2]));
  expect(bytes.subarray(-4)).toEqual(Buffer.from([0, 0xff, 0x2f, 0]));
});
