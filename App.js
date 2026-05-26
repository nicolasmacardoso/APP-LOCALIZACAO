import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as SQLite from "expo-sqlite";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  List,
  MD3LightTheme as DefaultTheme,
  PaperProvider,
  Switch,
  Text,
} from "react-native-paper";

import myColors from "./assets/colors.json";
import myColorsDark from "./assets/colorsDark.json";

const DARK_MODE_KEY = "@my_location_dark_mode";
const DATABASE_NAME = "myLocation.sqlite";

const db = SQLite.openDatabaseSync(DATABASE_NAME);

async function createLocationTable() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export default function App() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  const theme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: isSwitchOn ? myColorsDark.colors : myColors.colors,
    }),
    [isSwitchOn],
  );

  async function loadDarkMode() {
    try {
      const savedDarkMode = await AsyncStorage.getItem(DARK_MODE_KEY);
      setIsSwitchOn(savedDarkMode === "true");
    } catch (error) {
      console.log("Erro ao carregar tema:", error);
    }
  }

  async function onToggleSwitch() {
    const nextValue = !isSwitchOn;

    setIsSwitchOn(nextValue);
    await AsyncStorage.setItem(DARK_MODE_KEY, String(nextValue));
  }

  async function loadLocations() {
    const rows = await db.getAllAsync(`
      SELECT
        id,
        latitude,
        longitude,
        created_at AS createdAt
      FROM locations
      ORDER BY id DESC;
    `);

    setLocations(rows);
  }

  async function getLocation() {
    try {
      setIsLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permissao negada",
          "Nao foi possivel capturar a localizacao sem permissao.",
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      const capturedAt = new Date().toISOString();

      await db.runAsync(
        `
          INSERT INTO locations (latitude, longitude, created_at)
          VALUES (?, ?, ?);
        `,
        [latitude, longitude, capturedAt],
      );

      await loadLocations();
    } catch (error) {
      console.log("Erro ao capturar localizacao:", error);
      Alert.alert(
        "Erro",
        "Nao foi possivel capturar e salvar a localizacao atual.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function initializeApp() {
    try {
      setIsLoading(true);
      await createLocationTable();
      await loadDarkMode();
      await loadLocations();
    } catch (error) {
      console.log("Erro ao iniciar app:", error);
      Alert.alert("Erro", "Nao foi possivel carregar os dados salvos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <View
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
      >
        <Appbar.Header>
          <Appbar.Content title="My Location" />
        </Appbar.Header>

        <View style={styles.content}>
          <View style={styles.containerDarkMode}>
            <Text>Dark Mode</Text>
            <Switch value={isSwitchOn} onValueChange={onToggleSwitch} />
          </View>

          <Button
            style={styles.containerButton}
            icon="map-marker-plus"
            mode="contained"
            loading={isLoading}
            disabled={isLoading}
            onPress={getLocation}
          >
            Capturar localizacao
          </Button>

          <FlatList
            style={styles.containerList}
            contentContainerStyle={styles.listContent}
            data={locations}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhuma localizacao capturada ainda.
              </Text>
            }
            renderItem={({ item }) => (
              <List.Item
                title={`Localizacao ${item.id}`}
                description={`Latitude: ${item.latitude.toFixed(6)} | Longitude: ${item.longitude.toFixed(6)}`}
              />
            )}
          />
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  containerDarkMode: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerButton: {
    margin: 10,
  },
  containerList: {
    flex: 1,
    margin: 10,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyText: {
    marginTop: 24,
    textAlign: "center",
  },
});
