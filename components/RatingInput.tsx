import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

interface RatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  showText?: boolean;
  disabled?: boolean;
  showNumbers?: boolean;
  label?: string;
}

export const RatingInput: React.FC<RatingInputProps> = ({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 24,
  color = '#fbbf24',
  emptyColor = '#d1d5db',
  showText = true,
  disabled = false,
  showNumbers = false,
  label,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarPress = (starRating: number) => {
    if (!disabled) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!disabled) {
      setHoveredRating(starRating);
    }
  };

  const handleStarLeave = () => {
    if (!disabled) {
      setHoveredRating(0);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Foarte slab';
      case 2: return 'Slab';
      case 3: return 'OK';
      case 4: return 'Bun';
      case 5: return 'Excelent';
      default: return 'Selectează rating';
    }
  };

  const getRatingColor = (starRating: number) => {
    const currentRating = hoveredRating || rating;
    return starRating <= currentRating ? color : emptyColor;
  };

  const isStarFilled = (starRating: number) => {
    const currentRating = hoveredRating || rating;
    return starRating <= currentRating;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.star}
              onPress={() => handleStarPress(starRating)}
              onPressIn={() => handleStarHover(starRating)}
              onPressOut={handleStarLeave}
              disabled={disabled}
            >
              <Star
                size={size}
                color={getRatingColor(starRating)}
                fill={isStarFilled(starRating) ? getRatingColor(starRating) : 'transparent'}
              />
              {showNumbers && (
                <Text style={[styles.starNumber, { color: getRatingColor(starRating) }]}>
                  {starRating}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {showText && (
        <Text style={[styles.ratingText, disabled && styles.disabledText]}>
          {getRatingText(rating)}
        </Text>
      )}
      
      {rating > 0 && (
        <Text style={styles.ratingValue}>
          {rating}/{maxRating}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  star: {
    marginRight: 4,
    padding: 4,
    alignItems: 'center',
  },
  starNumber: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  ratingValue: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  disabledText: {
    color: '#d1d5db',
  },
});

export default RatingInput;