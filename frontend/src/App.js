import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import HomePage from "@/pages/HomePage";
import TrainingPage from "@/pages/TrainingPage";
import DiagnosticPage from "@/pages/DiagnosticPage";
import QuizPage from "@/pages/QuizPage";
import TechnicalCardsPage from "@/pages/TechnicalCardsPage";
import ProfilePage from "@/pages/ProfilePage";
import ActivitiesPage from "@/pages/ActivitiesPage";

function App() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <BrowserRouter>
        <Header />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/entrainement" element={<TrainingPage />} />
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/activites" element={<ActivitiesPage />} />
            <Route path="/fiches" element={<TechnicalCardsPage />} />
            <Route path="/profil" element={<ProfilePage />} />
          </Routes>
        </main>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
