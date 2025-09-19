import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, MapPin, Clock, MessageCircle, CheckCircle } from 'lucide-react-native';
import { Professional } from '@/services/supabaseApi';
import { router } from 'expo-router';

interface ProfessionalCardProps {
  professional: Professional;
  onPress?: (professional: Professional) => void;
  showActions?: boolean;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ 
  professional, 
  onPress, 
  showActions = true 
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(professional);
    } else {
      router.push(`/reviews/${professional.id}`);
    }
  };

  const handleMessage = () => {
    // TODO: Navigate to chat with professional
    console.log('Message professional:', professional.id);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={14} color="#fbbf24" fill="#fbbf24" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={14} color="#fbbf24" fill="#fbbf24" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={14} color="#e5e7eb" />
      );
    }

    return stars;
  };

  const categories = professional.categories ? professional.categories.split(',').slice(0, 2) : [];
  const serviceAreas = professional.serviceAreas ? professional.serviceAreas.split(',').slice(0, 2) : [];

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {professional.user?.name?.charAt(0) || 'P'}
          </Text>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{professional.user?.name || 'Profesionist'}</Text>
            {professional.isVerified && (
              <CheckCircle size={16} color="#10b981" />
            )}
          </View>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(professional.rating)}
            </View>
            <Text style={styles.ratingText}>
              {professional.rating.toFixed(1)} ({professional.reviewCount} recenzii)
            </Text>
          </View>
        </View>
      </View>

      {professional.bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {professional.bio}
        </Text>
      )}

      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{category.trim()}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {professional.experience} ani experiență
          </Text>
        </View>

        <View style={styles.detailItem}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {serviceAreas.length > 0 ? serviceAreas.join(', ') : 'Toate zonele'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Tarif orar:</Text>
          <Text style={styles.price}>
            {professional.hourlyRate} {professional.currency}
          </Text>
        </View>

        {showActions && (
          <TouchableOpacity 
            style={styles.messageButton} 
            onPress={handleMessage}
          >
            <MessageCircle size={16} color="#ffffff" />
            <Text style={styles.messageButtonText}>Mesaj</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoContainer: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  bio: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#374151',
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  messageButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
});

export default ProfessionalCard;
