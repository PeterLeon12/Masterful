import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Upload, File, X, Check, Image as ImageIcon } from 'lucide-react-native';
import { fileUploadService, UploadedFile } from '@/services/fileUploadService';

interface FileUploadProps {
  onFileSelect?: (file: UploadedFile) => void;
  onFileRemove?: (fileId: string) => void;
  onFilesUploaded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: ('image' | 'document')[];
  maxSize?: number; // in MB
  style?: any;
  folder?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  onFilesUploaded,
  maxFiles = 5,
  acceptedTypes = ['image', 'document'],
  maxSize = 10,
  style,
  folder = 'uploads',
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = async () => {
    if (files.length >= maxFiles) {
      Alert.alert('Limit reached', `Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    try {
      const result = await fileUploadService.pickImage();
      
      if (result.success && result.file) {
        const uploadedFile = result.file;
        setFiles(prev => [...prev, uploadedFile]);
        onFileSelect?.(uploadedFile);
      } else {
        Alert.alert('Error', result.error || 'Failed to select image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentSelect = async () => {
    if (files.length >= maxFiles) {
      Alert.alert('Limit reached', `Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    try {
      const result = await fileUploadService.pickDocument();
      
      if (result.success && result.file) {
        const uploadedFile = result.file;
        setFiles(prev => [...prev, uploadedFile]);
        onFileSelect?.(uploadedFile);
      } else {
        Alert.alert('Error', result.error || 'Failed to select document');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileRemove = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    onFileRemove?.(fileId);
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const result = await fileUploadService.uploadMultipleFiles(files, folder);
      
      if (result.success && result.urls) {
        // Update files with URLs
        const updatedFiles = files.map((file, index) => ({
          ...file,
          url: result.urls![index],
        }));
        
        setFiles(updatedFiles);
        onFilesUploaded?.(updatedFiles);
        Alert.alert('Success', 'Files uploaded successfully');
      } else {
        Alert.alert('Error', result.errors?.join('\n') || 'Failed to upload files');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (fileUploadService.isImageFile(mimeType)) {
      return <ImageIcon size={16} color="#3b82f6" />;
    }
    return <File size={16} color="#6b7280" />;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.uploadButtons}>
        {acceptedTypes.includes('image') && (
          <TouchableOpacity
            style={[styles.uploadButton, styles.imageButton]}
            onPress={handleImageSelect}
            disabled={files.length >= maxFiles || isUploading}
          >
            <ImageIcon size={20} color="#3b82f6" />
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Selecting...' : 'Add Image'}
            </Text>
          </TouchableOpacity>
        )}
        
        {acceptedTypes.includes('document') && (
          <TouchableOpacity
            style={[styles.uploadButton, styles.documentButton]}
            onPress={handleDocumentSelect}
            disabled={files.length >= maxFiles || isUploading}
          >
            <File size={20} color="#10b981" />
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Selecting...' : 'Add Document'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {files.length > 0 && (
        <View style={styles.filesList}>
          <View style={styles.filesHeader}>
            <Text style={styles.filesTitle}>Selected Files ({files.length}/{maxFiles})</Text>
            {files.length > 0 && (
              <TouchableOpacity
                style={styles.uploadAllButton}
                onPress={handleUploadAll}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.uploadAllButtonText}>Upload All</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          {files.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <View style={styles.fileInfo}>
                {getFileIcon(file.type)}
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {fileUploadService.formatFileSize(file.size)}
                  </Text>
                  {file.url && (
                    <Text style={styles.uploadedText}>✓ Uploaded</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleFileRemove(file.id)}
              >
                <X size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.helpText}>
        Max {maxFiles} files, {maxSize}MB each. 
        {acceptedTypes.includes('image') && ' Images: JPEG, PNG, GIF, WebP. '}
        {acceptedTypes.includes('document') && 'Documents: PDF, Word, Excel, Text.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  imageButton: {
    borderColor: '#3b82f6',
  },
  documentButton: {
    borderColor: '#10b981',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  filesList: {
    marginTop: 16,
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  uploadAllButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadAllButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
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
  uploadedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});

export default FileUpload;