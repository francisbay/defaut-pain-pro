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
1. **Apprenti CAP Boulanger** - Apprend les bases, utilise principalement l'entraînement et les fiches
2. **Apprenti Bac Pro** - Niveau avancé, utilise le diagnostic et le quiz

## Core Requirements
- 4 modes de jeu (Entraînement, Diagnostic, Quiz, Fiches techniques)
- 18 défauts de pain structurés en 4 catégories
- Système de score, niveaux, badges
- Répétition espacée
- Interface en français, thème boulangerie

## What's Been Implemented (2026-03-14)
- ✅ Backend complet avec 18 défauts, endpoints quiz/diagnostic/fiches
- ✅ 6 pages frontend (Accueil, Entraînement, Diagnostic, Quiz, Fiches, Profil)
- ✅ Système de progression (score, niveaux, badges, répétition espacée)
- ✅ Design thème boulangerie (Merriweather + Outfit, palette beige/brun/blé)
- ✅ Animations Framer Motion légères
- ✅ Tous les tests passés (API + UI)

## Prioritized Backlog
### P0 (Done)
- Tous les modes de jeu fonctionnels
- Données pédagogiques complètes
- Système de progression

### P1 (Next)
- Ajout de plus de défauts (pâtes)
- Mode multijoueur/classement
- Export PDF des fiches techniques

### P2 (Future)
- Mode hors-ligne (PWA)
- Statistiques détaillées par catégorie
- Timer sur les questions quiz
