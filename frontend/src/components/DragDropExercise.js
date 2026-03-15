import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addScore } from "@/lib/progressManager";
import { DEFECT_IMAGES } from "@/lib/activityData";

export default function DragDropExercise({ exercise, level, onComplete }) {
  const shuffledRight = useMemo(() => {
    const unique = [...new Set(exercise.pairs.map(p => p.right))];
    return unique.sort(() => Math.random() - 0.5);
  }, [exercise]);

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matches, setMatches] = useState({});
  const [results, setResults] = useState(null);

  const handleLeftClick = (leftItem) => {
    if (results) return;
    setSelectedLeft(leftItem === selectedLeft ? null : leftItem);
  };

  const handleRightClick = (rightItem) => {
    if (results || !selectedLeft) return;
    setMatches(prev => ({ ...prev, [selectedLeft]: rightItem }));
    setSelectedLeft(null);
  };

  const checkAnswers = () => {
    let correct = 0;
    const checked = {};
    exercise.pairs.forEach(pair => {
      const userAnswer = matches[pair.left];
      const isCorrect = userAnswer === pair.right;
      if (isCorrect) correct++;
      checked[pair.left] = isCorrect;
    });
    setResults(checked);
    const points = correct * 5;
    if (points > 0) addScore(points, "training");
    toast(correct === exercise.pairs.length ? "Parfait !" : `${correct}/${exercise.pairs.length} correct`);
  };

  const reset = () => {
    setSelectedLeft(null);
    setMatches({});
    setResults(null);
  };

  const allMatched = exercise.pairs.every(p => matches[p.left]);

  return (
    <div data-testid="dragdrop-exercise">
      <h3 className="font-heading text-xl font-semibold text-[#3E2723] mb-2">{exercise.title}</h3>
      <p className="text-[#5D4037] text-sm mb-6">{exercise.instruction}</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-3" data-testid="dragdrop-left">
          <p className="text-xs font-semibold text-[#8D6E63] uppercase tracking-wider mb-2">Éléments</p>
          {exercise.pairs.map((pair, idx) => {
            const isSelected = selectedLeft === pair.left;
            const isMatched = matches[pair.left];
            const result = results ? results[pair.left] : null;

            return (
              <motion.button
                key={pair.left}
                whileHover={!results ? { scale: 1.01 } : {}}
                onClick={() => handleLeftClick(pair.left)}
                className={`w-full text-left rounded-xl border-2 transition-all overflow-hidden ${
                  result === true ? "border-[#2E7D32] bg-[#2E7D32]/5" :
                  result === false ? "border-[#C62828] bg-[#C62828]/5" :
                  isSelected ? "border-[#8B4513] bg-[#F5DEB3]/20 shadow-md" :
                  isMatched ? "border-[#D2691E] bg-[#D2691E]/5" :
                  "border-[#E6C9A8]/50 bg-white hover:border-[#D2691E]/50"
                }`}
                data-testid={`left-item-${idx}`}
              >
                {pair.image && DEFECT_IMAGES[pair.image] && (
                  <img src={DEFECT_IMAGES[pair.image]} alt={pair.left} className="w-full h-20 object-cover" />
                )}
                <div className="p-3 flex items-center gap-2">
                  <span className="font-medium text-sm text-[#3E2723]">{pair.left}</span>
                  {isMatched && !results && (
                    <Badge className="ml-auto bg-[#D2691E]/10 text-[#D2691E] border-0 text-xs">{matches[pair.left]}</Badge>
                  )}
                  {result === true && <CheckCircle2 className="w-4 h-4 text-[#2E7D32] ml-auto" />}
                  {result === false && <XCircle className="w-4 h-4 text-[#C62828] ml-auto" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-3" data-testid="dragdrop-right">
          <p className="text-xs font-semibold text-[#8D6E63] uppercase tracking-wider mb-2">Réponses</p>
          {shuffledRight.map((item, idx) => {
            const isTarget = selectedLeft !== null;
            return (
              <motion.button
                key={item}
                whileHover={isTarget && !results ? { scale: 1.02 } : {}}
                onClick={() => handleRightClick(item)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isTarget && !results
                    ? "border-[#8B4513]/30 bg-[#F5DEB3]/10 hover:border-[#8B4513] hover:bg-[#F5DEB3]/30 cursor-pointer"
                    : results ? "border-[#E6C9A8]/30 bg-[#FAF9F6]" : "border-[#E6C9A8]/30 bg-[#FAF9F6]"
                }`}
                data-testid={`right-item-${idx}`}
              >
                <span className="font-medium text-sm text-[#3E2723]">{item}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {!results && (
          <>
            <Button onClick={checkAnswers} disabled={!allMatched}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6 disabled:opacity-40"
              data-testid="check-answers-btn">
              Vérifier <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="ghost" onClick={reset} className="text-[#8D6E63] rounded-full" data-testid="reset-btn">
              <RotateCcw className="w-4 h-4 mr-1" /> Recommencer
            </Button>
          </>
        )}
        {results && (
          <div className="flex gap-3">
            <Button onClick={reset} className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6" data-testid="retry-btn">
              <RotateCcw className="w-4 h-4 mr-1" /> Réessayer
            </Button>
            {onComplete && (
              <Button variant="ghost" onClick={onComplete} className="text-[#8B4513] rounded-full" data-testid="back-btn">
                Retour aux activités
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
