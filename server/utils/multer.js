// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}${path.extname(file.originalname)}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: {
//     // fileSize: 100 * 1024 * 1024, // 100MB
//     fileSize: 1 * 1024 * 1024 // ✅ 1MB
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedExt = [
//       // images
//       ".jpg",
//       ".jpeg",
//       ".png",
//       ".webp",
//       // videos
//       ".mp4",
//       ".mkv",
//       ".avi",
//       ".mov",
//       ".webm",
//     ];

//     const ext = path.extname(file.originalname).toLowerCase();

//     if (allowedExt.includes(ext)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image or video files are allowed"));
//     }
//   },
// });

// export default upload;


import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExt = [
      // images
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      // videos
      ".mp4",
      ".mkv",
      ".avi",
      ".mov",
      ".webm",
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image or video files are allowed"));
    }
  },
});

export default upload;
