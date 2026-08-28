import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";  
import toast from "react-hot-toast";

export default function ViewCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [activeTab, setActiveTab] = useState("lectures");

  const [lectures, setLectures] = useState([]);
  const [loadingLectures, setLoadingLectures] = useState(true);
  const [error, setError] = useState("");

  // Quiz states
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // Quiz form states
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [passPercentage, setPassPercentage] = useState(40);

  // Question form states
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");

  // Lecture form states
  const [title, setTitle] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [creating, setCreating] = useState(false);

  /* ================= FETCH COURSE ================= */
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(
          `http://localhost:3000/api/v1/course/${courseId}`,
          { withCredentials: true }
        );
        setCourse(res.data.course);
      } catch {
        setError("Failed to load course");
        toast.error("Failed to load course");
      } finally {
        setLoadingCourse(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  /* ================= FETCH LECTURES ================= */
  const fetchLectures = async () => {
    try {
      setLoadingLectures(true);
      const res = await api.get(
        `http://localhost:3000/api/v1/course/${courseId}/lecture`,
        { withCredentials: true }
      );
      if (res.data.success) setLectures(res.data.lectures);
    } catch {
      toast.error("Failed to load lectures");
    } finally {
      setLoadingLectures(false);
    }
  };

  /* ================= FETCH QUIZ ================= */
  const fetchQuiz = async () => {
    try {
      setLoadingQuiz(true);
      const res = await api.get(
        `http://localhost:3000/api/v1/quiz/course/${courseId}`,
        { withCredentials: true }
      );
      setQuiz(res.data.quiz);
      setQuestions(res.data.questions || []);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("Failed to load quiz");
      }
      setQuiz(null);
      setQuestions([]);
    } finally {
      setLoadingQuiz(false);
    }
  };

  /* ================= FETCH QUIZ RESULTS ================= */
  const fetchQuizResults = async () => {
    if (!quiz) return;
    try {
      setLoadingResults(true);
      const res = await api.get(
        `http://localhost:3000/api/v1/quiz/${quiz._id}/results`,
        { withCredentials: true }
      );
      setQuizResults(res.data.results || []);
    } catch (err) {
      toast.error("Failed to load quiz results", err);
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    fetchLectures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (activeTab === "quizzes") {
      fetchQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, courseId]);

  /* ================= CREATE QUIZ ================= */
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `http://localhost:3000/api/v1/quiz/course/${courseId}`,
        {
          title: quizTitle,
          description: quizDescription,
          timeLimit: parseInt(timeLimit),
          attemptsAllowed: parseInt(attemptsAllowed),
          passPercentage: parseInt(passPercentage),
        },
        { withCredentials: true }
      );
      setQuiz(res.data.quiz);
      setShowQuizForm(false);
      toast.success("Quiz created successfully!");
      fetchQuiz();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create quiz");
    }
  };

  /* ================= ADD/UPDATE QUESTION (with duplicate check) ================= */
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();

    // Trim all options
    const trimmedOptions = options.map(opt => opt.trim());

    // Check for duplicate options
    const hasDuplicate = trimmedOptions.some(
      (opt, index) => trimmedOptions.indexOf(opt) !== index
    );
    if (hasDuplicate) {
      toast.error("Options must be unique. Please remove duplicate options.");
      return;
    }

    // Check if any option is empty after trimming
    if (trimmedOptions.some(opt => opt === "")) {
      toast.error("All options must be filled.");
      return;
    }

    try {
      const questionData = {
        question: questionText,
        options: trimmedOptions,
        correctAnswer: parseInt(correctAnswer),
        explanation,
      };

      if (editingQuestion) {
        const res = await api.put(
          `http://localhost:3000/api/v1/quiz/question/${editingQuestion._id}`,
          questionData,
          { withCredentials: true }
        );
        setQuestions(questions.map(q => q._id === editingQuestion._id ? res.data.question : q));
        toast.success("Question updated successfully!");
      } else {
        const res = await api.post(
          `http://localhost:3000/api/v1/quiz/${quiz._id}/question`,
          questionData,
          { withCredentials: true }
        );
        setQuestions([...questions, res.data.question]);
        toast.success("Question added successfully!");
      }

      resetQuestionForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save question");
    }
  };

  /* ================= DELETE QUESTION ================= */
  const handleDeleteQuestion = (questionId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="mb-3">Are you sure you want to delete this question?</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(
                    `http://localhost:3000/api/v1/quiz/question/${questionId}`,
                    { withCredentials: true }
                  );
                  setQuestions(prev => prev.filter(q => q._id !== questionId));
                  toast.success("Question deleted!");
                } catch (err) {
                  toast.error("Failed to delete question", err);
                }
              }}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  /* ================= PUBLISH/UNPUBLISH QUIZ ================= */
  const handlePublishQuiz = async () => {
    try {
      const res = await api.patch(
        `http://localhost:3000/api/v1/quiz/${quiz._id}/publish`,
        {},
        { withCredentials: true }
      );
      setQuiz({ ...quiz, isPublished: res.data.isPublished });
      toast.success(`Quiz ${res.data.isPublished ? 'published' : 'unpublished'}!`);
    } catch (err) {
      toast.error("Failed to update quiz status", err);
    }
  };

  /* ================= EDIT QUESTION ================= */
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionText(question.question);
    setOptions([...question.options]);
    setCorrectAnswer(question.correctAnswer);
    setExplanation(question.explanation || "");
    setShowQuestionForm(true);
  };

  /* ================= RESET QUESTION FORM ================= */
  const resetQuestionForm = () => {
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setExplanation("");
    setEditingQuestion(null);
    setShowQuestionForm(false);
  };

  /* ================= VIDEO PREVIEW ================= */
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= CREATE LECTURE ================= */
  const handleCreateLecture = async (e) => {
    e.preventDefault();
    if (!title || !videoFile) {
      toast.error("Please provide lecture title and video");
      return;
    }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("isPreviewFree", isFreePreview);
      formData.append("video", videoFile);

      const res = await api.post(
        `http://localhost:3000/api/v1/course/${courseId}/lecture`,
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Lecture created successfully 🎉");
        setTitle("");
        setIsFreePreview(false);
        setVideoFile(null);
        setPreview(null);
        fetchLectures();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create lecture");
    } finally {
      setCreating(false);
    }
  };

  /* ================= DELETE LECTURE ================= */
  const handleDeleteLecture = async (lectureId) => {
    const confirm = await new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <p className="mb-3">Are you sure you want to delete this lecture?</p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  resolve(false);
                  toast.dismiss(t.id);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  resolve(true);
                  toast.dismiss(t.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    if (!confirm) return;

    try {
      setLectures(prev => prev.filter(l => l._id !== lectureId));
      await api.delete(
        `http://localhost:3000/api/v1/course/lecture/${lectureId}`,
        { withCredentials: true }
      );
      toast.success("Lecture deleted 🗑️");
    } catch {
      toast.error("Failed to delete lecture");
      fetchLectures();
    }
  };

  /* ================= RENDER LOADING ================= */
  if (loadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-(--text-muted)">Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-(--text-muted)">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-main) text-(--text-main) px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
      {/* BACK BUTTON - Mobile First */}
      <div className="md:hidden">
        <Link
          to="/instructor/my-courses"
          className="inline-flex items-center gap-2 text-sm text-(--text-muted) hover:text-(--text-main)"
        >
          <span>←</span>
          <span>Back to Courses</span>
        </Link>
      </div>

      {/* COURSE HEADER */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
        {course.courseThumbnail && (
          <img
            src={
              typeof course.courseThumbnail === "string"
                ? course.courseThumbnail
                : course.courseThumbnail.url || course.courseThumbnail.path
            }
            alt={course.courseTitle}
            className="w-full md:w-64 lg:w-72 h-40 md:h-44 object-cover rounded-lg md:rounded-xl"
          />
        )}

        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{course.courseTitle}</h1>
          <p className="text-sm sm:text-base opacity-90 mb-3 line-clamp-2">{course.subTitle}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {course.category}
            </span>
            <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {course.courseLevel}
            </span>
            <span className="bg-black/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
              ₹{course.courseprice || 0}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/instructor/edit-course/${courseId}`)}
              className="bg-black/30 hover:bg-black/40 px-4 py-2 rounded-lg text-sm sm:text-base"
            >
              Edit Course
            </button>

            <Link
              to={`/instructor/course/${course._id}/students`}
              className="bg-white text-black px-4 py-2 rounded-lg text-sm sm:text-base text-center"
            >
              Enrolled Students
            </Link>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="border-b border-(--border-main) overflow-x-auto">
        <div className="flex min-w-max md:min-w-0">
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "lectures"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-(--text-muted) hover:text-(--text-main)"
            }`}
            onClick={() => setActiveTab("lectures")}
          >
            Lectures
          </button>
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "quizzes"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-(--text-muted) hover:text-(--text-main)"
            }`}
            onClick={() => setActiveTab("quizzes")}
          >
            Quizzes
          </button>
        </div>
      </div>

      {/* CONTENT BASED ON ACTIVE TAB */}
      {activeTab === "lectures" ? (
        /* ================= LECTURES TAB ================= */
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* ADD LECTURE - Sidebar */}
          <div className="lg:w-1/3 xl:w-1/4">
            <div className="bg-(--bg-surface) rounded-xl md:rounded-2xl shadow p-4 md:p-6 border border-(--border-main) sticky top-6 md:top-24">
              <h2 className="text-lg md:text-xl font-bold mb-1">Add New Lecture</h2>
              <p className="text-xs md:text-sm text-(--text-muted) mb-4">
                Upload lecture video & settings
              </p>

              <form onSubmit={handleCreateLecture} className="space-y-4">
                <input
                  type="text"
                  placeholder="Lecture title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-(--bg-glass) border border-(--border-main) text-sm md:text-base outline-none focus:ring-1 focus:ring-indigo-500"
                />

                {/* Custom File Upload Button */}
                <div className="relative">
                  <label className="flex flex-col items-start cursor-pointer group">
                    <span className="text-theme-muted text-sm md:text-base mb-1 transition-colors duration-300">
                      Choose file
                    </span>

                    <div className="w-full px-3 py-2 rounded-lg bg-(--bg-glass) border border-(--border-main) text-gray-400 text-sm md:text-base group-hover:border-indigo-500 transition-all">
                      {videoFile ? videoFile.name : "No file chosen"}
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {preview && (
                  <video
                    src={preview}
                    controls
                    className="w-full rounded-lg border border-(--border-main) max-h-40"
                  />
                )}

                <label className="flex items-center gap-2 text-sm bg-(--bg-glass) p-3 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFreePreview}
                    onChange={(e) => setIsFreePreview(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span className="text-theme transition-colors duration-300">
                    Free Preview
                  </span>
                </label>

                <button
                  disabled={creating}
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm md:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Uploading..." : "Create Lecture"}
                </button>
              </form>
            </div>
          </div>

          {/* LECTURES LIST */}
          <div className="lg:w-2/3 xl:w-3/4">
            <div className="bg-(--bg-surface) rounded-xl md:rounded-2xl shadow p-4 md:p-6 border border-(--border-main)">
              <h2 className="text-lg md:text-2xl font-bold mb-4">
                Course Content ({lectures.length})
              </h2>

              {loadingLectures ? (
                <p className="text-(--text-muted)">Loading lectures...</p>
              ) : lectures.length === 0 ? (
                <p className="text-(--text-muted)">No lectures added yet.</p>
              ) : (
                <div className="space-y-4">
                  {lectures.map((lec, idx) => (
                    <div
                      key={lec._id}
                      className="border border-(--border-main) rounded-lg md:rounded-xl p-4 md:p-5 bg-(--bg-glass)"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold flex items-center gap-2 md:gap-3">
                          <span className="w-6 h-6 md:w-7 md:h-7 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="line-clamp-1">{lec.title}</span>
                        </h3>

                        {lec.isPreviewFree && (
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full w-fit">
                            Free Preview
                          </span>
                        )}
                      </div>

                      {lec.videoInfo?.videoUrl && (
                        <video
                          src={lec.videoInfo.videoUrl}
                          controls
                          className="w-full max-h-40 rounded-lg mt-2"
                        />
                      )}

                      <div className="flex justify-end gap-4 md:gap-6 text-sm mt-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/instructor/course/${courseId}/lecture/${lec._id}/edit`
                            )
                          }
                          className="text-indigo-500 hover:underline text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteLecture(lec._id)}
                          className="text-red-500 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= REDESIGNED QUIZZES TAB ================= */
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* LEFT SIDEBAR - QUIZ MANAGEMENT */}
          <div className="lg:w-1/3 xl:w-1/4 space-y-6">
            {loadingQuiz ? (
              <div className="bg-(--bg-surface) rounded-xl p-6 text-center">
                <p className="text-(--text-muted)">Loading quiz...</p>
              </div>
            ) : quiz ? (
              <>
                {/* QUIZ DETAILS CARD */}
                <div className="bg-(--bg-surface) rounded-xl shadow border border-(--border-main) overflow-hidden">
                  <div className="p-5 border-b border-(--border-main) bg-(--bg-glass)/50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <span className="text-indigo-500">📋</span> Quiz Details
                    </h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-base line-clamp-1">{quiz.title}</h3>
                      <p className="text-sm text-(--text-muted) mt-1 line-clamp-2">{quiz.description || "No description"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-(--bg-glass) p-3 rounded-lg">
                        <div className="text-(--text-muted) text-xs">Time Limit</div>
                        <div className="font-medium text-base">{quiz.timeLimit} min</div>
                      </div>
                      <div className="bg-(--bg-glass) p-3 rounded-lg">
                        <div className="text-(--text-muted) text-xs">Attempts</div>
                        <div className="font-medium text-base">{quiz.attemptsAllowed}</div>
                      </div>
                      <div className="bg-(--bg-glass) p-3 rounded-lg">
                        <div className="text-(--text-muted) text-xs">Passing %</div>
                        <div className="font-medium text-base">{quiz.passPercentage}%</div>
                      </div>
                      <div className="bg-(--bg-glass) p-3 rounded-lg">
                        <div className="text-(--text-muted) text-xs">Status</div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            quiz.isPublished
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {quiz.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handlePublishQuiz}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          quiz.isPublished
                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {quiz.isPublished ? "Unpublish Quiz" : "Publish Quiz"}
                      </button>
                      <button
                        onClick={fetchQuizResults}
                        className="w-full py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        View Results
                      </button>
                    </div>

                    <div className="pt-3 border-t border-(--border-main)">
                      <div className="flex justify-between text-sm">
                        <span className="text-(--text-muted)">Total Questions</span>
                        <span className="font-medium">{questions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-(--text-muted)">Results</span>
                        <span className="font-medium">{quizResults.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADD QUESTION BUTTON & FORM */}
                <div className="bg-(--bg-surface) rounded-xl shadow border border-(--border-main) overflow-hidden">
                  <div className="p-5 border-b border-(--border-main) bg-(--bg-glass)/50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <span className="text-indigo-500">➕</span> Questions
                    </h2>
                  </div>
                  <div className="p-5">
                    {!showQuestionForm ? (
                      <button
                        onClick={() => setShowQuestionForm(true)}
                        className="w-full py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors"
                      >
                        Add New Question
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-sm">
                          {editingQuestion ? "Edit Question" : "Add New Question"}
                        </h3>
                        <form onSubmit={handleSubmitQuestion} className="space-y-4">
                          <textarea
                            placeholder="Question text"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-(--bg-main) border border-(--border-main) text-sm"
                            rows="2"
                            required
                          />

                          <div className="space-y-2">
                            <label className="text-xs text-(--text-muted)">Options (select correct one)</label>
                            {options.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={correctAnswer === index}
                                  onChange={() => setCorrectAnswer(index)}
                                  className="w-4 h-4 accent-indigo-600"
                                />
                                <input
                                  type="text"
                                  placeholder={`Option ${index + 1}`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...options];
                                    newOptions[index] = e.target.value;
                                    setOptions(newOptions);
                                  }}
                                  className="flex-1 px-3 py-2 rounded-lg bg-(--bg-main) border border-(--border-main) text-sm"
                                  required
                                />
                              </div>
                            ))}
                          </div>

                          <div>
                            <label className="text-xs text-(--text-muted)">Explanation (optional)</label>
                            <textarea
                              placeholder="Explain why this is correct"
                              value={explanation}
                              onChange={(e) => setExplanation(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-(--bg-main) border border-(--border-main) text-sm"
                              rows="2"
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={resetQuestionForm}
                              className="flex-1 py-2 rounded-lg border border-(--border-main) text-sm hover:bg-(--bg-glass)"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium"
                            >
                              {editingQuestion ? "Update" : "Add"}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* CREATE QUIZ FORM */
              <div className="bg-(--bg-surface) rounded-xl shadow border border-(--border-main) overflow-hidden">
                <div className="p-5 border-b border-(--border-main) bg-(--bg-glass)/50">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="text-indigo-500">✨</span> Create Quiz
                  </h2>
                </div>
                <div className="p-5">
                  {showQuizForm ? (
                    <form onSubmit={handleCreateQuiz} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Quiz title"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-(--bg-main) border border-(--border-main) text-sm"
                        required
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={quizDescription}
                        onChange={(e) => setQuizDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-(--bg-main) border border-(--border-main) text-sm"
                        rows="2"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-(--text-muted)">Time (min)</label>
                          <input
                            type="number"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-(--bg-main) border border-(--border-main) text-sm"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-(--text-muted)">Attempts</label>
                          <input
                            type="number"
                            value={attemptsAllowed}
                            onChange={(e) => setAttemptsAllowed(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-(--bg-main) border border-(--border-main) text-sm"
                            min="1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-(--text-muted)">Passing %</label>
                        <input
                          type="number"
                          value={passPercentage}
                          onChange={(e) => setPassPercentage(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-(--bg-main) border border-(--border-main) text-sm"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowQuizForm(false)}
                          className="flex-1 py-2 rounded-lg border border-(--border-main) text-sm hover:bg-(--bg-glass)"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowQuizForm(true)}
                      className="w-full py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors"
                    >
                      Create New Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT MAIN CONTENT - QUESTIONS & RESULTS */}
          <div className="lg:w-2/3 xl:w-3/4 space-y-6">
            {/* QUESTIONS LIST */}
            <div className="bg-(--bg-surface) rounded-xl shadow border border-(--border-main) overflow-hidden">
              <div className="p-5 border-b border-(--border-main) bg-(--bg-glass)/50 flex justify-between items-center">
                <h2 className="text-lg font-bold">Questions</h2>
                {quiz && <span className="text-sm text-(--text-muted)">{questions.length} total</span>}
              </div>

              <div className="p-5">
                {!quiz ? (
                  <div className="text-center py-12">
                    <p className="text-(--text-muted) mb-4">Create a quiz first to add questions</p>
                    <button
                      onClick={() => setShowQuizForm(true)}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      Create Quiz
                    </button>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-(--text-muted) mb-4">No questions added yet</p>
                    <button
                      onClick={() => setShowQuestionForm(true)}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      Add First Question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q, index) => (
                      <div key={q._id} className="border border-(--border-main) rounded-xl p-5 bg-(--bg-glass)">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <span className="w-7 h-7 bg-indigo-600 text-white rounded-full text-sm flex items-center justify-center shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <h3 className="font-semibold text-base">{q.question}</h3>
                            </div>

                            <div className="ml-10 space-y-2">
                              {q.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${
                                    optIndex === q.correctAnswer
                                      ? "bg-green-500/10 border border-green-500/20"
                                      : "bg-(--bg-main)"
                                  }`}
                                >
                                  <span className="font-medium w-5 shrink-0">{String.fromCharCode(65 + optIndex)}.</span>
                                  <span className={optIndex === q.correctAnswer ? "text-green-600 font-medium" : ""}>
                                    {option}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {q.explanation && (
                              <div className="ml-10 mt-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                <p className="text-sm text-blue-600">
                                  <span className="font-medium">💡 Explanation:</span> {q.explanation}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 md:self-start">
                            <button
                              onClick={() => handleEditQuestion(q)}
                              className="px-3 py-1.5 text-xs bg-yellow-500/10 text-yellow-600 rounded-lg hover:bg-yellow-500/20"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q._id)}
                              className="px-3 py-1.5 text-xs bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* QUIZ RESULTS */}
            {quiz && quizResults.length > 0 && (
              <div className="bg-(--bg-surface) rounded-xl shadow border border-(--border-main) overflow-hidden">
                <div className="p-5 border-b border-(--border-main) bg-(--bg-glass)/50">
                  <h2 className="text-lg font-bold">Results</h2>
                </div>

                <div className="p-5">
                  {loadingResults ? (
                    <p className="text-(--text-muted) text-center py-8">Loading results...</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-(--text-muted) border-b border-(--border-main)">
                          <tr>
                            <th className="text-left py-3 font-medium">Student</th>
                            <th className="text-left py-3 font-medium">Score</th>
                            <th className="text-left py-3 font-medium">Percentage</th>
                            <th className="text-left py-3 font-medium">Status</th>
                            <th className="text-left py-3 font-medium">Attempt</th>
                            <th className="text-left py-3 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-(--border-main)">
                          {quizResults.map((result) => (
                            <tr key={result._id} className="hover:bg-(--bg-glass)">
                              <td className="py-3">
                                <div className="font-medium">{result.student?.name}</div>
                                <div className="text-xs text-(--text-muted)">{result.student?.email}</div>
                              </td>
                              <td className="py-3">{result.score} / {questions.length}</td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  result.percentage >= quiz.passPercentage
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-red-500/10 text-red-500"
                                }`}>
                                  {result.percentage.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={result.passed ? "text-green-600" : "text-red-600"}>
                                  {result.passed ? "Passed" : "Failed"}
                                </span>
                              </td>
                              <td className="py-3">{result.attemptNumber}</td>
                              <td className="py-3 text-(--text-muted)">{new Date(result.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BACK BUTTON - Desktop */}
      <div className="hidden md:block">
        <Link
          to="/instructor/my-courses"
          className="inline-flex items-center gap-2 text-(--text-muted) hover:text-(--text-main)"
        >
          <span>←</span>
          <span>Back to Courses</span>
        </Link>
      </div>
    </div>
  );
}