import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Award, Trophy, BookOpen, Stethoscope, Target, TrendingUp, RotateCcw, Wheat, Crown, ChefHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  getProgress, resetProgress, getCurrentBadge, getNextBadge,
  getLevelProgress, getAllBadges, getLevel,
} from "@/lib/progressManager";

const BADGE_ICONS = {
  apprenti: Wheat,
  mitron: ChefHat,
  boulanger: Award,
  maitre: Crown,
};

export default function ProfilePage() {
  const [progress, setProgress] = useState(getProgress());

  const handleReset = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser votre progression ?")) {
      const reset = resetProgress();
      setProgress(reset);
      toast.success("Progression réinitialisée");
    }
  };

  const badge = getCurrentBadge(progress.score);
  const nextBadge = getNextBadge(progress.score);
  const levelProg = getLevelProgress(progress.score);
  const allBadges = getAllBadges();
  const accuracy = progress.stats.totalAnswered > 0
    ? Math.round((progress.stats.correctAnswers / progress.stats.totalAnswered) * 100)
    : 0;

  const stats = [
    { label: "Score total", value: progress.score, icon: TrendingUp, color: "text-[#8B4513]" },
    { label: "Réponses totales", value: progress.stats.totalAnswered, icon: Target, color: "text-[#D2691E]" },
    { label: "Précision", value: `${accuracy}%`, icon: Trophy, color: "text-[#2E7D32]" },
    { label: "Meilleure série", value: progress.bestStreak, icon: Award, color: "text-[#F57C00]" },
  ];

  const activities = [
    { label: "Entraînements", value: progress.stats.trainingCompleted, icon: BookOpen, color: "bg-[#8B4513]/10 text-[#8B4513]" },
    { label: "Diagnostics", value: progress.stats.diagnosticsCompleted, icon: Stethoscope, color: "bg-[#D2691E]/10 text-[#D2691E]" },
    { label: "Quiz complétés", value: progress.stats.quizCompleted, icon: Trophy, color: "bg-[#2E7D32]/10 text-[#2E7D32]" },
    { label: "Meilleur score quiz", value: progress.stats.quizBestScore, icon: TrendingUp, color: "bg-[#0277BD]/10 text-[#0277BD]" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="profile-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#8B4513]/10 flex items-center justify-center">
            <User className="w-5 h-5 text-[#8B4513]" />
          </div>
          <h1 className="font-heading text-3xl font-semibold text-[#3E2723]" data-testid="profile-title">
            Mon Profil
          </h1>
        </div>
        <p className="text-[#5D4037] mb-8 ml-13">Suivez votre progression et vos réussites.</p>

        {/* Level Card */}
        <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)] mb-8" data-testid="level-card">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-[#F5DEB3] flex items-center justify-center flex-shrink-0">
                {(() => {
                  const BadgeIcon = BADGE_ICONS[badge.id] || Award;
                  return <BadgeIcon className="w-12 h-12 text-[#8B4513]" />;
                })()}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-heading text-2xl font-bold text-[#3E2723] mb-1" data-testid="current-badge">
                  {badge.name}
                </h2>
                <p className="text-[#5D4037] mb-3">Niveau {progress.level}</p>
                <div className="max-w-md">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#8D6E63]">{progress.score} points</span>
                    {nextBadge && <span className="text-[#8D6E63]">Prochain badge : {nextBadge.name} ({nextBadge.minScore} pts)</span>}
                  </div>
                  <Progress value={levelProg} className="h-3 bg-[#F5DEB3]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="stats-grid">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.05)]">
                <CardContent className="p-5 text-center">
                  <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-[#3E2723]">{stat.value}</p>
                  <p className="text-xs text-[#8D6E63] mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Activity */}
        <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)] mb-8" data-testid="activity-card">
          <CardContent className="p-6 md:p-8">
            <h3 className="font-heading text-xl font-semibold text-[#3E2723] mb-6">Activité</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activities.map(act => {
                const Icon = act.icon;
                return (
                  <div key={act.label} className="text-center">
                    <div className={`w-12 h-12 rounded-xl ${act.color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-xl font-bold text-[#3E2723]">{act.value}</p>
                    <p className="text-xs text-[#8D6E63]">{act.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)] mb-8" data-testid="badges-card">
          <CardContent className="p-6 md:p-8">
            <h3 className="font-heading text-xl font-semibold text-[#3E2723] mb-6">Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allBadges.map(b => {
                const earned = progress.score >= b.minScore;
                const BadgeIcon = BADGE_ICONS[b.id] || Award;
                return (
                  <div
                    key={b.id}
                    className={`text-center p-4 rounded-2xl transition-all ${earned ? "bg-[#F5DEB3]/30" : "bg-gray-50 opacity-40"}`}
                    data-testid={`badge-${b.id}`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${earned ? "bg-[#F5DEB3]" : "bg-gray-200"}`}>
                      <BadgeIcon className={`w-8 h-8 ${earned ? "text-[#8B4513]" : "text-gray-400"}`} />
                    </div>
                    <p className={`font-semibold text-sm ${earned ? "text-[#3E2723]" : "text-gray-400"}`}>{b.name}</p>
                    <p className="text-xs text-[#8D6E63] mt-1">{b.minScore} pts</p>
                    {earned && <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] border-0 text-xs mt-2">Obtenu</Badge>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reset */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-[#C62828] hover:bg-[#C62828]/5 gap-2"
            data-testid="reset-progress-btn"
          >
            <RotateCcw className="w-4 h-4" /> Réinitialiser la progression
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
