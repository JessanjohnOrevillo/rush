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

export default function UserLogin({ onRegister, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    if (!username.trim() || !password) {
      Alert.alert("Error", "Please enter username and password.");
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};

      if (data[username] && data[username].password === password) {
        onLoginSuccess && onLoginSuccess(username);
      } else {
        Alert.alert("Login failed", "Invalid username or password.");
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to login. Try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>NUMBER RUSH</Text>

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

      <TouchableOpacity style={styles.btnPrimary} onPress={login}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => onRegister && onRegister()}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030303",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    fontSize: 36,
    color: "#00FFAA",
    fontWeight: "bold",
    marginBottom: 28,
    textShadowColor: "#00FFAA",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
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
