'use client';

const sounds = {
  sync: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
  bug: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  step: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  export: 'https://assets.mixkit.co/active_storage/sfx/2355/2355-preview.mp3',
  stop: 'https://assets.mixkit.co/active_storage/sfx/2359/2359-preview.mp3',
};

// Singleton audio pool with pre-warmed instances
const audioPool: Record<string, HTMLAudioElement> = {};

// Preload function
if (typeof window !== 'undefined') {
  Object.entries(sounds).forEach(([key, url]) => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = 0.3;
    audioPool[key] = audio;
  });
}

export function playEffect(type: keyof typeof sounds) {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = audioPool[type];
    if (audio) {
      // For performance: Clone node if overlapping sounds are needed, 
      // but for logicflow, resetting time is more efficient
      if (!audio.paused) {
        audio.currentTime = 0;
      } else {
        audio.play().catch(() => {
          // Silent catch for autoplay restrictions
        });
      }
    }
  } catch (e) {
    console.error('Audio engine lag', e);
  }
}

export function useSoundEffect() {
  return { playSound: playEffect };
}