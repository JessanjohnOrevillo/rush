import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { playBackground, stopAllSounds } from "./MusicPlayer";

export default function MenuScreen({ onStart, onLogout, onDashboard, onLeaderboard, currentUser }) {
  const [difficulty, setDifficulty] = useState("normal");

  useEffect(() => {
    playBackground(1);
    return () => stopAllSounds();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NUMBER RUSH</Text>

      {currentUser ? <Text style={styles.welcome}>Welcome, {currentUser}</Text> : null}

      <Text style={styles.instructionTitle}>How to Play:</Text>
      <Text style={styles.instructions}>
        Tap the numbers in ascending order before the timer runs out!
        {"\n"}Each level has less time and more numbers.
        {"\n"}Be careful—one wrong tap and it’s Game Over!
      </Text>

      <Text style={styles.label}>Select Difficulty:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={difficulty}
          onValueChange={(value) => setDifficulty(value)}
          style={styles.picker}
          itemStyle={{ fontSize: 18 }}
        >
          <Picker.Item label="Easy" value="easy" />
          <Picker.Item label="Normal" value="normal" />
          <Picker.Item label="Hard" value="hard" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={() => onStart(difficulty)}>
        <Text style={styles.startBtnText}>Start Game ({difficulty.toUpperCase()})</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity style={styles.navBtn} onPress={onDashboard}>
          <Text style={styles.navText}>📊 Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={onLeaderboard}>
          <Text style={styles.navText}>🏆 Leaderboard</Text>
        </TouchableOpacity>
      </View>

      {onLogout && (
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#00FFAA",
    marginBottom: 6,
  },
  welcome: {
    color: "#FFD700",
    marginBottom: 12,
    fontSize: 16,
  },
  instructionTitle: {
    fontSize: 20,
    color: "white",
    marginBottom: 5,
  },
  instructions: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    marginBottom: 5,
    fontSize: 18,
  },
  pickerContainer: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    width: "100%",
    height: 50,
  },
  startBtn: {
    backgroundColor: "#00FFA5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    shadowColor: "#00FFA5",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  startBtnText: {
    color: "#001",
    fontWeight: "bold",
    fontSize: 18,
  },
  row: {
    flexDirection: "row",
    marginTop: 14,
  },
  navBtn: {
    backgroundColor: "#222",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  navText: {
    color: "#fff",
    fontWeight: "600",
  },
  logoutBtn: {
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: "#ccc",
  },
});
