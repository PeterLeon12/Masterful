import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images and documents
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  // Check file extension as well as MIME type
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Tip de fișier nepermis. Doar ${allowedExtensions.join(', ')} sunt acceptate.`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadController = {
  async uploadAvatar(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Niciun fișier nu a fost încărcat',
          code: 'NO_FILE_UPLOADED',
        });
      }

      // Validate file type
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Doar fișiere imagine sunt permise pentru avatar',
          code: 'INVALID_FILE_TYPE',
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      logger.info(`Avatar uploaded for user ${userId}: ${req.file.filename}`);

      return res.status(200).json({
        success: true,
        message: 'Avatar încărcat cu succes',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
        },
      });
    } catch (error) {
      logger.error('Upload avatar error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la încărcarea avatar-ului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async uploadDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Niciun fișier nu a fost încărcat',
          code: 'NO_FILE_UPLOADED',
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      logger.info(`Document uploaded for user ${userId}: ${req.file.filename}`);

      return res.status(200).json({
        success: true,
        message: 'Document încărcat cu succes',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          type: req.file.mimetype,
        },
      });
    } catch (error) {
      logger.error('Upload document error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la încărcarea documentului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async uploadMultiple(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Niciun fișier nu a fost încărcat',
          code: 'NO_FILES_UPLOADED',
        });
      }

      const files = req.files as Express.Multer.File[];
      const uploadedFiles = files.map(file => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        size: file.size,
        type: file.mimetype,
      }));
      
      logger.info(`${files.length} files uploaded for user ${userId}`);

      return res.status(200).json({
        success: true,
        message: `${files.length} fișiere încărcate cu succes`,
        data: { files: uploadedFiles },
      });
    } catch (error) {
      logger.error('Upload multiple files error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la încărcarea fișierelor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async deleteFile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { filename } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const filePath = path.join('uploads', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Fișierul nu a fost găsit',
          code: 'FILE_NOT_FOUND',
        });
      }

      // Delete file
      fs.unlinkSync(filePath);
      
      logger.info(`File deleted by user ${userId}: ${filename}`);

      return res.status(200).json({
        success: true,
        message: 'Fișierul a fost șters cu succes',
      });
    } catch (error) {
      logger.error('Delete file error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la ștergerea fișierului',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
