import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Star, Send, X } from 'lucide-react-native';

interface ReviewFormProps {
  jobId: string;
  professionalId: string;
  professionalName: string;
  onSubmit: (review: {
    rating: number;
    comment: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  jobId,
  professionalId,
  professionalName,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Eroare', 'Te rog selectează o evaluare');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Eroare', 'Comentariul trebuie să aibă cel puțin 10 caractere');
      return;
    }

    onSubmit({ rating, comment: comment.trim() });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starRating = index + 1;
      const isActive = starRating <= (hoveredRating || rating);
      
      return (
        <TouchableOpacity
          key={index}
          onPress={() => setRating(starRating)}
          onPressIn={() => setHoveredRating(starRating)}
          onPressOut={() => setHoveredRating(0)}
          style={styles.starButton}
        >
          <Star
            size={32}
            color={isActive ? '#fbbf24' : '#d1d5db'}
            fill={isActive ? '#fbbf24' : 'none'}
          />
        </TouchableOpacity>
      );
    });
  };

  const getRatingText = (rating: number) => {
    const ratingTexts = {
      1: 'Foarte slab',
      2: 'Slab',
      3: 'Mediu',
      4: 'Bun',
      5: 'Excelent',
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || '';
  };

  const getRatingDescription = (rating: number) => {
    const descriptions = {
      1: 'Serviciul nu a fost deloc satisfăcător',
      2: 'Serviciul a fost sub așteptări',
      3: 'Serviciul a fost acceptabil',
      4: 'Serviciul a fost bun și recomand',
      5: 'Serviciul a fost excelent, foarte recomand',
    };
    return descriptions[rating as keyof typeof descriptions] || '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Evaluează serviciul</Text>
          <Text style={styles.subtitle}>pentru {professionalName}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <X size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Evaluarea ta</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          {rating > 0 && (
            <View style={styles.ratingInfo}>
              <Text style={styles.ratingText}>{getRatingText(rating)}</Text>
              <Text style={styles.ratingDescription}>{getRatingDescription(rating)}</Text>
            </View>
          )}
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Comentariul tău</Text>
          <Text style={styles.sectionSubtitle}>
            Spune-ne despre experiența ta cu acest meșter
          </Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Descrie experiența ta... (minim 10 caractere)"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {comment.length}/500 caractere
          </Text>
        </View>

        <View style={styles.guidelines}>
          <Text style={styles.guidelinesTitle}>Ghid pentru recenzii</Text>
          <Text style={styles.guidelinesText}>
            • Fii obiectiv și onest în evaluare{'\n'}
            • Menționează aspectele pozitive și negative{'\n'}
            • Evită comentariile ofensatoare sau nepotrivite{'\n'}
            • Recenzia ta va fi publică și va ajuta alți clienți
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Anulează</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || comment.trim().length < 10 || isLoading) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || comment.trim().length < 10 || isLoading}
        >
          <Send size={16} color="#ffffff" />
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Se trimite...' : 'Trimite recenzia'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ratingSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingInfo: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  ratingDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  commentSection: {
    paddingVertical: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
  },
  guidelines: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default ReviewForm;
