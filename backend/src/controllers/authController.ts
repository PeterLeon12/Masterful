import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { databaseService } from '../services/databaseService';
import { logger } from '../utils/logger';

// Validate JWT secret on startup
if (!process.env['JWT_SECRET']) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const authController = {
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
      const existingUser = await databaseService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Un utilizator cu acest email există deja',
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await databaseService.createUser({
        email,
        password: hashedPassword,
        name,
        role,
        phone,
      });

      // Create profile based on role
      if (role === 'PROFESSIONAL') {
        await databaseService.createProfessional({
          userId: user.id,
          categories: '',
          hourlyRate: 0,
          experience: 0,
        });
      } else if (role === 'CLIENT') {
        // Client profile will be created automatically via Prisma relations
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env['JWT_SECRET']!,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      logger.info(`User registered successfully: ${email}`);

      return res.status(201).json({
        success: true,
        message: 'Cont creat cu succes!',
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la crearea contului',
        code: 'REGISTRATION_ERROR',
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email și parola sunt obligatorii',
          code: 'MISSING_CREDENTIALS',
        });
      }

      // Find user by email
      const user = await databaseService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email-ul sau parola nu sunt corecte',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Contul este dezactivat',
          code: 'ACCOUNT_DEACTIVATED',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email-ul sau parola nu sunt corecte',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Update last login
      await databaseService.updateUser(user.id, {
        lastLoginAt: new Date(),
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env['JWT_SECRET']!,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      logger.info(`User logged in successfully: ${email}`);

      return res.status(200).json({
        success: true,
        message: 'Autentificare reușită!',
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la autentificare',
        code: 'LOGIN_ERROR',
      });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just return a success message
      logger.info(`User logged out: ${req.user?.email}`);
      
      return res.status(200).json({
        success: true,
        message: 'Deconectare reușită!',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la deconectare',
        code: 'LOGOUT_ERROR',
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

      const user = await databaseService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizatorul nu a fost găsit',
          code: 'USER_NOT_FOUND',
        });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        data: {
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea profilului',
        code: 'PROFILE_FETCH_ERROR',
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

      const { name, phone, bio, dateOfBirth, gender, languages, address } = req.body;

      // Update user basic info
      const updateData: any = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;

      if (Object.keys(updateData).length > 0) {
        await databaseService.updateUser(userId, updateData);
      }

      // Update or create profile
      if (bio || dateOfBirth || gender || languages || address) {
        const profileData: any = {};
        if (bio) profileData.bio = bio;
        if (dateOfBirth) profileData.dateOfBirth = new Date(dateOfBirth);
        if (gender) profileData.gender = gender;
        if (languages) profileData.languages = languages;
        if (address) profileData.address = address;

        // This would need to be implemented in the database service
        // For now, we'll just log the profile update
        logger.info(`Profile update requested for user: ${userId}`, profileData);
      }

      logger.info(`Profile updated for user: ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Profil actualizat cu succes!',
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la actualizarea profilului',
        code: 'PROFILE_UPDATE_ERROR',
      });
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Parola actuală și parola nouă sunt obligatorii',
          code: 'MISSING_PASSWORD_FIELDS',
        });
      }

      // Get current user to verify current password
      const user = await databaseService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizatorul nu a fost găsit',
          code: 'USER_NOT_FOUND',
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Parola actuală nu este corectă',
          code: 'INVALID_CURRENT_PASSWORD',
        });
      }

      // Hash new password
      const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await databaseService.updateUser(userId, {
        password: hashedNewPassword,
      });

      logger.info(`Password changed for user: ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Parola a fost schimbată cu succes!',
      });
    } catch (error) {
      logger.error('Change password error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la schimbarea parolei',
        code: 'PASSWORD_CHANGE_ERROR',
      });
    }
  },

  // Placeholder methods for future implementation

  async verifyEmail(_req: Request, res: Response) {
    return res.status(501).json({
      success: false,
      message: 'Verificarea email-ului nu este implementată încă',
      code: 'NOT_IMPLEMENTED',
    });
  },

  async verifyPhone(_req: Request, res: Response) {
    return res.status(501).json({
      success: false,
      message: 'Verificarea telefonului nu este implementată încă',
      code: 'NOT_IMPLEMENTED',
    });
  },

  async resendVerification(_req: Request, res: Response) {
    return res.status(501).json({
      success: false,
      message: 'Retrimiterea verificării nu este implementată încă',
      code: 'NOT_IMPLEMENTED',
    });
  },

  async googleLogin(_req: Request, res: Response) {
    return res.status(501).json({
      success: false,
      message: 'Autentificarea cu Google nu este implementată încă',
      code: 'NOT_IMPLEMENTED',
    });
  },

  async appleLogin(_req: Request, res: Response) {
    return res.status(501).json({
      success: false,
      message: 'Autentificarea cu Apple nu este implementată încă',
      code: 'NOT_IMPLEMENTED',
    });
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

      // Check if user exists
      const user = await databaseService.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({
          success: true,
          message: 'Dacă adresa de email există în sistem, vei primi un link de resetare a parolei',
        });
      }

      // Generate reset token (in production, use crypto.randomBytes)
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        process.env['JWT_SECRET']!,
        { expiresIn: '1h' }
      );

      // TODO: Send email with reset link
      // For now, just log the token (in production, send email)
      logger.info(`Password reset token for ${email}: ${resetToken}`);

      return res.status(200).json({
        success: true,
        message: 'Dacă adresa de email există în sistem, vei primi un link de resetare a parolei',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la procesarea cererii',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token-ul și noua parolă sunt obligatorii',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      // Verify reset token
      const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any;
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({
          success: false,
          message: 'Token invalid',
          code: 'INVALID_TOKEN',
        });
      }

      // Hash new password
      const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user password
      await databaseService.updateUser(decoded.userId, {
        password: hashedPassword,
      });

      logger.info(`Password reset successful for user: ${decoded.userId}`);

      return res.status(200).json({
        success: true,
        message: 'Parola a fost resetată cu succes',
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(400).json({
          success: false,
          message: 'Token invalid sau expirat',
          code: 'INVALID_TOKEN',
        });
      }

      logger.error('Reset password error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la procesarea cererii',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
