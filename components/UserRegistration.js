import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "NumberRushUserData";

export default function UserRegistration({ onRegistered, onCancel }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    if (!username.trim() || !password) {
      Alert.alert("Error", "Please enter username and password.");
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};

      if (data[username]) {
        Alert.alert("Error", "Username already exists. Choose another.");
        return;
      }

      data[username] = { password, scores: [] }; // plaintext for demo
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      Alert.alert("Success", "Account created. You can now log in.", [
        { text: "OK", onPress: () => onRegistered && onRegistered() },
      ]);
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to register. Try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Username"
        placeholderTextColor="#888"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btnPrimary} onPress={register}>
        <Text style={styles.btnText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => onCancel && onCancel()}>
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { color: "#00FFAA", fontSize: 30, fontWeight: "bold", marginBottom: 24 },
  input: {
    width: "100%",
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 10,
    color: "#fff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  btnPrimary: {
    width: "100%",
    padding: 14,
    backgroundColor: "#00FFA5",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#00FFA5",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  btnText: { color: "#001", fontWeight: "bold", fontSize: 18 },
  link: { marginTop: 12 },
  linkText: { color: "#ccc" },
});
