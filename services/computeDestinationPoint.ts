// services/computeDestinationPoint.ts
import { LatLng } from "../utils/routeGenerationTypes";

export function computeDestinationPoint(
  origin: LatLng,
  distance: number,
  bearing: number
): LatLng {
  const R = 6371000; // Earth’s radius in meters
  const bearingRad = (bearing * Math.PI) / 180;
  const lat1 = (origin.latitude * Math.PI) / 180;
  const lon1 = (origin.longitude * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
      Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearingRad)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1),
      Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lon2 * 180) / Math.PI,
  };
}
