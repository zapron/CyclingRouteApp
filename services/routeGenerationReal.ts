// services/routeGenerationReal.ts
import { getRouteFromMapbox, Route } from "./directionsService";
import { LatLng } from "../utils/routeGenerationTypes";
import { computeDestinationPoint } from "./computeDestinationPoint";

/**
 * getCircuitRouteOfExactDistance
 * Generates a circuit route in the specified bearing direction,
 * trying to match targetDistance via iterative approach.
 */
export async function getCircuitRouteOfExactDistance(
  origin: LatLng,
  targetDistance: number,
  bearing: number // <--- new parameter
): Promise<Route> {
  let factor = 0.5;
  let iterations = 0;
  let bestRoute: Route | null = null;

  while (iterations < 10) {
    const guessDistance = targetDistance * factor;
    const guessedDestination = computeDestinationPoint(
      origin,
      guessDistance,
      bearing
    );

    try {
      // Outbound route
      const outbound = await getRouteFromMapbox(origin, guessedDestination);
      // Return route
      const inbound = await getRouteFromMapbox(guessedDestination, origin);

      const combinedDistance = outbound.distance + inbound.distance;
      const combinedDuration = outbound.duration + inbound.duration;

      // Combine coordinates for a full loop
      const combinedCoordinates = [
        ...outbound.coordinates,
        ...inbound.coordinates.slice(1), // skip the first inbound coord to avoid duplication
      ];

      // If we're within ~100m, we call it good
      if (Math.abs(combinedDistance - targetDistance) < 100) {
        return {
          coordinates: combinedCoordinates,
          outboundCoords: outbound.coordinates,
          inboundCoords: inbound.coordinates.slice(1),
          distance: combinedDistance,
          duration: combinedDuration,
        };
      }

      // Adjust factor
      if (combinedDistance < targetDistance) {
        factor *= 1.1;
      } else {
        factor *= 0.9;
      }

      bestRoute = {
        coordinates: combinedCoordinates,
        outboundCoords: outbound.coordinates,
        inboundCoords: inbound.coordinates.slice(1),
        distance: combinedDistance,
        duration: combinedDuration,
      };
    } catch (error) {
      throw error;
    }
    iterations++;
  }

  if (bestRoute) {
    return bestRoute;
  }
  throw new Error("Unable to generate a route of the desired distance");
}

export const DIRECTIONS = [
  { bearing: 0, label: "North" },
  { bearing: 90, label: "East" },
  { bearing: 180, label: "South" },
  { bearing: 270, label: "West" },
];

// services/routeGenerationReal.ts
export async function getMultipleCircuitRoutes(
  origin: LatLng,
  targetDistance: number
): Promise<{ route: Route; label: string }[]> {
  const routePromises = DIRECTIONS.map(async (dir) => {
    try {
      const route = await getCircuitRouteOfExactDistance(
        origin,
        targetDistance,
        dir.bearing
      );
      return { route, label: dir.label };
    } catch (err) {
      console.error(`Bearing ${dir.bearing} failed:`, err);
      return null;
    }
  });

  const results = await Promise.all(routePromises);

  return results.filter((item) => item !== null) as {
    route: Route;
    label: string;
  }[];
}
