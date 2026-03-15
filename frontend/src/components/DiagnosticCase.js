import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addScore } from "@/lib/progressManager";
import { DEFECT_IMAGES } from "@/lib/activityData";

export default function DiagnosticCase({ caseData, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const imageUrl = caseData.image ? DEFECT_IMAGES[caseData.image] : null;
  const isCorrect = selected === caseData.correctIndex;

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
  };

  const confirm = () => {
    if (selected === null) return;
    setShowResult(true);
    if (isCorrect) {
      addScore(10, "diagnostic");
      toast.success("+10 points !");
    } else {
      addScore(0, "diagnostic");
    }
  };

  const reset = () => {
    setSelected(null);
    setShowResult(false);
  };

  return (
    <div data-testid="diagnostic-case">
      <h3 className="font-heading text-xl font-semibold text-[#3E2723] mb-4">{caseData.title}</h3>

      {/* Image + context */}
      <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-sm mb-6 overflow-hidden" data-testid="case-card">
        <CardContent className="p-0">
          {imageUrl ? (
            <img src={imageUrl} alt={caseData.title}
              className="w-full h-48 md:h-64 object-cover"
              data-testid="case-image" />
          ) : (
            <div className="w-full h-32 bg-[#F5DEB3]/30 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-[#D2B48C]" />
            </div>
          )}
          <div className="p-5">
            <Badge className="bg-[#D2691E]/10 text-[#D2691E] border-0 mb-3">Cas clinique</Badge>
            <p className="text-[#3E2723] leading-relaxed italic" data-testid="case-context">
              "{caseData.context}"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <p className="font-heading text-lg font-semibold text-[#3E2723] mb-4" data-testid="case-question">
        {caseData.question}
      </p>

      {/* Options */}
      <div className="grid gap-3 mb-6" data-testid="case-options">
        {caseData.options.map((option, idx) => {
          let borderClass = "border-[#E6C9A8]/50 hover:border-[#D2691E]/50";
          let bgClass = "bg-white hover:bg-[#F5DEB3]/10";

          if (showResult) {
            if (idx === caseData.correctIndex) {
              borderClass = "border-[#2E7D32]";
              bgClass = "bg-[#2E7D32]/5";
            } else if (idx === selected) {
              borderClass = "border-[#C62828]";
              bgClass = "bg-[#C62828]/5";
            }
          } else if (idx === selected) {
            borderClass = "border-[#8B4513]";
            bgClass = "bg-[#F5DEB3]/20";
          }

          return (
            <motion.button
              key={idx}
              whileHover={!showResult ? { scale: 1.01 } : {}}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${borderClass} ${bgClass} ${showResult ? "cursor-default" : "cursor-pointer"}`}
              data-testid={`case-option-${idx}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E6C9A8] flex items-center justify-center text-sm font-medium text-[#5D4037] flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-[#3E2723] font-medium text-sm">{option}</span>
                {showResult && idx === caseData.correctIndex && <CheckCircle2 className="w-5 h-5 text-[#2E7D32] ml-auto" />}
                {showResult && idx === selected && idx !== caseData.correctIndex && <XCircle className="w-5 h-5 text-[#C62828] ml-auto" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Confirm / Feedback */}
      {!showResult && (
        <Button onClick={confirm} disabled={selected === null}
          className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6 disabled:opacity-40"
          data-testid="case-confirm-btn">
          Valider <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}

      {showResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} data-testid="case-feedback">
          <Card className={`rounded-2xl border-2 ${isCorrect ? "border-[#2E7D32] bg-[#2E7D32]/5" : "border-[#C62828] bg-[#C62828]/5"} mb-4`}>
            <CardContent className="p-4">
              <p className={`font-semibold mb-1 ${isCorrect ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                {isCorrect ? "Excellent diagnostic !" : "Ce n'est pas la bonne réponse."}
              </p>
              <p className="text-sm text-[#5D4037]">{caseData.explanation}</p>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button onClick={reset} className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6" data-testid="case-retry">
              <RotateCcw className="w-4 h-4 mr-1" /> Réessayer
            </Button>
            {onComplete && (
              <Button variant="ghost" onClick={onComplete} className="text-[#8B4513] rounded-full">Retour</Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
