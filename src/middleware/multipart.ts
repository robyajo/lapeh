import multer from "multer";

// Middleware for parsing multipart/form-data (text fields only)
export const parseMultipart = multer().none();

// Middleware for parsing multipart/form-data with files
// You can configure storage/limits here as needed
export const upload = multer({
  dest: "storage/uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
