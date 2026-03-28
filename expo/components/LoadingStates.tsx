import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

// Simple skeleton component using Animated
const SimpleSkeleton = ({ width, height, style }: { width: number | string; height: number; style?: any }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#e5e7eb',
          borderRadius: 4,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton loading component for job cards
export const JobCardSkeleton = () => (
  <View style={styles.jobCardSkeleton}>
    <View style={styles.jobHeaderSkeleton}>
      <SimpleSkeleton width={200} height={20} />
      <SimpleSkeleton width={80} height={16} />
    </View>
    <View style={styles.jobDetailsSkeleton}>
      <View style={styles.jobDetailSkeleton}>
        <SimpleSkeleton width={16} height={16} />
        <SimpleSkeleton width={120} height={14} />
      </View>
      <View style={styles.jobDetailSkeleton}>
        <SimpleSkeleton width={16} height={16} />
        <SimpleSkeleton width={100} height={14} />
      </View>
    </View>
    <SimpleSkeleton width={80} height={16} />
  </View>
);

// Skeleton loading component for professional cards
export const ProfessionalCardSkeleton = () => (
  <View style={styles.professionalCardSkeleton}>
    <View style={styles.professionalHeaderSkeleton}>
      <SimpleSkeleton width={60} height={60} style={{ borderRadius: 30 }} />
      <View style={styles.professionalInfoSkeleton}>
        <SimpleSkeleton width={150} height={18} />
        <SimpleSkeleton width={100} height={14} />
        <SimpleSkeleton width={80} height={14} />
      </View>
    </View>
    <View style={styles.professionalDetailsSkeleton}>
      <SimpleSkeleton width="100%" height={14} />
      <SimpleSkeleton width="80%" height={14} />
    </View>
    <View style={styles.professionalActionsSkeleton}>
      <SimpleSkeleton width={100} height={36} />
      <SimpleSkeleton width={100} height={36} />
    </View>
  </View>
);

// Skeleton loading component for category cards
export const CategoryCardSkeleton = () => (
  <View style={styles.categoryCardSkeleton}>
    <View style={styles.categoryHeaderSkeleton}>
      <SimpleSkeleton width={40} height={40} />
      <SimpleSkeleton width={120} height={16} />
    </View>
    <SimpleSkeleton width="100%" height={14} />
  </View>
);

// Full screen loading component
export const FullScreenLoader = ({ message = 'Se încarcă...' }: { message?: string }) => (
  <View style={styles.fullScreenLoader}>
    <View style={styles.loaderContent}>
      <View style={styles.spinnerContainer}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: '0deg' }] }]} />
      </View>
      <Text style={styles.loaderText}>{message}</Text>
    </View>
  </View>
);

// Inline loading component
export const InlineLoader = ({ size = 'small' }: { size?: 'small' | 'medium' | 'large' }) => {
  const spinnerSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32;
  
  return (
    <View style={[styles.inlineLoader, { width: spinnerSize, height: spinnerSize }]}>
      <Animated.View style={[styles.spinner, { width: spinnerSize, height: spinnerSize }]} />
    </View>
  );
};

// Button loading state
export const ButtonLoader = ({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) => {
  const spinnerSize = size === 'small' ? 14 : size === 'medium' ? 18 : 24;
  
  return (
    <View style={styles.buttonLoader}>
      <Animated.View style={[styles.spinner, { width: spinnerSize, height: spinnerSize }]} />
    </View>
  );
};

// List loading state with multiple skeletons
export const ListLoader = ({ 
  type = 'job', 
  count = 3 
}: { 
  type?: 'job' | 'professional' | 'category';
  count?: number;
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'job':
        return <JobCardSkeleton key={Math.random()} />;
      case 'professional':
        return <ProfessionalCardSkeleton key={Math.random()} />;
      case 'category':
        return <CategoryCardSkeleton key={Math.random()} />;
      default:
        return <JobCardSkeleton key={Math.random()} />;
    }
  };

  return (
    <View style={styles.listLoader}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          {renderSkeleton()}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  jobCardSkeleton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  jobHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobDetailsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobDetailSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  professionalCardSkeleton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  professionalHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  professionalInfoSkeleton: {
    marginLeft: 12,
  },
  professionalDetailsSkeleton: {
    marginBottom: 12,
  },
  professionalActionsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  categoryCardSkeleton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  categoryHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loaderContent: {
    alignItems: 'center',
  },
  spinnerContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  spinner: {
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: '#3b82f6',
    borderRadius: 15,
    borderTopColor: 'transparent',
  },
  loaderText: {
    fontSize: 16,
    color: '#6b7280',
  },
  inlineLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listLoader: {
    // Add any specific styles for the list container if needed
  },
  skeletonItem: {
    marginBottom: 16,
  },
});
