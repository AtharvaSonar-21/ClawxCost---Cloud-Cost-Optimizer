import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for streaming

const fileFilter = (req, file, cb) => {
  // Only accept CSV files
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.originalname.toLowerCase().endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Expected CSV file, got ${file.mimetype || path.extname(file.originalname)}`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

export default upload;
