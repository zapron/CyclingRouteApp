// global.d.ts (or mapbox-polyline.d.ts)
declare module "@mapbox/polyline" {
  export function decode(
    polyline: string,
    precision?: number
  ): [number, number][];
  export function encode(
    coordinates: [number, number][],
    precision?: number
  ): string;
}
