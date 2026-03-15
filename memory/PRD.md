# L'Apprenti Boulanger - PRD

## Problem Statement
Application web pédagogique (jeu sérieux) pour apprentis boulangers (CAP, Bac Pro) permettant d'apprendre à reconnaître les défauts du pain, comprendre leurs causes et choisir les remèdes techniques.

## Source Pédagogique
- Supplément technique n°66 "Les défauts des pâtes et des pains"
- Site: technomitron.aainb.com

## Architecture
- **Frontend**: React + Tailwind + Framer Motion + Shadcn UI
- **Backend**: FastAPI + MongoDB (Motor)
- **Persistence**: localStorage (progression), MongoDB (données défauts)
- **Auth**: Aucune (localStorage uniquement)

## User Personas
1. **Apprenti SAP** - Découverte des bases
2. **Apprenti Émotion** - Apprentissage ludique
3. **Apprenti BP** - Formation professionnelle
4. **Apprenti BM** - Diagnostic expert

## What's Been Implemented

### Phase 1 (2026-03-14)
- Backend 18 défauts, API quiz/diagnostic/fiches
- 6 pages (Accueil, Entraînement, Diagnostic, Quiz, Fiches, Profil)
- Progression (score, niveaux, badges, répétition espacée)
- Design thème boulangerie

### Phase 2 (2026-03-15) - Activités interactives
- **4 niveaux pédagogiques**: SAP, Émotion, BP, BM
- **Page Activités** avec sélection de niveau et grille d'activités
- **Glisser-Déposer**: Association défauts↔causes par niveau
- **Le Pendu**: Vocabulaire boulanger avec images et SVG animé
- **Mots Croisés**: Grilles vérifiées par niveau (3-7 mots)
- **Cas Diagnostic**: Scénarios avec images technomitron
- **Images technomitron** intégrées dans fiches, activités et diagnostics
- **Navigation** mise à jour avec lien Activités

## Prioritized Backlog
### P1 (Next)
- Mode multijoueur/classement
- Plus de cas diagnostics par niveau
- Timer quiz + mode chrono

### P2 (Future)
- PWA offline
- Export PDF fiches
- Statistiques par catégorie
