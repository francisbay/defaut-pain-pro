import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, CheckCircle2, XCircle, ArrowRight, RotateCcw, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addScore, getProgress } from "@/lib/progressManager";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEP_LABELS = ["Symptôme", "Cause", "Remède"];

export default function DiagnosticPage() {
  const [scenario, setScenario] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([null, null, null]);
  const [results, setResults] = useState([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const loadScenario = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/diagnostic/scenario`);
      setScenario(res.data);
      setCurrentStep(0);
      setAnswers([null, null, null]);
      setResults([null, null, null]);
      setFinished(false);
      setTotalScore(0);
    } catch (e) {
      toast.error("Erreur de chargement du scénario");
    }
    setLoading(false);
  }, []);

  const handleAnswer = (optionIdx) => {
    if (answers[currentStep] !== null) return;
    const step = scenario.steps[currentStep];
    const correct = optionIdx === step.correctIndex;
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIdx;
    setAnswers(newAnswers);

    const newResults = [...results];
    newResults[currentStep] = correct;
    setResults(newResults);

    if (correct) {
      const pts = 10;
      addScore(pts, "diagnostic");
      setTotalScore(prev => prev + pts);
      toast.success(`+${pts} points !`);
    } else {
      addScore(0, "diagnostic");
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const correctCount = results.filter(r => r === true).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="diagnostic-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#D2691E]/10 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-[#D2691E]" />
          </div>
          <h1 className="font-heading text-3xl font-semibold text-[#3E2723]" data-testid="diagnostic-title">
            Mode Diagnostic
          </h1>
        </div>
        <p className="text-[#5D4037] mb-8 ml-13">
          Simulez un diagnostic complet en trois étapes.
        </p>

        {!scenario && !loading && (
          <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)]" data-testid="start-card">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[#D2691E]/10 flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-10 h-10 text-[#D2691E]" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-3">
                Prêt pour le diagnostic ?
              </h2>
              <p className="text-[#5D4037] mb-8 max-w-md mx-auto">
                Vous allez observer un problème et devrez identifier le symptôme, la cause et le remède en trois étapes.
              </p>
              <Button
                onClick={loadScenario}
                className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                data-testid="start-diagnostic-btn"
              >
                Lancer un diagnostic
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20" data-testid="diagnostic-loading">
            <div className="animate-spin w-8 h-8 border-4 border-[#D2691E] border-t-transparent rounded-full" />
          </div>
        )}

        {scenario && !loading && !finished && (
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6" data-testid="step-indicator">
                {STEP_LABELS.map((label, idx) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      idx < currentStep
                        ? results[idx] ? "bg-[#2E7D32] text-white" : "bg-[#C62828] text-white"
                        : idx === currentStep
                        ? "bg-[#8B4513] text-white"
                        : "bg-[#F5DEB3] text-[#8D6E63]"
                    }`}>
                      {idx < currentStep ? (results[idx] ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />) : idx + 1}
                    </div>
                    <span className={`text-sm font-medium ${idx === currentStep ? "text-[#3E2723]" : "text-[#8D6E63]"}`}>{label}</span>
                    {idx < 2 && <div className="w-8 h-0.5 bg-[#E6C9A8] mx-1" />}
                  </div>
                ))}
              </div>

              {/* Scenario */}
              <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)] mb-6" data-testid="scenario-card">
                <CardContent className="p-6 md:p-8">
                  <Badge className="bg-[#D2691E]/10 text-[#D2691E] border-0 mb-3">Scénario</Badge>
                  <p className="text-[#3E2723] leading-relaxed text-lg italic" data-testid="scenario-narrative">
                    "{scenario.narrative}"
                  </p>
                </CardContent>
              </Card>

              {/* Current step question */}
              <div className="mb-4">
                <h3 className="font-heading text-lg font-semibold text-[#3E2723] mb-1">
                  Étape {currentStep + 1} : {scenario.steps[currentStep].title}
                </h3>
                <p className="text-[#5D4037] mb-4">{scenario.steps[currentStep].instruction}</p>
              </div>

              <div className="grid gap-3" data-testid="step-options">
                {scenario.steps[currentStep].options.map((option, idx) => {
                  const answered = answers[currentStep] !== null;
                  const isCorrectOption = idx === scenario.steps[currentStep].correctIndex;
                  const isSelected = idx === answers[currentStep];

                  let borderClass = "border-[#E6C9A8]/50 hover:border-[#D2691E]/50";
                  let bgClass = "bg-white hover:bg-[#F5DEB3]/10";

                  if (answered) {
                    if (isCorrectOption) {
                      borderClass = "border-[#2E7D32]";
                      bgClass = "bg-[#2E7D32]/5";
                    } else if (isSelected && !isCorrectOption) {
                      borderClass = "border-[#C62828]";
                      bgClass = "bg-[#C62828]/5";
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!answered ? { scale: 1.01 } : {}}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${borderClass} ${bgClass} ${answered ? "cursor-default" : "cursor-pointer"}`}
                      data-testid={`step-option-${idx}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E6C9A8] flex items-center justify-center text-sm font-medium text-[#5D4037] flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-[#3E2723] font-medium">{option}</span>
                        {answered && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-[#2E7D32] ml-auto" />}
                        {answered && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-[#C62828] ml-auto" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback + Next */}
              {answers[currentStep] !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6" data-testid="step-feedback">
                  <Card className={`rounded-2xl border-2 ${results[currentStep] ? "border-[#2E7D32] bg-[#2E7D32]/5" : "border-[#C62828] bg-[#C62828]/5"} mb-4`}>
                    <CardContent className="p-4">
                      <p className={`text-sm ${results[currentStep] ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                        {scenario.steps[currentStep].explanation}
                      </p>
                    </CardContent>
                  </Card>
                  <Button
                    onClick={nextStep}
                    className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6 gap-2"
                    data-testid="next-step-btn"
                  >
                    {currentStep < 2 ? "Étape suivante" : "Voir les résultats"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Results */}
        {finished && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} data-testid="diagnostic-results">
            <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)]">
              <CardContent className="p-8 text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${correctCount === 3 ? "bg-[#2E7D32]/10" : correctCount >= 2 ? "bg-[#F57C00]/10" : "bg-[#C62828]/10"}`}>
                  <span className="text-3xl font-bold" style={{ color: correctCount === 3 ? "#2E7D32" : correctCount >= 2 ? "#F57C00" : "#C62828" }}>
                    {correctCount}/3
                  </span>
                </div>
                <h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-2">
                  {correctCount === 3 ? "Diagnostic parfait !" : correctCount >= 2 ? "Bon diagnostic !" : "Continuez à apprendre"}
                </h2>
                <p className="text-[#5D4037] mb-4">
                  Défaut diagnostiqué : <strong>{scenario.defectName}</strong>
                </p>
                <p className="text-[#8B4513] font-bold mb-6">+{totalScore} points</p>

                <div className="grid gap-3 text-left max-w-md mx-auto mb-8">
                  {STEP_LABELS.map((label, idx) => (
                    <div key={label} className="flex items-center gap-3">
                      {results[idx] ? (
                        <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#C62828]" />
                      )}
                      <span className="text-[#3E2723] font-medium">{label}</span>
                      <span className={`ml-auto text-sm ${results[idx] ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                        {results[idx] ? "+10 pts" : "0 pts"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={loadScenario}
                    className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6 gap-2"
                    data-testid="new-diagnostic-btn"
                  >
                    <RotateCcw className="w-4 h-4" /> Nouveau diagnostic
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
