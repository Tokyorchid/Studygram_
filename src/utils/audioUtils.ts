
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

export const playBackgroundMusic = (trackName: string | null) => {
  // First stop any playing track
  Object.values(audioTracks).forEach(track => {
    track.pause();
    track.currentTime = 0;
  });

  // Play the selected track if it exists and isn't "none"
  if (trackName && trackName !== "none" && audioTracks[trackName as keyof typeof audioTracks]) {
    audioTracks[trackName as keyof typeof audioTracks].play().catch(error => {
      console.error("Error playing audio:", error);
    });
  }
};

export const stopAllBackgroundMusic = () => {
  Object.values(audioTracks).forEach(track => {
    track.pause();
    track.currentTime = 0;
  });
};

export const playAlarm = () => {
  alarmSound.play().catch(error => {
    console.error("Error playing alarm:", error);
  });
};
