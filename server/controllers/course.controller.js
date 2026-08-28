import { json } from "express";
import Course from "../models/course.model.js";
import Lecture from "../models/lecture.model.js";
import { uploadMedia, deleteMediaFromCloudinary , deleteVideoFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import { uploadVideo } from "../utils/cloudinary.js";
import User from "../models/user.model.js"

// Helper: Extract public_id from Cloudinary URL
const extractPublicId = (url) => {
  try {
    // Handle both: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    // And: https://res.cloudinary.com/cloud_name/image/upload/folder/public_id.ext
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find 'upload' index and get everything after it (excluding version numbers starting with 'v')
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Get parts after 'upload', skip version numbers (v1234567890)
    const relevantParts = pathParts.slice(uploadIndex + 1).filter(part => !/^v\d+$/.test(part));
    
    // Join remaining parts and remove extension
    const publicId = relevantParts.join('/').replace(/\.[^/.]+$/, '');
    return publicId;
  } catch (error) {
    console.error("Failed to extract public_id from URL:", url, error);
    return null;
  }
};

// ================= COURSE CONTROLLERS =================

//create course
export const createCourse = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      courseprice,
    } = req.body;

    if (!courseTitle || !category) {
      return res.status(400).json({
        success: false,
        message: "Course title and category are required",
      });
    }

    // CHECK DUPLICATE TITLE (case insensitive)
    const existingCourse = await Course.findOne({
      courseTitle: { $regex: new RegExp("^" + courseTitle + "$", "i") },
      creator: req.user._id, // only same instructor
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "You already created a course with this title",
      });
    }

    let thumbnailUrl = "";

    if (req.file) {
      const uploadResult = await uploadMedia(req.file.path);
      thumbnailUrl = uploadResult.secure_url;
    }

    const course = await Course.create({
      courseThumbnail: thumbnailUrl,
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      courseprice: Number(courseprice),
      creator: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });

  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Failed to delete local file:", err);
        }
      });
    }
  }
};
//search course
export const searchCourse = async (req,res) => {
    try {
        const {query = "", category = [], sortByPrice = ""} = req.query;

        //create serach query
        const serachCriteria = {
            isPublished:true,
            $or:[
                {courseTitle: {$regex:query , $options:"i"}},
                {subTitle: {$regex:query , $options:"i"}},
                {category: {$regex:query , $options:"i"}}
            ]
        }

        //if categories selected
        if (category.length > 0) {
            serachCriteria.category = {$in : category};
        }

        //define sorting oredr
        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = -1;
        } else if(sortByPrice == "high") {
            sortOptions.coursePrice = -1;
        }

        let course = await Course.find(serachCriteria).populate({path:"creator", select:"name photoUrl"}).sort(sortOptions);

        return res.status(200).json({
            success:true,
            courses: courses || []
        });

    } catch (error) {
        console.error("Search course error:", error);
        return res.status(500).json({
            message:"Failed toget a published courses"
        })
    }
}

//Draft Course (instructor)
export const getDraftCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      creator: req.user._id,
      isPublished: false,
    });

    return res.status(200).json({ courses });
  } catch (error) {
    console.error("Get draft courses error:", error);
    return res.status(500).json({
      message: "Failed to fetch draft courses",
    });
  }
};

//publish course (instructor)
export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      creator: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    course.isPublished = true;
    await course.save();

    return res.status(200).json({
      message: "Course published successfully",
    });
  } catch (error) {
    console.error("Publish course error:", error);
    return res.status(500).json({
      message: "Failed to publish course",
    });
  }
};

//get publish courses (student side)
export const getPublishedCourse = async (_,res) => {
    try {
        const course =await Course.find({isPublished:true}).populate({path:"creator", select:"name photoUrl"});
        if (!course) {
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            course,
        })
    } catch (error) {
        console.error("Get published course error:", error);
        return res.status(500).json({
            message:"Failed toget a published courses"
        })
    }
}

//get instructor courses
export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const courses = await Course.find({ creator: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.error("Get creator courses error:", error);
    return res.status(500).json({
      message: "Failed to fetch courses",
    });
  }
};

//edit course
export const editCourse = async (req,res) => {
    try {
        const courseId = req.params.courseId;
        const {courseTitle,subTitle, description , category , courseLevel , courseprice}= req.body;
        const thumbnail =req.file;

        let course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            })
        }
        let courseThumbnail;
        if (thumbnail) {
            if (course.courseThumbnail) {
                const publicId = extractPublicId(course.courseThumbnail);
                await deleteMediaFromCloudinary(publicId);  // delete old image
            }
        // upload a thumbnail on clourdinary
            courseThumbnail = await uploadMedia(thumbnail.path);
        }

        const updateData = {courseTitle,subTitle,description,category,courseLevel,courseprice, courseThumbnail:courseThumbnail?.secure_url};

        course = await Course.findByIdAndUpdate(courseId , updateData , {new:true});

        return res.status(200).json({
            course,
            message:"Course update successfully."
        })
    } catch (error) {
        console.error("Edit course error:", error);
        return res.status(500).json({
            message : "Failed to create course"
        })
    }
 finally {
    //delete file from local uploads folder
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Failed to delete local file:", err);
        }
      });
    }
  }
}

//get course by id - for course details page (public)
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: "lectures",
      select: "title videoInfo isPreviewFree",
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isLoggedIn = req.isAuthenticated && req.isAuthenticated();
    const isEnrolled =
      isLoggedIn &&
      course.enrolledStudents.some(
        (id) => id.toString() === req.user?._id.toString()
      );

    // Filter lectures for non-enrolled users
    let lectures = course.lectures;
    if (!isEnrolled) {
      lectures = lectures.filter((lec) => lec.isPreviewFree);
    }

    res.status(200).json({
      success: true,
      course: {
        _id: course._id,
        courseTitle: course.courseTitle,
        subTitle: course.subTitle,          // added
        description: course.description,
        category: course.category,
        courseLevel: course.courseLevel,
        courseprice: course.courseprice,
        courseThumbnail: course.courseThumbnail,
        averageRating: course.averageRating,
        totalReviews: course.totalReviews,
        isEnrolled,
      },
      lectures,
    });
  } catch (error) {
    console.error("Get course by id error:", error);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

//delete course
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user._id; // from auth middleware

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Security: only creator can delete
    if (course.creator.toString() !== instructorId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this course",
      });
    }

    // Delete thumbnail from Cloudinary (optional)
    if (course.courseThumbnail) {
      const publicId = extractPublicId(course.courseThumbnail);
      await deleteMediaFromCloudinary(publicId);
    }

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({
      message: "Failed to delete course",
    });
  }
};

// ================= LECTURE CONTROLLERS =================
export const createLecture = async (req, res) => {
  try {
    const { title, isPreviewFree } = req.body;
    const { courseId } = req.params;

    // No video
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video is required",
      });
    }

    // Course not found
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Upload video to Cloudinary
    const uploadedVideo = await uploadVideo(req.file.path);

    // Create lecture with duration
    const lecture = await Lecture.create({
      title,
      isPreviewFree: isPreviewFree === "true" || isPreviewFree === true,
      course: courseId,
      videoInfo: {
        videoUrl: uploadedVideo.secure_url,
        publicId: uploadedVideo.public_id,
        duration: Math.floor(uploadedVideo.duration), // seconds
      },
    });

    // Push lecture into course
    course.lectures.push(lecture._id);
    await course.save();

    return res.status(201).json({
      success: true,
      message: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    console.error("Create lecture error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    // Delete local uploaded file
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Failed to delete local file:", err);
        }
      });
    }
  }
};


export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: "lectures",
      select: "title videoInfo isPreviewFree createdAt",
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let lectures = course.lectures || [];

    // Visitor case → only free preview lectures
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      lectures = lectures.filter((lec) => lec.isPreviewFree);
    }

    res.status(200).json({
      success: true,
      lectures,
    });
  } catch (error) {
    console.error("Get course lectures error:", error);
    res.status(500).json({ message: "Failed to fetch lectures" });
  }
};

//edit leacture
export const editLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, isPreviewFree } = req.body;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // update fields
    if (title) lecture.title = title;

    if (typeof isPreviewFree !== "undefined") {
      lecture.isPreviewFree =
        isPreviewFree === "true" || isPreviewFree === true;
    }

    // video update
    if (req.file) {
      if (lecture.videoInfo?.publicId) {
        await deleteVideoFromCloudinary(
          lecture.videoInfo.publicId
        );
      }

      const uploadedVideo = await uploadVideo(req.file.path);

      lecture.videoInfo = {
        videoUrl: uploadedVideo.secure_url,
        publicId: uploadedVideo.public_id,
      };
    }

    // MAIN FIX
    const updatedLecture = await lecture.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      success: true,
      message: "Lecture updated successfully",
      lecture: updatedLecture,
    });
  } catch (error) {
    console.error("Edit lecture error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
finally {
    //delete file from local uploads folder
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Failed to delete local file:", err);
        }
      });
    }
  }
};

//remove lecture
export const removeLeacture = async (req,res) => {
    try {
        const {lectureId} =req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message : "Lecture not found!"
            });
        }

        // delete the lecture from couldinary as well
       if (lecture.videoInfo?.publicId) {
    await deleteVideoFromCloudinary(lecture.videoInfo.publicId);
}

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            {lectures:lectureId}, // find the course that contains the lecture
            {$pull: {lectures: lectureId}}  // Remove the lectures id from the lectures array
        );

        return res.status(200).json({
            message : "Lecture removed successfully."
        })

    } catch (error) {
     console.error("Remove lecture error:", error);
     return res.status(500).json({
        message : "Failed to remove lecture"
     })   
    }
}

//get lecture by id
export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    
    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    return res.status(200).json({ success: true, lecture });
  } catch (error) {
    console.error("Get lecture by id error:", error);
    return res.status(500).json({ success: false, message: "Error fetching lecture" });
  }
};


// publich unpublish course logic
export const tooglepublishCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {publish} = req.body;
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            });
        }
        // publish status based on the query paramter
        course.isPublished = publish == "true" ;
        await course.save();

        const statusMessage = course.isPublished ? "Course published successfully." : "Course unpublished successfully.";
        return res.status(200).json({
            course,
            message:`Course is ${statusMessage}`
        });
    } catch (error) {
        console.error("Toggle publish course error:", error);
        return res.status(500).json({
            message:"Failed to publish/unpublish status"
        });
    }
};

export const getInstructorDashboardStats = async (req, res) => {
  try {
    const instructorId = req.user._id;

    // Instructor courses with more details
    const courses = await Course.find({ creator: instructorId })
      .populate("enrolledStudents", "createdAt")
      .sort({ createdAt: -1 });

    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const draftCourses = courses.filter(c => !c.isPublished).length;

    let enrolledStudents = 0;
    let revenue = 0;
    let totalRating = 0;
    let coursesWithReviews = 0;

    // Category distribution
    const categoryCount = {};
    const levelCount = { Beginner: 0, Intermediate: 0, Advanced: 0 };

    courses.forEach(course => {
      enrolledStudents += course.enrolledStudents.length;
      revenue += course.enrolledStudents.length * (course.courseprice || 0);
      
      if (course.averageRating > 0) {
        totalRating += course.averageRating;
        coursesWithReviews++;
      }

      // Category stats
      categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
      
      // Level stats
      if (course.courseLevel) {
        levelCount[course.courseLevel]++;
      }
    });

    const averageRating = coursesWithReviews > 0 ? (totalRating / coursesWithReviews).toFixed(1) : 0;

    // Platform counts
    const [totalStudents, totalInstructors] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "instructor" })
    ]);

    // ========= GRAPH DATA (OPTIMIZED: IN-MEMORY BATCH) =========
    
    // Extract all unique enrolled student IDs for 1 single query instead of 120+ DB calls
    const allStudentIds = [...new Set(courses.flatMap(c => (c.enrolledStudents || []).map(s => s._id || s)))];
    const enrolledUsersList = allStudentIds.length > 0
      ? await User.find({ _id: { $in: allStudentIds } }).select("_id createdAt")
      : [];
    const userMap = new Map(enrolledUsersList.map(u => [u._id.toString(), u.createdAt]));

    const months = [];
    const monthlyEnrollments = [];
    const monthlyRevenue = [];
    const cumulativeStudents = [];
    
    let runningTotal = 0;
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleString('default', { month: 'short' }));
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      
      let monthEnrollments = 0;
      let monthRevenue = 0;
      
      for (const course of courses) {
        for (const student of course.enrolledStudents) {
          const studentId = (student._id || student).toString();
          const userCreatedAt = userMap.get(studentId);
          if (userCreatedAt && userCreatedAt >= startOfMonth && userCreatedAt <= endOfMonth) {
            monthEnrollments++;
            monthRevenue += course.courseprice || 0;
          }
        }
      }
      
      monthlyEnrollments.push(monthEnrollments);
      monthlyRevenue.push(monthRevenue);
      runningTotal += monthEnrollments;
      cumulativeStudents.push(runningTotal);
    }

    // Course-wise enrollment stats (top 10 courses)
    const courseStats = courses
      .map(course => ({
        name: course.courseTitle,
        enrollments: course.enrolledStudents.length,
        revenue: course.enrolledStudents.length * (course.courseprice || 0),
        rating: course.averageRating,
        isPublished: course.isPublished,
        category: course.category,
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 10);

    // Category distribution for pie chart
    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
    }));

    // Level distribution
    const levelData = Object.entries(levelCount).map(([name, value]) => ({
      name,
      value,
    })).filter(item => item.value > 0);

    // Recent activity - last 5 enrolled courses
    const recentCourses = courses
      .filter(c => c.enrolledStudents.length > 0)
      .slice(0, 5)
      .map(c => ({
        id: c._id,
        name: c.courseTitle,
        enrollments: c.enrolledStudents.length,
        thumbnail: c.courseThumbnail,
      }));

    // Calculate growth percentages
    const currentMonthEnrollments = monthlyEnrollments[11] || 0;
    const previousMonthEnrollments = monthlyEnrollments[10] || 0;
    const enrollmentGrowth = previousMonthEnrollments > 0 
      ? Math.round(((currentMonthEnrollments - previousMonthEnrollments) / previousMonthEnrollments) * 100)
      : 0;

    const currentMonthRevenue = monthlyRevenue[11] || 0;
    const previousMonthRevenue = monthlyRevenue[10] || 0;
    const revenueGrowth = previousMonthRevenue > 0 
      ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalStudents,
        enrolledStudents,
        totalInstructors,
        revenue,
        averageRating,
        // Growth metrics
        enrollmentGrowth,
        revenueGrowth,
        // Graph data
        monthlyStats: {
          labels: months,
          enrollments: monthlyEnrollments,
          revenue: monthlyRevenue,
          cumulativeStudents,
        },
        courseStats,
        categoryData,
        levelData,
        recentCourses,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Dashboard error" });
  }
};

//course enrollment
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    const userUpdate = await User.updateOne(
      { _id: userId },
      { $addToSet: { enrolledCourses: courseId } }
    );

    if (userUpdate.modifiedCount === 0) {
      return res
        .status(400)
        .json({ message: "Already enrolled" });
    }

    await Course.updateOne(
      { _id: courseId },
      { $addToSet: { enrolledStudents: userId } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

//get enrolled course student - for profile 
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const courses = await Course.find({
      enrolledStudents: userId,
    }).populate("creator", "name photoUrl");

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses",
    });
  }
};

//get enrolled students
export const getEnrolledStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user._id;

    const course = await Course.findOne({
      _id: courseId,
      creator: instructorId,
    }).populate("enrolledStudents", "name email createdAt");

    if (!course) {
      return res.status(403).json({
        message: "Course not found or unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      students: course.enrolledStudents,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ================= ❤️ SAVE / UNSAVE COURSE =================

// save course (student)
export const saveCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    
    // check course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // add to saved courses (no duplicates)
    const result = await User.updateOne(
      { _id: userId },
      { $addToSet: { savedCourses: courseId } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Course already saved",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course saved successfully",
    });
  } catch (error) {
    console.error("Save course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save course",
    });
  }
};

// unsave course (student)
export const unsaveCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    await User.updateOne(
      { _id: userId },
      { $pull: { savedCourses: courseId } }
    );

    return res.status(200).json({
      success: true,
      message: "Course removed from saved list",
    });
  } catch (error) {
    console.error("Unsave course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unsave course",
    });
  }
};