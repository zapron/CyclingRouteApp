// services/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedRoute {
  id: string; // a unique identifier (e.g., generated using uuid)
  distance: number; // in meters
  createdAt: string; // ISO date string
  coordinates: { latitude: number; longitude: number }[]; // the full route polyline
}

const ROUTE_HISTORY_KEY = "ROUTE_HISTORY";

export async function saveRoute(route: SavedRoute): Promise<void> {
  try {
    const existingRoutesStr = await AsyncStorage.getItem(ROUTE_HISTORY_KEY);
    const existingRoutes: SavedRoute[] = existingRoutesStr
      ? JSON.parse(existingRoutesStr)
      : [];
    existingRoutes.push(route);
    await AsyncStorage.setItem(
      ROUTE_HISTORY_KEY,
      JSON.stringify(existingRoutes)
    );
  } catch (error) {
    console.error("Error saving route:", error);
  }
}

export async function getAllRoutes(): Promise<SavedRoute[]> {
  try {
    const routesStr = await AsyncStorage.getItem(ROUTE_HISTORY_KEY);
    return routesStr ? JSON.parse(routesStr) : [];
  } catch (error) {
    console.error("Error retrieving routes:", error);
    return [];
  }
}

export async function clearAllRoutes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ROUTE_HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing routes:", error);
  }
}
