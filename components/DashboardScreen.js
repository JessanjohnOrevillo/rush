import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "NumberRushUserData";

export default function DashboardScreen({ onBack, onLeaderboard, onLogout, currentUser }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    highest: 0,
    gamesPlayed: 0,
    average: 0,
  });

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : {};
        const user = data[currentUser];
        if (user && user.scores && user.scores.length > 0) {
          const vals = user.scores.map((s) => s.value);
          const highest = Math.max(...vals);
          const gamesPlayed = vals.length;
          const average = Math.round((vals.reduce((a, b) => a + b, 0) / gamesPlayed) * 100) / 100;
          if (mounted) setStats({ highest, gamesPlayed, average });
        } else {
          if (mounted) setStats({ highest: 0, gamesPlayed: 0, average: 0 });
        }
      } catch (err) {
        console.warn("Failed to load dashboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadStats();
    return () => (mounted = false);
  }, [currentUser]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.label}>Player:</Text>
      <Text style={styles.value}>{currentUser || "—"}</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Highest Score</Text>
            <Text style={styles.statValue}>{stats.highest}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Games Played</Text>
            <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Score</Text>
            <Text style={styles.statValue}>{stats.average}</Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={onLeaderboard}>
            <Text style={styles.btnText}>View Leaderboard</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>Back to Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    padding: 24,
    alignItems: "center",
  },
  title: { color: "#00FFAA", fontSize: 28, fontWeight: "bold", marginTop: 24 },
  label: { color: "#ccc", marginTop: 18 },
  value: { color: "#fff", fontSize: 20, marginTop: 6 },
  statRow: {
    width: "100%",
    marginTop: 18,
    padding: 14,
    backgroundColor: "#111",
    borderRadius: 8,
  },
  statLabel: { color: "#888" },
  statValue: { color: "#fff", fontSize: 20, marginTop: 6 },
  btn: {
    marginTop: 20,
    width: "100%",
    padding: 14,
    backgroundColor: "#00FFA5",
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#001", fontWeight: "bold" },
  backBtn: { marginTop: 12 },
  backText: { color: "#ccc" },
  logoutBtn: { marginTop: 8 },
  logoutText: { color: "#ccc" },
});
