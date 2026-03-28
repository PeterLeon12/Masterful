import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react-native';

interface AudioProps {
  uri: string;
  title?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onVolumeToggle?: () => void;
  isPlaying?: boolean;
  isMuted?: boolean;
  duration?: number;
  currentTime?: number;
  style?: any;
}

export const Audio: React.FC<AudioProps> = ({
  uri,
  title = 'Audio File',
  onPlay,
  onPause,
  onVolumeToggle,
  isPlaying = false,
  isMuted = false,
  duration = 0,
  currentTime = 0,
  style,
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.volumeButton}
          onPress={onVolumeToggle}
        >
          {isMuted ? (
            <VolumeX size={20} color="#6b7280" />
          ) : (
            <Volume2 size={20} color="#6b7280" />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={isPlaying ? onPause : onPlay}
        >
          {isPlaying ? (
            <Pause size={24} color="#ffffff" />
          ) : (
            <Play size={24} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  volumeButton: {
    padding: 4,
  },
  controls: {
    alignItems: 'center',
    marginBottom: 12,
  },
  playButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default Audio;
