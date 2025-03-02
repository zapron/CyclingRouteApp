// services/routeGenerationReal.ts
import { Route, getRouteFromMapbox } from "./directionsService";
// or wherever you define Route
import { computeDestinationPoint } from "./computeDestinationPoint";
import { LatLng } from "../utils/routeGenerationTypes";

export async function getCircuitRouteOfExactDistance(
  origin: LatLng,
  targetDistance: number
): Promise<Route> {
  let factor = 0.5;
  let iterations = 0;
  let bestRoute: Route | null = null;

  while (iterations < 10) {
    const guessDistance = targetDistance * factor;
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

      const combinedDistance = outbound.distance + inbound.distance;
      const combinedDuration = outbound.duration + inbound.duration;

      // Build a Route object with separate arrays
      const route: Route = {
        outboundCoords: outbound.coordinates,
        // remove the first coordinate from inbound to avoid duplication at the guessedDestination
        inboundCoords: inbound.coordinates.slice(1),
        distance: combinedDistance,
        duration: combinedDuration,
        coordinates: [],
      };

      if (Math.abs(combinedDistance - targetDistance) < 100) {
        return route;
      }

      // Adjust factor
      if (combinedDistance < targetDistance) {
        factor *= 1.1;
      } else {
        factor *= 0.9;
      }
      bestRoute = route;
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
