import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle2, XCircle, ArrowRight, RotateCcw, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { addScore, updateSpacedRepetition, getProgress, getDefectsToReview } from "@/lib/progressManager";
import { DEFECT_IMAGES } from "@/lib/activityData";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TrainingPage() {
  const [defects, setDefects] = useState([]);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [completed, setCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);

  const fetchDefects = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/defects`);
      setDefects(res.data);
      setLoading(false);
    } catch (e) {
      toast.error("Erreur de chargement des données");
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDefects(); }, [fetchDefects]);

  const generateQuestion = useCallback(() => {
    if (defects.length < 4) return;

    const toReview = getDefectsToReview(defects.map(d => d.id));
    let targetId = toReview.length > 0 ? toReview[0] : defects[Math.floor(Math.random() * defects.length)].id;
    let target = defects.find(d => d.id === targetId);
    if (!target) target = defects[Math.floor(Math.random() * defects.length)];

    const causeGroup = target.causes[Math.floor(Math.random() * target.causes.length)];
    const correct = causeGroup.origin;
    const allCauses = [...new Set(defects.flatMap(d => d.causes.map(c => c.origin)).filter(c => c !== correct))];
    const wrong = allCauses.sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...wrong, correct].sort(() => Math.random() - 0.5);

    setCurrent(target);
    setCorrectAnswer(correct);
    setOptions(opts);
    setSelected(null);
    setIsCorrect(null);
    setShowHint(false);
  }, [defects]);

  useEffect(() => {
    if (defects.length >= 4) generateQuestion();
  }, [defects, generateQuestion]);

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      addScore(5, "training");
      updateSpacedRepetition(current.id, true);
      toast.success("+5 points !");
    } else {
      addScore(0, "training");
      updateSpacedRepetition(current.id, false);
    }
    setCompleted(prev => prev + 1);
  };

  const progress = getProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="training-loading">
        <div className="animate-spin w-8 h-8 border-4 border-[#8B4513] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="training-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#8B4513]/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#8B4513]" />
          </div>
          <h1 className="font-heading text-3xl font-semibold text-[#3E2723]" data-testid="training-title">
            Entraînement
          </h1>
        </div>
        <p className="text-[#5D4037] mb-8 ml-13">
          Identifiez la cause probable de chaque défaut.
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-4 mb-8">
          <Progress value={Math.min((completed / 10) * 100, 100)} className="h-2 bg-[#F5DEB3] flex-1" />
          <span className="text-sm font-medium text-[#8B4513]" data-testid="training-progress">{completed} répondu{completed > 1 ? "s" : ""}</span>
        </div>

        {current && (
          <AnimatePresence mode="wait">
            <motion.div key={current.id + completed} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              {/* Defect Card */}
              <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)] mb-6 overflow-hidden" data-testid="defect-card">
                {DEFECT_IMAGES[current.id] && (
                  <img src={DEFECT_IMAGES[current.id]} alt={current.name}
                    className="w-full h-40 md:h-52 object-cover"
                    data-testid="training-defect-image" />
                )}
                <CardContent className="p-6 md:p-8">
                  <Badge className="bg-[#F5DEB3] text-[#5D2906] border-0 mb-4">{current.categoryLabel}</Badge>
                  <h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-3" data-testid="defect-name">{current.name}</h2>
                  <p className="text-[#5D4037] leading-relaxed mb-4">{current.description}</p>
                  <p className="text-sm text-[#8D6E63]">Étape concernée : {current.stage}</p>

                  {!showHint && selected === null && (
                    <Button
                      variant="ghost"
                      className="mt-4 text-[#D2691E] hover:text-[#8B4513] hover:bg-[#F5DEB3]/30 gap-2"
                      onClick={() => setShowHint(true)}
                      data-testid="hint-btn"
                    >
                      <Lightbulb className="w-4 h-4" /> Indice
                    </Button>
                  )}
                  {showHint && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-[#D2691E] italic bg-[#D2691E]/5 rounded-xl p-3" data-testid="hint-text">
                      Ce défaut est lié à l'étape : {current.stage}
                    </motion.p>
                  )}
                </CardContent>
              </Card>

              {/* Question */}
              <h3 className="font-heading text-lg font-semibold text-[#3E2723] mb-4">
                Quelle est la cause probable de ce défaut ?
              </h3>

              <div className="grid gap-3" data-testid="options-grid">
                {options.map((option, idx) => {
                  let borderClass = "border-[#E6C9A8]/50 hover:border-[#D2691E]/50";
                  let bgClass = "bg-white hover:bg-[#F5DEB3]/10";

                  if (selected !== null) {
                    if (option === correctAnswer) {
                      borderClass = "border-[#2E7D32]";
                      bgClass = "bg-[#2E7D32]/5";
                    } else if (option === selected && !isCorrect) {
                      borderClass = "border-[#C62828]";
                      bgClass = "bg-[#C62828]/5";
                    }
                  }

                  return (
                    <motion.button
                      key={option}
                      whileHover={selected === null ? { scale: 1.01 } : {}}
                      whileTap={selected === null ? { scale: 0.99 } : {}}
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${borderClass} ${bgClass} ${selected !== null ? "cursor-default" : "cursor-pointer"}`}
                      data-testid={`option-${idx}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E6C9A8] flex items-center justify-center text-sm font-medium text-[#5D4037] flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-[#3E2723] font-medium">{option}</span>
                        {selected !== null && option === correctAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-[#2E7D32] ml-auto flex-shrink-0" />
                        )}
                        {selected === option && !isCorrect && (
                          <XCircle className="w-5 h-5 text-[#C62828] ml-auto flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              {selected !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6" data-testid="feedback-section">
                  <Card className={`rounded-2xl border-2 ${isCorrect ? "border-[#2E7D32] bg-[#2E7D32]/5" : "border-[#C62828] bg-[#C62828]/5"}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-[#2E7D32] flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-[#C62828] flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={`font-semibold mb-1 ${isCorrect ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                            {isCorrect ? "Bonne réponse !" : "Pas tout à fait..."}
                          </p>
                          <p className="text-[#5D4037] text-sm">
                            La bonne réponse est : <strong>{correctAnswer}</strong>.
                          </p>
                          {current.causes.find(c => c.origin === correctAnswer) && (
                            <p className="text-[#8D6E63] text-sm mt-2">
                              Problèmes associés : {current.causes.find(c => c.origin === correctAnswer).problems.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={generateQuestion}
                      className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6 gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                      data-testid="next-btn"
                    >
                      Question suivante <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
