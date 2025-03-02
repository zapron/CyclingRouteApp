// In MapScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Button,
  Text,
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import * as Location from "expo-location";
import { getCircuitRouteOfExactDistance } from "../services/routeGenerationReal";
import { v4 as uuidv4 } from "uuid";
import { LatLng } from "../utils/routeGenerationTypes";
import { saveRoute } from "../services/storage";

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // For route generation
  const [distance, setDistance] = useState("5"); // default 5 km
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(
    null
  );
  const [outboundCoordinates, setOutboundCoordinates] = useState<LatLng[]>([]);
  const [inboundCoordinates, setInboundCoordinates] = useState<LatLng[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoading(false);
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoading(false);
    })();
  }, []);

  const handleGenerateRoute = async () => {
    if (!location) return;
    const distanceInKm = parseFloat(distance);
    if (isNaN(distanceInKm) || distanceInKm <= 0) {
      alert("Please enter a valid distance in km.");
      return;
    }
    const targetDistanceInMeters = distanceInKm * 1000;
    const startPoint: LatLng = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    try {
      const route = await getCircuitRouteOfExactDistance(
        startPoint,
        targetDistanceInMeters
      );
      // Our route comes decoded as coordinates already

      const fullRouteCoordinates = [
        ...route.outboundCoords,
        ...route.inboundCoords,
      ];
      setOutboundCoordinates(route.outboundCoords);
      setInboundCoordinates(route.inboundCoords);
      setEstimatedDistance(route.distance);

      const newSavedRoute = {
        id: uuidv4(),
        distance: route.distance,
        createdAt: new Date().toISOString(),
        coordinates: fullRouteCoordinates,
      };

      await saveRoute(newSavedRoute);
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.loaderContainer}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region && (
        <>
          <View style={styles.controls}>
            <Text>Distance (km):</Text>
            <TextInput
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
            />
            {estimatedDistance !== null && (
              <Text style={{ marginVertical: 5 }}>
                Estimated Distance: {(estimatedDistance / 1000).toFixed(2)} km
              </Text>
            )}
            <Button
              title="Generate Circuit Route"
              onPress={handleGenerateRoute}
            />
          </View>
          <MapView
            style={styles.map}
            initialRegion={region}
            showsUserLocation
            onRegionChangeComplete={(reg) => setRegion(reg)}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="You are here"
              />
            )}
            {outboundCoordinates.length > 1 && (
              <Polyline
                coordinates={outboundCoordinates}
                strokeColor="blue"
                strokeWidth={3}
              />
            )}
            {inboundCoordinates.length > 1 && (
              <Polyline
                coordinates={inboundCoordinates}
                strokeColor="red"
                strokeWidth={3}
              />
            )}
          </MapView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  controls: {
    position: "absolute",
    top: 10,
    left: 10,
    width: "80%",
    backgroundColor: "white",
    padding: 10,
    zIndex: 999,
    borderRadius: 5,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    marginVertical: 5,
    paddingHorizontal: 8,
    height: 40,
  },
});
