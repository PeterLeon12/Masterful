import { supabaseApiClient } from './supabaseApi';

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  reviewee?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateReviewRequest {
  jobId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export class ReviewService {
  async createReview(reviewData: CreateReviewRequest): Promise<{ success: boolean; review?: Review; error?: string }> {
    try {
      const { data: { user } } = await supabaseApiClient.supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabaseApiClient.supabase
        .from('reviews')
        .insert({
          job_id: reviewData.jobId,
          reviewer_id: user.id,
          reviewee_id: reviewData.revieweeId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        })
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(id, name, avatar),
          reviewee:users!reviews_reviewee_id_fkey(id, name, avatar)
        `)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        review: this.formatReview(data),
      };
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create review',
      };
    }
  }

  async getReviews(revieweeId: string, limit: number = 20, offset: number = 0): Promise<{ success: boolean; reviews?: Review[]; total?: number; error?: string }> {
    try {
      const { data, error, count } = await supabaseApiClient.supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(id, name, avatar),
          reviewee:users!reviews_reviewee_id_fkey(id, name, avatar)
        `, { count: 'exact' })
        .eq('reviewee_id', revieweeId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message };
      }

      const reviews = data?.map(review => this.formatReview(review)) || [];

      return {
        success: true,
        reviews,
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reviews',
      };
    }
  }

  async getReviewById(reviewId: string): Promise<{ success: boolean; review?: Review; error?: string }> {
    try {
      const { data, error } = await supabaseApiClient.supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(id, name, avatar),
          reviewee:users!reviews_reviewee_id_fkey(id, name, avatar)
        `)
        .eq('id', reviewId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        review: this.formatReview(data),
      };
    } catch (error) {
      console.error('Error fetching review:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch review',
      };
    }
  }

  async updateReview(reviewId: string, updates: UpdateReviewRequest): Promise<{ success: boolean; review?: Review; error?: string }> {
    try {
      const { data, error } = await supabaseApiClient.supabase
        .from('reviews')
        .update({
          rating: updates.rating,
          comment: updates.comment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey(id, name, avatar),
          reviewee:users!reviews_reviewee_id_fkey(id, name, avatar)
        `)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        review: this.formatReview(data),
      };
    } catch (error) {
      console.error('Error updating review:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update review',
      };
    }
  }

  async deleteReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseApiClient.supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete review',
      };
    }
  }

  async getAverageRating(revieweeId: string): Promise<{ success: boolean; averageRating?: number; totalReviews?: number; error?: string }> {
    try {
      const { data, error } = await supabaseApiClient.supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', revieweeId);

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: true, averageRating: 0, totalReviews: 0 };
      }

      const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / data.length;

      return {
        success: true,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: data.length,
      };
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate average rating',
      };
    }
  }

  async canUserReview(jobId: string, revieweeId: string): Promise<{ success: boolean; canReview?: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabaseApiClient.supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user has already reviewed this person for this job
      const { data, error } = await supabaseApiClient.supabase
        .from('reviews')
        .select('id')
        .eq('job_id', jobId)
        .eq('reviewer_id', user.id)
        .eq('reviewee_id', revieweeId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { success: false, error: error.message };
      }

      return {
        success: true,
        canReview: !data, // Can review if no existing review found
      };
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check review eligibility',
      };
    }
  }

  private formatReview(data: any): Review {
    return {
      id: data.id,
      jobId: data.job_id,
      reviewerId: data.reviewer_id,
      revieweeId: data.reviewee_id,
      rating: data.rating,
      comment: data.comment,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      reviewer: data.reviewer ? {
        id: data.reviewer.id,
        name: data.reviewer.name,
        avatar: data.reviewer.avatar,
      } : undefined,
      reviewee: data.reviewee ? {
        id: data.reviewee.id,
        name: data.reviewee.name,
        avatar: data.reviewee.avatar,
      } : undefined,
    };
  }
}

export const reviewService = new ReviewService();
export default reviewService;
