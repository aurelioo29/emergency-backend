const multer = require("multer");
const path = require("path");
const fs = require("fs");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createImageUploader(folderName, maxSizeMb = 5) {
  const uploadDir = path.join(__dirname, `../../uploads/${folderName}`);

  ensureDir(uploadDir);

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, uploadDir);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, safeName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP, and SVG images are allowed"));
    }

    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeMb * 1024 * 1024,
    },
  });
}

const uploadEmergencyPhoto = createImageUploader("emergency-reports", 5);
const uploadServiceIcon = createImageUploader("services", 2);

module.exports = {
  uploadEmergencyPhoto,
  uploadServiceIcon,
};
