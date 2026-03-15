import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { addScore } from "@/lib/progressManager";
import { DEFECT_IMAGES } from "@/lib/activityData";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOTAL = 5;

const LEVEL_DIFFICULTY = {
  SAP: "facile",
  Emotion: "facile",
  BP: "moyen",
  BM: "difficile",
};

export default function QuickQuiz({ level, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const diff = LEVEL_DIFFICULTY[level] || "moyen";
      const fetched = [];
      for (let i = 0; i < TOTAL; i++) {
        const res = await axios.get(`${API}/quiz/generate`, { params: { difficulty: diff } });
        fetched.push(res.data);
      }
      setQuestions(fetched);
      setCurrentIdx(0);
      setSelected(null);
      setScore(0);
      setFinished(false);
    } catch (e) {
      toast.error("Erreur de chargement");
    }
    setLoading(false);
  }, [level]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const current = questions[currentIdx];
  const isCorrect = selected !== null && selected === current?.correctIndex;

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === current.correctIndex) {
      setScore(prev => prev + 1);
      addScore(5, "quiz");
      toast.success("+5 points");
    } else {
      addScore(0, "quiz");
    }
  };

  const next = () => {
    if (currentIdx + 1 >= TOTAL) {
      setFinished(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" data-testid="quickquiz-loading">
        <div className="animate-spin w-8 h-8 border-4 border-[#2E7D32] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / TOTAL) * 100);
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} data-testid="quickquiz-results">
        <div className="text-center py-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            pct >= 80 ? "bg-[#2E7D32]/10" : pct >= 50 ? "bg-[#F57C00]/10" : "bg-[#C62828]/10"
          }`}>
            <span className="text-3xl font-bold" style={{ color: pct >= 80 ? "#2E7D32" : pct >= 50 ? "#F57C00" : "#C62828" }}>
              {score}/{TOTAL}
            </span>
          </div>
          <h3 className="font-heading text-xl font-semibold text-[#3E2723] mb-2">
            {pct >= 80 ? "Excellent !" : pct >= 50 ? "Bien joué !" : "Continuez à apprendre"}
          </h3>
          <p className="text-[#8B4513] font-bold mb-6">{score * 5} points gagnés</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchQuestions} className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6 gap-2" data-testid="quickquiz-retry">
              <RotateCcw className="w-4 h-4" /> Recommencer
            </Button>
            {onComplete && (
              <Button variant="ghost" onClick={onComplete} className="text-[#8B4513] rounded-full">Retour</Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!current) return null;

  return (
    <div data-testid="quickquiz-game">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#F57C00]" />
          <span className="text-sm font-medium text-[#5D4037]">Question {currentIdx + 1}/{TOTAL}</span>
        </div>
        <Badge className="bg-[#F5DEB3] text-[#5D2906] border-0">{score * 5} pts</Badge>
      </div>

      <Progress value={((currentIdx + 1) / TOTAL) * 100} className="h-2 bg-[#F5DEB3] mb-6" />

      <AnimatePresence mode="wait">
        <motion.div key={current.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {/* Question */}
          <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-sm mb-5" data-testid="quickquiz-question">
            <CardContent className="p-5">
              {current.defectId && DEFECT_IMAGES[current.defectId] && (
                <img src={DEFECT_IMAGES[current.defectId]} alt="Indice visuel"
                  className="w-full h-32 object-cover rounded-xl mb-3" />
              )}
              <p className="text-[#3E2723] leading-relaxed whitespace-pre-line">{current.question}</p>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="grid gap-2.5" data-testid="quickquiz-options">
            {current.options.map((option, idx) => {
              let cls = "border-[#E6C9A8]/50 bg-white hover:border-[#D2691E]/50 hover:bg-[#F5DEB3]/10";
              if (selected !== null) {
                if (idx === current.correctIndex) cls = "border-[#2E7D32] bg-[#2E7D32]/5";
                else if (idx === selected) cls = "border-[#C62828] bg-[#C62828]/5";
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${cls} ${selected !== null ? "cursor-default" : "cursor-pointer"}`}
                  data-testid={`quickquiz-option-${idx}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#E6C9A8] flex items-center justify-center text-xs font-medium text-[#5D4037]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm text-[#3E2723] font-medium">{option}</span>
                    {selected !== null && idx === current.correctIndex && <CheckCircle2 className="w-4 h-4 text-[#2E7D32] ml-auto" />}
                    {selected !== null && idx === selected && idx !== current.correctIndex && <XCircle className="w-4 h-4 text-[#C62828] ml-auto" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
              <Card className={`rounded-xl border-2 ${isCorrect ? "border-[#2E7D32] bg-[#2E7D32]/5" : "border-[#C62828] bg-[#C62828]/5"} mb-4`}>
                <CardContent className="p-3">
                  <p className={`text-xs ${isCorrect ? "text-[#2E7D32]" : "text-[#C62828]"}`}>{current.explanation}</p>
                </CardContent>
              </Card>
              <Button onClick={next} className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-5 gap-1.5 text-sm" data-testid="quickquiz-next">
                {currentIdx < TOTAL - 1 ? "Suivante" : "Résultats"} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
