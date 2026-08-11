import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max size
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
      return cb(new Error('INVALID_FILE_TYPE: Only image files (.jpg, .jpeg, .png, .webp, .gif) are allowed.'));
    }

    // Anti-malicious upload check
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      return cb(new Error('MALICIOUS_FILENAME: File path traversal attempt detected.'));
    }

    cb(null, true);
  },
});
