# L'Apprenti Boulanger - PRD

## Problem Statement
Application web pédagogique (jeu sérieux) pour apprentis boulangers (CAP, Bac Pro) permettant d'apprendre à reconnaître les défauts du pain, comprendre leurs causes et choisir les remèdes techniques.

## Source Pédagogique
- Supplément technique n°66 "Les défauts des pâtes et des pains"
- Site: technomitron.aainb.com (images et contenu technique)

## Architecture
- Frontend: React + Tailwind + Framer Motion + Shadcn UI
- Backend: FastAPI + MongoDB (Motor)
- Persistence: localStorage (progression), MongoDB (données défauts)

## What's Been Implemented

### Phase 1 - Core App
- Backend 18 défauts, API quiz/diagnostic/fiches
- 6 pages (Accueil, Entraînement, Diagnostic, Quiz, Fiches, Profil)
- Système progression (score, niveaux, badges, répétition espacée)

### Phase 2 - Activités Interactives
- 4 niveaux (SAP, Émotion, BP, BM) avec contenu progressif
- Glisser-Déposer, Pendu, Mots Croisés, Cas Diagnostic
- Images technomitron intégrées dans activités et fiches

### Phase 3 - Enrichissement (current)
- Quiz Rapide (5 questions par niveau avec difficulté adaptée)
- Images technomitron dans Training et Diagnostic pages
- 3+ cas diagnostics par niveau (12 total)
- Suivi de complétion par activité et niveau
- Badges de complétion sur cartes d'activité
- 13 images technomitron intégrées

## Backlog
### P1: Timer quiz, mode défi quotidien
### P2: PWA, export PDF, classement entre élèves
