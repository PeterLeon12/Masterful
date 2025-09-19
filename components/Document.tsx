import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { File, Download, Eye, Trash2 } from 'lucide-react-native';

interface DocumentProps {
  uri: string;
  name: string;
  size?: number;
  type?: string;
  onPress?: () => void;
  onDownload?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  style?: any;
}

export const Document: React.FC<DocumentProps> = ({
  uri,
  name,
  size,
  type,
  onPress,
  onDownload,
  onView,
  onDelete,
  style,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word')) return '📝';
    if (fileType?.includes('excel')) return '📊';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('video')) return '🎥';
    if (fileType?.includes('audio')) return '🎵';
    return '📄';
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.fileIcon}>{getFileIcon(type || '')}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.fileName} numberOfLines={1}>
            {name}
          </Text>
          {size && (
            <Text style={styles.fileSize}>
              {formatFileSize(size)}
            </Text>
          )}
          {type && (
            <Text style={styles.fileType}>
              {type.toUpperCase()}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        {onView && (
          <TouchableOpacity style={styles.actionButton} onPress={onView}>
            <Eye size={16} color="#3b82f6" />
          </TouchableOpacity>
        )}
        {onDownload && (
          <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
            <Download size={16} color="#10b981" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileIcon: {
    fontSize: 20,
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  fileType: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
});

export default Document;
