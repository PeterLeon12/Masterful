import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerProps {
  onImageSelect: (image: any) => void;
  onImageRemove?: (imageId: string) => void;
  images?: Array<{
    id: string;
    uri: string;
    name?: string;
  }>;
  maxImages?: number;
  allowMultiple?: boolean;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelect,
  onImageRemove,
  images = [],
  maxImages = 5,
  allowMultiple = true,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleImageSelect = async () => {
    try {
      setIsSelecting(true);
      
      // Use expo-image-picker for production
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to select images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: allowMultiple,
        quality: 0.8,
        maxImages: allowMultiple ? maxImages : 1,
      });

      if (!result.canceled) {
        const images = result.assets.map((asset, index) => ({
          id: `${Date.now()}-${index}`,
          uri: asset.uri,
          name: asset.fileName || `image-${index}.jpg`,
          type: asset.type || 'image/jpeg',
        }));

        if (allowMultiple) {
          images.forEach(image => onImageSelect(image));
        } else {
          onImageSelect(images[0]);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleImageRemove = (imageId: string) => {
    onImageRemove?.(imageId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imagesGrid}>
        {images.map((image) => (
          <View key={image.id} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleImageRemove(image.id)}
            >
              <X size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ))}
        
        {images.length < maxImages && (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleImageSelect}
            disabled={isSelecting}
          >
            {isSelecting ? (
              <Text style={styles.addButtonText}>...</Text>
            ) : (
              <>
                <Camera size={24} color="#3b82f6" />
                <Text style={styles.addButtonText}>Add</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {images.length === 0 && (
        <TouchableOpacity 
          style={styles.emptyButton} 
          onPress={handleImageSelect}
          disabled={isSelecting}
        >
          <ImageIcon size={48} color="#6b7280" />
          <Text style={styles.emptyButtonText}>
            {isSelecting ? 'Selecting...' : 'Add Images'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  addButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
  },
  emptyButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 32,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyButtonText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
});

export default ImagePicker;
