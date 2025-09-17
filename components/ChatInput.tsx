import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Send, Paperclip, Camera, MapPin } from 'lucide-react-native';

interface ChatInputProps {
  onSendMessage: (content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION') => void;
  onSendImage?: () => void;
  onSendFile?: () => void;
  onSendLocation?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendImage,
  onSendFile,
  onSendLocation,
  disabled = false,
  placeholder = "Scrie un mesaj...",
}) => {
  const [message, setMessage] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), 'TEXT');
      setMessage('');
    }
  };

  const handleAttachmentPress = () => {
    setShowAttachments(!showAttachments);
  };

  const handleImagePress = () => {
    setShowAttachments(false);
    if (onSendImage) {
      onSendImage();
    } else {
      Alert.alert('Funcție în dezvoltare', 'Trimiterea imaginilor va fi disponibilă în curând.');
    }
  };

  const handleFilePress = () => {
    setShowAttachments(false);
    if (onSendFile) {
      onSendFile();
    } else {
      Alert.alert('Funcție în dezvoltare', 'Trimiterea fișierelor va fi disponibilă în curând.');
    }
  };

  const handleLocationPress = () => {
    setShowAttachments(false);
    if (onSendLocation) {
      onSendLocation();
    } else {
      Alert.alert('Funcție în dezvoltare', 'Trimiterea locației va fi disponibilă în curând.');
    }
  };

  return (
    <View style={styles.container}>
      {showAttachments && (
        <View style={styles.attachmentsContainer}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={handleImagePress}
            disabled={disabled}
          >
            <Camera size={20} color="#3b82f6" />
            <Text style={styles.attachmentText}>Imagine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={handleFilePress}
            disabled={disabled}
          >
            <Paperclip size={20} color="#3b82f6" />
            <Text style={styles.attachmentText}>Fișier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={handleLocationPress}
            disabled={disabled}
          >
            <MapPin size={20} color="#3b82f6" />
            <Text style={styles.attachmentText}>Locație</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.attachmentToggle, disabled && styles.disabledButton]}
          onPress={handleAttachmentPress}
          disabled={disabled}
        >
          <Paperclip size={20} color={disabled ? "#9ca3af" : "#6b7280"} />
        </TouchableOpacity>

        <TextInput
          style={[styles.textInput, disabled && styles.disabledInput]}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={1000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Send size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  attachmentsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 16,
  },
  attachmentButton: {
    alignItems: 'center',
    gap: 4,
  },
  attachmentText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  attachmentToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  disabledButton: {
    opacity: 0.5,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    maxHeight: 100,
    minHeight: 44,
  },
  disabledInput: {
    opacity: 0.5,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
});

export default ChatInput;
