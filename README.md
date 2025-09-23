# EduConnect Africa - Plateforme d'entraide académique panafricaine

## 📋 Description du projet

EduConnect Africa est une plateforme web complète d'entraide académique et de mentorat destinée aux élèves et étudiants africains. Cette application permet aux utilisateurs de poser des questions, trouver des mentors, suivre leur progression et accéder à des opportunités éducatives.

## ✨ Fonctionnalités principales

### 🤝 Entraide académique
- **Questions & Réponses** : Posez vos questions sur vos cours ou examens
- **Système de votes** : Votez pour les meilleures réponses
- **Filtres avancés** : Recherchez par matière, niveau d'étude, pays
- **Badges de contribution** : Récompenses pour l'aide apportée à la communauté

### 👨‍🏫 Mentorat
- **Profils de mentors** : Trouvez des mentors expérimentés dans votre domaine
- **Système de réservation** : Planifiez des sessions de mentorat
- **Évaluations** : Notez et commentez vos expériences de mentorat
- **Messagerie** : Communiquez directement avec vos mentors

### 🏆 Gamification
- **Système de points** : Gagnez des points en contribuant à la communauté
- **Badges** : Débloquez des badges selon vos contributions
- **Classements** : Suivez votre progression et celle des autres utilisateurs

### 🌍 Opportunités éducatives
- **Bourses d'études** : Découvrez les bourses disponibles
- **Concours** : Participez à des compétitions académiques
- **Formations** : Accédez à des formations spécialisées
- **Stages** : Trouvez des opportunités de stage

## 🎨 Design et expérience utilisateur

### Palette de couleurs
- **Bleu nuit** (#0D1B2A) : Couleur principale, évoque la profondeur et la confiance
- **Bleu ciel** (#1B4965) : Couleur secondaire, représente l'espoir et l'ouverture
- **Jaune** (#FFD166) : Couleur d'accent, symbolise l'énergie et l'optimisme
- **Gris clair** (#F5F5F5) : Couleur de fond, assure la lisibilité
- **Blanc** (#FFFFFF) : Couleur de contraste

### Fonctionnalités UX
- **Thème jour/nuit automatique** : S'adapte selon l'heure locale
- **Design responsive** : Optimisé pour mobile, tablette et desktop
- **Animations fluides** : Transitions et hover effects pour une expérience moderne
- **Accessibilité** : Interface pensée pour tous les utilisateurs

## 🏗️ Architecture technique

### Frontend (React)
- **Framework** : React 18 avec Vite
- **Styling** : Tailwind CSS + composants UI personnalisés
- **État global** : Context API pour l'authentification
- **Icônes** : Lucide React
- **Responsive** : Mobile-first design

### Backend (Flask - API mockée)
- **Framework** : Flask avec Flask-CORS
- **Authentification** : JWT (mockée)
- **Base de données** : Données mockées en mémoire
- **API REST** : Endpoints complets pour toutes les fonctionnalités

### Structure des données
- **Utilisateurs** : Profils avec informations académiques
- **Questions** : Système Q&A avec votes et réponses
- **Mentors** : Profils de mentors avec spécialités
- **Badges** : Système de récompenses par catégorie
- **Notifications** : Alertes et opportunités
- **Opportunités** : Bourses, concours, formations

## 📁 Structure du projet

```
panafrican_edu_platform/
├── frontend/
│   └── panafrican-edu-app/          # Application React
│       ├── src/
│       │   ├── components/          # Composants React
│       │   │   ├── Layout.jsx       # Layout principal
│       │   │   ├── HomePage.jsx     # Page d'accueil
│       │   │   ├── AuthPage.jsx     # Authentification
│       │   │   ├── QuestionsPage.jsx # Questions & Réponses
│       │   │   ├── MentorsPage.jsx  # Page des mentors
│       │   │   └── BadgesPage.jsx   # Badges et classements
│       │   ├── context/             # Contextes React
│       │   │   └── AuthContext.jsx  # Gestion de l'authentification
│       │   ├── services/            # Services API
│       │   │   └── api.js           # Client API
│       │   ├── assets/              # Images et ressources
│       │   └── App.jsx              # Composant principal
│       ├── public/                  # Fichiers statiques
│       └── package.json             # Dépendances frontend
├── backend/
│   └── panafrican_api/              # API Flask
│       ├── src/
│       │   ├── models/              # Modèles de données
│       │   ├── routes/              # Routes API
│       │   └── main.py              # Point d'entrée
│       └── requirements.txt         # Dépendances backend
├── image_assets.txt                 # Liste des assets visuels
└── README.md                        # Cette documentation
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+ et pnpm
- Python 3.11+
- Git

### Installation du frontend

```bash
cd frontend/panafrican-edu-app
pnpm install
pnpm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Installation du backend

```bash
cd backend/panafrican_api
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
python src/main.py
```

L'API sera accessible sur `http://localhost:5000`

## 🔧 Configuration

### Variables d'environnement
Aucune configuration spéciale requise pour la version de démonstration. Toutes les données sont mockées.

### Ports par défaut
- **Frontend** : 5173
- **Backend** : 5000

## 📱 Utilisation

### Navigation
1. **Page d'accueil** : Vue d'ensemble de la plateforme
2. **Questions** : Parcourir et poser des questions
3. **Mentors** : Trouver et contacter des mentors
4. **Badges** : Voir les récompenses et classements
5. **Opportunités** : Découvrir bourses et concours

### Fonctionnalités testables
- Navigation entre les pages
- Filtres et recherche
- Thème jour/nuit automatique
- Interface responsive
- Intégration API (données mockées)

## 🌍 Spécificités panafricaines

### Pays supportés
L'application couvre tous les pays africains avec une attention particulière pour :
- Nigeria, Kenya, Ghana, Sénégal, Maroc
- Égypte, Afrique du Sud, Cameroun, Mali, Burkina Faso
- Et tous les autres pays du continent

### Langues
- Interface en français (extensible)
- Support prévu pour l'anglais, l'arabe et les langues locales

### Contenu culturel
- Exemples et cas d'usage africains
- Mentors et universités du continent
- Opportunités spécifiques à l'Afrique

## 🔮 Évolutions futures

### Fonctionnalités avancées
- **Vidéoconférence** : Sessions de mentorat en ligne
- **Groupes d'étude** : Création de groupes par matière
- **Marketplace** : Vente de cours et ressources
- **Mobile app** : Application native iOS/Android

### Intégrations
- **Universités africaines** : Partenariats institutionnels
- **Systèmes de paiement** : Mobile money, cartes bancaires
- **Réseaux sociaux** : Partage et connexions
- **IA** : Recommandations personnalisées

## 🤝 Contribution

Ce projet est conçu comme une base solide pour une plateforme éducative panafricaine. Les contributions sont les bienvenues pour :
- Ajouter de nouvelles fonctionnalités
- Améliorer l'interface utilisateur
- Optimiser les performances
- Étendre le support linguistique

## 📄 Licence

Projet éducatif - Libre d'utilisation et de modification.

## 👥 Équipe

Développé avec passion pour l'éducation en Afrique.

---

**EduConnect Africa** - *Ensemble vers l'excellence académique* 🌍📚✨

