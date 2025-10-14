import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert } from "react-native";
import { playBackground, playCountdown, stopAllSounds, playGameOver } from "./MusicPlayer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const STORAGE_KEY = "NumberRushUserData";

export default function GameScreen({ onExit, difficulty, currentUser }) {
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(15);
  const [targetNumbers, setTargetNumbers] = useState([]);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(true);
  const [preCountdown, setPreCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [bgColor] = useState(new Animated.Value(1));

  const timerRef = useRef(null);
  const preCountRef = useRef(null);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(preCountRef.current);
      stopAllSounds();
    };
  }, []);

  // pre-game countdown
  useEffect(() => {
    if (preCountdown > 0) {
      preCountRef.current = setTimeout(() => setPreCountdown((p) => p - 1), 1000);
    } else if (isCountingDown) {
      setIsCountingDown(false);
      startGame(1, false);
    }
    return () => clearTimeout(preCountRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preCountdown]);

  // game timer
  useEffect(() => {
    if (isCountingDown || gameOver) return;
    if (time <= 0) {
      handleGameOver();
      return;
    }
    timerRef.current = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [time, isCountingDown, gameOver]);

  // STORAGE HELPERS
  async function saveScoreForCurrentUser(username, value) {
    if (!username) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      if (!data[username]) {
        // if user somehow missing, create entry
        data[username] = { password: "", scores: [] };
      }
      data[username].scores = data[username].scores || [];
      data[username].scores.push({ value, date: new Date().toISOString() });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to save score:", err);
    }
  }

  function computeTimeForLevel(lvl) {
    if (difficulty === "easy") {
      return Math.max(60 - (lvl - 1) * 2, 5);
    } else if (difficulty === "normal") {
      return Math.max(30 - (lvl - 1) * 2, 5);
    } else {
      // hard: keep previous behavior similar to original (approx)
      const difficultyFactor = difficulty === "hard" ? -2 : 0;
      const t = 15 - lvl + difficultyFactor;
      return t > 5 ? t : 5;
    }
  }

  function computeChoicesCount(lvl) {
    return 10 + (lvl - 1) * 2;
  }

  async function startGame(lvl, playPreCountdown = true) {
    clearTimeout(timerRef.current);
    clearTimeout(preCountRef.current);
    await stopAllSounds();
    if (playPreCountdown) await playCountdown();
    await playBackground(lvl);

    setLevel(lvl);
    setTime(computeTimeForLevel(lvl));
    generateNumbers(lvl);
    animateBackground(lvl);
    setPicked([]);
    setGameOver(false);
    setScore(0);
  }

  function generateNumbers(lvl) {
    const numToPick = 5;
    const totalChoices = computeChoicesCount(lvl);
    const numbers = Array.from({ length: totalChoices }, () => Math.floor(Math.random() * 100) + 1);
    const targets = [...numbers].sort(() => Math.random() - 0.5).slice(0, numToPick).sort((a, b) => a - b);
    setChoices(numbers);
    setTargetNumbers(targets);
    setPicked([]);
  }

  function animateBackground(lvl) {
    Animated.timing(bgColor, {
      toValue: Math.min(Math.max(lvl, 1), 10),
      duration: 400,
      useNativeDriver: false,
    }).start();
  }

  function handlePress(num) {
    if (gameOver || isCountingDown) return;

    const nextTarget = targetNumbers[picked.length];
    if (num === nextTarget) {
      const newPicked = [...picked, num];
      setPicked(newPicked);
      setScore((s) => s + 10);

      if (newPicked.length === targetNumbers.length) {
        // finished level
        if (level === 10) {
          handleGameOver();
        } else {
          // advance level: keep score but reset timer based on next level
          setLevel((lv) => {
            const nextLevel = lv + 1;
            startGame(nextLevel, false);
            return nextLevel;
          });
        }
      }
    } else {
      handleGameOver();
    }
  }

  async function handleGameOver() {
    clearTimeout(timerRef.current);
    clearTimeout(preCountRef.current);
    await stopAllSounds();
    await playGameOver();
    setGameOver(true);

    // save to storage for leaderboard/dashboard
    try {
      await saveScoreForCurrentUser(currentUser, score);
    } catch (err) {
      console.warn("Error saving score on game over:", err);
    }
  }

  if (gameOver) {
    return (
      <View style={styles.center}>
        <Text style={styles.overText}>GAME OVER</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <TouchableOpacity style={styles.quitButton} onPress={() => onExit()}>
          <Text style={styles.quitText}>Return to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const NUM_COLUMNS = Math.min(4, Math.ceil(Math.sqrt(choices.length || 10)));
  const buttonSize = (width - NUM_COLUMNS * 20) / NUM_COLUMNS;

  const bgInterpolate = bgColor.interpolate({
    inputRange: [1, 10],
    outputRange: ["#1E90FF", "#FF4500"],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgInterpolate }]}>
      {isCountingDown ? (
        <View style={styles.center}>
          <Text style={styles.countdownText}>{preCountdown > 0 ? preCountdown : "GO!"}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.header}>Level {level}</Text>
          <Text style={styles.timer}>⏱ {time}s</Text>
          <Text style={styles.scoreText}>⭐ {score}</Text>

          <View style={{ marginVertical: 10 }}>
            <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>Arrange:</Text>
            <Text style={{ color: "yellow", fontSize: 22, textAlign: "center" }}>
              {targetNumbers.join(", ")}
            </Text>
          </View>

          <View style={styles.grid}>
            {choices.map((num, index) => (
              <TouchableOpacity
                key={`${index}-${num}`}
                style={[
                  styles.numButton,
                  { width: buttonSize, height: buttonSize },
                  picked.includes(num) && styles.numPicked,
                ]}
                onPress={() => handlePress(num)}
              >
                <Text style={styles.numText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.quitButton, { width: width * 0.9 }]} onPress={handleGameOver}>
            <Text style={styles.quitText}>QUIT</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  numButton: {
    backgroundColor: "#333",
    margin: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  numPicked: { backgroundColor: "green" },
  numText: { color: "white", fontSize: 26, fontWeight: "bold" },
  header: { fontSize: 28, fontWeight: "bold", color: "white" },
  timer: { color: "white", fontSize: 20, marginVertical: 5 },
  countdownText: { color: "white", fontSize: 80, fontWeight: "bold" },
  overText: { fontSize: 40, color: "red", fontWeight: "bold" },
  scoreText: { fontSize: 22, color: "#FFD700", marginVertical: 5 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  quitButton: {
    marginTop: 20,
    backgroundColor: "red",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  quitText: { color: "white", fontSize: 20, fontWeight: "bold" },
});
