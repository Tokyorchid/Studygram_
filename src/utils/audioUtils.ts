
// Collection of background music tracks
const audioTracks = {
  nature: new Audio("/sounds/nature.mp3"),
  lofi: new Audio("/sounds/lofi.mp3"),
  ambient: new Audio("/sounds/ambient.mp3"),
};

// Alarm sound
const alarmSound = new Audio("/sounds/alarm.mp3");

// Configure audio tracks
Object.values(audioTracks).forEach(track => {
  track.loop = true;
  track.volume = 0.5;
});

// Set alarm volume higher to ensure it's heard
alarmSound.volume = 0.7;

export const playBackgroundMusic = (trackName: string | null) => {
  // First stop any playing track
  stopAllBackgroundMusic();

  // Play the selected track if it exists and isn't "none"
  if (trackName && trackName !== "none" && audioTracks[trackName as keyof typeof audioTracks]) {
    const track = audioTracks[trackName as keyof typeof audioTracks];
    
    // Handle autoplay restrictions by requiring user interaction
    const playPromise = track.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Error playing audio (might need user interaction first):", error);
      });
    }
  }
};

export const stopAllBackgroundMusic = () => {
  Object.values(audioTracks).forEach(track => {
    track.pause();
    track.currentTime = 0;
  });
};

export const playAlarm = () => {
  // First ensure background music volume is lowered
  Object.values(audioTracks).forEach(track => {
    track.volume = 0.2;
  });
  
  // Play the alarm sound
  const playPromise = alarmSound.play();
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        // After alarm finishes, restore background music volume
        alarmSound.onended = () => {
          Object.values(audioTracks).forEach(track => {
            track.volume = 0.5;
          });
        };
      })
      .catch(error => {
        console.error("Error playing alarm (might need user interaction first):", error);
      });
  }
};

// Check if audio is available and can be played
export const checkAudioAvailability = () => {
  const audio = new Audio();
  return audio.canPlayType && audio.canPlayType('audio/mpeg') !== '';
};

// Preload audio files to ensure they're ready to play
export const preloadAudioFiles = () => {
  Object.values(audioTracks).forEach(track => {
    track.load();
  });
  alarmSound.load();
};
