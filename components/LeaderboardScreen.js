import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "NumberRushUserData";

export default function LeaderboardScreen({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]); // { username, value, date }

  useEffect(() => {
    let mounted = true;
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : {};
        const allEntries = [];
        Object.keys(data).forEach((username) => {
          const user = data[username];
          if (user.scores && user.scores.length) {
            user.scores.forEach((s) => {
              allEntries.push({ username, value: s.value, date: s.date });
            });
          }
        });
        // sort descending
        allEntries.sort((a, b) => b.value - a.value);
        if (mounted) setEntries(allEntries);
      } catch (err) {
        console.warn("Failed to load leaderboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadLeaderboard();
    return () => (mounted = false);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : entries.length === 0 ? (
        <Text style={styles.empty}>No scores yet. Play a game to add your score!</Text>
      ) : (
        <FlatList
          style={{ width: "100%", marginTop: 12 }}
          data={entries}
          keyExtractor={(item, idx) => `${item.username}-${item.value}-${idx}`}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>{index + 1}.</Text>
              <View style={styles.rowRight}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.score}>{item.value}</Text>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    padding: 24,
  },
  title: { color: "#00FFAA", fontSize: 28, fontWeight: "bold", marginTop: 12 },
  empty: { color: "#ccc", marginTop: 20, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#111",
    borderRadius: 8,
    marginVertical: 6,
  },
  rank: { color: "#FFD700", fontWeight: "700", width: 30 },
  rowRight: { flexDirection: "row", justifyContent: "space-between", flex: 1 },
  username: { color: "#fff", fontWeight: "600" },
  score: { color: "#00FFA5", fontWeight: "700" },
  backBtn: { marginTop: 20, alignItems: "center" },
  backText: { color: "#ccc" },
});
