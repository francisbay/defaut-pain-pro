import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Stethoscope, Trophy, Library, ArrowRight, Wheat, Award, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getProgress, getCurrentBadge, getNextBadge, getLevelProgress } from "@/lib/progressManager";

const MODES = [
  {
    path: "/activites",
    title: "Activités interactives",
    description: "Pendu, mots croisés, glisser-déposer et cas diagnostics par niveau (SAP, BP, BM)",
    icon: Sparkles,
    color: "bg-[#D2691E]",
    lightColor: "bg-[#D2691E]/5",
  },
  {
    path: "/entrainement",
    title: "Entraînement",
    description: "Apprenez à reconnaître les défauts et leurs causes avec des exercices guidés",
    icon: BookOpen,
    color: "bg-[#8B4513]",
    lightColor: "bg-[#8B4513]/5",
  },
  {
    path: "/diagnostic",
    title: "Diagnostic",
    description: "Simulez un diagnostic complet : symptôme, cause et remède",
    icon: Stethoscope,
    color: "bg-[#D2691E]",
    lightColor: "bg-[#D2691E]/5",
  },
  {
    path: "/quiz",
    title: "Quiz",
    description: "Testez vos connaissances avec des questions aléatoires",
    icon: Trophy,
    color: "bg-[#2E7D32]",
    lightColor: "bg-[#2E7D32]/5",
  },
  {
    path: "/fiches",
    title: "Fiches techniques",
    description: "Consultez les fiches complètes de chaque défaut du pain",
    icon: Library,
    color: "bg-[#0277BD]",
    lightColor: "bg-[#0277BD]/5",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomePage() {
  const progress = getProgress();
  const badge = getCurrentBadge(progress.score);
  const nextBadge = getNextBadge(progress.score);
  const levelProg = getLevelProgress(progress.score);

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1772316721788-f5100b4e1c4b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxzb3VyZG91Z2glMjBicmVhZCUyMGxvYWYlMjBvbiUyMHdvb2RlbiUyMHRhYmxlfGVufDB8fHx8MTc3MzQ5OTY0OXww&ixlib=rb-4.1.0&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723]/70 via-[#3E2723]/50 to-[#FAF9F6]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#F5DEB3] flex items-center justify-center">
                <Wheat className="w-6 h-6 text-[#8B4513]" />
              </div>
              <span className="text-[#F5DEB3] font-body text-sm font-medium tracking-wider uppercase">
                Jeu Sérieux
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl" data-testid="hero-title">
              L'Apprenti Boulanger
            </h1>
            <p className="mt-6 text-base md:text-lg text-[#F5DEB3]/90 max-w-2xl leading-relaxed font-body">
              Apprenez à diagnostiquer les défauts du pain comme un boulanger professionnel.
              Identifiez les symptômes, comprenez les causes et maîtrisez les remèdes techniques.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/entrainement">
                <Button className="bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" data-testid="start-training-btn">
                  Commencer l'entraînement
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/fiches">
                <Button className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 rounded-full px-8 py-3 font-medium transition-all" data-testid="view-cards-btn">
                  Consulter les fiches
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Progress Summary */}
      {progress.score > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12" data-testid="progress-summary">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.08)]">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-6 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#F5DEB3] flex items-center justify-center">
                      <Award className="w-6 h-6 text-[#8B4513]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#8D6E63] font-body">Votre niveau</p>
                      <p className="font-heading text-xl font-bold text-[#3E2723]">{badge.name}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] max-w-md">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#5D4037] font-medium">Niveau {progress.level}</span>
                      {nextBadge && <span className="text-[#8D6E63]">Prochain : {nextBadge.name}</span>}
                    </div>
                    <Progress value={levelProg} className="h-2.5 bg-[#F5DEB3]" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#8B4513]">{progress.score}</p>
                    <p className="text-sm text-[#8D6E63]">points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      )}

      {/* Game Modes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20" data-testid="modes-section">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="font-heading text-3xl font-semibold text-[#3E2723] mb-3">Modes de jeu</h2>
          <p className="text-base text-[#5D4037] mb-10 max-w-lg">
            Choisissez votre mode d'apprentissage et progressez à votre rythme.
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={container} initial="hidden" animate="show">
          {MODES.map(mode => {
            const Icon = mode.icon;
            return (
              <motion.div key={mode.path} variants={item}>
                <Link to={mode.path} data-testid={`mode-card-${mode.path.slice(1)}`}>
                  <Card className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_24px_rgba(139,69,19,0.1)] hover:border-[#D2691E]/30 cursor-pointer group h-full">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex items-start gap-5">
                        <div className={`w-14 h-14 rounded-2xl ${mode.lightColor} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                          <Icon className={`w-7 h-7 ${mode.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading text-xl font-semibold text-[#3E2723] mb-2 group-hover:text-[#8B4513] transition-colors">
                            {mode.title}
                          </h3>
                          <p className="text-sm text-[#5D4037] leading-relaxed">{mode.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#D2B48C] group-hover:text-[#8B4513] transition-all group-hover:translate-x-1 flex-shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Footer info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center py-8 border-t border-[#E6C9A8]/30">
          <p className="text-sm text-[#8D6E63]">
            Source pédagogique : Supplément technique n66 - Les défauts des pâtes et des pains
          </p>
          <p className="text-xs text-[#8D6E63] mt-1">
            Les Nouvelles de la Boulangerie Pâtisserie &bull; technomitron.aainb.com
          </p>
        </div>
      </section>
    </div>
  );
}
