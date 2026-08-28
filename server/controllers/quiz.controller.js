import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";

/* ================= CREATE QUIZ ================= */
export const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({
      ...req.body,
      course: req.params.courseId,
      instructor: req.user._id,
    });

    res.status(201).json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= GET QUIZ (INSTRUCTOR) ================= */
export const getQuizByCourseInstructor = async (req, res) => {
  const quiz = await Quiz.findOne({
    course: req.params.courseId,
    instructor: req.user._id,
  });

  const questions = await Question.find({ quiz: quiz?._id });

  res.json({ quiz, questions });
};

/* ================= ADD QUESTION ================= */
export const addQuestion = async (req, res) => {
  const question = await Question.create({
    ...req.body,
    quiz: req.params.quizId,
  });

  res.status(201).json({ success: true, question });
};

/* ================= UPDATE QUESTION ================= */
export const updateQuestion = async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.questionId,
    req.body,
    { new: true }
  );

  res.json({ success: true, question });
};

/* ================= DELETE QUESTION ================= */
export const deleteQuestion = async (req, res) => {
  await Question.findByIdAndDelete(req.params.questionId);
  res.json({ success: true, message: "Question deleted" });
};

/* ================= PUBLISH QUIZ ================= */
export const publishQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  quiz.isPublished = !quiz.isPublished;
  await quiz.save();

  res.json({ success: true, isPublished: quiz.isPublished });
};

/* ================= GET QUIZ (STUDENT) ================= */
export const getQuizForStudent = async (req, res) => {
  const quiz = await Quiz.findOne({
    course: req.params.courseId,
    isPublished: true,
  });

  const questions = await Question.find({ quiz: quiz._id }).select(
    "-correctAnswer"
  );

  res.json({ quiz, questions });
};

/* ================= SUBMIT QUIZ ================= */
export const submitQuiz = async (req, res) => {
  const { answers } = req.body;

  const quiz = await Quiz.findById(req.params.quizId);
  const questions = await Question.find({ quiz: quiz._id });

  let score = 0;

  const answerSheet = questions.map(q => {
    const userAnswer = answers.find(a => a.questionId === q._id.toString());
    const isCorrect = userAnswer?.selectedOption === q.correctAnswer;

    if (isCorrect) score++;

    return {
      question: q._id,
      selectedOption: userAnswer?.selectedOption,
      isCorrect,
    };
  });

  const percentage = (score / questions.length) * 100;
  const passed = percentage >= quiz.passPercentage;

  const attemptCount = await QuizAttempt.countDocuments({
    quiz: quiz._id,
    student: req.user._id,
  });

  const attempt = await QuizAttempt.create({
    quiz: quiz._id,
    student: req.user._id,
    answers: answerSheet,
    score,
    percentage,
    passed,
    attemptNumber: attemptCount + 1,
  });

  res.json({ success: true, attempt });
};

/* ================= INSTRUCTOR RESULTS ================= */
export const getQuizResultsInstructor = async (req, res) => {
  const results = await QuizAttempt.find({ quiz: req.params.quizId })
    .populate("student", "name email");

  res.json({ success: true, results });
};

/* ================= STUDENT RESULT ================= */
export const getMyQuizResult = async (req, res) => {
  const result = await QuizAttempt.findOne({
    quiz: req.params.quizId,
    student: req.user._id,
  }).populate("answers.question");

  res.json({ success: true, result });
};
