import { Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService';
import { logger } from '../utils/logger';

export const supabaseProfessionalController = {
  async getProfessionals(req: Request, res: Response) {
    try {
      const {
        categories,
        minRating,
        maxHourlyRate,
        isAvailable,
        limit = 20,
        offset = 0
      } = req.query;

      // Build the query
      let query = supabaseService.client
        .from('professionals')
        .select(`
          *,
          user:users!professionals_user_id_fkey (
            id,
            name,
            email,
            avatar,
            phone
          ),
          reviews:reviews!reviews_professional_id_fkey (
            id,
            rating,
            comment,
            created_at
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (categories) {
        const categoryArray = Array.isArray(categories) ? categories : [categories];
        query = query.overlaps('categories', categoryArray);
      }

      if (minRating) {
        query = query.gte('rating', parseFloat(minRating as string));
      }

      if (maxHourlyRate) {
        query = query.lte('hourly_rate', parseFloat(maxHourlyRate as string));
      }

      if (isAvailable !== undefined) {
        query = query.eq('is_available', isAvailable === 'true');
      }

      // Apply pagination
      query = query
        .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)
        .order('rating', { ascending: false });

      const { data: professionals, error, count } = await query;

      if (error) {
        logger.error('Error fetching professionals:', error);
        return res.status(500).json({
          success: false,
          message: 'Eroare la încărcarea meșterilor',
          error: error.message
        });
      }

      // Calculate average ratings and review counts
      const professionalsWithStats = professionals?.map(professional => {
        const reviews = professional.reviews || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
          : 0;
        const reviewCount = reviews.length;

        return {
          id: professional.id,
          user: professional.user,
          categories: professional.categories,
          service_areas: professional.service_areas,
          hourly_rate: professional.hourly_rate,
          rating: Math.round(avgRating * 10) / 10,
          review_count: reviewCount,
          completed_jobs: professional.completed_jobs || 0,
          is_available: professional.is_available,
          bio: professional.bio,
          experience_years: professional.experience_years,
          languages: professional.languages,
          created_at: professional.created_at,
          updated_at: professional.updated_at
        };
      }) || [];

      res.json({
        success: true,
        data: {
          professionals: professionalsWithStats,
          total: count || 0,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });
      return;

    } catch (error) {
      logger.error('Error in getProfessionals:', error);
      res.status(500).json({
        success: false,
        message: 'Eroare internă a serverului',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  },

  async getProfessional(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data: professional, error } = await supabaseService.client
        .from('professionals')
        .select(`
          *,
          user:users!professionals_user_id_fkey (
            id,
            name,
            email,
            avatar,
            phone
          ),
          reviews:reviews!reviews_professional_id_fkey (
            id,
            rating,
            comment,
            created_at,
            client:users!reviews_client_id_fkey (
              name,
              avatar
            )
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Meșterul nu a fost găsit'
          });
        }
        
        logger.error('Error fetching professional:', error);
        return res.status(500).json({
          success: false,
          message: 'Eroare la încărcarea meșterului',
          error: error.message
        });
      }

      // Calculate average rating and review count
      const reviews = professional.reviews || [];
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
        : 0;
      const reviewCount = reviews.length;

      const professionalWithStats = {
        id: professional.id,
        user: professional.user,
        categories: professional.categories,
        service_areas: professional.service_areas,
        hourly_rate: professional.hourly_rate,
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviewCount,
        completed_jobs: professional.completed_jobs || 0,
        is_available: professional.is_available,
        bio: professional.bio,
        experience_years: professional.experience_years,
        languages: professional.languages,
        reviews: reviews.map((review: any) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          client: review.client
        })),
        created_at: professional.created_at,
        updated_at: professional.updated_at
      };

      res.json({
        success: true,
        data: professionalWithStats
      });
      return;

    } catch (error) {
      logger.error('Error in getProfessional:', error);
      res.status(500).json({
        success: false,
        message: 'Eroare internă a serverului',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  },

  async updateProfessionalProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const {
        categories,
        service_areas,
        hourly_rate,
        bio,
        experience_years,
        languages,
        is_available
      } = req.body;

      // Validate required fields
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Categoriile de servicii sunt obligatorii'
        });
      }

      if (!service_areas || !Array.isArray(service_areas) || service_areas.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Zonele de serviciu sunt obligatorii'
        });
      }

      if (!hourly_rate || hourly_rate <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Tariful orar trebuie să fie mai mare de 0'
        });
      }

      // Update professional profile
      const { data: professional, error } = await supabaseService.client
        .from('professionals')
        .update({
          categories,
          service_areas,
          hourly_rate: parseFloat(hourly_rate),
          bio,
          experience_years: experience_years ? parseInt(experience_years) : null,
          languages: languages || [],
          is_available: is_available !== undefined ? is_available : true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select(`
          *,
          user:users!professionals_user_id_fkey (
            id,
            name,
            email,
            avatar,
            phone
          )
        `)
        .single();

      if (error) {
        logger.error('Error updating professional profile:', error);
        return res.status(500).json({
          success: false,
          message: 'Eroare la actualizarea profilului',
          error: error.message
        });
      }

      res.json({
        success: true,
        data: {
          professional: {
            id: professional.id,
            user: professional.user,
            categories: professional.categories,
            service_areas: professional.service_areas,
            hourly_rate: professional.hourly_rate,
            bio: professional.bio,
            experience_years: professional.experience_years,
            languages: professional.languages,
            is_available: professional.is_available,
            created_at: professional.created_at,
            updated_at: professional.updated_at
          }
        }
      });
      return;

    } catch (error) {
      logger.error('Error in updateProfessionalProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Eroare internă a serverului',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  }
};
