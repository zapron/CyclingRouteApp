// services/directionsService.ts
// You can define this type as:
// export interface LatLng {
//   latitude: number;
//   longitude: number;
// }

import { LatLng } from "../utils/routeGenerationTypes";
import polyline from "@mapbox/polyline";

export interface Route {
  coordinates: LatLng[]; // Decoded route coordinates
  distance: number; // Total distance in meters
  duration: number; // Duration in seconds
}

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoicmFrdGltMjQiLCJhIjoiY203cXVlaTcxMHFjYzJqcXkzYTd0cmJ6byJ9.HPJdyM2vL5JLGLqlc8rF8A";

export async function getRouteFromMapbox(
  origin: LatLng,
  destination: LatLng
): Promise<Route> {
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=polyline&access_token=${MAPBOX_ACCESS_TOKEN}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No routes found");
  }

  const routeData = data.routes[0];
  const coordinates = polyline
    .decode(routeData.geometry)
    .map(([lat, lng]: [number, number]) => ({
      latitude: lat,
      longitude: lng,
    }));

  return {
    coordinates,
    distance: routeData.distance,
    duration: routeData.duration,
  };
}
