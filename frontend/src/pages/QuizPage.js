import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, CheckCircle2, XCircle, ArrowRight, RotateCcw, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { addScore, updateQuizBestScore, getProgress } from "@/lib/progressManager";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOTAL_QUESTIONS = 10;

export default function QuizPage() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(null);
  const [questionNum, setQuestionNum] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const difficulties = ["facile", "moyen", "difficile"];
      const diff = difficulties[Math.min(Math.floor(questionNum / 4), 2)];
      const res = await axios.get(`${API}/quiz/generate`, { params: { difficulty: diff } });
      setQuestion(res.data);
      setSelected(null);
      setIsCorrect(null);
    } catch (e) {
      toast.error("Erreur de chargement de la question");
    }
    setLoading(false);
  }, [questionNum]);

  const startQuiz = async () => {
    setStarted(true);
    setQuestionNum(0);
    setScore(0);
    setStreak(0);
    setFinished(false);
    setAnswers([]);
    setLoading(true);
    try {
      const res = await axios.get(`${API}/quiz/generate`, { params: { difficulty: "facile" } });
      setQuestion(res.data);
      setSelected(null);
      setIsCorrect(null);
    } catch (e) {
      toast.error("Erreur de chargement");
    }
    setLoading(false);
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === question.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      const streakBonus = streak >= 2 ? 3 : 0;
      const pts = 5 + streakBonus;
      setScore(prev => prev + pts);
      setStreak(prev => prev + 1);
      addScore(pts, "quiz");
      if (streakBonus > 0) toast.success(`Série ! +${pts} points`);
      else toast.success(`+${pts} points`);
    } else {
      setStreak(0);
      addScore(0, "quiz");
    }

    setAnswers(prev => [...prev, { question: question.question, correct, correctAnswer: question.options[question.correctIndex] }]);
  };

  const nextQuestion = () => {
    const nextNum = questionNum + 1;
    if (nextNum >= TOTAL_QUESTIONS) {
      setFinished(true);
      updateQuizBestScore(score);
    } else {
      setQuestionNum(nextNum);
      fetchNextQuestion(nextNum);
    }
  };

  const fetchNextQuestion = async (num) => {
    setLoading(true);
    try {
      const difficulties = ["facile", "moyen", "difficile"];
      const diff = difficulties[Math.min(Math.floor(num / 4), 2)];
      const res = await axios.get(`${API}/quiz/generate`, { params: { difficulty: diff } });
      setQuestion(res.data);
      setSelected(null);
      setIsCorrect(null);
    } catch (e) {
      toast.error("Erreur de chargement");
    }
    setLoading(false);
  };

  const progress = getProgress();

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="quiz-page">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <h1 className="font-heading text-3xl font-semibold text-[#3E2723]" data-testid="quiz-title">Mode Quiz</h1>
          </div>
          <p className="text-[#5D4037] mb-8 ml-13">Testez vos connaissances sur les défauts du pain.</p>

          <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)]" data-testid="quiz-start-card">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[#2E7D32]/10 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-[#2E7D32]" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-3">
                Quiz de {TOTAL_QUESTIONS} questions
              </h2>
              <p className="text-[#5D4037] mb-4 max-w-md mx-auto">
                Les questions deviennent plus difficiles au fur et à mesure. Gagnez des bonus de série !
              </p>
              {progress.stats.quizBestScore > 0 && (
                <p className="text-sm text-[#8D6E63] mb-6">
                  Meilleur score : <span className="font-bold text-[#8B4513]">{progress.stats.quizBestScore} pts</span>
                </p>
              )}
              <Button
                onClick={startQuiz}
                className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                data-testid="start-quiz-btn"
              >
                Commencer le quiz <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((answers.filter(a => a.correct).length / TOTAL_QUESTIONS) * 100);
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="quiz-results">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)]">
            <CardContent className="p-8 text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${percentage >= 70 ? "bg-[#2E7D32]/10" : percentage >= 40 ? "bg-[#F57C00]/10" : "bg-[#C62828]/10"}`}>
                <span className="text-3xl font-bold" style={{ color: percentage >= 70 ? "#2E7D32" : percentage >= 40 ? "#F57C00" : "#C62828" }}>
                  {percentage}%
                </span>
              </div>
              <h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-2">
                {percentage >= 70 ? "Excellent travail !" : percentage >= 40 ? "Bon effort !" : "Continuez l'entraînement"}
              </h2>
              <p className="text-[#8B4513] font-bold text-xl mb-2">{score} points</p>
              <p className="text-[#5D4037] mb-8">
                {answers.filter(a => a.correct).length} / {TOTAL_QUESTIONS} bonnes réponses
              </p>

              <div className="space-y-2 text-left max-w-lg mx-auto mb-8">
                {answers.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {a.correct ? <CheckCircle2 className="w-4 h-4 text-[#2E7D32] flex-shrink-0" /> : <XCircle className="w-4 h-4 text-[#C62828] flex-shrink-0" />}
                    <span className="text-[#5D4037] truncate">{a.question.split("\n")[0].substring(0, 60)}...</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={startQuiz}
                  className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6 gap-2"
                  data-testid="restart-quiz-btn"
                >
                  <RotateCcw className="w-4 h-4" /> Recommencer
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="quiz-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#5D4037]" data-testid="question-counter">
              Question {questionNum + 1}/{TOTAL_QUESTIONS}
            </span>
            {streak >= 2 && (
              <Badge className="bg-[#F57C00]/10 text-[#F57C00] border-0 gap-1">
                <Zap className="w-3 h-3" /> Série x{streak}
              </Badge>
            )}
          </div>
          <span className="text-sm font-bold text-[#8B4513]" data-testid="quiz-score">{score} pts</span>
        </div>

        <Progress value={((questionNum + 1) / TOTAL_QUESTIONS) * 100} className="h-2 bg-[#F5DEB3] mb-8" />

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[#2E7D32] border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && question && (
          <AnimatePresence mode="wait">
            <motion.div key={question.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)] mb-6" data-testid="question-card">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-[#F5DEB3] text-[#5D2906] border-0 capitalize">{question.difficulty}</Badge>
                    <Badge className="bg-[#E6C9A8]/30 text-[#8D6E63] border-0">
                      {question.questionType === "identify_defect" && "Identifier le défaut"}
                      {question.questionType === "identify_cause" && "Identifier la cause"}
                      {question.questionType === "identify_category" && "Catégorie"}
                      {question.questionType === "identify_remedy" && "Trouver le remède"}
                    </Badge>
                  </div>
                  <p className="text-[#3E2723] text-lg leading-relaxed whitespace-pre-line" data-testid="question-text">
                    {question.question}
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-3" data-testid="quiz-options">
                {question.options.map((option, idx) => {
                  let borderClass = "border-[#E6C9A8]/50 hover:border-[#D2691E]/50";
                  let bgClass = "bg-white hover:bg-[#F5DEB3]/10";

                  if (selected !== null) {
                    if (idx === question.correctIndex) {
                      borderClass = "border-[#2E7D32]";
                      bgClass = "bg-[#2E7D32]/5";
                    } else if (idx === selected && !isCorrect) {
                      borderClass = "border-[#C62828]";
                      bgClass = "bg-[#C62828]/5";
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={selected === null ? { scale: 1.01 } : {}}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${borderClass} ${bgClass} ${selected !== null ? "cursor-default" : "cursor-pointer"}`}
                      data-testid={`quiz-option-${idx}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E6C9A8] flex items-center justify-center text-sm font-medium text-[#5D4037] flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-[#3E2723] font-medium">{option}</span>
                        {selected !== null && idx === question.correctIndex && <CheckCircle2 className="w-5 h-5 text-[#2E7D32] ml-auto" />}
                        {selected !== null && idx === selected && !isCorrect && <XCircle className="w-5 h-5 text-[#C62828] ml-auto" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {selected !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6" data-testid="quiz-feedback">
                  <Card className={`rounded-2xl border-2 ${isCorrect ? "border-[#2E7D32] bg-[#2E7D32]/5" : "border-[#C62828] bg-[#C62828]/5"} mb-4`}>
                    <CardContent className="p-4">
                      <p className={`text-sm ${isCorrect ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                        {question.explanation}
                      </p>
                    </CardContent>
                  </Card>
                  <Button
                    onClick={nextQuestion}
                    className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6 gap-2"
                    data-testid="next-question-btn"
                  >
                    {questionNum < TOTAL_QUESTIONS - 1 ? "Question suivante" : "Voir les résultats"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
