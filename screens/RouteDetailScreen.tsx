// screens/RouteDetailScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { RouteProp } from "@react-navigation/native";
import { SavedRoute } from "../services/storage";

type RootStackParamList = {
  RouteDetail: { route: SavedRoute };
};

type RouteDetailScreenRouteProp = RouteProp<RootStackParamList, "RouteDetail">;

interface Props {
  route: RouteDetailScreenRouteProp;
}

const RouteDetailScreen: React.FC<Props> = ({ route }) => {
  const savedRoute = route.params.route;

  // Use the first coordinate as the initial region
  const initialRegion = {
    latitude: savedRoute.coordinates[0].latitude,
    longitude: savedRoute.coordinates[0].longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        <Polyline
          coordinates={savedRoute.coordinates}
          strokeColor="blue"
          strokeWidth={3}
        />
        <Marker coordinate={savedRoute.coordinates[0]} title="Start" />
      </MapView>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>
          Distance: {(savedRoute.distance / 1000).toFixed(2)} km
        </Text>
        <Text style={styles.detailText}>
          Date: {new Date(savedRoute.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.detailText}>
          Points: {savedRoute.coordinates.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  detailsContainer: { padding: 16, backgroundColor: "#fff" },
  detailText: { fontSize: 16, marginBottom: 8 },
});

export default RouteDetailScreen;
