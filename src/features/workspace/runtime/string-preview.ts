// A schematic plucked tone, not a simulation or recording of Timbre's noise-based
// pluck generator. Higher harmonics fade faster, leaving a decaying fundamental.
export function getStringPreviewSamples() {
  return Array.from({ length: 301 }, (_, index) => {
    const time = index / 300;
    const phase = time * Math.PI * 2 * 6;
    return (
      (Math.sin(phase) * Math.exp(-2.5 * time) +
        0.35 * Math.sin(phase * 2) * Math.exp(-5 * time) +
        0.15 * Math.sin(phase * 3) * Math.exp(-8 * time)) /
      1.5
    );
  });
}

export function drawStringPreview(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const samples = getStringPreviewSamples();
  context.save();
  context.strokeStyle = "#087ca7";
  context.lineWidth = 2;
  context.beginPath();
  samples.forEach((sample, index) => {
    const x = (index / (samples.length - 1)) * canvas.width;
    const y = canvas.height / 2 - sample * canvas.height * 0.45;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();
  context.restore();
}
