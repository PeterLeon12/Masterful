import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/OptimalAuthContext';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION';
  };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const isOwnMessage = user?.id === message.senderId;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'TEXT':
        return (
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
        );
      case 'IMAGE':
        return (
          <View style={styles.imageContainer}>
            <Text style={styles.imagePlaceholder}>📷 Imagine</Text>
            <Text style={styles.imageCaption}>{message.content}</Text>
          </View>
        );
      case 'FILE':
        return (
          <View style={styles.fileContainer}>
            <Text style={styles.fileIcon}>📄</Text>
            <Text style={styles.fileName}>{message.content}</Text>
          </View>
        );
      case 'LOCATION':
        return (
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{message.content}</Text>
          </View>
        );
      default:
        return (
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
        );
    }
  };

  return (
    <View style={[
      styles.messageContainer,
      isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
      ]}>
        {!isOwnMessage && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        {renderMessageContent()}
        <Text style={[
          styles.timestamp,
          isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
        ]}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownMessageBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#f1f5f9',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#1e293b',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTimestamp: {
    color: '#bfdbfe',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#94a3b8',
  },
  imageContainer: {
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 24,
    marginBottom: 8,
  },
  imageCaption: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileIcon: {
    fontSize: 20,
  },
  fileName: {
    fontSize: 14,
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    fontSize: 16,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
});

export default ChatMessage;
