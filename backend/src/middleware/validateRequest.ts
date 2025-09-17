import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Extend Request interface to include file property
interface MulterRequest extends Request {
  file?: any;
}

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: (error as any).path,
      message: error.msg,
      value: (error as any).value
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Validarea a eșuat',
      details: errorMessages
    });
  }

  return next();
};

// Custom validation helpers
export const validatePagination = [
  (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    
    if (page < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page number',
        message: 'Numărul paginii nu este valid'
      });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit',
        message: 'Limita nu este validă (1-100)'
      });
    }
    
    req.query['page'] = page.toString();
    req.query['limit'] = limit.toString();
    return next();
  }
];

export const validateLocation = [
  (req: Request, res: Response, next: NextFunction) => {
    const { county, city } = req.body.location || {};
    
    if (!county || !city) {
      return res.status(400).json({
        success: false,
        error: 'Location required',
        message: 'Locația este obligatorie (județ și oraș)'
      });
    }
    
    // Validate Romanian counties and cities
    const validCounties = [
      'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila',
      'Brașov', 'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța',
      'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
      'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt',
      'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea',
      'Vâlcea', 'Vaslui', 'Vrancea'
    ];
    
    if (!validCounties.includes(county)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid county',
        message: 'Județul nu este valid'
      });
    }
    
    if (city.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid city',
        message: 'Orașul nu este valid'
      });
    }
    
    return next();
  }
];

export const validateBudget = [
  (req: Request, res: Response, next: NextFunction) => {
    const { type, amount, currency } = req.body.budget || {};
    
    if (!type || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Budget information required',
        message: 'Informațiile despre buget sunt obligatorii'
      });
    }
    
    if (!['fixed', 'hourly', 'range'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid budget type',
        message: 'Tipul de buget nu este valid'
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Suma trebuie să fie mai mare decât 0'
      });
    }
    
    if (!['RON', 'EUR', 'USD'].includes(currency)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid currency',
        message: 'Moneda nu este validă'
      });
    }
    
    return next();
  }
];

export const validateFileUpload = [
  (req: MulterRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'File required',
        message: 'Fișierul este obligatoriu'
      });
    }
    
    const allowedTypes = process.env["ALLOWED_FILE_TYPES"]?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type',
        message: 'Tipul de fișier nu este permis'
      });
    }
    
    const maxSize = parseInt(process.env["MAX_FILE_SIZE"] || '10485760'); // 10MB default
    
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'Fișierul este prea mare'
      });
    }
    
    return next();
  }
];
