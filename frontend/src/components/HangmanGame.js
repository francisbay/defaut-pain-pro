import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Lightbulb, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addScore } from "@/lib/progressManager";
import { DEFECT_IMAGES } from "@/lib/activityData";

const MAX_WRONG = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function HangmanSVG({ wrong }) {
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[180px] mx-auto">
      {/* Base */}
      <line x1="20" y1="180" x2="180" y2="180" stroke="#8B4513" strokeWidth="3" />
      <line x1="60" y1="180" x2="60" y2="20" stroke="#8B4513" strokeWidth="3" />
      <line x1="60" y1="20" x2="130" y2="20" stroke="#8B4513" strokeWidth="3" />
      <line x1="130" y1="20" x2="130" y2="40" stroke="#8B4513" strokeWidth="3" />
      {/* Head */}
      {wrong >= 1 && <circle cx="130" cy="55" r="15" fill="none" stroke="#3E2723" strokeWidth="2.5" />}
      {/* Body */}
      {wrong >= 2 && <line x1="130" y1="70" x2="130" y2="120" stroke="#3E2723" strokeWidth="2.5" />}
      {/* Left arm */}
      {wrong >= 3 && <line x1="130" y1="85" x2="105" y2="105" stroke="#3E2723" strokeWidth="2.5" />}
      {/* Right arm */}
      {wrong >= 4 && <line x1="130" y1="85" x2="155" y2="105" stroke="#3E2723" strokeWidth="2.5" />}
      {/* Left leg */}
      {wrong >= 5 && <line x1="130" y1="120" x2="105" y2="150" stroke="#3E2723" strokeWidth="2.5" />}
      {/* Right leg */}
      {wrong >= 6 && <line x1="130" y1="120" x2="155" y2="150" stroke="#3E2723" strokeWidth="2.5" />}
    </svg>
  );
}

export default function HangmanGame({ wordData, onComplete }) {
  const word = wordData.word.toUpperCase();
  const normalizedWord = useMemo(() => word.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), [word]);
  const [guessed, setGuessed] = useState(new Set());
  const [finished, setFinished] = useState(false);

  const wrongLetters = [...guessed].filter(l => !normalizedWord.includes(l));
  const wrongCount = wrongLetters.length;
  const isLost = wrongCount >= MAX_WRONG;
  const isWon = normalizedWord.split("").every(l => l === " " || l === "-" || guessed.has(l));
  const gameOver = isLost || isWon;

  const handleGuess = useCallback((letter) => {
    if (gameOver || guessed.has(letter)) return;
    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    const isCorrect = normalizedWord.includes(letter);
    if (!isCorrect) {
      const remaining = MAX_WRONG - wrongCount - 1;
      if (remaining === 0) {
        addScore(0, "training");
        toast.error("Perdu !");
      }
    }

    const allFound = normalizedWord.split("").every(l => l === " " || l === "-" || newGuessed.has(l));
    if (allFound && !finished) {
      setFinished(true);
      addScore(10, "training");
      toast.success("+10 points !");
    }
  }, [gameOver, guessed, normalizedWord, wrongCount, finished]);

  const reset = () => {
    setGuessed(new Set());
    setFinished(false);
  };

  const imageUrl = wordData.image ? DEFECT_IMAGES[wordData.image] : null;

  return (
    <div data-testid="hangman-game">
      <div className="grid md:grid-cols-[1fr_auto] gap-6 mb-6">
        <div>
          {/* Clue + image */}
          <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-sm mb-4">
            <CardContent className="p-5">
              {imageUrl && (
                <img src={imageUrl} alt="Indice visuel" className="w-full h-32 object-cover rounded-xl mb-3"
                  data-testid="hangman-image" />
              )}
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#D2691E] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#5D4037]" data-testid="hangman-clue">
                  <span className="font-semibold">Indice :</span> {wordData.clue}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lives */}
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: MAX_WRONG }).map((_, i) => (
              <Heart key={i} className={`w-5 h-5 ${i < MAX_WRONG - wrongCount ? "text-[#C62828] fill-[#C62828]" : "text-[#E6C9A8]"}`} />
            ))}
            <span className="ml-2 text-xs text-[#8D6E63]">{MAX_WRONG - wrongCount} vie{MAX_WRONG - wrongCount > 1 ? "s" : ""}</span>
          </div>

          {/* Word display */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start" data-testid="word-display">
            {word.split("").map((letter, idx) => {
              const normalizedLetter = letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              const isRevealed = letter === " " || letter === "-" || guessed.has(normalizedLetter) || gameOver;
              return (
                <motion.div
                  key={idx}
                  initial={isRevealed && gameOver ? { scale: 0.8 } : {}}
                  animate={isRevealed && gameOver ? { scale: 1 } : {}}
                  className={`w-10 h-12 flex items-center justify-center border-b-3 text-xl font-bold ${
                    letter === " " ? "border-transparent w-4" :
                    isRevealed && !isWon && gameOver ? "border-[#C62828] text-[#C62828]" :
                    isRevealed ? "border-[#2E7D32] text-[#3E2723]" :
                    "border-[#8B4513]"
                  }`}
                  style={{ borderBottomWidth: letter === " " ? 0 : 3 }}
                >
                  {isRevealed ? letter : ""}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Hangman drawing */}
        <div className="flex-shrink-0">
          <HangmanSVG wrong={wrongCount} />
        </div>
      </div>

      {/* Letter buttons */}
      {!gameOver && (
        <div className="flex flex-wrap gap-1.5 justify-center mb-4" data-testid="letter-buttons">
          {ALPHABET.map(letter => {
            const used = guessed.has(letter);
            const isWrong = used && !normalizedWord.includes(letter);
            const isRight = used && normalizedWord.includes(letter);
            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={used}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  isRight ? "bg-[#2E7D32] text-white" :
                  isWrong ? "bg-[#C62828]/10 text-[#C62828]/40 line-through" :
                  "bg-white border border-[#E6C9A8] text-[#3E2723] hover:bg-[#F5DEB3] hover:border-[#8B4513]"
                } disabled:cursor-default`}
                data-testid={`letter-${letter}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}

      {/* Game over */}
      {gameOver && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} data-testid="hangman-result">
          <Card className={`rounded-2xl border-2 ${isWon ? "border-[#2E7D32] bg-[#2E7D32]/5" : "border-[#C62828] bg-[#C62828]/5"} mb-4`}>
            <CardContent className="p-4 text-center">
              <p className={`font-semibold ${isWon ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                {isWon ? "Bravo ! Vous avez trouvé le mot !" : `Perdu ! Le mot était : ${word}`}
              </p>
            </CardContent>
          </Card>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6" data-testid="hangman-retry">
              <RotateCcw className="w-4 h-4 mr-1" /> Rejouer
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
