import { LatLng } from "../utils/routeGenerationTypes";
import { getRouteFromMapbox, Route } from "./directionsService";
import { computeDestinationPoint } from "./computeDestinationPoint"; // same helper as before

export async function getCircuitRouteOfExactDistance(
  origin: LatLng,
  targetDistance: number
): Promise<Route> {
  let factor = 0.5;
  let iterations = 0;
  let bestRoute: Route | null = null;

  while (iterations < 10) {
    const guessDistance = targetDistance * factor;
    // For variety, you could pick a random bearing each iteration. For now, let's do 0° (north).
    const guessedDestination = computeDestinationPoint(
      origin,
      guessDistance,
      0
    );

    try {
      // 1) Outbound route
      const outbound = await getRouteFromMapbox(origin, guessedDestination);
      // 2) Return route
      const inbound = await getRouteFromMapbox(guessedDestination, origin);

      // Combine them into a single route object
      const combinedDistance = outbound.distance + inbound.distance; // total meters
      const combinedCoordinates = [
        ...outbound.coordinates,
        // omit the last coordinate so we don't duplicate the guessedDestination marker
        ...inbound.coordinates.slice(1),
      ];

      // We'll consider the entire route's distance for iteration
      if (Math.abs(combinedDistance - targetDistance) < 100) {
        // If within 100m, let's call it good
        return {
          coordinates: combinedCoordinates,
          distance: combinedDistance,
          duration: outbound.duration + inbound.duration,
        };
      }

      // Adjust factor based on whether we need a longer or shorter route
      if (combinedDistance < targetDistance) {
        factor *= 1.1;
      } else {
        factor *= 0.9;
      }

      // Keep track of the best route so far
      bestRoute = {
        coordinates: combinedCoordinates,
        distance: combinedDistance,
        duration: outbound.duration + inbound.duration,
      };
    } catch (error) {
      throw error;
    }
    iterations++;
  }

  // If we exit the loop, return the best we have
  if (bestRoute) {
    return bestRoute;
  }
  throw new Error("Unable to generate a route of the desired distance");
}
