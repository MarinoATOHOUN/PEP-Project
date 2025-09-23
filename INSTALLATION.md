# Guide d'installation - EduConnect Africa

## 📋 Prérequis système

### Logiciels requis
- **Node.js** : Version 18.0 ou supérieure
- **pnpm** : Gestionnaire de paquets (recommandé)
- **Python** : Version 3.11 ou supérieure
- **Git** : Pour cloner le projet

### Vérification des prérequis

```bash
# Vérifier Node.js
node --version  # Doit afficher v18.x.x ou supérieur

# Vérifier pnpm (installer si nécessaire)
pnpm --version  # ou npm install -g pnpm

# Vérifier Python
python --version  # ou python3 --version

# Vérifier Git
git --version
```

## 🚀 Installation rapide

### 1. Cloner le projet

```bash
git clone <url-du-projet>
cd panafrican_edu_platform
```

### 2. Installation du backend (API Flask)

```bash
# Naviguer vers le dossier backend
cd backend/panafrican_api

# Créer un environnement virtuel Python
python -m venv venv

# Activer l'environnement virtuel
# Sur Linux/Mac :
source venv/bin/activate
# Sur Windows :
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Démarrer le serveur backend
python src/main.py
```

Le serveur backend sera accessible sur `http://localhost:5000`

### 3. Installation du frontend (React)

```bash
# Ouvrir un nouveau terminal
# Naviguer vers le dossier frontend
cd frontend/panafrican-edu-app

# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🔧 Configuration détaillée

### Structure des dossiers après installation

```
panafrican_edu_platform/
├── frontend/
│   └── panafrican-edu-app/
│       ├── node_modules/           # Dépendances Node.js
│       ├── src/                    # Code source React
│       ├── public/                 # Fichiers statiques
│       ├── package.json            # Configuration pnpm
│       └── vite.config.js          # Configuration Vite
├── backend/
│   └── panafrican_api/
│       ├── venv/                   # Environnement virtuel Python
│       ├── src/                    # Code source Flask
│       └── requirements.txt        # Dépendances Python
└── assets/                         # Images et ressources
```

### Ports utilisés
- **Frontend React** : `http://localhost:5173`
- **Backend Flask** : `http://localhost:5000`

### Variables d'environnement

Aucune configuration d'environnement spéciale n'est requise pour cette version de démonstration. Toutes les données sont mockées en mémoire.

## 🧪 Tests et vérification

### Vérifier le backend

```bash
# Tester l'API avec curl
curl http://localhost:5000/api/badges

# Réponse attendue : JSON avec la liste des badges
```

### Vérifier le frontend

1. Ouvrir `http://localhost:5173` dans votre navigateur
2. Vérifier que la page d'accueil se charge correctement
3. Tester la navigation entre les pages
4. Vérifier le thème jour/nuit automatique

### Tests de fonctionnalités

1. **Navigation** : Cliquer sur les onglets Questions, Mentors, Badges
2. **Responsive** : Redimensionner la fenêtre pour tester le mobile
3. **Filtres** : Utiliser les filtres sur la page Questions
4. **API** : Vérifier que les données se chargent depuis le backend

## 🐛 Résolution de problèmes

### Problèmes courants

#### Port déjà utilisé
```bash
# Si le port 5173 est occupé
pnpm run dev -- --port 3000

# Si le port 5000 est occupé (backend)
# Modifier le port dans src/main.py : app.run(port=5001)
```

#### Erreurs de dépendances Node.js
```bash
# Nettoyer le cache et réinstaller
rm -rf node_modules package-lock.json
pnpm install
```

#### Erreurs Python
```bash
# Vérifier l'activation de l'environnement virtuel
which python  # Doit pointer vers venv/bin/python

# Réinstaller les dépendances
pip install --upgrade pip
pip install -r requirements.txt
```

#### Problèmes CORS
Si vous rencontrez des erreurs CORS, vérifiez que :
- Le backend Flask est démarré
- Flask-CORS est installé
- Les URLs dans `src/services/api.js` sont correctes

### Logs de débogage

#### Backend Flask
Les logs s'affichent directement dans le terminal où vous avez lancé `python src/main.py`

#### Frontend React
- Ouvrir les outils de développement du navigateur (F12)
- Onglet Console pour voir les erreurs JavaScript
- Onglet Network pour vérifier les appels API

## 🔄 Commandes utiles

### Frontend
```bash
# Démarrage en mode développement
pnpm run dev

# Build pour la production
pnpm run build

# Prévisualisation du build
pnpm run preview

# Linter et formatage
pnpm run lint
```

### Backend
```bash
# Démarrage du serveur
python src/main.py

# Installation d'une nouvelle dépendance
pip install <package>
pip freeze > requirements.txt

# Tests (si implémentés)
python -m pytest
```

## 📱 Accès mobile

Pour tester sur mobile dans le même réseau :

1. Trouver votre adresse IP locale :
```bash
# Linux/Mac
ifconfig | grep inet
# Windows
ipconfig
```

2. Accéder depuis mobile :
- Frontend : `http://[VOTRE_IP]:5173`
- Backend : `http://[VOTRE_IP]:5000`

## 🚀 Déploiement

### Build de production

```bash
# Frontend
cd frontend/panafrican-edu-app
pnpm run build
# Les fichiers seront dans le dossier dist/

# Backend
# Utiliser un serveur WSGI comme Gunicorn pour la production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```

### Hébergement recommandé
- **Frontend** : Vercel, Netlify, GitHub Pages
- **Backend** : Heroku, Railway, DigitalOcean
- **Base de données** : PostgreSQL, MongoDB (pour remplacer les données mockées)

## 📞 Support

En cas de problème :
1. Vérifier les prérequis système
2. Consulter les logs d'erreur
3. Vérifier la section résolution de problèmes
4. Redémarrer les serveurs frontend et backend

---

**Bon développement avec EduConnect Africa !** 🚀

