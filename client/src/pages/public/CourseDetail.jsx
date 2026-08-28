/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import Confetti from "react-confetti";
import toast from "react-hot-toast";
import logo from "../../assets/Brainera-logo.png";
import {
  Play,
  CheckCircle,
  Lock,
  Download,
  Edit2,
  Trash2,
  X,
  Save,
  Clock,
  BookOpen,
  FileText,
  Award,
  Users,
  BarChart,
  Star,
  MessageSquare,
  Filter,
  SortAsc,
  SortDesc,
  ThumbsUp,
  User,
  HelpCircle,
  ChevronRight,
  AlertCircle,
  Trophy,
  Target,
  Check,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/Authcontext";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

const CourseDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const videoRef = useRef(null);
  const quizTimerRef = useRef(null);

  // --- UI & Tab States ---
  const [activeTab, setActiveTab] = useState("overview");
  const [noteText, setNoteText] = useState("");
  const MAX_NOTE_LENGTH = 1000;

  // --- Data States ---
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [notes, setNotes] = useState([]);

  // --- Quiz States ---
  const [quiz, setQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizStats, setQuizStats] = useState({
    bestScore: 0,
    totalAttempts: 0,
    passedAttempts: 0,
    hasPassedQuiz: false,
  });
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState({});
  const [quizTimeLeft, setQuizTimeLeft] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuizResult, setCurrentQuizResult] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizError, setQuizError] = useState("");

  // --- Review System States ---
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
  });
  const [canReview, setCanReview] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
    isCompleted: false,
  });

  // --- Review Form States ---
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // --- Review Filter/Sort ---
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState(0);

  // --- Progress & UI Feedback States ---
  const [progressPercent, setProgressPercent] = useState(0);
  const [markedLectures, setMarkedLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [canDownloadCertificate, setCanDownloadCertificate] = useState(false);

  // --- Editing Note States ---
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  // Helper: Format seconds to time string
  const formatDuration = (seconds = 0) => {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const sec = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${sec}s`;
    if (minutes > 0) return `${minutes}m ${sec}s`;
    return `${sec}s`;
  };

  const totalDurationSeconds = lectures.reduce(
    (sum, lec) => sum + (lec.videoInfo?.duration || 0),
    0
  );

  // ===================== QUIZ FUNCTIONS =====================

  const fetchQuiz = async () => {
    // Removed the early return that depended on stale course state
    try {
      setLoadingQuiz(true);
      setQuizError("");
      const response = await api.get(`/quiz/course/${courseId}/student`, {
        withCredentials: true,
      });

      if (response.data.quiz && response.data.quiz.isPublished) {
        setQuiz(response.data.quiz);
        setQuizQuestions(response.data.questions || []);
      } else {
        setQuiz(null);
        setQuizQuestions([]);
        setQuizError("Quiz is not published yet. Please check back later.");
      }
    } catch (error) {
      console.error("Quiz fetch error:", error);
      if (error.response?.status === 404) {
        setQuiz(null);
        setQuizQuestions([]);
        setQuizError("This course doesn't have any quiz yet. Check back later!");
      } else if (error.response?.status === 401) {
        setQuizError("Please refresh the page or login again.");
      } else {
        setQuizError("Failed to load quiz. Please try again.");
      }
    } finally {
      setLoadingQuiz(false);
    }
  };

  const fetchQuizAttempts = async () => {
    if (!quiz) return;

    try {
      const response = await api.get(`/quiz/${quiz._id}/my-result`, {
        withCredentials: true,
      });
      if (response.data.success) {
        const attempts = Array.isArray(response.data.results)
          ? response.data.results
          : response.data.result
          ? [response.data.result]
          : [];
        setQuizAttempts(attempts);

        if (attempts.length > 0) {
          const bestScore = Math.max(...attempts.map((a) => a.percentage || 0));
          const passedAttempts = attempts.filter((a) => a.passed).length;
          const hasPassedQuiz = passedAttempts > 0;

          setQuizStats({
            bestScore,
            totalAttempts: attempts.length,
            passedAttempts,
            hasPassedQuiz,
          });

          updateCertificateEligibility(hasPassedQuiz);
        }
      }
    } catch (error) {
      console.error("Failed to fetch quiz attempts:", error);
    }
  };

  const updateCertificateEligibility = (hasPassed = false) => {
    const lecturesCompleted = completionStatus.percentage >= 100;
    const quizPassed = !quiz || hasPassed;

    const canDownload = lecturesCompleted && quizPassed;
    setCanDownloadCertificate(canDownload);
    setCourseCompleted(canDownload);

    return canDownload;
  };

  const startQuiz = () => {
    if (!quiz) return;

    if (quizAttempts.length >= quiz.attemptsAllowed) {
      toast.error(`You have used all ${quiz.attemptsAllowed} attempts.`);
      return;
    }

    setCurrentQuizAnswers({});
    setQuizSubmitted(false);
    setCurrentQuizResult(null);
    setShowQuizResults(false);

    if (quiz.timeLimit > 0) {
      setQuizTimeLeft(quiz.timeLimit * 60);
    }

    setIsTakingQuiz(true);
  };

  useEffect(() => {
    if (!isTakingQuiz || quizTimeLeft <= 0 || quizSubmitted) return;

    quizTimerRef.current = setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(quizTimerRef.current);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (quizTimerRef.current) {
        clearInterval(quizTimerRef.current);
      }
    };
  }, [isTakingQuiz, quizTimeLeft, quizSubmitted]);

  const handleQuizAnswer = (questionId, optionIndex) => {
    setCurrentQuizAnswers({
      ...currentQuizAnswers,
      [questionId]: optionIndex,
    });
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    if (quizTimerRef.current) {
      clearInterval(quizTimerRef.current);
    }

    const answers = Object.entries(currentQuizAnswers).map(
      ([questionId, selectedOption]) => ({
        questionId,
        selectedOption: parseInt(selectedOption),
      })
    );

    if (answers.length !== quizQuestions.length) {
      const confirm = window.confirm(
        `You have answered ${answers.length} out of ${quizQuestions.length} questions. Submit anyway?`
      );
      if (!confirm) return;
    }

    try {
      const response = await api.post(
        `/quiz/${quiz._id}/submit`,
        { answers },
        { withCredentials: true }
      );

      if (response.data.success) {
        const attempt = response.data.attempt;
        setCurrentQuizResult(attempt);
        setQuizSubmitted(true);
        setIsTakingQuiz(false);

        await fetchQuizAttempts();

        // Refresh review status after quiz completion
        await checkUserReviewStatus();
        await fetchReviews();

        const passed = attempt.passed;
        toast.success(
          passed
            ? `🎉 Quiz Passed! Score: ${attempt.score}/${quizQuestions.length}`
            : `Quiz completed. Score: ${attempt.score}/${quizQuestions.length}`
        );

        const canDownload = updateCertificateEligibility(passed);

        if (passed && canDownload) {
          toast.success("🎉 Congratulations! You can now download your certificate!");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit quiz");
      setIsTakingQuiz(false);
    }
  };

  const checkCourseCompletion = async () => {
    if (!course?.isEnrolled) return;

    try {
      const res = await api.get(`/progress/${courseId}`);
      const prog = res.data.data.progress || [];
      const viewedLectures = prog.filter((p) => p.viewed).length;
      const lecturePercent = Math.round((viewedLectures / lectures.length) * 100);

      const lecturesCompleted = lecturePercent >= 100;

      setCompletionStatus({
        completed: viewedLectures,
        total: lectures.length,
        percentage: lecturePercent,
        isCompleted: lecturesCompleted,
      });

      updateCertificateEligibility(quizStats.hasPassedQuiz);

      if (canDownloadCertificate && !showCelebration) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
        toast.success("🎉 Congratulations! Course Completed!");

        setCanReview(true);
      }
    } catch (err) {
      console.error("Completion check failed", err);
    }
  };

  // ===================== AUTO-FETCH QUIZ ON TAB SWITCH =====================
  useEffect(() => {
    if (activeTab === "quiz" && course?.isEnrolled && !quiz && !loadingQuiz) {
      fetchQuiz();
    }
  }, [activeTab, course?.isEnrolled, quiz, loadingQuiz]);

  // ===================== RAZORPAY PAYMENT =====================
const handlePayment = async () => {
  if (course.isEnrolled) {
    toast.info("Already enrolled!");
    return;
  }

  setEnrolling(true);

  try {
    // Create Razorpay Order
    const orderRes = await api.post(`/payment/create-order`, {
      amount: course.courseprice,
    });

    const { order } = orderRes.data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,

// Branding
name: "Brainera", 
description: `Payment for ${course.courseTitle}`,

      // Prefill user data
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },

      notes: {
        courseId: courseId,
        courseName: course.courseTitle,
      },

      theme: {
        color: "#2563eb",
      },

      // Payment Success Handler
      handler: async function (response) {
        try {
          // Verify payment
          await api.post(`/payment/verify`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // Enroll user in course
          await api.post(`/course/${courseId}/enroll`);

          setCourse((prev) => ({
            ...prev,
            isEnrolled: true,
          }));

          // Auto select first lecture
          if (lectures.length > 0 && !currentLecture) {
            setCurrentLecture(lectures[0]);
          }

          toast.success("Payment successful! Course enrolled.");

          // Refresh course data
          setTimeout(() => {
            fetchReviews();
            checkUserReviewStatus();
            fetchQuiz();

            api
              .get(`/notes/${courseId}`)
              .then((notesRes) => {
                setNotes(notesRes.data.notes || []);
              })
              .catch(() => {});
          }, 1000);

        } catch (err) {
          console.error(err);
          toast.error("Payment verification failed.");
        }
      },

      modal: {
        ondismiss: function () {
          toast("Payment popup closed.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    toast.error("Failed to initiate payment.");
  } finally {
    setEnrolling(false);
  }
};
  // ===================== REVIEW SYSTEM FUNCTIONS =====================
  const fetchReviews = async () => {
    try {
      const response = await api.get(`/review/course/${courseId}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
        setReviewStats({
          averageRating: response.data.averageRating || 0,
          totalReviews: response.data.totalReviews || 0,
          ratingDistribution: calculateRatingDistribution(
            response.data.reviews
          ),
        });
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const checkUserReviewStatus = async () => {
    try {
      const response = await api.get(`/review/check/${courseId}`);
      if (response.data.success) {
        setUserReview(response.data.review);
        setCanReview(response.data.canReview);
        setCompletionStatus(response.data.completionStatus);
      }
    } catch (error) {
      console.error("Failed to check user review status:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!completionStatus.isCompleted) {
      toast.error(
        `Please complete the course first (${completionStatus.percentage}% complete)`
      );
      return;
    }

    if (!reviewForm.rating || !reviewForm.comment.trim()) {
      toast.error("Please provide both rating and comment");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await api.post(`/review/${courseId}`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      if (response.data.success) {
        const newReview = response.data.review;
        const newStats = response.data.courseStats;

        // Update user's own review
        setUserReview(newReview);
        setCanReview(false);
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: "" });

        // Calculate updated reviews list
        const updatedReviews = [newReview, ...reviews];

        // Update reviews list
        setReviews(updatedReviews);

        // Recalculate rating distribution
        const newDistribution = calculateRatingDistribution(updatedReviews);

        // Update review stats
        setReviewStats({
          averageRating: newStats.averageRating,
          totalReviews: newStats.totalReviews,
          ratingDistribution: newDistribution,
        });

        // Update course stats
        setCourse((prev) => ({
          ...prev,
          averageRating: newStats.averageRating,
          totalReviews: newStats.totalReviews,
        }));

        toast.success("Review submitted successfully!");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to submit review";
      toast.error(errorMsg);

      if (error.response?.data?.percentage !== undefined) {
        setCompletionStatus({
          completed: error.response.data.completed,
          total: error.response.data.total,
          percentage: error.response.data.percentage,
          isCompleted: error.response.data.percentage >= 100,
        });
      }

      await checkUserReviewStatus();
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateReview = async () => {
    if (!userReview?._id) return;

    setSubmittingReview(true);
    try {
      const response = await api.put(`/review/${userReview._id}`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      // API returns review directly or nested in data
      const updatedReview = response.data.review || response.data;
      const newStats = response.data.courseStats;

      if (updatedReview) {
        // Debug logging
        console.log("Update review response:", response.data);
        console.log("New stats from API:", newStats);

        // Update user's own review
        setUserReview(updatedReview);
        setShowReviewForm(false);

        // Calculate updated reviews list first
        const updatedReviewsList = reviews.map(r =>
          r._id === updatedReview._id ? updatedReview : r
        );

        // Update reviews list
        setReviews(updatedReviewsList);

        // Calculate new distribution from the updated list
        const newDistribution = calculateRatingDistribution(updatedReviewsList);

        // Use API stats or fallback to recalculating
        const newAvgRating = newStats?.averageRating !== undefined ? newStats.averageRating : reviewStats.averageRating;
        const newTotalReviews = newStats?.totalReviews !== undefined ? newStats.totalReviews : reviewStats.totalReviews;

        // Update review stats
        setReviewStats({
          averageRating: newAvgRating,
          totalReviews: newTotalReviews,
          ratingDistribution: newDistribution,
        });

        // Update course stats
        setCourse((prev) => ({
          ...prev,
          averageRating: newStats?.averageRating !== undefined ? newStats.averageRating : prev.averageRating,
          totalReviews: newStats?.totalReviews !== undefined ? newStats.totalReviews : prev.totalReviews,
        }));

        toast.success("Review updated successfully!");
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Update review error:", error);
      toast.error(error.response?.data?.message || "Failed to update review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = () => {
    if (!userReview?._id) return;

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium">Are you sure you want to delete your review?</p>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                const reviewIdToDelete = userReview._id;
                try {
                  const response = await api.delete(`/review/${reviewIdToDelete}`);

                  if (response.data.success) {
                    const newStats = response.data.courseStats;

                    // Remove user's review from state
                    setUserReview(null);
                    setCanReview(true);

                    // Optimistically remove from reviews list and recalculate distribution
                    setReviews(prev => {
                      const updatedReviews = prev.filter(r => r._id !== reviewIdToDelete);
                      const newDistribution = calculateRatingDistribution(updatedReviews);
                      setReviewStats({
                        averageRating: newStats.averageRating,
                        totalReviews: newStats.totalReviews,
                        ratingDistribution: newDistribution,
                      });
                      return updatedReviews;
                    });

                    // Update course stats
                    setCourse((prev) => ({
                      ...prev,
                      averageRating: newStats.averageRating,
                      totalReviews: newStats.totalReviews,
                    }));

                    toast.success("Review deleted successfully!", {
                      duration: 3000,
                    });
                  }
                } catch (error) {
                  toast.error("Failed to delete review", {
                    duration: 1000,
                  });
                } finally {
                  toast.dismiss(t.id);
                }
              }}
              className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 1000,
      }
    );
  };

  const openReviewForm = (edit = false) => {
    if (edit && userReview) {
      setReviewForm({
        rating: userReview.rating,
        comment: userReview.comment,
      });
    } else {
      setReviewForm({
        rating: 5,
        comment: "",
      });
    }
    setShowReviewForm(true);
  };

  const calculateRatingDistribution = (reviewsList) => {
    const distribution = [0, 0, 0, 0, 0];
    reviewsList.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution;
  };

  const getFilteredAndSortedReviews = () => {
    let filtered = reviews;

    if (filterRating > 0) {
      filtered = filtered.filter((review) => review.rating === filterRating);
    }

    switch (sortBy) {
      case "newest":
        return [...filtered].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return [...filtered].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "highest":
        return [...filtered].sort((a, b) => b.rating - a.rating);
      case "lowest":
        return [...filtered].sort((a, b) => a.rating - b.rating);
      default:
        return filtered;
    }
  };

  const renderStars = (rating, size = "text-lg") => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size === "text-lg" ? 18 : 14}
            className={`${
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  // ===================== MAIN EFFECTS =====================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, lectureRes] = await Promise.all([
          api.get(`/course/${courseId}`),
          api.get(`/course/${courseId}/lecture`),
        ]);

        setCourse(courseRes.data.course);
        const fetchedLectures = lectureRes.data.lectures || [];
        setLectures(fetchedLectures);

        // Set current lecture only if enrolled or if there's a free preview
        if (fetchedLectures.length > 0) {
          if (courseRes.data.course.isEnrolled) {
            setCurrentLecture(fetchedLectures[0]);
          } else {
            // Find first free preview lecture, if any
            const freePreview = fetchedLectures.find((lec) => lec.isPreviewFree);
            setCurrentLecture(freePreview || null);
          }
        }

        if (courseRes.data.course.isEnrolled) {
          const [notesRes] = await Promise.all([
            api.get(`/notes/${courseId}`).catch(() => ({ data: { notes: [] } })),
            fetchReviews(),
            checkUserReviewStatus(),
            fetchQuiz(),   // Now this will run because we removed the guard
          ]);
          setNotes(notesRes.data.notes || []);
        } else {
          await fetchReviews();
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Failed to load course data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (!course?.isEnrolled || lectures.length === 0) return;

    const fetchProgress = async () => {
      try {
        const res = await api.get(`/progress/${courseId}`);
        const prog = res.data.data.progress || [];
        const viewed = prog.filter((p) => p.viewed).length;
        const percent = Math.round((viewed / lectures.length) * 100);

        setProgressPercent(percent);
        setMarkedLectures(
          prog.filter((p) => p.viewed).map((p) => String(p.lectureId))
        );

        setCompletionStatus({
          completed: viewed,
          total: lectures.length,
          percentage: percent,
          isCompleted: percent >= 100,
        });

        setCanReview(percent >= 100 && !userReview);

        updateCertificateEligibility(quizStats.hasPassedQuiz);
      } catch (err) {
        console.error("Progress fetch error", err);
      }
    };
    fetchProgress();
  }, [course?.isEnrolled, lectures.length, courseId, userReview]);

  useEffect(() => {
    if (quiz) {
      fetchQuizAttempts();
    }
  }, [quiz]);

  const handleVideoEnded = async () => {
    if (!course?.isEnrolled || !currentLecture) return;
    const lectureId = String(currentLecture._id);

    if (markedLectures.includes(lectureId)) return;

    try {
      await api.post(`/progress/${courseId}/lecture/${lectureId}/view`);

      const res = await api.get(`/progress/${courseId}`);
      const prog = res.data.data.progress || [];
      const viewed = prog.filter((p) => p.viewed).length;
      const percent = Math.round((viewed / lectures.length) * 100);

      setProgressPercent(percent);
      setMarkedLectures(
        prog.filter((p) => p.viewed).map((p) => String(p.lectureId))
      );

      const newCompletionStatus = {
        completed: viewed,
        total: lectures.length,
        percentage: percent,
        isCompleted: percent >= 100,
      };

      setCompletionStatus(newCompletionStatus);

      const canDownload = updateCertificateEligibility(quizStats.hasPassedQuiz);

      if (canDownload) {
        setCanReview(true);
        setShowCelebration(true);
        toast.success(
          "🎉 Congratulations! Course Completed! You can now download your certificate."
        );

        // Refresh review status after course completion
        await checkUserReviewStatus();
        await fetchReviews();
      } else if (percent >= 100) {
        if (quiz) {
          toast.success("All lectures completed! Now pass the quiz to get your certificate.");
        } else {
          setCanReview(true);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 5000);
          toast.success("🎉 Congratulations! Course Completed!");
        }
      }
    } catch (err) {
      console.error("Progress update failed", err);
    }
  };

  // ===================== NOTES FUNCTIONS =====================
  const handleSaveNote = async () => {
    if (!noteText.trim() || !course?.isEnrolled) return;
    setSavingNote(true);
    try {
      const currentTime = videoRef.current?.currentTime || 0;
      const response = await api.post(`/notes/${courseId}`, {
        content: noteText,
        lectureId: currentLecture?._id,
        timestamp: currentTime,
      });
      setNotes([response.data.note, ...notes]);
      setNoteText("");
      toast.success("Note created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium">Are you sure you want to delete this note?</p>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                try {
                  await api.delete(`/notes/${noteId}`);

                  setNotes((prev) => prev.filter((n) => n._id !== noteId));

                  toast.success("Note deleted successfully 🗑️");
                } catch (err) {
                  console.error("Delete note failed:", err);
                  toast.error("Failed to delete note.");
                } finally {
                  toast.dismiss(t.id);
                }
              }}
              className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 1000,
      }
    );
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note._id);
    setEditingNoteText(note.content);
  };

  const handleSaveEditedNote = async () => {
    if (!editingNoteText.trim()) return;

    try {
      const res = await api.put(`/notes/${editingNoteId}`, {
        content: editingNoteText,
      });
      setNotes(notes.map((n) => (n._id === editingNoteId ? res.data.note : n)));
      setEditingNoteId(null);
      setEditingNoteText("");
      toast.success("Note updated successfully!");
    } catch (err) {
      console.error("Failed to update note", err);
      toast.error("Failed to update note.");
    }
  };

  // ===================== CERTIFICATE DOWNLOAD =====================
  const handleDownloadCertificate = async () => {
    if (!canDownloadCertificate) {
      if (completionStatus.percentage < 100) {
        toast.error(
          `Complete all lectures first (${completionStatus.percentage}% complete)`
        );
      } else if (quiz && !quizStats.hasPassedQuiz) {
        toast.error("You must pass the quiz to download the certificate");
      } else {
        toast.error("Course not completed yet!");
      }
      return;
    }

    try {
      const res = await api.get(`/certificate/${courseId}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${course.courseTitle}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Certificate download error:", error);
      if (error.response?.status === 404) {
        toast.error("Certificate not available yet. Please contact support.");
      } else {
        toast.error("Failed to download certificate. Please try again.");
      }
    }
  };

  // ===================== VIDEO PLAYER ACCESS CONTROL =====================
  const canWatchCurrentLecture = () => {
    if (!currentLecture) return false;
    return course?.isEnrolled || currentLecture.isPreviewFree;
  };

  // ===================== RENDER LOADING =====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-theme">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent"></div>
      </div>
    );
  }

  // ===================== RENDER QUIZ TAB CONTENT =====================
  const renderQuizTab = () => {
    if (!course?.isEnrolled) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-theme-glass rounded-full flex items-center justify-center">
            <Lock className="text-theme-muted" size={32} />
          </div>
          <h3 className="text-xl font-bold text-theme mb-2">Enroll to Access Quiz</h3>
          <p className="text-theme-muted mb-6">
            You need to enroll in this course to take the quiz.
          </p>
          <button
            onClick={handlePayment}
            className="bg-linear-to-r from-theme-accent to-theme-accent-secondary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg"
          >
            Enroll Now
          </button>
        </div>
      );
    }

    if (loadingQuiz) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent mx-auto"></div>
          <p className="text-theme-muted mt-4">Loading quiz...</p>
        </div>
      );
    }

    if (!quiz) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-theme-glass rounded-full flex items-center justify-center">
            <HelpCircle className="text-theme-muted" size={32} />
          </div>
          <h3 className="text-xl font-bold text-theme mb-2">No Quiz Available</h3>
          <p className="text-theme-muted mb-4">
            {quizError || "This course doesn't have any quiz yet. Check back later!"}
          </p>
          <div className="flex justify-center gap-3">
            {/* Refresh button removed – quiz auto‑fetches when tab is active */}
            <button
              onClick={() => setActiveTab("overview")}
              className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90"
            >
              Back to Overview
            </button>
          </div>
        </div>
      );
    }

    // Quiz Taking Interface
    if (isTakingQuiz) {
      const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`;
      };

      return (
        <div className="space-y-6">
          {/* Quiz Header */}
          <div className="bg-theme-glass p-6 rounded-xl border border-theme">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-theme mb-2">
                  {quiz?.title || "Quiz"}
                </h2>
                <p className="text-theme-muted">{quiz?.description || ""}</p>
              </div>
              {quiz?.timeLimit > 0 && (
                <div
                  className={`px-4 py-2 rounded-lg font-bold ${
                    quizTimeLeft < 60
                      ? "bg-red-500/10 text-red-600"
                      : "bg-blue-500/10 text-blue-600"
                  }`}
                >
                  ⏱️ {formatTime(quizTimeLeft)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-theme/30 p-3 rounded-lg">
                <p className="text-sm text-theme-muted">Time Limit</p>
                <p className="font-semibold">{quiz?.timeLimit || 0} min</p>
              </div>
              <div className="bg-theme/30 p-3 rounded-lg">
                <p className="text-sm text-theme-muted">Passing %</p>
                <p className="font-semibold">{quiz?.passPercentage || 40}%</p>
              </div>
              <div className="bg-theme/30 p-3 rounded-lg">
                <p className="text-sm text-theme-muted">Questions</p>
                <p className="font-semibold">{quizQuestions.length}</p>
              </div>
              <div className="bg-theme/30 p-3 rounded-lg">
                <p className="text-sm text-theme-muted">Answered</p>
                <p className="font-semibold">
                  {Object.keys(currentQuizAnswers).length}/{quizQuestions.length}
                </p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {quizQuestions.map((question, index) => (
              <div
                key={question._id}
                className="bg-theme-glass p-6 rounded-xl border border-theme"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-theme-accent/20 text-theme-accent rounded-full flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-theme mb-3">{question.question}</h3>
                    <div className="space-y-3">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            currentQuizAnswers[question._id] === optIndex
                              ? "bg-theme-accent/20 border border-theme-accent"
                              : "bg-theme/30 hover:bg-theme/50"
                          }`}
                          onClick={() => handleQuizAnswer(question._id, optIndex)}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              currentQuizAnswers[question._id] === optIndex
                                ? "border-theme-accent bg-theme-accent"
                                : "border-theme-muted"
                            }`}
                          >
                            {currentQuizAnswers[question._id] === optIndex && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="text-theme flex-1">{option}</span>
                          <span className="text-xs text-theme-muted">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-6 bg-theme-surface p-4 rounded-xl border border-theme shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-theme-muted">
                  Answered: {Object.keys(currentQuizAnswers).length}/{quizQuestions.length}
                </p>
                <p className="text-xs text-theme-muted">Click submit when you're ready</p>
              </div>
              <button
                onClick={handleSubmitQuiz}
                className="bg-linear-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Quiz Results View
    if (quizSubmitted && currentQuizResult) {
      return (
        <div className="space-y-6">
          {/* Quiz Result Header */}
          <div
            className={`p-6 rounded-xl border ${
              currentQuizResult.passed
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-theme mb-1">Quiz Result</h2>
                <p className="text-theme-muted">{quiz?.title || "Quiz"}</p>
              </div>
              <div
                className={`px-4 py-2 rounded-full font-bold ${
                  currentQuizResult.passed
                    ? "bg-green-500/20 text-green-600"
                    : "bg-red-500/20 text-red-600"
                }`}
              >
                {currentQuizResult.passed ? "PASSED" : "FAILED"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-theme-glass p-4 rounded-lg">
                <p className="text-sm text-theme-muted">Your Score</p>
                <p className="text-3xl font-bold text-theme">
                  {currentQuizResult.score}/{quizQuestions.length}
                </p>
              </div>
              <div className="bg-theme-glass p-4 rounded-lg">
                <p className="text-sm text-theme-muted">Percentage</p>
                <p className="text-3xl font-bold text-theme">
                  {currentQuizResult.percentage?.toFixed(1) || "0.0"}%
                </p>
              </div>
              <div className="bg-theme-glass p-4 rounded-lg">
                <p className="text-sm text-theme-muted">Passing %</p>
                <p className="text-3xl font-bold text-theme">
                  {quiz?.passPercentage || 40}%
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setQuizSubmitted(false);
                  setCurrentQuizResult(null);
                  setShowQuizResults(true);
                }}
                className="px-4 py-2 bg-theme-glass border border-theme rounded-lg text-theme hover:bg-theme/30"
              >
                View Details
              </button>
              <button
                onClick={startQuiz}
                disabled={quizAttempts.length >= (quiz?.attemptsAllowed || 1)}
                className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Retake Quiz ({quizAttempts.length}/{quiz?.attemptsAllowed || 1})
              </button>
            </div>
          </div>

          {/* Course Completion & Certificate Status */}
          <div
            className={`p-6 rounded-xl border ${
              canDownloadCertificate
                ? "bg-green-500/10 border-green-500/20"
                : "bg-yellow-500/10 border-yellow-500/20"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {canDownloadCertificate ? (
                <Trophy className="text-green-500" size={24} />
              ) : (
                <AlertCircle className="text-yellow-500" size={24} />
              )}
              <h3 className="font-semibold text-theme">
                {canDownloadCertificate ? "Certificate Ready!" : "Certificate Requirements"}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Lectures Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-theme-muted">Lectures Completed</span>
                  <span
                    className={`font-medium ${
                      completionStatus.percentage >= 100 ? "text-green-500" : "text-yellow-500"
                    }`}
                  >
                    {completionStatus.completed}/{completionStatus.total} (
                    {completionStatus.percentage}%)
                    {completionStatus.percentage >= 100 && " ✓"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      completionStatus.percentage >= 100 ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${completionStatus.percentage}%` }}
                  />
                </div>
              </div>

              {/* Quiz Status */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-theme-muted">Quiz Status</span>
                  <span
                    className={`font-medium ${
                      currentQuizResult.passed ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {currentQuizResult.passed ? "PASSED ✓" : "NOT PASSED"}
                  </span>
                </div>
                <p className="text-sm text-theme-muted">
                  {currentQuizResult.passed
                    ? "✓ Quiz requirement satisfied"
                    : `You need ${quiz?.passPercentage || 40}% to pass. You got ${
                        currentQuizResult.percentage?.toFixed(1) || "0.0"
                      }%`}
                </p>
              </div>

              {/* Certificate Download Button */}
              {canDownloadCertificate ? (
                <div className="pt-4 border-t border-green-500/20">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                    🎉 Congratulations! You've completed all requirements. Download your
                    certificate now!
                  </p>
                  <button
                    onClick={handleDownloadCertificate}
                    className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} /> Download Certificate
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-yellow-500/20">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {completionStatus.percentage < 100
                      ? `Complete all lectures (${completionStatus.percentage}% done) to unlock certificate`
                      : "Pass the quiz to unlock certificate download"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Quiz Overview (Not taking quiz)
    return (
      <div className="space-y-6">
        {/* Quiz Info Card */}
        <div className="bg-theme-glass p-6 rounded-xl border border-theme">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-theme mb-2">
                {quiz?.title || "Quiz"}
              </h2>
              <p className="text-theme-muted mb-4">{quiz?.description || ""}</p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                quiz?.isPublished
                  ? "bg-green-500/10 text-green-500"
                  : "bg-yellow-500/10 text-yellow-500"
              }`}
            >
              {quiz?.isPublished ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-theme/30 p-4 rounded-lg">
              <p className="text-sm text-theme-muted mb-1">Time Limit</p>
              <p className="text-lg font-semibold text-theme">
                {quiz?.timeLimit > 0 ? `${quiz?.timeLimit} min` : "No limit"}
              </p>
            </div>
            <div className="bg-theme/30 p-4 rounded-lg">
              <p className="text-sm text-theme-muted mb-1">Attempts</p>
              <p className="text-lg font-semibold text-theme">
                {quizAttempts.length}/{quiz?.attemptsAllowed || 1}
              </p>
            </div>
            <div className="bg-theme/30 p-4 rounded-lg">
              <p className="text-sm text-theme-muted mb-1">Passing %</p>
              <p className="text-lg font-semibold text-theme">
                {quiz?.passPercentage || 40}%
              </p>
            </div>
            <div className="bg-theme/30 p-4 rounded-lg">
              <p className="text-sm text-theme-muted mb-1">Questions</p>
              <p className="text-lg font-semibold text-theme">
                {quizQuestions.length}
              </p>
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className="flex gap-3">
            <button
              onClick={startQuiz}
              disabled={quizAttempts.length >= (quiz?.attemptsAllowed || 1)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                quizAttempts.length < (quiz?.attemptsAllowed || 1)
                  ? "bg-linear-to-r from-theme-accent to-theme-accent-secondary text-white hover:shadow-lg"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              {quizAttempts.length === 0
                ? "Start Quiz"
                : quizAttempts.length < (quiz?.attemptsAllowed || 1)
                ? "Retake Quiz"
                : "No Attempts Left"}
            </button>

            {quizAttempts.length > 0 && (
              <button
                onClick={() => setShowQuizResults(!showQuizResults)}
                className="px-6 py-3 bg-theme-glass border border-theme rounded-lg text-theme hover:bg-theme/30"
              >
                {showQuizResults ? "Hide Results" : "View Results"}
              </button>
            )}
          </div>
        </div>

        {/* Quiz Stats */}
        {quizAttempts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-theme-glass p-4 rounded-xl border border-theme">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="text-yellow-500" size={20} />
                <p className="text-sm text-theme-muted">Best Score</p>
              </div>
              <p className="text-2xl font-bold text-theme">
                {quizStats.bestScore.toFixed(1)}%
              </p>
            </div>
            <div className="bg-theme-glass p-4 rounded-xl border border-theme">
              <div className="flex items-center gap-3 mb-2">
                <Target className="text-blue-500" size={20} />
                <p className="text-sm text-theme-muted">Attempts</p>
              </div>
              <p className="text-2xl font-bold text-theme">{quizStats.totalAttempts}</p>
            </div>
            <div className="bg-theme-glass p-4 rounded-xl border border-theme">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="text-green-500" size={20} />
                <p className="text-sm text-theme-muted">Passed</p>
              </div>
              <p className="text-2xl font-bold text-theme">{quizStats.passedAttempts}</p>
            </div>
          </div>
        )}

        {/* Quiz Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <h3 className="font-semibold text-theme mb-3 flex items-center gap-2">
            <AlertCircle className="text-blue-500" size={20} />
            Quiz Instructions
          </h3>
          <ul className="space-y-2 text-sm text-theme-muted">
            <li className="flex items-start gap-2">
              <ChevronRight size={16} className="text-blue-500 mt-0.5" />
              <span>Quiz has {quizQuestions.length} multiple choice questions</span>
            </li>
            {quiz?.timeLimit > 0 && (
              <li className="flex items-start gap-2">
                <ChevronRight size={16} className="text-blue-500 mt-0.5" />
                <span>Time limit: {quiz?.timeLimit} minutes</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <ChevronRight size={16} className="text-blue-500 mt-0.5" />
              <span>You have {quiz?.attemptsAllowed || 1} attempt(s) total</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={16} className="text-blue-500 mt-0.5" />
              <span>Passing percentage: {quiz?.passPercentage || 40}%</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight size={16} className="text-blue-500 mt-0.5" />
              <span>
                You must pass the quiz to complete the course and earn certificate
              </span>
            </li>
          </ul>
        </div>

        {/* Quiz Attempts History */}
        {showQuizResults && quizAttempts.length > 0 && (
          <div className="bg-theme-glass rounded-xl border border-theme overflow-hidden">
            <div className="p-4 border-b border-theme">
              <h3 className="font-semibold text-theme">Quiz Attempt History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme bg-theme/50">
                    <th className="text-left p-4">Attempt #</th>
                    <th className="text-left p-4">Score</th>
                    <th className="text-left p-4">Percentage</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizAttempts.map((attempt) => (
                    <tr key={attempt._id} className="border-b border-theme/30 hover:bg-theme/20">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              attempt.passed
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {attempt.attemptNumber}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        {attempt.score}/{quizQuestions.length}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            attempt.percentage >= (quiz?.passPercentage || 40)
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {attempt.percentage?.toFixed(1) || "0.0"}%
                        </span>
                      </td>
                      <td className="p-4">
                        {attempt.passed ? (
                          <span className="flex items-center gap-2 text-green-500">
                            <Check size={16} /> Passed
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-500">
                            <XCircle size={16} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-theme-muted">
                        {new Date(attempt.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs">
                          {new Date(attempt.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===================== RENDER =====================
  return (
    <>
      {showCelebration && (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
      )}

      <div className="min-h-screen bg-gradient-theme py-8 text-theme">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Video & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-theme-surface rounded-2xl overflow-hidden border border-theme shadow-theme">
              {canWatchCurrentLecture() ? (
                <div className="relative">
                  <video
                    key={currentLecture?._id}
                    ref={videoRef}
                    controls
                    onEnded={handleVideoEnded}
                    className="w-full h-96 bg-black rounded-t-2xl"
                    poster={course?.courseThumbnail}
                  >
                    <source
                      src={currentLecture?.videoInfo?.videoUrl}
                      type="video/mp4"
                    />
                  </video>
                </div>
              ) : (
                <div className="relative h-96">
                  <img
                    src={course?.courseThumbnail}
                    className="w-full h-full object-cover"
                    alt="Thumbnail"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Lock className="text-white" size={24} />
                      </div>

                      <p className="text-white font-semibold mb-2">
                        {currentLecture
                          ? "Enroll to watch this lecture"
                          : "Enroll to access course lectures"}
                      </p>

                      <p className="text-white/80 text-sm mb-4">
                        {course?.isEnrolled
                          ? "You don't have access to this lecture"
                          : "Purchase this course to unlock all lectures"}
                      </p>

                      {!course?.isEnrolled &&
                        (!user ? (
                          <button
                            onClick={() => navigate("/login")}
                            className="bg-linear-to-r from-theme-accent to-theme-accent-secondary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                          >
                            Login to Enroll
                          </button>
                        ) : (
                          <button
                            onClick={handlePayment}
                            className="bg-linear-to-r from-theme-accent to-theme-accent-secondary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                          >
                            Enroll Now
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs Navigation - Modified: quiz tab appears only after all lectures completed */}
            <div className="flex border-b border-theme mt-4 overflow-x-auto">
              {(() => {
                // Determine if quiz tab should be shown
                const showQuizTab = course?.isEnrolled && completionStatus.percentage >= 100;
                const tabs = ["overview", "notes", "reviews"];
                if (showQuizTab) tabs.push("quiz");
                return tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-semibold capitalize transition-all relative shrink-0 ${
                      activeTab === tab
                        ? "text-theme-accent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-theme-accent"
                        : "text-theme-muted hover:text-theme-accent/80"
                    }`}
                  >
                    {tab === "quiz" ? (
                      <span className="flex items-center gap-2">
                        <HelpCircle size={14} />
                        Quiz
                      </span>
                    ) : (
                      tab
                    )}
                  </button>
                ));
              })()}
            </div>

            {/* Dynamic Content Area */}
            <div className="bg-theme-surface rounded-2xl p-8 border border-theme shadow-theme min-h-96">
              {/* OVERVIEW SECTION */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-theme mb-4">
                      {course?.courseTitle}
                    </h1>
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <p className="text-theme-muted leading-relaxed">
                        {course?.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar (only for enrolled users) */}
                  {course?.isEnrolled && (
                    <div className="border-t border-theme pt-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-theme flex items-center gap-2">
                          <BarChart size={16} /> Progress
                        </h3>
                        <span className="text-sm font-bold text-theme-accent">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="relative w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden mb-2">
                        <div
                          className="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-500 dark:from-purple-500 dark:to-cyan-400 h-full transition-all duration-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-theme-muted">
                        <span>
                          {markedLectures.length} of {lectures.length} lectures completed
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {formatDuration(totalDurationSeconds)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Course Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-theme pt-6">
                    {!course?.isEnrolled ? (
                      <div className="bg-theme-glass p-4 rounded-xl border border-theme">
                        <p className="text-theme-muted text-sm mb-2 font-medium">
                          Course Price
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-theme">
                            ₹{course?.courseprice || 0}
                          </span>
                          <span className="text-theme-muted text-sm line-through">
                            ₹{Math.round((course?.courseprice || 0) * 1.2)}
                          </span>
                        </div>
                        <p className="text-xs text-theme-muted/70 mt-2">One-time payment</p>
                      </div>
                    ) : (
                      <div className="bg-theme-glass p-4 rounded-xl border border-theme">
                        <p className="text-theme-muted text-sm mb-2 font-medium">
                          Enrollment Status
                        </p>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-green-500" size={20} />
                          <span className="text-lg font-bold text-theme">Enrolled</span>
                        </div>
                        <p className="text-xs text-theme-muted/70 mt-2">Full access granted</p>
                      </div>
                    )}

                    {/* Reviews Stat */}
                    <div className="bg-theme-glass p-4 rounded-xl border border-theme">
                      <p className="text-theme-muted text-sm mb-2 font-medium">
                        Course Rating
                      </p>
                      <div className="flex items-center gap-2">
                        {renderStars(course?.averageRating || 0)}
                        <span className="text-lg font-bold text-theme">
                          {(course?.averageRating || 0).toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-theme-muted/70 mt-2">
                        {course?.totalReviews || 0} reviews
                      </p>
                    </div>

                    <div className="bg-theme-glass p-4 rounded-xl border border-theme">
                      <p className="text-theme-muted text-sm mb-2 font-medium">
                        Total Duration
                      </p>
                      <p className="text-lg font-semibold text-theme-accent-secondary flex items-center gap-2">
                        <Clock size={16} />
                        {formatDuration(totalDurationSeconds)}
                      </p>
                    </div>

                    <div className="bg-theme-glass p-4 rounded-xl border border-theme">
                      <p className="text-theme-muted text-sm mb-2 font-medium">Lectures</p>
                      <p className="text-lg font-semibold text-theme flex items-center gap-2">
                        <FileText size={16} />
                        {lectures.length} Videos
                      </p>
                    </div>

                    {/* Quiz Stat if enrolled */}
                    {course?.isEnrolled && quiz && (
                      <div className="bg-theme-glass p-4 rounded-xl border border-theme">
                        <p className="text-theme-muted text-sm mb-2 font-medium">
                          Quiz Status
                        </p>
                        <div className="flex items-center gap-2">
                          <HelpCircle className="text-blue-500" size={16} />
                          <span className="text-lg font-semibold text-theme">
                            {quizStats.hasPassedQuiz
                              ? "PASSED"
                              : quizAttempts.length > 0
                              ? "NOT PASSED"
                              : "NOT TAKEN"}
                          </span>
                        </div>
                        <p className="text-xs text-theme-muted/70 mt-2">
                          {quizAttempts.length} attempt(s)
                        </p>
                      </div>
                    )}

                    {/* Certificate Status */}
                    {course?.isEnrolled && (
                      <div
                        className={`p-4 rounded-xl border ${
                          canDownloadCertificate
                            ? "bg-green-500/10 border-green-500"
                            : "bg-blue-500/10 border-blue-500"
                        }`}
                      >
                        <p className="text-theme-muted text-sm mb-2 font-medium">
                          Certificate Status
                        </p>
                        <div className="flex items-center gap-2">
                          {canDownloadCertificate ? (
                            <CheckCircle className="text-green-500" size={20} />
                          ) : (
                            <Clock className="text-blue-500" size={20} />
                          )}
                          <span className="text-lg font-bold text-theme">
                            {canDownloadCertificate ? "READY" : "IN PROGRESS"}
                          </span>
                        </div>
                        <p className="text-xs text-theme-muted/70 mt-2">
                          {canDownloadCertificate
                            ? "Ready to download"
                            : `${completionStatus.percentage}% completed`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-theme pt-6">
                    {enrollMessage && (
                      <p className="text-theme-accent-secondary font-medium">{enrollMessage}</p>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                      {!user ? (
                        <button
                          onClick={() => navigate("/login")}
                          className="bg-linear-to-r from-theme-accent to-theme-accent-secondary text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 w-full sm:w-auto shadow-lg"
                        >
                          Login to Enroll
                        </button>
                      ) : !course?.isEnrolled ? (
                        <button
                          onClick={handlePayment}
                          disabled={enrolling}
                          className="bg-linear-to-r from-theme-accent to-theme-accent-secondary text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto shadow-lg"
                        >
                          {enrolling ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">Enroll Now</span>
                          )}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-theme-accent/10 text-theme-accent px-6 py-3 rounded-xl font-semibold border border-theme-accent/20">
                          Enrolled
                        </span>
                      )}

                      {user && course?.isEnrolled && canDownloadCertificate && (
                        <button
                          onClick={handleDownloadCertificate}
                          className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                          Download Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* NOTES SECTION */}
              {activeTab === "notes" && (
                <div className="space-y-6">
                  {course?.isEnrolled ? (
                    <>
                      <div className="bg-theme-glass rounded-xl overflow-hidden border border-theme">
                        <div className="flex items-center justify-between p-3 border-b border-theme bg-theme/50">
                          <span className="text-xs font-semibold text-theme-muted flex items-center gap-2">
                            <FileText size={12} /> New Note
                          </span>
                          <span
                            className={`text-xs font-mono ${
                              noteText.length > MAX_NOTE_LENGTH - 100
                                ? "text-red-400"
                                : "text-theme-muted"
                            }`}
                          >
                            {MAX_NOTE_LENGTH - noteText.length}
                          </span>
                        </div>
                        <textarea
                          className="w-full p-4 bg-transparent text-theme outline-none h-40 resize-none placeholder:text-theme-muted/50 focus:border-theme-accent focus:ring-1 focus:ring-theme-accent/30"
                          placeholder="Type your notes here... (Supports markdown)"
                          value={noteText}
                          onChange={(e) =>
                            setNoteText(e.target.value.slice(0, MAX_NOTE_LENGTH))
                          }
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setNoteText("")}
                          className="px-4 py-2 text-theme-muted hover:text-theme hover:bg-theme-surface rounded-lg transition-colors text-sm border border-theme"
                        >
                          Clear
                        </button>
                        <button
                          onClick={handleSaveNote}
                          disabled={savingNote || !course?.isEnrolled || !noteText.trim()}
                          className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {savingNote ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Saving...
                            </span>
                          ) : (
                            "Save Note"
                          )}
                        </button>
                      </div>

                      {/* Saved Notes List */}
                      <div className="space-y-4 pt-6 border-t border-theme">
                        <h3 className="font-semibold text-theme flex items-center gap-2">
                          <FileText size={16} className="text-theme-accent" /> Your Notes (
                          {notes.length})
                        </h3>
                        {notes.length === 0 ? (
                          <div className="text-center py-10 text-theme-muted/50 bg-theme-glass rounded-xl border border-dashed border-theme">
                            <div className="text-4xl mb-3">📝</div>
                            <p className="text-sm">
                              No notes yet. Start by adding your first note above!
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {notes.map((n) => (
                              <div
                                key={n._id}
                                className="bg-theme-glass p-5 rounded-xl border border-theme hover:border-theme-accent/30 transition-colors group"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono bg-theme-accent/10 text-theme-accent px-2 py-1 rounded">
                                      {Math.floor(n.timestamp / 60)}:
                                      {(n.timestamp % 60).toFixed(0).padStart(2, "0")}
                                    </span>
                                    {n.lectureId && (
                                      <span className="text-xs text-theme-muted bg-theme/30 px-2 py-1 rounded">
                                        Lecture{" "}
                                        {lectures.findIndex((l) => l._id === n.lectureId) + 1}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-theme-muted/50">
                                    {new Date(n.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>

                                {editingNoteId === n._id ? (
                                  <div className="space-y-3">
                                    <textarea
                                      className="w-full p-3 bg-theme border border-theme rounded-lg text-theme resize-none focus:border-theme-accent focus:outline-none"
                                      value={editingNoteText}
                                      onChange={(e) => setEditingNoteText(e.target.value)}
                                      rows={3}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setEditingNoteId(null)}
                                        className="px-3 py-1.5 text-sm border border-theme text-theme-muted hover:text-theme rounded-lg transition-colors flex items-center gap-1"
                                      >
                                        <X size={14} /> Cancel
                                      </button>
                                      <button
                                        onClick={handleSaveEditedNote}
                                        className="px-3 py-1.5 text-sm bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90 transition-colors flex items-center gap-1"
                                      >
                                        <Save size={14} /> Save Changes
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm text-theme leading-relaxed whitespace-pre-wrap mb-4">
                                      {n.content}
                                    </p>
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleEditNote(n)}
                                        className="p-1.5 text-theme-accent hover:bg-theme-accent/10 rounded transition-colors"
                                        title="Edit note"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteNote(n._id)}
                                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                        title="Delete note"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 bg-theme-glass rounded-full flex items-center justify-center">
                        <Lock className="text-theme-muted" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-theme mb-2">Enroll to Take Notes</h3>
                      <p className="text-theme-muted mb-6">
                        You need to enroll in this course to save notes.
                      </p>
                      <button
                        onClick={handlePayment}
                        className="bg-linear-to-r from-theme-accent to-theme-accent-secondary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg"
                      >
                        Enroll Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* REVIEWS SECTION */}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Reviews Header with Stats */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-theme pb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-theme mb-2">Student Reviews</h2>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="text-3xl font-bold text-theme">
                            {reviewStats.averageRating.toFixed(1)}
                          </div>
                          {renderStars(reviewStats.averageRating)}
                        </div>
                        <div className="text-theme-muted">
                          <span className="font-semibold">{reviewStats.totalReviews}</span>{" "}
                          reviews
                        </div>
                      </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2 min-w-50">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviewStats.ratingDistribution[rating - 1] || 0;
                        const percentage =
                          reviewStats.totalReviews > 0
                            ? (count / reviewStats.totalReviews) * 100
                            : 0;

                        return (
                          <div key={rating} className="flex items-center gap-2">
                            <div className="flex items-center gap-1 w-10">
                              <span className="text-sm text-theme-muted">{rating}</span>
                              <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-yellow-500 to-yellow-600 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-theme-muted w-8 text-right">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* User Review Section */}
                  {course?.isEnrolled && (
                    <div className="bg-theme-glass p-5 rounded-xl border border-theme">
                      <h3 className="font-semibold text-theme mb-4 flex items-center gap-2">
                        <User className="text-theme-accent" size={18} /> Your Review
                      </h3>

                      {userReview ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                {renderStars(userReview.rating, "text-base")}
                                <span className="text-sm text-theme-muted">
                                  {new Date(userReview.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-theme">{userReview.comment}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openReviewForm(true)}
                                className="p-2 text-theme-accent hover:bg-theme-accent/10 rounded-lg transition-colors"
                                title="Edit review"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={handleDeleteReview}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete review"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {canReview ? (
                            <div>
                              <p className="text-theme mb-3">
                                Share your experience with this course!
                              </p>
                              <button
                                onClick={() => openReviewForm(false)}
                                className="bg-linear-to-r from-(--accent-primary) to-(--accent-secondary) text-white px-5 py-2.5 rounded-lg font-semibold transition-all hover:shadow-lg flex items-center gap-2"
                              >
                                <MessageSquare size={16} /> Write a Review
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                <p className="text-yellow-600 dark:text-yellow-400 font-medium mb-1">
                                  Complete the course to leave a review
                                </p>
                                <p className="text-sm text-theme-muted">
                                  {completionStatus.completed} of {completionStatus.total}{" "}
                                  lectures completed ({completionStatus.percentage}%)
                                </p>
                                <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full mt-2 overflow-hidden">
                                  <div
                                    className="h-full bg-linear-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-500"
                                    style={{ width: `${completionStatus.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-theme-muted" />
                      <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(Number(e.target.value))}
                        className="custom-select bg-theme-surface border border-theme rounded-lg px-3 py-1.5 text-sm text-theme focus:outline-none"
                      >
                        <option value={0}>All Ratings</option>
                        <option value={5}>5 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={2}>2 Stars</option>
                        <option value={1}>1 Star</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <SortAsc size={16} className="text-theme-muted" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="custom-select bg-theme-surface border border-theme rounded-lg px-3 py-1.5 text-sm text-theme focus:outline-none"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                      </select>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {getFilteredAndSortedReviews().length === 0 ? (
                      <div className="text-center py-10 text-theme-muted/50 bg-theme-glass rounded-xl border border-dashed border-theme">
                        <div className="text-4xl mb-3">💬</div>
                        <p className="text-sm">
                          No reviews yet. Be the first to review this course!
                        </p>
                      </div>
                    ) : (
                      getFilteredAndSortedReviews().map((review) => (
                        <div
                          key={review._id}
                          className="bg-theme-glass p-5 rounded-xl border border-theme hover:border-theme-accent/30 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              {review.user?.avatar ? (
                                <img
                                  src={review.user.avatar}
                                  alt={review.user.name}
                                  className="w-10 h-10 rounded-full object-cover border border-theme"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-theme-accent/20 rounded-full flex items-center justify-center border border-theme">
                                  <User className="text-theme-accent" size={18} />
                                </div>
                              )}
                              <div>
                                <h4 className="font-medium text-theme">
                                  {review.user?.name || "Anonymous"}
                                </h4>
                                <p className="text-xs text-theme-muted">
                                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              {renderStars(review.rating, "text-base")}
                            </div>
                          </div>

                          <p className="text-theme leading-relaxed whitespace-pre-wrap">
                            {review.comment}
                          </p>

                          {review.updatedAt !== review.createdAt && (
                            <p className="text-xs text-theme-muted mt-3 italic">
                              Edited on {new Date(review.updatedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* QUIZ SECTION */}
              {activeTab === "quiz" && renderQuizTab()}
            </div>
          </div>

          {/* RIGHT: Course Content Sidebar */}
          <div className="space-y-6">
            {/* Progress Summary Card */}
            {course?.isEnrolled && (
              <div className="bg-theme-surface rounded-2xl p-6 border border-theme shadow-theme">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-theme flex items-center gap-2">
                    <BarChart className="text-theme-accent" size={18} /> Your Progress
                  </h2>
                  <span className="text-lg font-bold text-theme-accent">{progressPercent}%</span>
                </div>
                <div className="relative w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-500 dark:from-purple-500 dark:to-cyan-400 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-theme-muted mb-4">
                  <span>
                    {markedLectures.length} of {lectures.length} completed
                  </span>
                  <span>
                    {Math.round(
                      (totalDurationSeconds * markedLectures.length) / lectures.length / 60
                    )}
                    m watched
                  </span>
                </div>

                {/* Quiz Status */}
                {quiz && (
                  <div className="mb-4 p-3 bg-theme-glass rounded-lg border border-theme">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-theme-muted">Quiz Status</span>
                      {quizAttempts.length > 0 ? (
                        <span
                          className={`text-sm font-medium ${
                            quizStats.hasPassedQuiz ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {quizStats.hasPassedQuiz ? "PASSED" : "NOT PASSED"}
                        </span>
                      ) : (
                        <span className="text-sm text-yellow-500">Not Taken</span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          quizStats.hasPassedQuiz ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${quizStats.bestScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-theme-muted">
                      {quizAttempts.length}/{quiz?.attemptsAllowed || 1} attempts
                    </p>
                  </div>
                )}

                {/* Certificate Status */}
                <div className="mb-4 p-3 bg-theme-glass rounded-lg border border-theme">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-theme-muted">Certificate Status</span>
                    <span
                      className={`text-sm font-medium ${
                        canDownloadCertificate ? "text-green-500" : "text-blue-500"
                      }`}
                    >
                      {canDownloadCertificate ? "READY" : "IN PROGRESS"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    {/* Lectures Requirement */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-theme-muted">Lectures</span>
                      <span
                        className={`text-xs font-medium ${
                          completionStatus.percentage >= 100 ? "text-green-500" : "text-blue-500"
                        }`}
                      >
                        {completionStatus.completed}/{completionStatus.total}
                        {completionStatus.percentage >= 100 && " ✓"}
                      </span>
                    </div>

                    {/* Quiz Requirement if exists */}
                    {quiz && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-theme-muted">Quiz Passed</span>
                        <span
                          className={`text-xs font-medium ${
                            quizStats.hasPassedQuiz ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {quizStats.hasPassedQuiz ? "✓ Passed" : "Not passed"}
                        </span>
                      </div>
                    )}
                  </div>

                  {canDownloadCertificate && (
                    <button
                      onClick={handleDownloadCertificate}
                      className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 rounded-lg font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                    >
                      <Download size={16} /> Download Certificate
                    </button>
                  )}
                </div>

                {/* Review Eligibility Status */}
                {course?.isEnrolled && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-theme-muted">Review Eligibility</span>
                      {canReview ? (
                        <span className="text-green-500 font-medium">✓ Can Review</span>
                      ) : completionStatus.isCompleted ? (
                        userReview ? (
                          <span className="text-blue-500 font-medium">✓ Reviewed</span>
                        ) : (
                          <span className="text-green-500 font-medium">✓ Eligible</span>
                        )
                      ) : (
                        <span className="text-yellow-500 font-medium">
                          {completionStatus.percentage}%
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-cyan-500 dark:from-purple-500 dark:to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${completionStatus.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-theme-muted mt-1">
                      {completionStatus.completed} of {completionStatus.total} lectures
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Lecture List */}
            <div className="bg-theme-surface rounded-2xl border border-theme overflow-hidden shadow-theme">
              <div className="p-5 border-b border-theme font-bold text-theme bg-theme/50 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="text-theme-accent" size={18} /> Course Content
                </span>
                <span className="text-xs font-normal text-theme-muted bg-theme-accent/10 px-2 py-1 rounded">
                  {lectures.length} lectures
                </span>
              </div>
              <div className="max-h-125 overflow-y-auto">
                {lectures.map((lec, idx) => {
                  const canWatch = lec.isPreviewFree || course?.isEnrolled;
                  const isMarked = markedLectures.includes(String(lec._id));
                  const isCurrent = currentLecture?._id === lec._id;

                  return (
                    <div
                      key={lec._id}
                      onClick={() => canWatch && setCurrentLecture(lec)}
                      className={`p-4 cursor-pointer border-b border-theme transition-all flex items-center justify-between group ${
                        isCurrent
                          ? "bg-theme-accent/10 border-l-4 border-l-theme-accent"
                          : "hover:bg-theme/50 hover:border-theme-accent/20"
                      } ${!canWatch ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                            isMarked
                              ? "bg-green-500/20 text-green-400"
                              : isCurrent
                              ? "bg-theme-accent/20 text-theme-accent"
                              : "bg-theme/50 text-theme-muted"
                          }`}
                        >
                          {isMarked ? (
                            <CheckCircle size={14} />
                          ) : (
                            <span className="text-xs font-medium">{idx + 1}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm truncate ${
                              isCurrent ? "text-theme-accent font-medium" : "text-theme"
                            }`}
                          >
                            {lec.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-theme-muted flex items-center gap-1">
                              <Clock size={10} /> {formatDuration(lec.videoInfo?.duration || 0)}
                            </span>
                            {lec.isPreviewFree && !course?.isEnrolled && (
                              <span className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">
                                Preview
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!canWatch && <Lock className="text-theme-muted" size={14} />}
                        {isCurrent && (
                          <div className="w-2 h-2 bg-theme-accent rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course Details Card */}
            <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-theme">
              <h3 className="font-semibold text-theme mb-4 flex items-center gap-2">
                <Award className="text-theme-accent" size={18} /> Course Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-theme/30 rounded-lg">
                  <Clock className="text-theme-accent" size={16} />
                  <div>
                    <p className="text-xs text-theme-muted">Duration</p>
                    <p className="font-medium text-theme">{formatDuration(totalDurationSeconds)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-theme/30 rounded-lg">
                  <Users className="text-theme-accent" size={16} />
                  <div>
                    <p className="text-xs text-theme-muted">Difficulty</p>
                    <p className="font-medium text-theme">{course?.courseLevel || "Beginner"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-theme/30 rounded-lg">
                  <FileText className="text-theme-accent" size={16} />
                  <div>
                    <p className="text-xs text-theme-muted">Category</p>
                    <p className="font-medium text-theme-accent">{course?.category || "General"}</p>
                  </div>
                </div>
                {/* Rating in Course Details */}
                <div className="flex items-center gap-3 p-3 bg-theme/30 rounded-lg">
                  <Star className="text-theme-accent" size={16} />
                  <div>
                    <p className="text-xs text-theme-muted">Rating</p>
                    <div className="flex items-center gap-2">
                      {renderStars(course?.averageRating || 0, "text-sm")}
                      <span className="font-medium text-theme">
                        {(course?.averageRating || 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-theme-muted">
                        ({course?.totalReviews || 0})
                      </span>
                    </div>
                  </div>
                </div>
                {/* Certificate Info */}
                {course?.isEnrolled && (
                  <div className="flex items-center gap-3 p-3 bg-theme/30 rounded-lg">
                    <Trophy className="text-theme-accent" size={16} />
                    <div>
                      <p className="text-xs text-theme-muted">Certificate</p>
                      <p className="font-medium text-theme">
                        {canDownloadCertificate ? "Available" : "In Progress"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal/Form */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-surface rounded-2xl p-6 max-w-md w-full border border-theme shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-theme">
                {userReview ? "Edit Your Review" : "Write a Review"}
              </h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="p-2 hover:bg-theme/30 rounded-lg transition-colors text-theme-muted hover:text-theme"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-3">
                  How would you rate this course?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= reviewForm.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-theme-muted mt-2">
                  {reviewForm.rating} star{reviewForm.rating !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-3">
                  Your Review
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience with this course..."
                  className="w-full h-40 p-4 bg-theme-glass border border-theme rounded-xl text-theme resize-none focus:border-theme-accent focus:outline-none"
                  maxLength={1000}
                />
                <p className="text-xs text-theme-muted mt-2 text-right">
                  {reviewForm.comment.length}/1000 characters
                </p>
              </div>

              {/* Completion Status Info */}
              {!completionStatus.isCompleted && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    ⚠️ You need to complete 100% of the course to submit a review
                  </p>
                  <p className="text-xs text-theme-muted mt-1">
                    Current progress: {completionStatus.percentage}% (
                    {completionStatus.completed}/{completionStatus.total} lectures)
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 px-4 py-3 border border-theme text-theme rounded-xl hover:bg-theme/30 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={userReview ? handleUpdateReview : handleSubmitReview}
                  disabled={
                    submittingReview ||
                    !reviewForm.comment.trim() ||
                    !completionStatus.isCompleted
                  }
                  className="flex-1 px-4 py-3 bg-linear-to-r from-theme-accent to-theme-accent-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {userReview ? "Updating..." : "Submitting..."}
                    </span>
                  ) : userReview ? (
                    "Update Review"
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default CourseDetail;