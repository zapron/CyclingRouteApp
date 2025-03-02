import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import * as Location from "expo-location";
import { getMultipleCircuitRoutes } from "../services/routeGenerationReal";
import { Route } from "../services/directionsService";
import { LatLng } from "../utils/routeGenerationTypes";

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [distance, setDistance] = useState("5"); // user input
  const [routeOptions, setRouteOptions] = useState<
    { route: Route; label: string }[]
  >([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(
    null
  );

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

  const handleGenerateMultipleRoutes = async () => {
    if (!location) return;
    const distanceInKm = parseFloat(distance);
    if (isNaN(distanceInKm) || distanceInKm <= 0) {
      alert("Please enter a valid distance in km.");
      return;
    }
    setIsCalculating(true);
    const targetDistanceInMeters = distanceInKm * 1000;
    const startPoint: LatLng = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    try {
      const results = await getMultipleCircuitRoutes(
        startPoint,
        targetDistanceInMeters
      );
      setRouteOptions(results);
      setSelectedRouteIndex(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCalculating(false); // <--- End loading animation
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

            {selectedRouteIndex !== null && (
              <>
                <Polyline
                  coordinates={
                    routeOptions[selectedRouteIndex].route.outboundCoords
                  }
                  strokeColor="blue"
                  strokeWidth={3}
                />
                <Polyline
                  coordinates={
                    routeOptions[selectedRouteIndex].route.inboundCoords
                  }
                  strokeColor="red"
                  strokeWidth={3}
                />
              </>
            )}
          </MapView>

          {/* BOTTOM PANEL */}
          <View style={styles.bottomPanel}>
            <Text style={styles.label}>Distance (km):</Text>
            <TextInput
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateMultipleRoutes}
            >
              <Text style={styles.generateButtonText}>
                GENERATE CIRCUIT ROUTE
              </Text>
            </TouchableOpacity>

            {/* If we have multiple routes, display them in a row (or wrap) */}
            {routeOptions.length > 0 && (
              <View style={styles.routesRow}>
                {routeOptions.map((obj, index) => {
                  const { route, label } = obj;
                  const isSelected = selectedRouteIndex === index;
                  const distanceKm = (route.distance / 1000).toFixed(2);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.routeOptionButton,
                        isSelected && styles.routeOptionButtonSelected,
                      ]}
                      onPress={() => setSelectedRouteIndex(index)}
                    >
                      <Text style={styles.routeOptionButtonText}>
                        {label.toUpperCase()} - {distanceKm} KM
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
          {isCalculating && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.overlayText}>Calculating routes...</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Bottom panel container */
  bottomPanel: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    // For Android shadow:
    elevation: 5,
    // For iOS shadow:
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    height: 40,
    borderRadius: 5,
  },
  generateButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  generateButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  routesRow: {
    flexDirection: "row",
    flexWrap: "wrap", // allows buttons to wrap to the next line
    justifyContent: "center",
  },
  routeOptionButton: {
    backgroundColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  routeOptionButtonSelected: {
    backgroundColor: "orange",
  },
  routeOptionButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // ensure it's on top
  },
  overlayText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
