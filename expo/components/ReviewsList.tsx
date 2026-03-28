import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Star, Filter, SortAsc, SortDesc } from 'lucide-react-native';
import ReviewCard from './ReviewCard';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    name: string;
    avatar?: string;
  };
  job?: {
    title: string;
    category: string;
  };
  helpful?: number;
  reported?: boolean;
}

interface ReviewsListProps {
  reviews: Review[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  showJobDetails?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful';

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  isLoading = false,
  onRefresh,
  onHelpful,
  onReport,
  showJobDetails = true,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortOptions, setShowSortOptions] = useState(false);

  const sortOptions = [
    { key: 'newest' as SortOption, label: 'Cele mai noi', icon: SortDesc },
    { key: 'oldest' as SortOption, label: 'Cele mai vechi', icon: SortAsc },
    { key: 'highest' as SortOption, label: 'Rating cel mai mare', icon: Star },
    { key: 'lowest' as SortOption, label: 'Rating cel mai mic', icon: Star },
    { key: 'most_helpful' as SortOption, label: 'Cele mai utile', icon: Filter },
  ];

  const getSortedReviews = () => {
    const sorted = [...reviews];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'most_helpful':
        return sorted.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
      default:
        return sorted;
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const renderRatingBar = (rating: number, count: number) => {
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    
    return (
      <View key={rating} style={styles.ratingBarContainer}>
        <Text style={styles.ratingLabel}>{rating}★</Text>
        <View style={styles.ratingBarBackground}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingCount}>{count}</Text>
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <ReviewCard
      review={item}
      onHelpful={onHelpful}
      onReport={onReport}
      showJobDetails={showJobDetails}
    />
  );

  const renderSortOption = ({ item }: { item: typeof sortOptions[0] }) => {
    const Icon = item.icon;
    const isSelected = sortBy === item.key;
    
    return (
      <TouchableOpacity
        style={[styles.sortOption, isSelected && styles.sortOptionSelected]}
        onPress={() => {
          setSortBy(item.key);
          setShowSortOptions(false);
        }}
      >
        <Icon size={16} color={isSelected ? '#3b82f6' : '#6b7280'} />
        <Text style={[styles.sortOptionText, isSelected && styles.sortOptionTextSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const selectedSortOption = sortOptions.find(option => option.key === sortBy);

  return (
    <View style={styles.container}>
      {/* Reviews Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.ratingSummary}>
          <View style={styles.averageRating}>
            <Text style={styles.averageRatingNumber}>{getAverageRating()}</Text>
            <View style={styles.averageStars}>
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={16}
                  color={index < Math.floor(Number(getAverageRating())) ? '#fbbf24' : '#d1d5db'}
                  fill={index < Math.floor(Number(getAverageRating())) ? '#fbbf24' : 'none'}
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>
              {reviews.length} recenzii
            </Text>
          </View>
          
          <View style={styles.ratingDistribution}>
            {Object.entries(getRatingDistribution())
              .reverse()
              .map(([rating, count]) => renderRatingBar(parseInt(rating), count))}
          </View>
        </View>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Text style={styles.sortButtonText}>
            Sortează: {selectedSortOption?.label}
          </Text>
          <Filter size={16} color="#6b7280" />
        </TouchableOpacity>
        
        {showSortOptions && (
          <View style={styles.sortOptionsContainer}>
            <FlatList
              data={sortOptions}
              renderItem={renderSortOption}
              keyExtractor={(item) => item.key}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>

      {/* Reviews List */}
      <FlatList
        data={getSortedReviews()}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reviewsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nu există recenzii încă
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Fii primul care lasă o recenzie!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  averageRating: {
    alignItems: 'center',
    minWidth: 100,
  },
  averageRatingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  averageStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  totalReviews: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingDistribution: {
    flex: 1,
    gap: 8,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#374151',
    minWidth: 24,
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 20,
    textAlign: 'right',
  },
  sortContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  sortButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  sortOptionsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 8,
  },
  sortOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sortOptionTextSelected: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  reviewsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default ReviewsList;
