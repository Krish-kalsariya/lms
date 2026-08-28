import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

const CreateQuiz = () => {
  const { courseId } = useParams();

  const [title, setTitle] = useState("");
  const [passPercentage, setPassPercentage] = useState(60);
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);
  };

  const handleOptionChange = (qi, oi, value) => {
    const copy = [...questions];
    copy[qi].options[oi] = value;
    setQuestions(copy);
  };

  const handleCorrectAnswer = (qi, index) => {
    const copy = [...questions];
    copy[qi].correctAnswer = index;
    setQuestions(copy);
  };

  const createQuiz = async () => {
    try {
      await api.post(`/quiz/course/${courseId}/quiz`, {
        title,
        questions,
        passPercentage,
      });
      toast.success("Quiz created successfully 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-slate-900 to-black px-4 py-10 text-white">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create Quiz
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Add questions and set correct answers
          </p>
        </div>

        {/* CARD */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* Quiz Title */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">
              Quiz Title
            </label>
            <input
              placeholder="Enter quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-indigo-400 transition"
            />
          </div>

          {/* Pass Percentage */}
          <div className="mb-8">
            <label className="block text-sm text-gray-400 mb-2">
              Pass Percentage (%)
            </label>
            <input
              type="number"
              value={passPercentage}
              onChange={(e) => setPassPercentage(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-indigo-400 transition"
            />
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((q, qi) => (
              <div
                key={qi}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-4 text-indigo-300">
                  Question {qi + 1}
                </h3>

                <input
                  placeholder="Enter question"
                  value={q.question}
                  onChange={(e) => {
                    const copy = [...questions];
                    copy[qi].question = e.target.value;
                    setQuestions(copy);
                  }}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 mb-4 outline-none focus:border-indigo-400"
                />

                {/* Options */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correctAnswer === oi}
                        onChange={() => handleCorrectAnswer(qi, oi)}
                        className="accent-indigo-500"
                      />
                      <input
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(qi, oi, e.target.value)
                        }
                        className="flex-1 rounded-lg bg-black/30 border border-white/10 px-4 py-2 outline-none focus:border-indigo-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={addQuestion}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 hover:bg-white/10 transition"
            >
              + Add Question
            </button>

            <button
              onClick={createQuiz}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl py-3 font-semibold transition"
            >
              Create Quiz
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
