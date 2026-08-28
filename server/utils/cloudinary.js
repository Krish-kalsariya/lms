// // import { v2 as cloudinary } from "cloudinary";
// // import dotenv from "dotenv";
// // dotenv.config();

// // cloudinary.config({
// //   cloud_name: process.env.CLOUD_NAME,
// //   api_key: process.env.API_KEY,
// //   api_secret: process.env.API_SECRET,
// // });

// // // upload image
// // export const uploadMedia = async (filePath) => {
// //   return await cloudinary.uploader.upload(filePath, {
// //     folder: "profile_images",
// //     resource_type: "image",
// //   });
// // };

// // /* ================= VIDEO UPLOAD ================= */
// // export const uploadVideo = async (filePath) => {
// //   return await cloudinary.uploader.upload(filePath, {
// //     folder: "course_lectures",
// //     resource_type: "video",
// //   });
// // };

// // // delete old image
// // export const deleteMediaFromCloudinary = async (publicId) => {
// //   await cloudinary.uploader.destroy(publicId);
// // };

// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";

// dotenv.config();

// /* ================= CLOUDINARY CONFIG ================= */
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

// /* ================= IMAGE UPLOAD ================= */
// export const uploadMedia = async (filePath) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: "profile_images",
//       resource_type: "image",
//     });

//     return result;
//   } catch (error) {
//     console.error("Cloudinary Image Upload Error:", error);
//     throw error;
//   }
// };

// /* ================= VIDEO UPLOAD (FIXED) ================= */
// // export const uploadVideo = async (filePath) => {
// //   try {
// //     const result = await cloudinary.uploader.upload(filePath, {
// //       folder: "course_lectures",
// //       resource_type: "video",

// //       format: "mp4", // ✅ FORCE MP4 (VERY IMPORTANT)

// //       eager: [
// //         {
// //           format: "mp4",
// //           quality: "auto",
// //         },
// //       ],
// //       eager_async: true, // ✅ generates streaming metadata
// //     });

// //     return result;
// //   } catch (error) {
// //     console.error("Cloudinary Video Upload Error:", error);
// //     throw error;
// //   }
// // };

// import { v2 as cloudinary } from "cloudinary";

// const uploadVideoToCloudinary = async (filePath) => {
//   const result = await cloudinary.uploader.upload(filePath, {
//     resource_type: "video", // 🔥 THIS IS THE FIX
//   });

//   return result.secure_url; // 🔥 THIS URL IS PLAYABLE
// };

// /* ================= DELETE IMAGE ================= */
// export const deleteMediaFromCloudinary = async (publicId) => {
//   try {
//     return await cloudinary.uploader.destroy(publicId, {
//       resource_type: "image",
//     });
//   } catch (error) {
//     console.error("Cloudinary Image Delete Error:", error);
//     throw error;
//   }
// };

// /* ================= DELETE VIDEO ================= */
// export const deleteVideoFromCloudinary = async (publicId) => {
//   try {
//     return await cloudinary.uploader.destroy(publicId, {
//       resource_type: "video",
//     });
//   } catch (error) {
//     console.error("Cloudinary Video Delete Error:", error);
//     throw error;
//   }
// };

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

/* ================= CLOUDINARY CONFIG ================= */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/* ================= IMAGE UPLOAD ================= */
export const uploadMedia = async (filePath) => {
  try {
    return await cloudinary.uploader.upload(filePath, {
      folder: "profile_images",
      resource_type: "image",
    });
  } catch (error) {
    console.error("Cloudinary Image Upload Error:", error);
    throw error;
  }
};

/* ================= VIDEO UPLOAD ================= */
export const uploadVideo = async (filePath) => {
  try {
    return await cloudinary.uploader.upload(filePath, {
      folder: "course_lectures",
      resource_type: "video",
      format: "mp4",
      eager: [{ format: "mp4", quality: "auto" }],
      eager_async: true,
    });
  } catch (error) {
    console.error("Cloudinary Video Upload Error:", error);
    throw error;
  }
};

/* ================= DELETE IMAGE ================= */
export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Cloudinary Image Delete Error:", error);
    throw error;
  }
};

/* ================= DELETE VIDEO ================= */
export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
  } catch (error) {
    console.error("Cloudinary Video Delete Error:", error);
    throw error;
  }
};
