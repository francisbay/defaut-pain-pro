import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Library, Search, ChevronDown, ChevronUp, AlertCircle, Wrench, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORY_COLORS = {
  aspect: { bg: "bg-[#8B4513]/10", text: "text-[#8B4513]", badge: "bg-[#8B4513]/10 text-[#8B4513]" },
  croute: { bg: "bg-[#D2691E]/10", text: "text-[#D2691E]", badge: "bg-[#D2691E]/10 text-[#D2691E]" },
  grigne: { bg: "bg-[#2E7D32]/10", text: "text-[#2E7D32]", badge: "bg-[#2E7D32]/10 text-[#2E7D32]" },
  mie: { bg: "bg-[#0277BD]/10", text: "text-[#0277BD]", badge: "bg-[#0277BD]/10 text-[#0277BD]" },
};

export default function TechnicalCardsPage() {
  const [defects, setDefects] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDefects = async () => {
      try {
        const res = await axios.get(`${API}/defects`);
        setDefects(res.data);
      } catch (e) {
        toast.error("Erreur de chargement des fiches");
      }
      setLoading(false);
    };
    fetchDefects();
  }, []);

  const categories = [
    { id: "all", label: "Tous" },
    { id: "aspect", label: "Aspect" },
    { id: "croute", label: "Croûte" },
    { id: "grigne", label: "Grigne" },
    { id: "mie", label: "Mie" },
  ];

  const filtered = defects.filter(d => {
    const matchCategory = activeCategory === "all" || d.category === activeCategory;
    const matchSearch = search === "" ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="technical-cards-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#0277BD]/10 flex items-center justify-center">
            <Library className="w-5 h-5 text-[#0277BD]" />
          </div>
          <h1 className="font-heading text-3xl font-semibold text-[#3E2723]" data-testid="cards-title">
            Fiches techniques
          </h1>
        </div>
        <p className="text-[#5D4037] mb-8 ml-13">
          Consultez les fiches complètes de chaque défaut du pain.
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8" data-testid="filters-section">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]" />
            <Input
              placeholder="Rechercher un défaut..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-[#E6C9A8] focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513] rounded-xl"
              data-testid="search-input"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant="ghost"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-[#8B4513] text-white hover:bg-[#A0522D]"
                    : "bg-white text-[#5D4037] border border-[#E6C9A8] hover:bg-[#F5DEB3]/30"
                }`}
                data-testid={`filter-${cat.id}`}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <p className="text-sm text-[#8D6E63] mb-4">{filtered.length} fiche{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}</p>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[#0277BD] border-t-transparent rounded-full" />
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid gap-4" data-testid="defects-grid">
          <AnimatePresence>
            {filtered.map(defect => {
              const colors = CATEGORY_COLORS[defect.category] || CATEGORY_COLORS.aspect;
              const isExpanded = expandedId === defect.id;

              return (
                <motion.div
                  key={defect.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card
                    className="bg-white rounded-2xl border border-[#E6C9A8]/30 shadow-[0_2px_8px_rgba(139,69,19,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_16px_rgba(139,69,19,0.08)]"
                    data-testid={`defect-card-${defect.id}`}
                  >
                    <CardContent className="p-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : defect.id)}
                        className="w-full text-left p-6 flex items-start gap-4"
                        data-testid={`defect-toggle-${defect.id}`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Layers className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-heading text-lg font-semibold text-[#3E2723]">{defect.name}</h3>
                            <Badge className={`${colors.badge} border-0 text-xs`}>{defect.categoryLabel.replace("Défauts ", "").replace("de la ", "").replace("d'aspect du ", "")}</Badge>
                          </div>
                          <p className="text-sm text-[#5D4037] line-clamp-2">{defect.description}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-[#8D6E63] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#8D6E63] flex-shrink-0" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6">
                              <Separator className="mb-6 bg-[#E6C9A8]/30" />

                              {/* Stage */}
                              <div className="mb-6">
                                <p className="text-xs font-medium text-[#8D6E63] uppercase tracking-wider mb-1">Étapes concernées</p>
                                <p className="text-sm text-[#3E2723]">{defect.stage}</p>
                              </div>

                              {/* Causes */}
                              <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertCircle className="w-4 h-4 text-[#C62828]" />
                                  <p className="text-sm font-semibold text-[#3E2723]">Causes et problèmes</p>
                                </div>
                                <div className="space-y-3">
                                  {defect.causes.map((cause, idx) => (
                                    <div key={idx} className="bg-[#FAF9F6] rounded-xl p-4">
                                      <p className="font-medium text-sm text-[#3E2723] mb-2">{cause.origin}</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {cause.problems.map((p, pIdx) => (
                                          <span key={pIdx} className="text-xs bg-white px-2.5 py-1 rounded-full text-[#5D4037] border border-[#E6C9A8]/50">
                                            {p}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Remedies */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Wrench className="w-4 h-4 text-[#2E7D32]" />
                                  <p className="text-sm font-semibold text-[#3E2723]">Remèdes</p>
                                </div>
                                <div className="grid gap-2">
                                  {defect.remedies.map((remedy, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mt-2 flex-shrink-0" />
                                      <span className="text-sm text-[#5D4037]">{remedy}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16" data-testid="no-results">
            <p className="text-[#8D6E63]">Aucune fiche ne correspond à votre recherche.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
