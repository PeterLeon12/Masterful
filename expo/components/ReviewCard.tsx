import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: {
      name: string;
      avatar?: string;
    };
  };
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  showJobDetails?: boolean;
}

export default function ReviewCard({ review, onHelpful, onReport, showJobDetails }: ReviewCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.reviewerName}>{review.reviewer.name}</Text>
        <View style={styles.rating}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              color={i < review.rating ? '#fbbf24' : '#d1d5db'}
              fill={i < review.rating ? '#fbbf24' : 'transparent'}
            />
          ))}
        </View>
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
      <Text style={styles.date}>
        {new Date(review.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  rating: {
    flexDirection: 'row',
  },
  comment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
