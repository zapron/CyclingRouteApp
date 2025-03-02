// screens/HistoryScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SavedRoute, getAllRoutes, clearAllRoutes } from "../services/storage";
import { useNavigation } from "@react-navigation/native";

export default function HistoryScreen() {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const all = await getAllRoutes();
    setRoutes(all);
  };

  const handleClear = async () => {
    await clearAllRoutes();
    setRoutes([]);
  };

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route History</Text>
      <Button title="Refresh" onPress={fetchRoutes} />
      <Button title="Clear All" onPress={handleClear} color="red" />
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.routeItem}
            onPress={() => navigation.navigate("RouteDetail", { route: item })}
          >
            <Text>Date: {new Date(item.createdAt).toLocaleString()}</Text>
            <Text>Distance: {(item.distance / 1000).toFixed(2)} km</Text>
            <Text>Points: {item.coordinates.length}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  routeItem: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
});
