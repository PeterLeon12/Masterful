import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabaseApiClient } from './supabaseApi';

export interface UploadedFile {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
  uploadedAt: string;
  url?: string;
}

export class FileUploadService {
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  async pickImage(): Promise<{ success: boolean; file?: UploadedFile; error?: string }> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Permission to access media library was denied' };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return { success: false, error: 'Image selection cancelled' };
      }

      const asset = result.assets[0];
      if (!asset) {
        return { success: false, error: 'No image selected' };
      }

      // Check file size
      if (asset.fileSize && asset.fileSize > this.maxFileSize) {
        return { success: false, error: 'File size too large. Maximum 10MB allowed.' };
      }

      const file: UploadedFile = {
        id: Date.now().toString(),
        name: asset.fileName || `image_${Date.now()}.jpg`,
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize || 0,
        uploadedAt: new Date().toISOString(),
      };

      return { success: true, file };
    } catch (error) {
      console.error('Error picking image:', error);
      return { success: false, error: 'Failed to pick image' };
    }
  }

  async pickDocument(): Promise<{ success: boolean; file?: UploadedFile; error?: string }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { success: false, error: 'Document selection cancelled' };
      }

      const asset = result.assets[0];
      if (!asset) {
        return { success: false, error: 'No document selected' };
      }

      // Check file size
      if (asset.size && asset.size > this.maxFileSize) {
        return { success: false, error: 'File size too large. Maximum 10MB allowed.' };
      }

      // Check file type
      if (asset.mimeType && !this.allowedDocumentTypes.includes(asset.mimeType)) {
        return { success: false, error: 'File type not supported' };
      }

      const file: UploadedFile = {
        id: Date.now().toString(),
        name: asset.name,
        uri: asset.uri,
        type: asset.mimeType || 'application/octet-stream',
        size: asset.size || 0,
        uploadedAt: new Date().toISOString(),
      };

      return { success: true, file };
    } catch (error) {
      console.error('Error picking document:', error);
      return { success: false, error: 'Failed to pick document' };
    }
  }

  async uploadFile(file: UploadedFile, folder: string = 'uploads'): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create file name with timestamp
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const response = await supabaseApiClient.uploadFile(filePath, base64, file.type);

      if (response.success && response.url) {
        return { success: true, url: response.url };
      } else {
        return { success: false, error: response.error || 'Failed to upload file' };
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: 'Failed to upload file' };
    }
  }

  async uploadMultipleFiles(files: UploadedFile[], folder: string = 'uploads'): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
    const results = await Promise.all(
      files.map(file => this.uploadFile(file, folder))
    );

    const urls: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.success && result.url) {
        urls.push(result.url);
      } else {
        errors.push(`File ${files[index].name}: ${result.error || 'Upload failed'}`);
      }
    });

    return {
      success: urls.length > 0,
      urls: urls.length > 0 ? urls : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await supabaseApiClient.deleteFile(filePath);
      return response;
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: 'Failed to delete file' };
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    return '📄';
  }

  isImageFile(mimeType: string): boolean {
    return this.allowedImageTypes.includes(mimeType);
  }

  isDocumentFile(mimeType: string): boolean {
    return this.allowedDocumentTypes.includes(mimeType);
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService;
