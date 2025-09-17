import { Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService';
import { logger } from '../utils/logger';

export const supabaseAuthController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role = 'CLIENT', phone } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password și numele sunt obligatorii',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      // Check if user already exists
      const existingUser = await supabaseService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Un utilizator cu acest email există deja',
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      // Create user with Supabase Auth
      const user = await supabaseService.createUser({
        email,
        password,
        name,
        role,
        phone,
      });

      // Create professional profile if needed
      if (role === 'PROFESSIONAL') {
        await supabaseService.createProfessional({
          user_id: user.id,
          categories: '',
          hourly_rate: 0,
          experience: 0,
        });
      }

      logger.info(`User registered successfully: ${user.email}`);

      return res.status(201).json({
        success: true,
        message: 'Utilizator creat cu succes',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            is_verified: user.is_verified,
            created_at: user.created_at,
          },
        },
      });
    } catch (error: any) {
      logger.error('Register error:', error);
      
      if (error.message?.includes('already registered')) {
        return res.status(409).json({
          success: false,
          message: 'Un utilizator cu acest email există deja',
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la crearea utilizatorului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email și parola sunt obligatorii',
          code: 'MISSING_CREDENTIALS',
        });
      }

      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabaseService.client.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return res.status(401).json({
          success: false,
          message: 'Email sau parolă incorectă',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Get user profile
      const user = await supabaseService.findUserById(authData.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Profilul utilizatorului nu a fost găsit',
          code: 'USER_NOT_FOUND',
        });
      }

      // Update last login
      await supabaseService.updateUser(user.id, {
        last_login_at: new Date().toISOString(),
      });

      logger.info(`User logged in successfully: ${user.email}`);

      return res.status(200).json({
        success: true,
        message: 'Autentificare reușită',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            is_verified: user.is_verified,
            last_login_at: new Date().toISOString(),
          },
          session: {
            access_token: authData.session?.access_token,
            refresh_token: authData.session?.refresh_token,
            expires_at: authData.session?.expires_at,
          },
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la autentificare',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (refresh_token) {
        // Sign out with Supabase
        const { error } = await supabaseService.client.auth.signOut();
        if (error) {
          logger.error('Logout error:', error);
        }
      }

      logger.info('User logged out successfully');

      return res.status(200).json({
        success: true,
        message: 'Deconectare reușită',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la deconectare',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token este obligatoriu',
          code: 'MISSING_REFRESH_TOKEN',
        });
      }

      // Refresh session with Supabase
      const { data: authData, error: authError } = await supabaseService.client.auth.refreshSession({
        refresh_token,
      });

      if (authError || !authData.session) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token invalid',
          code: 'INVALID_REFRESH_TOKEN',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Token reîmprospătat cu succes',
        data: {
          session: {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_at: authData.session.expires_at,
          },
        },
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la reîmprospătarea token-ului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const user = await supabaseService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizatorul nu a fost găsit',
          code: 'USER_NOT_FOUND',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            is_verified: user.is_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea profilului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { name, phone, avatar } = req.body;
      const updates: any = {};

      if (name) updates.name = name;
      if (phone) updates.phone = phone;
      if (avatar) updates.avatar = avatar;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nu s-au furnizat date pentru actualizare',
          code: 'NO_UPDATES',
        });
      }

      const updatedUser = await supabaseService.updateUser(userId, updates);

      return res.status(200).json({
        success: true,
        message: 'Profil actualizat cu succes',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            is_verified: updatedUser.is_verified,
            updated_at: updatedUser.updated_at,
          },
        },
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la actualizarea profilului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      // Soft delete - mark as inactive
      await supabaseService.updateUser(userId, {
        is_active: false,
        email: `deleted_${Date.now()}_${userId}@deleted.local`,
        name: 'Utilizator șters',
        phone: null,
      });

      logger.info(`User account deleted: ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Cont șters cu succes',
      });
    } catch (error) {
      logger.error('Delete account error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la ștergerea contului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email-ul este obligatoriu',
          code: 'MISSING_EMAIL',
        });
      }

      // Send password reset email with Supabase
      const { error } = await supabaseService.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env['FRONTEND_URL']}/reset-password`,
      });

      if (error) {
        logger.error('Forgot password error:', error);
        return res.status(500).json({
          success: false,
          message: 'A apărut o eroare la trimiterea email-ului de resetare',
          code: 'EMAIL_SEND_ERROR',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Email de resetare trimis cu succes',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la trimiterea email-ului de resetare',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { password, access_token, refresh_token } = req.body;

      if (!password || !access_token || !refresh_token) {
        return res.status(400).json({
          success: false,
          message: 'Parola și token-urile sunt obligatorii',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      // Set session and update password
      const { error: sessionError } = await supabaseService.client.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        return res.status(401).json({
          success: false,
          message: 'Token-urile sunt invalide',
          code: 'INVALID_TOKENS',
        });
      }

      const { error: updateError } = await supabaseService.client.auth.updateUser({
        password,
      });

      if (updateError) {
        return res.status(500).json({
          success: false,
          message: 'A apărut o eroare la actualizarea parolei',
          code: 'PASSWORD_UPDATE_ERROR',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Parola a fost actualizată cu succes',
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la actualizarea parolei',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
