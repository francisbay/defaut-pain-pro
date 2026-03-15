import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical, Gamepad2, Grid3X3, Stethoscope,
  ArrowLeft, Sparkles, ChevronRight, Layers
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DragDropExercise from "@/components/DragDropExercise";
import HangmanGame from "@/components/HangmanGame";
import CrosswordPuzzle from "@/components/CrosswordPuzzle";
import DiagnosticCase from "@/components/DiagnosticCase";
import {
  LEVELS, HANGMAN_WORDS, CROSSWORD_PUZZLES,
  DRAG_DROP_EXERCISES, DIAGNOSTIC_CASES, ACTIVITY_TYPES,
} from "@/lib/activityData";

const ICON_MAP = {
  GripVertical, Gamepad2, Grid3X3, Stethoscope,
};

export default function ActivitiesPage() {
  const [selectedLevel, setSelectedLevel] = useState("SAP");
  const [activeActivity, setActiveActivity] = useState(null);

  const level = LEVELS.find(l => l.id === selectedLevel);

  const randomHangmanWord = useMemo(() => {
    const words = HANGMAN_WORDS[selectedLevel] || [];
    return words[Math.floor(Math.random() * words.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel, activeActivity]);

  const randomDiagnosticCase = useMemo(() => {
    const cases = DIAGNOSTIC_CASES[selectedLevel] || [];
    return cases[Math.floor(Math.random() * cases.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel, activeActivity]);

  const activities = ACTIVITY_TYPES.map(type => {
    let available = true;
    if (type.id === "diagnostic" && (!DIAGNOSTIC_CASES[selectedLevel] || DIAGNOSTIC_CASES[selectedLevel].length === 0)) available = false;
    if (type.id === "hangman" && (!HANGMAN_WORDS[selectedLevel] || HANGMAN_WORDS[selectedLevel].length === 0)) available = false;
    if (type.id === "crossword" && !CROSSWORD_PUZZLES[selectedLevel]) available = false;
    if (type.id === "dragdrop" && !DRAG_DROP_EXERCISES[selectedLevel]) available = false;
    return { ...type, available };
  });

  const renderActivity = () => {
    switch (activeActivity) {
      case "dragdrop":
        return <DragDropExercise exercise={DRAG_DROP_EXERCISES[selectedLevel]} level={selectedLevel} onComplete={() => setActiveActivity(null)} />;
      case "hangman":
        return randomHangmanWord ? <HangmanGame wordData={randomHangmanWord} onComplete={() => setActiveActivity(null)} /> : <p>Aucun mot disponible</p>;
      case "crossword":
        return <CrosswordPuzzle puzzle={CROSSWORD_PUZZLES[selectedLevel]} onComplete={() => setActiveActivity(null)} />;
      case "diagnostic":
        return randomDiagnosticCase ? <DiagnosticCase caseData={randomDiagnosticCase} onComplete={() => setActiveActivity(null)} /> : <p>Aucun cas disponible</p>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="activities-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#D2691E]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D2691E]" />
          </div>
          <h1 className="font-heading text-3xl font-semibold text-[#3E2723]" data-testid="activities-title">
            Activités interactives
          </h1>
        </div>
        <p className="text-[#5D4037] mb-8 ml-13">
          Choisissez votre niveau et lancez une activité pédagogique.
        </p>

        {/* Level selector */}
        <div className="flex flex-wrap gap-3 mb-8" data-testid="level-selector">
          {LEVELS.map(l => (
            <button
              key={l.id}
              onClick={() => { setSelectedLevel(l.id); setActiveActivity(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                selectedLevel === l.id
                  ? "text-white shadow-lg"
                  : "bg-white text-[#5D4037] border border-[#E6C9A8] hover:border-[#D2691E]/50"
              }`}
              style={selectedLevel === l.id ? { backgroundColor: l.color } : {}}
              data-testid={`level-btn-${l.id}`}
            >
              <Layers className="w-4 h-4" />
              {l.name}
              <span className="text-xs opacity-70">({l.label})</span>
            </button>
          ))}
        </div>

        {/* Level description */}
        <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-sm mb-8" data-testid="level-description">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${level.color}15` }}>
              <span className="text-xl font-bold" style={{ color: level.color }}>{level.difficulty}</span>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-[#3E2723]">
                Niveau {level.name} — {level.label}
              </h3>
              <p className="text-sm text-[#5D4037]">{level.description}</p>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {!activeActivity ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Activity cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="activity-cards">
                {activities.map(act => {
                  const Icon = ICON_MAP[act.icon] || Sparkles;
                  return (
                    <motion.div key={act.id} whileHover={{ scale: 1.01 }}>
                      <Card
                        className={`rounded-2xl border border-[#E6C9A8]/30 shadow-sm overflow-hidden transition-all cursor-pointer group ${
                          act.available ? "hover:shadow-md hover:border-[#D2691E]/30 bg-white" : "bg-[#FAF9F6] opacity-60 cursor-not-allowed"
                        }`}
                        onClick={() => act.available && setActiveActivity(act.id)}
                        data-testid={`activity-card-${act.id}`}
                      >
                        <CardContent className="p-6 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: act.available ? `${level.color}10` : "#f0f0f0" }}>
                            <Icon className="w-6 h-6" style={{ color: act.available ? level.color : "#999" }} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-heading text-lg font-semibold text-[#3E2723] group-hover:text-[#8B4513] transition-colors">
                              {act.name}
                            </h3>
                            <p className="text-sm text-[#5D4037]">{act.description}</p>
                          </div>
                          {act.available && (
                            <ChevronRight className="w-5 h-5 text-[#D2B48C] group-hover:text-[#8B4513] transition-all group-hover:translate-x-1" />
                          )}
                          {!act.available && (
                            <Badge className="bg-[#E6C9A8]/30 text-[#8D6E63] border-0 text-xs">Bientôt</Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Back button */}
              <Button
                variant="ghost"
                onClick={() => setActiveActivity(null)}
                className="text-[#8B4513] hover:bg-[#F5DEB3]/30 rounded-full mb-6 gap-2"
                data-testid="back-to-activities"
              >
                <ArrowLeft className="w-4 h-4" /> Retour aux activités
              </Button>

              {/* Activity component */}
              <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-sm" data-testid="activity-container">
                <CardContent className="p-6 md:p-8">
                  {renderActivity()}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
