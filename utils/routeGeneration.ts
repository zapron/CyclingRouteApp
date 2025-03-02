// utils/routeGeneration.ts
import {
  getGreatCircleBearing,
  computeDestinationPoint as getDestination,
  getDistance,
} from "geolib";

// We'll define an interface for LatLng
export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * generateCircularRoute
 * Creates a circular route around the start point (center) with a total length (distance).
 */
export function generateCircularRoute(
  center: LatLng,
  distanceInMeters: number,
  numPoints = 36
): LatLng[] {
  // The circumference of a circle is distanceInMeters.
  // => radius = circumference / (2 * π)
  const radius = distanceInMeters / (2 * Math.PI);

  const route: LatLng[] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (360 / numPoints) * i; // in degrees
    const destination = getDestination(
      center,
      radius, // distance from center
      angle
    );
    route.push({
      latitude: destination.latitude,
      longitude: destination.longitude,
    });
  }

  // Close the loop by adding the start point at the end
  route.push(route[0]);

  return route;
}

/**
 * generateExplorationRoute
 * Starts at center and ends anywhere else, matching the desired distance.
 */
export function generateExplorationRoute(
  start: LatLng,
  distanceInMeters: number,
  numPoints = 10
): LatLng[] {
  const route: LatLng[] = [start];
  const stepDistance = distanceInMeters / (numPoints - 1); // meters per segment

  let currentPoint = start;
  for (let i = 1; i < numPoints; i++) {
    // pick a random bearing each step
    const randomBearing = Math.random() * 360;
    const nextPoint = getDestination(currentPoint, stepDistance, randomBearing);
    route.push({
      latitude: nextPoint.latitude,
      longitude: nextPoint.longitude,
    });
    currentPoint = nextPoint;
  }

  return route;
}
