export const visualizations = Object.freeze({ bar: "Bars", flat: "Trajectories" } as const);

export type VisualizationType = keyof typeof visualizations;
