/*!
 * Scale data extracted from subcollider.js 0.1.0, formerly bundled by Audio Sort.
 * Source: https://github.com/mohayonao/subcollider
 * Preserves the original scale IDs, names, degrees, and pitches per octave.
 *
 * Copyright (c) 2012 nao yonamine
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

export interface Scale {
  readonly name: string;
  readonly pitchesPerOctave: number;
  readonly degrees: readonly number[];
}

export const scales: Readonly<Record<string, Scale>> = {
  aeolian: {
    name: "Aeolian",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 5, 7, 8, 10],
  },
  ahirbhairav: {
    name: "Ahirbhairav",
    pitchesPerOctave: 12,
    degrees: [0, 1, 4, 5, 7, 9, 10],
  },
  ajam: {
    name: "Ajam",
    pitchesPerOctave: 24,
    degrees: [0, 4, 8, 10, 14, 18, 22],
  },
  atharKurd: {
    name: "Athar Kurd",
    pitchesPerOctave: 24,
    degrees: [0, 2, 6, 12, 14, 16, 22],
  },
  augmented: {
    name: "Augmented",
    pitchesPerOctave: 12,
    degrees: [0, 3, 4, 7, 8, 11],
  },
  augmented2: {
    name: "Augmented 2",
    pitchesPerOctave: 12,
    degrees: [0, 1, 4, 5, 8, 9],
  },
  bartok: {
    name: "Bartok",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 5, 7, 8, 10],
  },
  bastanikar: {
    name: "Bastanikar",
    pitchesPerOctave: 24,
    degrees: [0, 3, 7, 10, 13, 15, 21],
  },
  bayati: {
    name: "Bayati",
    pitchesPerOctave: 24,
    degrees: [0, 3, 6, 10, 14, 16, 20],
  },
  bhairav: {
    name: "Bhairav",
    pitchesPerOctave: 12,
    degrees: [0, 1, 4, 5, 7, 8, 11],
  },
  chinese: {
    name: "Chinese",
    pitchesPerOctave: 12,
    degrees: [0, 4, 6, 7, 11],
  },
  chromatic: {
    name: "Chromatic",
    pitchesPerOctave: 12,
    degrees: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  chromatic24: {
    name: "Chromatic 24",
    pitchesPerOctave: 24,
    degrees: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  },
  diminished: {
    name: "Diminished",
    pitchesPerOctave: 12,
    degrees: [0, 1, 3, 4, 6, 7, 9, 10],
  },
  diminished2: {
    name: "Diminished 2",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 5, 6, 8, 9, 11],
  },
  dorian: {
    name: "Dorian",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 5, 7, 9, 10],
  },
  egyptian: {
    name: "Egyptian",
    pitchesPerOctave: 12,
    degrees: [0, 2, 5, 7, 10],
  },
  enigmatic: {
    name: "Enigmatic",
    pitchesPerOctave: 12,
    degrees: [0, 1, 4, 6, 8, 10, 11],
  },
  farahfaza: {
    name: "Farahfaza",
    pitchesPerOctave: 24,
    degrees: [0, 4, 6, 10, 14, 16, 20],
  },
  gong: {
    name: "Gong",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 7, 9],
  },
  harmonicMajor: {
    name: "Harmonic Major",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 5, 7, 8, 11],
  },
  harmonicMinor: {
    name: "Harmonic Minor",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 5, 7, 8, 11],
  },
  hexAeolian: {
    name: "Hex Aeolian",
    pitchesPerOctave: 12,
    degrees: [0, 3, 5, 7, 8, 10],
  },
  hexDorian: {
    name: "Hex Dorian",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 5, 7, 10],
  },
  hexMajor6: {
    name: "Hex Major 6",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 5, 7, 9],
  },
  hexMajor7: {
    name: "Hex Major 7",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 7, 9, 11],
  },
  hexPhrygian: {
    name: "Hex Phrygian",
    pitchesPerOctave: 12,
    degrees: [0, 1, 3, 5, 8, 10],
  },
  hexSus: {
    name: "Hex Sus",
    pitchesPerOctave: 12,
    degrees: [0, 2, 5, 7, 9, 10],
  },
  hijaz: {
    name: "Hijaz",
    pitchesPerOctave: 24,
    degrees: [0, 2, 8, 10, 14, 17, 20],
  },
  hijazDesc: {
    name: "Hijaz Descending",
    pitchesPerOctave: 24,
    degrees: [0, 2, 8, 10, 14, 16, 20],
  },
  hindu: {
    name: "Hindu",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 5, 7, 8, 10],
  },
  hirajoshi: {
    name: "Hirajoshi",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 7, 8],
  },
  hungarianMinor: {
    name: "Hungarian Minor",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 6, 7, 8, 11],
  },
  husseini: {
    name: "Husseini",
    pitchesPerOctave: 24,
    degrees: [0, 3, 6, 10, 14, 17, 21],
  },
  huzam: {
    name: "Huzam",
    pitchesPerOctave: 24,
    degrees: [0, 3, 7, 9, 15, 17, 21],
  },
  indian: {
    name: "Indian",
    pitchesPerOctave: 12,
    degrees: [0, 4, 5, 7, 10],
  },
  ionian: {
    name: "Ionian",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 5, 7, 9, 11],
  },
  iraq: {
    name: "Iraq",
    pitchesPerOctave: 24,
    degrees: [0, 3, 7, 10, 13, 17, 21],
  },
  iwato: {
    name: "Iwato",
    pitchesPerOctave: 12,
    degrees: [0, 1, 5, 6, 10],
  },
  jiao: {
    name: "Jiao",
    pitchesPerOctave: 12,
    degrees: [0, 3, 5, 8, 10],
  },
  jiharkah: {
    name: "Jiharkah",
    pitchesPerOctave: 24,
    degrees: [0, 4, 8, 10, 14, 18, 21],
  },
  karjighar: {
    name: "Karjighar",
    pitchesPerOctave: 24,
    degrees: [0, 3, 6, 10, 12, 18, 20],
  },
  kijazKarKurd: {
    name: "Kijaz Kar Kurd",
    pitchesPerOctave: 24,
    degrees: [0, 2, 8, 10, 14, 16, 22],
  },
  kumoi: {
    name: "Kumoi",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 7, 9],
  },
  kurd: {
    name: "Kurd",
    pitchesPerOctave: 24,
    degrees: [0, 2, 6, 10, 14, 16, 20],
  },
  leadingWhole: {
    name: "Leading Whole Tone",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 6, 8, 10, 11],
  },
  locrian: {
    name: "Locrian",
    pitchesPerOctave: 12,
    degrees: [0, 1, 3, 5, 6, 8, 10],
  },
  locrianMajor: {
    name: "Locrian Major",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 5, 6, 8, 10],
  },
  lydian: {
    name: "Lydian",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 6, 7, 9, 11],
  },
  lydianMinor: {
    name: "Lydian Minor",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 6, 7, 8, 10],
  },
  mahur: {
    name: "Mahur",
    pitchesPerOctave: 24,
    degrees: [0, 4, 7, 10, 14, 18, 22],
  },
  major: {
    name: "Major",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 5, 7, 9, 11],
  },
  majorPentatonic: {
    name: "Major Pentatonic",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 7, 9],
  },
  marva: {
    name: "Marva",
    pitchesPerOctave: 12,
    degrees: [0, 1, 4, 6, 7, 9, 11],
  },
  melodicMajor: {
    name: "Melodic Major",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 5, 7, 8, 10],
  },
  melodicMinor: {
    name: "Melodic Minor",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 5, 7, 9, 11],
  },
  melodicMinorDesc: {
    name: "Melodic Minor Descending",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 5, 7, 8, 10],
  },
  minor: {
    name: "Natural Minor",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 5, 7, 8, 10],
  },
  minorPentatonic: {
    name: "Minor Pentatonic",
    pitchesPerOctave: 12,
    degrees: [0, 3, 5, 7, 10],
  },
  mixolydian: {
    name: "Mixolydian",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 5, 7, 9, 10],
  },
  murassah: {
    name: "Murassah",
    pitchesPerOctave: 24,
    degrees: [0, 4, 6, 10, 12, 18, 20],
  },
  mustar: {
    name: "Mustar",
    pitchesPerOctave: 24,
    degrees: [0, 5, 7, 11, 13, 17, 21],
  },
  nahawand: {
    name: "Nahawand",
    pitchesPerOctave: 24,
    degrees: [0, 4, 6, 10, 14, 16, 22],
  },
  nahawandDesc: {
    name: "Nahawand Descending",
    pitchesPerOctave: 24,
    degrees: [0, 4, 6, 10, 14, 16, 20],
  },
  nairuz: {
    name: "Nairuz",
    pitchesPerOctave: 24,
    degrees: [0, 4, 7, 10, 14, 17, 20],
  },
  nawaAthar: {
    name: "Nawa Athar",
    pitchesPerOctave: 24,
    degrees: [0, 4, 6, 12, 14, 16, 22],
  },
  neapolitanMajor: {
    name: "Neapolitan Major",
    pitchesPerOctave: 12,
    degrees: [0, 1, 3, 5, 7, 9, 11],
  },
  neapolitanMinor: {
    name: "Neapolitan Minor",
    pitchesPerOctave: 12,
    degrees: [0, 1, 3, 5, 7, 8, 11],
  },
  nikriz: {
    name: "Nikriz",
    pitchesPerOctave: 24,
    degrees: [0, 4, 6, 12, 14, 18, 20],
  },
  partch_o1: {
    name: "Partch Otonality 1",
    pitchesPerOctave: 43,
    degrees: [0, 8, 14, 20, 25, 34],
  },
  partch_o2: {
    name: "Partch Otonality 2",
    pitchesPerOctave: 43,
    degrees: [0, 7, 13, 18, 27, 35],
  },
  partch_o3: {
    name: "Partch Otonality 3",
    pitchesPerOctave: 43,
    degrees: [0, 6, 12, 21, 29, 36],
  },
  partch_o4: {
    name: "Partch Otonality 4",
    pitchesPerOctave: 43,
    degrees: [0, 5, 15, 23, 30, 37],
  },
  partch_o5: {
    name: "Partch Otonality 5",
    pitchesPerOctave: 43,
    degrees: [0, 10, 18, 25, 31, 38],
  },
  partch_o6: {
    name: "Partch Otonality 6",
    pitchesPerOctave: 43,
    degrees: [0, 9, 16, 22, 28, 33],
  },
  partch_u1: {
    name: "Partch Utonality 1",
    pitchesPerOctave: 43,
    degrees: [0, 9, 18, 23, 29, 35],
  },
  partch_u2: {
    name: "Partch Utonality 2",
    pitchesPerOctave: 43,
    degrees: [0, 8, 16, 25, 30, 36],
  },
  partch_u3: {
    name: "Partch Utonality 3",
    pitchesPerOctave: 43,
    degrees: [0, 7, 14, 22, 31, 37],
  },
  partch_u4: {
    name: "Partch Utonality 4",
    pitchesPerOctave: 43,
    degrees: [0, 6, 13, 20, 28, 38],
  },
  partch_u5: {
    name: "Partch Utonality 5",
    pitchesPerOctave: 43,
    degrees: [0, 5, 12, 18, 25, 33],
  },
  partch_u6: {
    name: "Partch Utonality 6",
    pitchesPerOctave: 43,
    degrees: [0, 10, 15, 21, 27, 34],
  },
  pelog: {
    name: "Pelog",
    pitchesPerOctave: 12,
    degrees: [0, 1, 3, 7, 8],
  },
  phrygian: {
    name: "Phrygian",
    pitchesPerOctave: 12,
    degrees: [0, 1, 3, 5, 7, 8, 10],
  },
  prometheus: {
    name: "Prometheus",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 6, 11],
  },
  purvi: {
    name: "Purvi",
    pitchesPerOctave: 12,
    degrees: [0, 1, 4, 6, 7, 8, 11],
  },
  rast: {
    name: "Rast",
    pitchesPerOctave: 24,
    degrees: [0, 4, 7, 10, 14, 18, 21],
  },
  rastDesc: {
    name: "Rast Descending",
    pitchesPerOctave: 24,
    degrees: [0, 4, 7, 10, 14, 18, 20],
  },
  ritusen: {
    name: "Ritusen",
    pitchesPerOctave: 12,
    degrees: [0, 2, 5, 7, 9],
  },
  romanianMinor: {
    name: "Romanian Minor",
    pitchesPerOctave: 12,
    degrees: [0, 2, 3, 6, 7, 9, 10],
  },
  ryukyu: {
    name: "Ryukyu",
    pitchesPerOctave: 12,
    degrees: [0, 4, 5, 7, 11],
  },
  saba: {
    name: "Saba",
    pitchesPerOctave: 24,
    degrees: [0, 3, 6, 8, 12, 16, 20],
  },
  scriabin: {
    name: "Scriabin",
    pitchesPerOctave: 12,
    degrees: [0, 1, 4, 7, 9],
  },
  shang: {
    name: "Shang",
    pitchesPerOctave: 12,
    degrees: [0, 2, 5, 7, 10],
  },
  shawqAfza: {
    name: "Shawq Afza",
    pitchesPerOctave: 24,
    degrees: [0, 4, 8, 10, 14, 16, 22],
  },
  sikah: {
    name: "Sikah",
    pitchesPerOctave: 24,
    degrees: [0, 3, 7, 11, 14, 17, 21],
  },
  sikahDesc: {
    name: "Sikah Descending",
    pitchesPerOctave: 24,
    degrees: [0, 3, 7, 11, 13, 17, 21],
  },
  spanish: {
    name: "Spanish",
    pitchesPerOctave: 12,
    degrees: [0, 1, 4, 5, 7, 8, 10],
  },
  superLocrian: {
    name: "Super Locrian",
    pitchesPerOctave: 12,
    degrees: [0, 1, 3, 4, 6, 8, 10],
  },
  suznak: {
    name: "Suznak",
    pitchesPerOctave: 24,
    degrees: [0, 4, 7, 10, 14, 16, 22],
  },
  todi: {
    name: "Todi",
    pitchesPerOctave: 12,
    degrees: [0, 1, 3, 6, 7, 8, 11],
  },
  ushaqMashri: {
    name: "Ushaq Mashri",
    pitchesPerOctave: 24,
    degrees: [0, 4, 6, 10, 14, 17, 21],
  },
  whole: {
    name: "Whole Tone",
    pitchesPerOctave: 12,
    degrees: [0, 2, 4, 6, 8, 10],
  },
  yakah: {
    name: "Yakah",
    pitchesPerOctave: 24,
    degrees: [0, 4, 7, 10, 14, 18, 21],
  },
  yakahDesc: {
    name: "Yakah Descending",
    pitchesPerOctave: 24,
    degrees: [0, 4, 7, 10, 14, 18, 20],
  },
  yu: {
    name: "Yu",
    pitchesPerOctave: 12,
    degrees: [0, 3, 5, 7, 10],
  },
  zamzam: {
    name: "Zamzam",
    pitchesPerOctave: 24,
    degrees: [0, 2, 6, 8, 14, 16, 20],
  },
  zanjaran: {
    name: "Zanjaran",
    pitchesPerOctave: 24,
    degrees: [0, 2, 8, 10, 14, 18, 20],
  },
  zhi: {
    name: "Zhi",
    pitchesPerOctave: 12,
    degrees: [0, 2, 5, 7, 9],
  },
};

for (const scale of Object.values(scales)) {
  Object.freeze(scale.degrees);
  Object.freeze(scale);
}
Object.freeze(scales);
