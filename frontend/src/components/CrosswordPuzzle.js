import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Eye, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addScore } from "@/lib/progressManager";

export default function CrosswordPuzzle({ puzzle, onComplete }) {
  const { gridSize, words } = puzzle;

  // Build grid and solution
  const { grid, cellMap } = useMemo(() => {
    const g = Array.from({ length: gridSize.rows }, () => Array(gridSize.cols).fill(null));
    const cm = {};

    words.forEach(w => {
      const letters = w.word.split("");
      letters.forEach((letter, i) => {
        const row = w.direction === "across" ? w.startRow : w.startRow + i;
        const col = w.direction === "across" ? w.startCol + i : w.startCol;
        g[row][col] = { letter, number: i === 0 ? w.number : null, wordIds: [] };
        const key = `${row}-${col}`;
        if (!cm[key]) cm[key] = { letter, number: i === 0 ? w.number : (cm[key]?.number || null), wordIds: [] };
        cm[key].wordIds.push(w.number);
        if (i === 0) cm[key].number = w.number;
      });
    });

    return { grid: g, cellMap: cm };
  }, [gridSize, words]);

  const [userInput, setUserInput] = useState({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [activeClue, setActiveClue] = useState(null);
  const inputRefs = useRef({});

  const handleInput = useCallback((row, col, value) => {
    if (checked || revealed) return;
    const key = `${row}-${col}`;
    const letter = value.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(-1);
    setUserInput(prev => ({ ...prev, [key]: letter }));

    // Auto-advance to next cell
    if (letter && activeClue !== null) {
      const word = words.find(w => w.number === activeClue);
      if (word) {
        const wordLetters = word.word.split("");
        const currentIdx = word.direction === "across"
          ? col - word.startCol
          : row - word.startRow;
        const nextIdx = currentIdx + 1;
        if (nextIdx < wordLetters.length) {
          const nextRow = word.direction === "across" ? word.startRow : word.startRow + nextIdx;
          const nextCol = word.direction === "across" ? word.startCol + nextIdx : word.startCol;
          const nextKey = `${nextRow}-${nextCol}`;
          setTimeout(() => inputRefs.current[nextKey]?.focus(), 50);
        }
      }
    }
  }, [checked, revealed, activeClue, words]);

  const checkAnswers = () => {
    setChecked(true);
    let correct = 0;
    let total = 0;
    Object.entries(cellMap).forEach(([key, cell]) => {
      total++;
      const normalized = cell.letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
      if (userInput[key] === normalized) correct++;
    });
    const points = Math.round((correct / total) * 15);
    if (points > 0) addScore(points, "training");
    toast(correct === total ? "Parfait !" : `${correct}/${total} lettres correctes`);
  };

  const revealAnswers = () => {
    setRevealed(true);
    const filled = {};
    Object.entries(cellMap).forEach(([key, cell]) => {
      filled[key] = cell.letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    });
    setUserInput(filled);
  };

  const reset = () => {
    setUserInput({});
    setChecked(false);
    setRevealed(false);
    setActiveClue(null);
  };

  const acrossWords = words.filter(w => w.direction === "across");
  const downWords = words.filter(w => w.direction === "down");

  return (
    <div data-testid="crossword-puzzle">
      <h3 className="font-heading text-xl font-semibold text-[#3E2723] mb-1">{puzzle.title}</h3>
      <p className="text-[#5D4037] text-sm mb-6">Remplissez la grille à l'aide des indices.</p>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        {/* Grid */}
        <div className="overflow-x-auto" data-testid="crossword-grid">
          <div className="inline-grid gap-0.5 p-2 bg-[#3E2723] rounded-xl" style={{
            gridTemplateColumns: `repeat(${gridSize.cols}, 2.5rem)`,
            gridTemplateRows: `repeat(${gridSize.rows}, 2.5rem)`,
          }}>
            {Array.from({ length: gridSize.rows }).map((_, row) =>
              Array.from({ length: gridSize.cols }).map((_, col) => {
                const key = `${row}-${col}`;
                const cell = cellMap[key];

                if (!cell) {
                  return <div key={key} className="bg-[#3E2723] w-10 h-10" />;
                }

                const normalizedExpected = cell.letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
                const isCorrect = checked && userInput[key] === normalizedExpected;
                const isWrong = checked && userInput[key] && userInput[key] !== normalizedExpected;
                const isHighlighted = cell.wordIds.includes(activeClue);

                return (
                  <div key={key} className={`relative w-10 h-10 ${
                    isCorrect ? "bg-[#2E7D32]/10" :
                    isWrong ? "bg-[#C62828]/10" :
                    isHighlighted ? "bg-[#F5DEB3]" :
                    "bg-white"
                  } rounded-sm`}>
                    {cell.number && (
                      <span className="absolute top-0 left-0.5 text-[8px] font-bold text-[#8B4513] leading-none">{cell.number}</span>
                    )}
                    <input
                      ref={el => { inputRefs.current[key] = el; }}
                      type="text"
                      maxLength={1}
                      value={userInput[key] || ""}
                      onChange={(e) => handleInput(row, col, e.target.value)}
                      onFocus={() => {
                        if (cell.wordIds.length > 0) setActiveClue(cell.wordIds[0]);
                      }}
                      disabled={checked || revealed}
                      className="w-full h-full text-center text-lg font-bold text-[#3E2723] bg-transparent outline-none uppercase disabled:cursor-default"
                      data-testid={`cell-${row}-${col}`}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Clues */}
        <div className="space-y-4" data-testid="crossword-clues">
          {downWords.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#8D6E63] uppercase tracking-wider mb-2">Vertical</p>
              {downWords.map(w => (
                <button key={w.number} onClick={() => setActiveClue(w.number)}
                  className={`block w-full text-left text-sm p-2 rounded-lg transition-all ${activeClue === w.number ? "bg-[#F5DEB3]/40 text-[#3E2723]" : "text-[#5D4037] hover:bg-[#FAF9F6]"}`}
                  data-testid={`clue-down-${w.number}`}>
                  <span className="font-bold text-[#8B4513]">{w.number}.</span> {w.clue}
                </button>
              ))}
            </div>
          )}
          {acrossWords.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#8D6E63] uppercase tracking-wider mb-2">Horizontal</p>
              {acrossWords.map(w => (
                <button key={w.number} onClick={() => setActiveClue(w.number)}
                  className={`block w-full text-left text-sm p-2 rounded-lg transition-all ${activeClue === w.number ? "bg-[#F5DEB3]/40 text-[#3E2723]" : "text-[#5D4037] hover:bg-[#FAF9F6]"}`}
                  data-testid={`clue-across-${w.number}`}>
                  <span className="font-bold text-[#8B4513]">{w.number}.</span> {w.clue}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {!checked && !revealed && (
          <>
            <Button onClick={checkAnswers} className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6" data-testid="crossword-check">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Vérifier
            </Button>
            <Button variant="ghost" onClick={revealAnswers} className="text-[#8D6E63] rounded-full" data-testid="crossword-reveal">
              <Eye className="w-4 h-4 mr-1" /> Révéler
            </Button>
          </>
        )}
        {(checked || revealed) && (
          <div className="flex gap-3">
            <Button onClick={reset} className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-6" data-testid="crossword-retry">
              <RotateCcw className="w-4 h-4 mr-1" /> Recommencer
            </Button>
            {onComplete && (
              <Button variant="ghost" onClick={onComplete} className="text-[#8B4513] rounded-full">Retour</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
