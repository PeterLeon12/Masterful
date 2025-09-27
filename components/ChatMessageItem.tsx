import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ChatMessage } from '@/hooks/use-realtime-chat';
import { useRouter } from 'expo-router';

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
  const router = useRouter();
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleJobLinkPress = (jobId: string) => {
    router.push(`/job/${jobId}`);
  };

  const renderMessageContent = (content: string) => {
    // Check if message contains a job link pattern like "/job/jobId"
    const jobLinkRegex = /\/job\/([a-f0-9-]+)/g;
    const parts = content.split(jobLinkRegex);
    
    if (parts.length > 1) {
      // Message contains job links, render with clickable links
      const elements = [];
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          // Regular text
          if (parts[i]) {
            elements.push(
              <Text key={i} style={[
                styles.messageText,
                isOwnMessage ? styles.ownText : styles.otherText
              ]}>
                {parts[i]}
              </Text>
            );
          }
        } else {
          // Job ID - make it clickable
          const jobId = parts[i];
          elements.push(
            <TouchableOpacity
              key={i}
              onPress={() => handleJobLinkPress(jobId)}
              style={styles.jobLink}
            >
              <Text style={[
                styles.jobLinkText,
                isOwnMessage ? styles.ownJobLinkText : styles.otherJobLinkText
              ]}>
                Vezi job-ul
              </Text>
            </TouchableOpacity>
          );
        }
      }
      return elements;
    } else {
      // No job links, render as regular text
      return (
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownText : styles.otherText
        ]}>
          {content}
        </Text>
      );
    }
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
        {renderMessageContent(message.content)}
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
  jobLink: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  jobLinkText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  ownJobLinkText: {
    color: '#ffffff',
  },
  otherJobLinkText: {
    color: '#3b82f6',
  },
});
