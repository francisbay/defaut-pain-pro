from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---------- MODELS ----------
class CauseGroup(BaseModel):
    origin: str
    problems: List[str]

class Defect(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    category: str
    categoryLabel: str
    description: str
    stage: str
    causes: List[CauseGroup]
    remedies: List[str]

class QuizQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    options: List[str]
    correctIndex: int
    explanation: str
    questionType: str
    difficulty: str
    defectId: str

class DiagnosticScenario(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    narrative: str
    defectId: str
    defectName: str
    steps: List[dict]

# ---------- SEED DATA ----------
DEFECTS_DATA = [
    {
        "id": "pain-plat",
        "name": "Pain plat",
        "category": "aspect",
        "categoryLabel": "Défauts d'aspect du pain",
        "description": "Le pain est aplati, il manque de volume et de tenue. La forme est étalée et le développement est insuffisant.",
        "stage": "Pétrissage, Fermentation, Cuisson",
        "causes": [
            {"origin": "Manque de force", "problems": ["Farine faible", "Pâte trop douce", "Pâte froide", "Manque de pointage"]},
            {"origin": "Excès de pousse et fermentation", "problems": ["Excès de levure", "Durée de pousse trop longue", "Farine hyperdiastasique"]},
            {"origin": "Mauvaises manipulations", "problems": ["Pâtons collants sur couche", "Dépose sur le tapis brutale", "Scarifications trop profondes"]},
            {"origin": "Manque de chaleur", "problems": ["Température de cuisson trop faible", "Four qui manque de fond, rythme des cuissons trop rapide"]}
        ],
        "remedies": ["Utiliser une farine de force adaptée", "Ajuster l'hydratation de la pâte", "Respecter la température de base", "Allonger le temps de pointage", "Réduire la quantité de levure", "Contrôler la durée d'apprêt", "Augmenter la température du four"]
    },
    {
        "id": "pain-peu-developpe",
        "name": "Pain peu développé",
        "category": "aspect",
        "categoryLabel": "Défauts d'aspect du pain",
        "description": "Le pain manque de volume. Il est petit, dense et n'a pas atteint le développement attendu.",
        "stage": "Pétrissage, Fermentation, Cuisson",
        "causes": [
            {"origin": "Farine", "problems": ["Farine trop vieille"]},
            {"origin": "Pétrissage", "problems": ["Pétrissage insuffisant"]},
            {"origin": "Manque de fermentation", "problems": ["Farine manque d'amylases (malt)", "Manque de levure", "Pâte trop ferme", "Durée d'apprêt trop courte", "Température de la pâte ou de la chambre trop froide"]},
            {"origin": "Problème de force", "problems": ["Excès de force"]},
            {"origin": "Problème de coupe", "problems": ["Mauvaise scarification"]},
            {"origin": "Buée", "problems": ["Manque de buée"]},
            {"origin": "Température du four", "problems": ["Température du four trop élevée", "Four qui a un excès de fond", "Four insuffisamment rempli"]}
        ],
        "remedies": ["Utiliser une farine fraîche", "Pétrir suffisamment", "Ajouter du malt", "Augmenter la levure", "Allonger l'apprêt", "Ajuster la température de la pâte", "Assurer une buée suffisante", "Régler la température du four"]
    },
    {
        "id": "pain-cintre-ferre",
        "name": "Pain cintré / Pain ferré",
        "category": "aspect",
        "categoryLabel": "Défauts d'aspect du pain",
        "description": "Le pain cintré présente une courbure anormale. Le pain ferré a un dessous brûlé ou trop coloré.",
        "stage": "Pétrissage, Façonnage, Cuisson",
        "causes": [
            {"origin": "Pétrissage et manipulations", "problems": ["Excès de force", "Excès de pointage", "Façonnage ou boulage trop serrés"]},
            {"origin": "Cuisson", "problems": ["Excès de chaleur", "Sole trop chaude", "Réglage température trop élevé", "Temps de pause trop court sur four maçonné"]}
        ],
        "remedies": ["Réduire le temps de pétrissage", "Réduire le temps de pointage", "Desserrer le façonnage", "Baisser la température de sole", "Allonger le temps de pause du four"]
    },
    {
        "id": "pain-baise",
        "name": "Pain baisé",
        "category": "aspect",
        "categoryLabel": "Défauts d'aspect du pain",
        "description": "Les pains se sont collés entre eux pendant la cuisson. Une partie latérale est blanche, molle et affaissée.",
        "stage": "Façonnage, Enfournement, Cuisson",
        "causes": [
            {"origin": "Manipulations", "problems": ["Pains trop serrés", "Plis sur couche trop petits"]},
            {"origin": "Excès de pousse", "problems": ["Excès de levure", "Durée de pousse trop longue", "Température de la pâte ou de la chambre trop élevée"]},
            {"origin": "Mise au four", "problems": ["Mauvaise disposition sur le tapis", "Quantité de pains trop importante sur la sole"]},
            {"origin": "Affaissement des pâtons", "problems": ["Manque de chaleur du four", "Manque de force"]}
        ],
        "remedies": ["Espacer davantage les pâtons", "Agrandir les plis de couche", "Réduire la levure", "Mieux répartir les pains sur la sole", "Augmenter la chaleur du four"]
    },
    {
        "id": "croute-rouge",
        "name": "Croûte rouge",
        "category": "croute",
        "categoryLabel": "Défauts de la croûte",
        "description": "La croûte du pain est anormalement rouge ou trop foncée, avec une coloration excessive.",
        "stage": "Pétrissage, Fermentation, Cuisson",
        "causes": [
            {"origin": "Problème de pétrissage", "problems": ["Pâte trop douce", "Pâte trop froide"]},
            {"origin": "Problème de fermentation", "problems": ["Pointage trop court", "Fournil humide, pâtons qui suintent", "Hygrométrie trop forte en chambre"]},
            {"origin": "Problème de force", "problems": ["Manque de force"]},
            {"origin": "Excès de sucre", "problems": ["Farine trop diastasique due à blé germé", "Excès de malt"]},
            {"origin": "Trop de cuisson", "problems": ["Durée de cuisson trop longue", "Température du four trop élevée", "Four qui a un excès de fond", "Four insuffisamment rempli"]}
        ],
        "remedies": ["Ajuster l'hydratation", "Respecter la température de base", "Allonger le pointage", "Réduire le malt", "Baisser la température du four", "Réduire le temps de cuisson"]
    },
    {
        "id": "croute-epaisse-dure",
        "name": "Croûte épaisse et dure",
        "category": "croute",
        "categoryLabel": "Défauts de la croûte",
        "description": "La croûte est anormalement épaisse et dure, rendant le pain difficile à couper et désagréable en bouche.",
        "stage": "Pétrissage, Fermentation, Cuisson",
        "causes": [
            {"origin": "Problème de pétrissage", "problems": ["Oubli de sel", "Pâte trop ferme", "Pâte trop chaude", "Pointage excessif"]},
            {"origin": "Problème de fermentation", "problems": ["Courants d'air (croûtage)", "Couches trop sèches", "Hygrométrie trop basse"]},
            {"origin": "Problème de force", "problems": ["Excès de force"]},
            {"origin": "Manque de buée", "problems": ["Oubli de la buée", "Quantité de buée insuffisante", "Appareil à buée entartré"]},
            {"origin": "Durée de cuisson", "problems": ["Cuisson trop longue", "Température du four trop faible", "Manque de sucre (malt)"]}
        ],
        "remedies": ["Ne pas oublier le sel", "Réduire la fermeté de la pâte", "Protéger de courants d'air", "Humidifier les couches", "Assurer une buée suffisante", "Entretenir l'appareil à buée", "Ajuster temps et température de cuisson"]
    },
    {
        "id": "croute-pale",
        "name": "Croûte pâle",
        "category": "croute",
        "categoryLabel": "Défauts de la croûte",
        "description": "La croûte est trop claire, manque de couleur dorée caractéristique d'un bon pain.",
        "stage": "Pétrissage, Fermentation, Cuisson",
        "causes": [
            {"origin": "Pétrissage", "problems": ["Pâte trop ferme", "Oubli du sel", "Pâte chaude"]},
            {"origin": "Problème de force", "problems": ["Excès de force"]},
            {"origin": "Problème de fermentation", "problems": ["Courants d'air (croûtage)", "Couches trop sèches"]},
            {"origin": "Manque de sucre", "problems": ["Farine peu diastasique (malt)", "Excès de fermentation", "Excès de pâte fermentée", "Excès de levure"]},
            {"origin": "Manque de cuisson", "problems": ["Durée de cuisson trop courte", "Température du four trop faible", "Four qui manque de fond"]},
            {"origin": "Manque de buée", "problems": ["Oubli à l'enfournement", "Introduction de buée trop tardive", "Appareil de buée entartré"]}
        ],
        "remedies": ["Ajuster la fermeté de la pâte", "Ne pas oublier le sel", "Ajouter du malt", "Réduire la levure", "Allonger la cuisson", "Augmenter la température du four", "Assurer la buée à l'enfournement"]
    },
    {
        "id": "croute-cloquee",
        "name": "Croûte cloquée",
        "category": "croute",
        "categoryLabel": "Défauts de la croûte",
        "description": "La croûte présente des cloques (pustules), des boursouflures à la surface du pain.",
        "stage": "Fermentation, Cuisson",
        "causes": [
            {"origin": "Fermentation", "problems": ["Pâte fermentée trop vieille"]},
            {"origin": "Fermentation avant blocage", "problems": ["Pâte chaude", "Pâte trop douce", "Pâtons qui suintent", "Pointage trop long"]},
            {"origin": "Chambre de fermentation", "problems": ["Chambre insuffisamment refroidie", "Chambre trop humide", "Durée de fermentation en chambre trop longue (+ de 24h)"]},
            {"origin": "Cuisson", "problems": ["Excès de buée"]}
        ],
        "remedies": ["Utiliser une pâte fermentée fraîche", "Refroidir la pâte avant blocage", "Réduire l'hydratation", "Raccourcir le pointage", "Régler la chambre de fermentation", "Réduire la buée"]
    },
    {
        "id": "croute-terne",
        "name": "Croûte terne",
        "category": "croute",
        "categoryLabel": "Défauts de la croûte",
        "description": "La croûte manque de brillance et d'éclat, elle a un aspect mat et peu appétissant.",
        "stage": "Pétrissage, Fermentation, Cuisson",
        "causes": [
            {"origin": "Problème de pétrissage", "problems": ["Oubli du sel", "Pâte trop ferme", "Pâte chaude"]},
            {"origin": "Problème de force", "problems": ["Excès de force"]},
            {"origin": "Manipulations", "problems": ["Emploi excessif de farine au façonnage"]},
            {"origin": "Problème de fermentation", "problems": ["Hygrométrie de l'air trop faible", "Courants d'air (croûtage)", "Couches trop sèches"]},
            {"origin": "Buée", "problems": ["Oubli de la buée à l'enfournement", "Quantité insuffisante", "Appareil à buée entartré"]}
        ],
        "remedies": ["Ne pas oublier le sel", "Ajuster la fermeté de la pâte", "Réduire le fleurage", "Protéger des courants d'air", "Assurer une buée suffisante", "Entretenir l'appareil à buée"]
    },
    {
        "id": "croute-molle",
        "name": "Croûte molle",
        "category": "croute",
        "categoryLabel": "Défauts de la croûte",
        "description": "La croûte est molle, manque de croustillant et de tenue. Elle plie sous la pression.",
        "stage": "Pétrissage, Cuisson, Ressuage",
        "causes": [
            {"origin": "Problème de pétrissage", "problems": ["Pâte trop molle", "Pâtons qui suintent", "Pâte froide"]},
            {"origin": "Problème de force", "problems": ["Manque de force"]},
            {"origin": "Buée", "problems": ["Excès de buée"]},
            {"origin": "Cuisson", "problems": ["Température du four trop élevée", "Excès de sucre résiduel"]},
            {"origin": "Ressuage", "problems": ["Hygrométrie de l'air trop élevée", "Mauvaise aération du local", "Ressuage sur planches ou sur plaques", "Pains trop entassés dans les chariots"]}
        ],
        "remedies": ["Réduire l'hydratation", "Utiliser une farine plus forte", "Réduire la buée", "Ajuster la température du four", "Assurer une bonne ventilation au ressuage", "Espacer les pains au ressuage"]
    },
    {
        "id": "croute-ecaille",
        "name": "Croûte qui s'écaille",
        "category": "croute",
        "categoryLabel": "Défauts de la croûte",
        "description": "La croûte se détache en écailles, elle se fissure et des morceaux s'en détachent.",
        "stage": "Fermentation, Cuisson",
        "causes": [
            {"origin": "Pain très développé", "problems": ["Excès d'acide ascorbique", "Excès d'apprêt", "Pains trop volumineux", "Hygrométrie trop élevée en chambre de pousse"]},
            {"origin": "Croûte fine", "problems": ["Excès de buée", "Four trop vif"]},
            {"origin": "Desséchement (pain congelé)", "problems": ["Congélation trop longue", "Ventilation trop importante dans le congélateur"]}
        ],
        "remedies": ["Réduire l'acide ascorbique", "Raccourcir l'apprêt", "Réduire la buée", "Baisser la température du four", "Limiter la durée de congélation"]
    },
    {
        "id": "croute-sale",
        "name": "Croûte sale (tachée)",
        "category": "croute",
        "categoryLabel": "Défauts de la croûte",
        "description": "La croûte présente des taches, des salissures ou des traces indésirables.",
        "stage": "Pétrissage, Façonnage, Cuisson",
        "causes": [
            {"origin": "Incorporation tardive", "problems": ["Sel non dissous"]},
            {"origin": "Manque d'entretien", "problems": ["Couches sales", "Bannetons sales, séchage insuffisant", "Plaques de cuisson sales ou oxydées", "Sole sales, balayage insuffisant"]},
            {"origin": "Mauvaise pratique", "problems": ["Fleurage excessif"]}
        ],
        "remedies": ["Dissoudre le sel avant incorporation", "Nettoyer régulièrement les couches", "Sécher correctement les bannetons", "Nettoyer les plaques de cuisson", "Balayer les soles", "Réduire le fleurage"]
    },
    {
        "id": "grignes-dechirees",
        "name": "Grignes déchirées",
        "category": "grigne",
        "categoryLabel": "Défauts de la grigne",
        "description": "Les coups de lame sont irréguliers, déchirés, avec un aspect grossier et non maîtrisé.",
        "stage": "Fermentation, Scarification, Cuisson",
        "causes": [
            {"origin": "Problèmes de pétrissage", "problems": ["Oubli du sel"]},
            {"origin": "Problèmes de fermentation", "problems": ["Courants d'air (croûtage)", "Couches trop sèches", "Hygrométrie trop basse"]},
            {"origin": "Buée", "problems": ["Oubli à l'enfournement", "Manque de buée", "Appareil à buée entartré"]},
            {"origin": "Cuisson", "problems": ["Mauvaise scarification", "Manque de chaleur"]}
        ],
        "remedies": ["Ne pas oublier le sel", "Protéger des courants d'air", "Humidifier les couches", "Assurer une buée suffisante", "Améliorer la technique de scarification", "Augmenter la chaleur du four"]
    },
    {
        "id": "absence-grignes",
        "name": "Absence de grignes",
        "category": "grigne",
        "categoryLabel": "Défauts de la grigne",
        "description": "Les coups de lame ne se sont pas ouverts, la grigne est absente ou à peine visible.",
        "stage": "Pétrissage, Fermentation, Cuisson",
        "causes": [
            {"origin": "Problème de force", "problems": ["Sous-pétrissage", "Excès de force", "Manque de force"]},
            {"origin": "Pâtons collants", "problems": ["Pâte trop douce", "Pâte froide"]},
            {"origin": "Pâtons croûtés", "problems": ["Pâte trop ferme", "Pâte chaude", "Courants d'air"]},
            {"origin": "Excès de pousse", "problems": ["Trop de levure", "Durée de pousse trop longue", "Température de la pâte ou de la chambre trop élevée"]},
            {"origin": "Cuisson", "problems": ["Excès de buée", "Four trop chaud"]}
        ],
        "remedies": ["Pétrir suffisamment", "Ajuster la force de la pâte", "Contrôler l'hydratation", "Respecter la température de base", "Protéger du croûtage", "Réduire la levure", "Régler la buée et la température du four"]
    },
    {
        "id": "mie-trop-serree",
        "name": "Mie trop serrée",
        "category": "mie",
        "categoryLabel": "Défauts de la mie",
        "description": "La mie est trop dense et compacte, les alvéoles sont très petites et uniformes sans la structure aérée souhaitée.",
        "stage": "Pétrissage, Façonnage, Fermentation, Cuisson",
        "causes": [
            {"origin": "Pétrissage", "problems": ["Pâte trop ferme"]},
            {"origin": "Manipulations", "problems": ["Excès de serrage", "Boulage ou façonnage trop serré", "Détente insuffisante"]},
            {"origin": "Problème de force", "problems": ["Excès de force"]},
            {"origin": "Fermentation", "problems": ["Manque d'apprêt"]},
            {"origin": "Cuisson", "problems": ["Manque de développement au four", "Excès de force", "Mauvaise scarification", "Four trop chaud"]}
        ],
        "remedies": ["Augmenter l'hydratation", "Desserrer le façonnage et le boulage", "Allonger la détente", "Réduire la force", "Allonger l'apprêt", "Améliorer la scarification", "Ajuster la température du four"]
    },
    {
        "id": "mie-collante",
        "name": "Mie collante",
        "category": "mie",
        "categoryLabel": "Défauts de la mie",
        "description": "La mie est collante au toucher, humide et pâteuse. Elle adhère au couteau lors de la coupe.",
        "stage": "Pétrissage, Fermentation, Cuisson",
        "causes": [
            {"origin": "Farine trop diastasique", "problems": ["Farine en provenance de blé germé", "Farine trop enrichie en malt"]},
            {"origin": "Manque de cuisson interne", "problems": ["Sous-pétrissage", "Pâte froide", "Pointage court", "Pâte trop hydratée", "Manque de force"]},
            {"origin": "Température du four", "problems": ["Cuisson trop courte", "Température trop élevée", "Thermostat mal réglé", "Four insuffisamment rempli"]},
            {"origin": "Maladie du pain filant", "problems": ["Présence de Bacille Mesantericus ou Subtilis", "Stockage farine près de pommes de terre", "Manque d'hygiène", "Atmosphère trop humide", "Pâtes sans acidité", "Ressuage en atmosphère chaude et humide"]}
        ],
        "remedies": ["Vérifier la qualité de la farine", "Réduire le malt", "Pétrir suffisamment", "Respecter la température de base", "Allonger le pointage", "Ajuster l'hydratation", "Allonger la cuisson", "Régler le thermostat", "Ajouter du levain pour l'acidité", "Assurer une bonne hygiène"]
    },
    {
        "id": "mie-trop-blanche",
        "name": "Mie trop blanche",
        "category": "mie",
        "categoryLabel": "Défauts de la mie",
        "description": "La mie est excessivement blanche et manque de goût. Elle n'a pas la couleur crème caractéristique.",
        "stage": "Pétrissage",
        "causes": [
            {"origin": "Farine", "problems": ["Contient de la farine de fèves", "Contient de la farine de soja"]},
            {"origin": "Pétrissage", "problems": ["Pétrissage excessif, trop long", "Pâte chaude", "Sel en fin de pétrissage"]},
            {"origin": "Pâte fermentée", "problems": ["Introduction de la pâte fermentée en début de pétrissage"]}
        ],
        "remedies": ["Vérifier la composition de la farine", "Réduire le temps de pétrissage", "Respecter la température de base", "Incorporer le sel au bon moment", "Ajouter la pâte fermentée en cours de pétrissage"]
    },
    {
        "id": "mie-emiette",
        "name": "Mie qui s'émiette",
        "category": "mie",
        "categoryLabel": "Défauts de la mie",
        "description": "La mie se fragmente facilement, elle s'émiette au toucher et à la coupe.",
        "stage": "Pétrissage, Fermentation, Cuisson",
        "causes": [
            {"origin": "Pétrissage", "problems": ["Pâte trop ferme", "Pâte trop chaude"]},
            {"origin": "Problème de force", "problems": ["Excès de force"]},
            {"origin": "Pâte fermentée", "problems": ["Excès de levure", "Pointage excessif", "Apprêt trop court"]},
            {"origin": "Cuisson", "problems": ["Cuisson trop longue"]}
        ],
        "remedies": ["Augmenter l'hydratation", "Respecter la température de base", "Réduire la force", "Ajuster la levure", "Raccourcir le pointage", "Allonger l'apprêt", "Réduire le temps de cuisson"]
    }
]

CATEGORIES = [
    {"id": "aspect", "label": "Défauts d'aspect du pain", "description": "Problèmes liés à la forme et au volume du pain"},
    {"id": "croute", "label": "Défauts de la croûte", "description": "Problèmes liés à l'apparence et la texture de la croûte"},
    {"id": "grigne", "label": "Défauts de la grigne", "description": "Problèmes liés aux coups de lame et à leur développement"},
    {"id": "mie", "label": "Défauts de la mie", "description": "Problèmes liés à la texture et l'aspect intérieur du pain"}
]

async def seed_defects():
    count = await db.defects.count_documents({})
    if count == 0:
        await db.defects.insert_many(DEFECTS_DATA)
        logger.info(f"Seeded {len(DEFECTS_DATA)} defects into database")
    else:
        logger.info(f"Database already has {count} defects, skipping seed")

@app.on_event("startup")
async def startup():
    await seed_defects()

# ---------- ENDPOINTS ----------
@api_router.get("/")
async def root():
    return {"message": "L'Apprenti Boulanger API"}

@api_router.get("/defects", response_model=List[Defect])
async def get_defects(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    defects = await db.defects.find(query, {"_id": 0}).to_list(100)
    return defects

@api_router.get("/defects/{defect_id}", response_model=Defect)
async def get_defect(defect_id: str):
    defect = await db.defects.find_one({"id": defect_id}, {"_id": 0})
    if not defect:
        return {"error": "Défaut non trouvé"}
    return defect

@api_router.get("/categories")
async def get_categories():
    return CATEGORIES

@api_router.get("/quiz/generate")
async def generate_quiz_question(difficulty: Optional[str] = None):
    defects = await db.defects.find({}, {"_id": 0}).to_list(100)
    if len(defects) < 4:
        return {"error": "Pas assez de données"}

    question_types = ["identify_defect", "identify_cause", "identify_category", "identify_remedy"]
    if difficulty == "facile":
        question_types = ["identify_defect", "identify_category"]
    elif difficulty == "difficile":
        question_types = ["identify_cause", "identify_remedy"]

    q_type = random.choice(question_types)
    target = random.choice(defects)
    others = [d for d in defects if d["id"] != target["id"]]

    if q_type == "identify_defect":
        question = f"Quel défaut correspond à cette description ?\n\n« {target['description']} »"
        correct = target["name"]
        wrong = random.sample([d["name"] for d in others], min(3, len(others)))
        options = wrong + [correct]
        random.shuffle(options)
        explanation = f"Ce défaut est « {target['name']} » de la catégorie {target['categoryLabel']}."

    elif q_type == "identify_cause":
        cause_group = random.choice(target["causes"])
        question = f"Quelle est une cause possible du défaut « {target['name']} » ?"
        correct = cause_group["origin"]
        all_causes = list(set(c["origin"] for d in defects for c in d["causes"] if c["origin"] != correct))
        wrong = random.sample(all_causes, min(3, len(all_causes)))
        options = wrong + [correct]
        random.shuffle(options)
        explanation = f"« {cause_group['origin']} » est bien une cause du défaut « {target['name']} ». Problèmes associés : {', '.join(cause_group['problems'][:3])}."

    elif q_type == "identify_category":
        question = f"À quelle catégorie appartient le défaut « {target['name']} » ?"
        correct = target["categoryLabel"]
        wrong = [c["label"] for c in CATEGORIES if c["label"] != correct]
        options = wrong + [correct]
        random.shuffle(options)
        explanation = f"Le défaut « {target['name']} » appartient à la catégorie « {correct} »."

    else:  # identify_remedy
        remedy = random.choice(target["remedies"])
        question = f"Quel remède est approprié pour le défaut « {target['name']} » ?"
        correct = remedy
        all_remedies = list(set(r for d in defects for r in d["remedies"] if r != remedy))
        wrong = random.sample(all_remedies, min(3, len(all_remedies)))
        options = wrong + [correct]
        random.shuffle(options)
        explanation = f"« {remedy} » est un remède adapté pour corriger le défaut « {target['name']} »."

    diff = difficulty or ("facile" if q_type in ["identify_defect", "identify_category"] else "moyen")

    return {
        "id": str(uuid.uuid4()),
        "question": question,
        "options": options,
        "correctIndex": options.index(correct),
        "explanation": explanation,
        "questionType": q_type,
        "difficulty": diff,
        "defectId": target["id"]
    }

@api_router.get("/diagnostic/scenario")
async def generate_diagnostic_scenario():
    defects = await db.defects.find({}, {"_id": 0}).to_list(100)
    if len(defects) < 4:
        return {"error": "Pas assez de données"}

    target = random.choice(defects)
    others = [d for d in defects if d["id"] != target["id"]]

    narratives = [
        f"Vous sortez vos pains du four et vous constatez un problème : {target['description'].lower()}",
        f"Un collègue vous montre un pain et vous demande votre avis : {target['description'].lower()}",
        f"Lors du contrôle qualité, vous identifiez un problème : {target['description'].lower()}",
        f"Votre maître boulanger vous interroge sur ce pain défectueux : {target['description'].lower()}"
    ]

    correct_cause = random.choice(target["causes"])
    correct_remedy = random.choice(target["remedies"])

    # Step 1: Identify symptom
    symptom_options = random.sample([d["name"] for d in others], min(3, len(others))) + [target["name"]]
    random.shuffle(symptom_options)

    # Step 2: Identify cause
    all_causes = list(set(c["origin"] for d in others for c in d["causes"] if c["origin"] != correct_cause["origin"]))
    cause_options = random.sample(all_causes, min(3, len(all_causes))) + [correct_cause["origin"]]
    random.shuffle(cause_options)

    # Step 3: Choose remedy
    all_remedies = list(set(r for d in others for r in d["remedies"] if r != correct_remedy))
    remedy_options = random.sample(all_remedies, min(3, len(all_remedies))) + [correct_remedy]
    random.shuffle(remedy_options)

    return {
        "id": str(uuid.uuid4()),
        "narrative": random.choice(narratives),
        "defectId": target["id"],
        "defectName": target["name"],
        "steps": [
            {
                "step": 1,
                "title": "Identifier le symptôme",
                "instruction": "Quel est le défaut observé ?",
                "options": symptom_options,
                "correctIndex": symptom_options.index(target["name"]),
                "explanation": f"Le défaut observé est « {target['name']} » : {target['description']}"
            },
            {
                "step": 2,
                "title": "Identifier la cause",
                "instruction": "Quelle est la cause probable de ce défaut ?",
                "options": cause_options,
                "correctIndex": cause_options.index(correct_cause["origin"]),
                "explanation": f"La cause « {correct_cause['origin']} » entraîne les problèmes suivants : {', '.join(correct_cause['problems'][:3])}"
            },
            {
                "step": 3,
                "title": "Choisir le remède",
                "instruction": "Quel remède appliquer pour corriger ce défaut ?",
                "options": remedy_options,
                "correctIndex": remedy_options.index(correct_remedy),
                "explanation": f"Le remède « {correct_remedy} » permet de corriger le défaut « {target['name']} »."
            }
        ]
    }

@api_router.get("/stats")
async def get_stats():
    total = await db.defects.count_documents({})
    categories = await db.defects.distinct("category")
    return {
        "totalDefects": total,
        "totalCategories": len(categories),
        "categories": CATEGORIES
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
