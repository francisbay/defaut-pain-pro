import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Stethoscope, Trophy, Library, User, Wheat, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProgress, getCurrentBadge } from "@/lib/progressManager";

const NAV_ITEMS = [
  { path: "/entrainement", label: "Entraînement", icon: BookOpen },
  { path: "/diagnostic", label: "Diagnostic", icon: Stethoscope },
  { path: "/quiz", label: "Quiz", icon: Trophy },
  { path: "/fiches", label: "Fiches", icon: Library },
  { path: "/profil", label: "Profil", icon: User },
];

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const progress = getProgress();
  const badge = getCurrentBadge(progress.score);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E6C9A8]/40" data-testid="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
            <div className="w-9 h-9 rounded-full bg-[#8B4513] flex items-center justify-center">
              <Wheat className="w-5 h-5 text-[#F5DEB3]" />
            </div>
            <span className="font-heading text-lg font-bold text-[#3E2723] hidden sm:block">
              L'Apprenti Boulanger
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" data-testid="desktop-nav">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} data-testid={`nav-${item.path.slice(1)}`}>
                  <Button
                    variant="ghost"
                    className={`gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#8B4513] text-white hover:bg-[#A0522D]"
                        : "text-[#5D4037] hover:bg-[#F5DEB3]/40 hover:text-[#3E2723]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Badge className="bg-[#F5DEB3] text-[#5D2906] hover:bg-[#E6C9A8] border-0 px-3 py-1" data-testid="badge-display">
              {badge.name}
            </Badge>
            <span className="text-sm font-semibold text-[#8B4513]" data-testid="score-display">
              {progress.score} pts
            </span>
          </div>

          <Button
            variant="ghost"
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-[#E6C9A8]/40 px-4 pb-4"
          data-testid="mobile-nav"
        >
          <div className="flex items-center gap-2 mb-3 pt-2">
            <Badge className="bg-[#F5DEB3] text-[#5D2906] border-0">{badge.name}</Badge>
            <span className="text-sm font-semibold text-[#8B4513]">{progress.score} pts</span>
          </div>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-nav-${item.path.slice(1)}`}
              >
                <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive ? "bg-[#8B4513] text-white" : "text-[#5D4037] hover:bg-[#F5DEB3]/40"
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </motion.div>
      )}
    </header>
  );
}
