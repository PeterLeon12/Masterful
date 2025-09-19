import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react-native';

interface VideoProps {
  uri: string;
  poster?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onVolumeToggle?: () => void;
  isPlaying?: boolean;
  isMuted?: boolean;
  duration?: number;
  currentTime?: number;
  style?: any;
}

export const Video: React.FC<VideoProps> = ({
  uri,
  poster,
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
      <View style={styles.videoContainer}>
        {poster ? (
          <View style={styles.posterContainer}>
            <Text style={styles.posterText}>Video Poster</Text>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Video Player</Text>
          </View>
        )}
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? (
              <Pause size={24} color="#ffffff" />
            ) : (
              <Play size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onVolumeToggle}
          >
            {isMuted ? (
              <VolumeX size={20} color="#ffffff" />
            ) : (
              <Volume2 size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  posterContainer: {
    flex: 1,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterText: {
    color: '#ffffff',
    fontSize: 16,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  timeContainer: {
    padding: 8,
    backgroundColor: '#1f2937',
  },
  timeText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default Video;
