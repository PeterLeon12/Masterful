import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '@/hooks/use-realtime-chat';

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showHeader: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ 
  message, 
  isOwnMessage, 
  showHeader 
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={[styles.container, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
      {showHeader && (
        <View style={[styles.header, isOwnMessage ? styles.ownHeader : styles.otherHeader]}>
          <Text style={styles.userName}>{message.user.name}</Text>
          <Text style={styles.timestamp}>
            {formatTime(message.createdAt)}
          </Text>
        </View>
      )}
      <View style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownText : styles.otherText
        ]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ownHeader: {
    justifyContent: 'flex-end',
  },
  otherHeader: {
    justifyContent: 'flex-start',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ownText: {
    color: '#ffffff',
  },
  otherText: {
    color: '#111827',
  },
});
