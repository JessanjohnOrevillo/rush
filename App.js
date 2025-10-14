import React, { useState, useEffect } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import MenuScreen from "./components/MenuScreen";
import GameScreen from "./components/GameScreen";
import UserLogin from "./components/UserLogin";
import UserRegistration from "./components/UserRegistration";
import DashboardScreen from "./components/DashboardScreen";
import LeaderboardScreen from "./components/LeaderboardScreen";
import { stopAllSounds } from "./components/MusicPlayer";

export default function App() {
  // screens: login | register | menu | game | dashboard | leaderboard
  const [screen, setScreen] = useState("login");
  const [difficulty, setDifficulty] = useState("normal");
  const [currentUser, setCurrentUser] = useState(null); // username string

  // called after successful login
  const handleLoginSuccess = (username) => {
    setCurrentUser(username);
    setScreen("menu");
  };

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setScreen("game");
  };

  const backToMenu = () => {
    setScreen("menu");
  };

  const goToLogin = async () => {
    // when logging out, stop all sounds and clear currentUser
    await stopAllSounds();
    setCurrentUser(null);
    setScreen("login");
  };

  // navigation props
  const nav = {
    toLogin: () => setScreen("login"),
    toRegister: () => setScreen("register"),
    toMenu: () => setScreen("menu"),
    toGame: () => setScreen("game"),
    toDashboard: () => setScreen("dashboard"),
    toLeaderboard: () => setScreen("leaderboard"),
    logout: goToLogin,
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {screen === "login" && (
        <UserLogin onRegister={() => setScreen("register")} onLoginSuccess={handleLoginSuccess} />
      )}

      {screen === "register" && (
        <UserRegistration onRegistered={() => setScreen("login")} onCancel={() => setScreen("login")} />
      )}

      {screen === "menu" && (
        <MenuScreen
          onStart={startGame}
          onLogout={goToLogin}
          onDashboard={() => setScreen("dashboard")}
          onLeaderboard={() => setScreen("leaderboard")}
          currentUser={currentUser}
        />
      )}

      {screen === "game" && (
        <GameScreen
          onExit={backToMenu}
          difficulty={difficulty}
          currentUser={currentUser}
        />
      )}

      {screen === "dashboard" && (
        <DashboardScreen
          onBack={() => setScreen("menu")}
          onLeaderboard={() => setScreen("leaderboard")}
          onLogout={goToLogin}
          currentUser={currentUser}
        />
      )}

      {screen === "leaderboard" && (
        <LeaderboardScreen onBack={() => setScreen("menu")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
