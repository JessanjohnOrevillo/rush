import { Audio } from "expo-av";

let backgroundRef = null;
let countdownRef = null;
let gameOverRef = null;

const backgroundMusic = require("../assets/menu.mp3");
const countdownVoice = require("../assets/countdown.mp3");
const gameOverSound = require("../assets/gameover.wav");

// helper: safely create sound
async function playSound(file, loop = false, volume = 1.0, rate = 1.0) {
  try {
    const sound = new Audio.Sound();
    await sound.loadAsync(file);
    await sound.setIsLoopingAsync(loop);
    await sound.setVolumeAsync(volume);
    await sound.setRateAsync(rate, true);
    await sound.playAsync();
    return sound;
  } catch (error) {
    console.warn("Error playing sound:", error);
    return null;
  }
}

// stop safely
async function stopSound(ref) {
  if (ref) {
    try {
      await ref.stopAsync();
      await ref.unloadAsync();
    } catch (error) {
      console.log("Sound already stopped/unloaded");
    }
  }
}

// background music
export async function playBackground(level = 1) {
  await stopSound(backgroundRef);
  const volume = Math.min(0.3 + level * 0.05, 1.0);
  const rate = 1 + (level - 1) * 0.03;
  backgroundRef = await playSound(backgroundMusic, true, volume, rate);
}

// countdown (non-looping)
export async function playCountdown() {
  await stopSound(countdownRef);
  countdownRef = await playSound(countdownVoice, false, 1.0);
}

// game over (non-looping, stop all first)
export async function playGameOver() {
  await stopAllSounds();
  gameOverRef = await playSound(gameOverSound, false, 1.0);
}

// stops
export async function stopBackground() {
  await stopSound(backgroundRef);
  backgroundRef = null;
}

export async function stopCountdown() {
  await stopSound(countdownRef);
  countdownRef = null;
}

export async function stopGameOver() {
  await stopSound(gameOverRef);
  gameOverRef = null;
}

// full stop
export async function stopAllSounds() {
  await stopBackground();
  await stopCountdown();
  await stopGameOver();
}
