# 🧪 Tests du rendu Markdown - EduConnect Africa

## Checklist de vérification

### ✅ 1. Installation des dépendances
```bash
cd frontend/panafrican-edu-app
pnpm install
```

Vérifier que ces packages sont installés :
- ✅ `@tailwindcss/typography`
- ✅ `react-syntax-highlighter`
- ✅ `react-markdown`
- ✅ `remark-gfm`
- ✅ `react-mde`

---

### ✅ 2. Fichiers créés

| Fichier | Emplacement | Status |
|---------|-------------|--------|
| MarkdownRenderer.jsx | `src/components/` | ✅ |
| react-mde-custom.css | `src/styles/` | ✅ |
| MarkdownTest.jsx | `src/components/` | ✅ |
| MARKDOWN_GUIDE.md | `frontend/panafrican-edu-app/` | ✅ |
| WYSIWYG_IMPROVEMENTS.md | `frontend/panafrican-edu-app/` | ✅ |

---

### ✅ 3. Fichiers modifiés

| Fichier | Modifications | Status |
|---------|--------------|--------|
| QuestionsPage.jsx | Import MarkdownRenderer, rendu dans liste et détails | ✅ |
| MentorsPage.jsx | Support Markdown pour les bios | ✅ |
| App.css | Import react-mde-custom.css + styles markdown | ✅ |

---

### 🧪 4. Tests à effectuer

#### Test 1 : Démarrer l'application
```bash
cd frontend/panafrican-edu-app
pnpm run dev
```

#### Test 2 : Page Questions
1. Aller sur `/questions`
2. Vérifier que les questions affichent le Markdown formaté (pas le texte brut)
3. Vérifier que :
   - **Le gras** s'affiche en gras
   - *L'italique* s'affiche en italique
   - `Le code inline` a un fond coloré
   - Les liens sont cliquables et colorés

#### Test 3 : Créer une nouvelle question
1. Cliquer sur "Poser une question"
2. Remplir le formulaire avec du Markdown :
```markdown
# Ma question sur Python

J'ai un problème avec ce code :

```python
def factorielle(n):
    if n <= 1:
        return 1
    return n * factorielle(n - 1)
```

**Qu'est-ce qui ne va pas ?**

> Note : J'obtiens une erreur de récursion
```

3. Basculer sur l'onglet "Preview"
4. Vérifier que le rendu est correct
5. Publier la question
6. Vérifier qu'elle s'affiche correctement dans la liste

#### Test 4 : Détails d'une question
1. Cliquer sur une question avec du Markdown
2. Vérifier que le contenu complet est bien formaté
3. Vérifier la coloration syntaxique des blocs de code

#### Test 5 : Répondre à une question
1. Dans une question ouverte, cliquer sur "Envoyer ma réponse"
2. Écrire une réponse en Markdown :
```markdown
## Solution

Voici comment résoudre ton problème :

```python
def factorielle(n):
    if n <= 1:
        return 1
    return n * factorielle(n - 1)

print(factorielle(5))  # 120
```

**Explication :**
- La fonction utilise la récursion
- Elle s'arrête quand `n <= 1`
```

3. Prévisualiser la réponse
4. Publier la réponse
5. Vérifier qu'elle s'affiche correctement

#### Test 6 : Mode sombre
1. Basculer en mode sombre (icône lune/soleil)
2. Vérifier que :
   - Les couleurs s'adaptent
   - Le code reste lisible
   - Les liens changent de couleur (jaune #FFD166)
   - L'éditeur React-MDE s'adapte

#### Test 7 : Page Mentors
1. Aller sur `/mentors`
2. Cliquer sur "Devenir mentor"
3. Remplir le formulaire avec une bio en Markdown :
```markdown
# Expert en Intelligence Artificielle

Je suis **docteur en IA** avec *10 ans d'expérience*.

## Mes spécialités :
- Machine Learning
- Deep Learning
- NLP

> "L'éducation est l'arme la plus puissante"
```

4. Prévisualiser
5. Soumettre
6. Vérifier que la bio s'affiche correctement

#### Test 8 : Responsive
1. Ouvrir les DevTools (F12)
2. Tester en mode mobile (iPhone, Android)
3. Vérifier que :
   - L'éditeur est utilisable
   - Les tableaux ont un scroll horizontal
   - Le code ne déborde pas

---

### 🐛 5. Problèmes potentiels et solutions

#### Problème : Le Markdown ne s'affiche pas formaté
**Symptômes :**
- On voit `**texte**` au lieu de **texte**
- On voit les backticks ` autour du code

**Solutions :**
1. Vérifier que `MarkdownRenderer` est importé :
```jsx
import MarkdownRenderer from '@/components/MarkdownRenderer';
```

2. Vérifier l'utilisation :
```jsx
<MarkdownRenderer content={question.content} />
```

3. Ne PAS utiliser :
```jsx
<p>{question.content}</p>  ❌
```

---

#### Problème : Pas de coloration syntaxique
**Symptômes :**
- Le code s'affiche en monochrome

**Solutions :**
1. Vérifier que `react-syntax-highlighter` est installé :
```bash
pnpm list react-syntax-highlighter
```

2. Vérifier l'import dans `MarkdownRenderer.jsx` :
```jsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
```

---

#### Problème : L'éditeur React-MDE a un style bizarre
**Symptômes :**
- Couleurs incohérentes
- Police trop petite ou trop grande

**Solutions :**
1. Vérifier que `react-mde-custom.css` est importé dans `App.css` :
```css
@import "./styles/react-mde-custom.css";
```

2. Vérifier que `react-mde/lib/styles/css/react-mde-all.css` est importé dans le composant

---

#### Problème : Erreur de compilation
**Symptômes :**
- `Cannot find module '@/components/MarkdownRenderer'`

**Solutions :**
1. Vérifier le path alias dans `vite.config.js` ou `jsconfig.json`
2. Redémarrer le serveur de dev :
```bash
pnpm run dev
```

---

#### Problème : Le mode sombre ne fonctionne pas
**Symptômes :**
- Les couleurs ne changent pas

**Solutions :**
1. Vérifier que `useTheme` est importé dans `MarkdownRenderer` :
```jsx
import { useTheme } from 'next-themes';
```

2. Vérifier que le ThemeProvider est dans `App.jsx`

---

### 📊 6. Éléments à vérifier visuellement

#### Dans la liste des questions :
- [ ] Le titre est en gras
- [ ] Le contenu prévisualise le Markdown (3 lignes max)
- [ ] Le gras/italique est visible
- [ ] Le code inline a un fond jaune (#FFD166)

#### Dans les détails d'une question :
- [ ] Tous les titres (H1-H4) sont stylisés
- [ ] Les listes ont des puces/numéros
- [ ] Les citations ont une bordure bleue
- [ ] Les blocs de code ont la coloration syntaxique
- [ ] Les tableaux sont responsive
- [ ] Les liens sont cliquables et colorés

#### Dans l'éditeur :
- [ ] L'onglet "Write" permet d'écrire
- [ ] L'onglet "Preview" affiche le rendu
- [ ] La barre d'outils fonctionne (B, I, liens, etc.)
- [ ] Le style correspond au thème

#### Dans les réponses :
- [ ] Chaque réponse affiche le Markdown formaté
- [ ] L'auteur et la date sont visibles
- [ ] Le vote fonctionne (si implémenté)

---

### 📈 7. Performance

#### Métriques à vérifier :
- [ ] Temps de chargement initial < 3s
- [ ] Rendu d'une question < 100ms
- [ ] Prévisualisation instantanée (< 50ms)
- [ ] Pas de lag lors du scroll

#### Outils de test :
1. Chrome DevTools > Performance
2. Lighthouse audit
3. Network tab pour les assets

---

### 🎨 8. Vérification des couleurs

#### Mode Jour :
- [ ] Texte principal : #0D1B2A (bleu nuit)
- [ ] Liens : #1B4965 (bleu ciel)
- [ ] Code inline : fond #FFD166 (jaune)
- [ ] Citations : bordure #1B4965

#### Mode Nuit :
- [ ] Texte principal : #F5F5F5 (gris clair)
- [ ] Liens : #FFD166 (jaune)
- [ ] Code inline : fond #FFD166
- [ ] Citations : bordure #FFD166

---

### ✅ 9. Validation finale

Avant de considérer que tout fonctionne :

1. [ ] Créer une question avec tous les types de Markdown
2. [ ] Vérifier qu'elle s'affiche correctement dans la liste
3. [ ] Ouvrir les détails et vérifier le rendu complet
4. [ ] Répondre avec du Markdown complexe
5. [ ] Basculer en mode sombre et vérifier
6. [ ] Tester sur mobile (responsive)
7. [ ] Vérifier les performances (pas de lag)
8. [ ] Tester avec l'API backend réelle

---

### 🚀 10. Déploiement

Avant de déployer en production :

```bash
# Build
pnpm run build

# Vérifier la taille du bundle
ls -lh dist/

# Tester le build
pnpm run preview
```

Vérifier que :
- [ ] Le build se termine sans erreur
- [ ] La taille du bundle est raisonnable (< 2MB)
- [ ] Le preview fonctionne comme en dev

---

### 📝 11. Documentation utilisateur

Créer une page d'aide pour les utilisateurs :
- [ ] Guide Markdown dans l'application
- [ ] Exemples de formatage
- [ ] Raccourcis clavier
- [ ] FAQ

---

### 🎯 12. Améliorations futures

Idées pour améliorer l'expérience :

1. [ ] Formules mathématiques (KaTeX)
2. [ ] Diagrammes (Mermaid)
3. [ ] Upload d'images drag & drop
4. [ ] Emojis picker
5. [ ] Mentions (@utilisateur)
6. [ ] Hashtags (#sujet)
7. [ ] Export PDF
8. [ ] Sauvegarde automatique (draft)

---

## 🎉 Conclusion

Si tous les tests passent, le système Markdown/WYSIWYG est opérationnel et prêt pour la production !

**EduConnect Africa** - Ensemble vers l'excellence académique 🌍📚✨
