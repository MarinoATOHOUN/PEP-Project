# Guide d'utilisation du Markdown dans EduConnect Africa

## 📝 Introduction

Le contenu des questions et réponses sur EduConnect Africa est formaté en **Markdown**, un langage de balisage léger qui permet de créer du texte riche et bien formaté facilement.

## 🎨 Composant MarkdownRenderer

Le composant `MarkdownRenderer` est utilisé pour afficher le contenu Markdown avec un style personnalisé aux couleurs panafricaines d'EduConnect Africa.

### Utilisation

```jsx
import MarkdownRenderer from '@/components/MarkdownRenderer';

<MarkdownRenderer 
  content="# Votre contenu Markdown ici"
  className="mb-6"
/>
```

## ✨ Fonctionnalités supportées

### 1. **Titres**

```markdown
# Titre niveau 1
## Titre niveau 2
### Titre niveau 3
#### Titre niveau 4
```

**Rendu :**
- Les titres sont stylisés avec les couleurs primaires (#1B4965)
- Les H1 et H2 ont des bordures décoratives
- Espacement automatique avant et après

---

### 2. **Formatage du texte**

```markdown
**Texte en gras**
*Texte en italique*
~~Texte barré~~
`Code inline`
```

**Rendu :**
- **Gras** : Police épaisse
- *Italique* : Police inclinée
- ~~Barré~~ : Texte avec ligne médiane
- `Code` : Fond jaune (#FFD166) avec police monospace

---

### 3. **Listes**

#### Liste non ordonnée :
```markdown
- Élément 1
- Élément 2
  - Sous-élément 2.1
  - Sous-élément 2.2
- Élément 3
```

#### Liste ordonnée :
```markdown
1. Premier élément
2. Deuxième élément
3. Troisième élément
```

**Rendu :**
- Espacement vertical entre les éléments
- Indentation automatique pour les sous-listes

---

### 4. **Blocs de code**

#### Code inline :
```markdown
Utilisez la fonction `console.log()` pour déboguer.
```

#### Bloc de code avec coloration syntaxique :
````markdown
```javascript
function saluer(nom) {
  console.log(`Bonjour ${nom}!`);
}
```
````

**Rendu :**
- Coloration syntaxique automatique selon le langage
- Thème adapté au mode jour/nuit
- Langages supportés : JavaScript, Python, Java, C, SQL, HTML, CSS, etc.

---

### 5. **Citations**

```markdown
> Ceci est une citation importante.
> Elle peut s'étendre sur plusieurs lignes.
```

**Rendu :**
- Bordure gauche bleue (#1B4965)
- Fond légèrement coloré
- Texte en italique

---

### 6. **Liens**

```markdown
[Texte du lien](https://example.com)
```

**Rendu :**
- Couleur bleue (#1B4965) en mode jour
- Couleur jaune (#FFD166) en mode nuit
- Souligné au survol
- S'ouvre dans un nouvel onglet

---

### 7. **Images**

```markdown
![Description de l'image](https://example.com/image.jpg)
```

**Rendu :**
- Image responsive (s'adapte à la largeur)
- Bordure légère
- Coins arrondis
- Ombre portée

---

### 8. **Tableaux**

```markdown
| Colonne 1 | Colonne 2 | Colonne 3 |
|-----------|-----------|-----------|
| Valeur 1  | Valeur 2  | Valeur 3  |
| Valeur 4  | Valeur 5  | Valeur 6  |
```

**Rendu :**
- En-têtes avec fond coloré (#1B4965/10)
- Bordures visibles
- Responsive avec défilement horizontal sur mobile
- Hover effect sur les lignes

---

### 9. **Lignes horizontales**

```markdown
---
```

**Rendu :**
- Ligne épaisse avec espacement vertical
- Couleur adaptée au thème

---

### 10. **Combinaisons**

Vous pouvez combiner plusieurs éléments :

```markdown
### Résolution d'un problème mathématique

Pour résoudre l'équation `x² + 5x + 6 = 0`, on utilise la formule :

```python
import math

def resoudre_equation(a, b, c):
    delta = b**2 - 4*a*c
    if delta > 0:
        x1 = (-b + math.sqrt(delta)) / (2*a)
        x2 = (-b - math.sqrt(delta)) / (2*a)
        return (x1, x2)
```

> **Note importante** : Cette méthode fonctionne uniquement pour les équations du second degré.

**Résultat :**
- x₁ = -2
- x₂ = -3

Pour plus d'informations, consultez [ce guide](https://example.com).
```

---

## 🎨 Personnalisation des couleurs

Le composant `MarkdownRenderer` utilise automatiquement les couleurs du thème :

### Mode Jour (light) :
- **Texte principal** : #0D1B2A (Bleu nuit)
- **Couleur primaire** : #1B4965 (Bleu ciel)
- **Accent** : #FFD166 (Jaune)
- **Fond** : #F5F5F5 (Gris clair)

### Mode Nuit (dark) :
- **Texte principal** : #F5F5F5 (Gris clair)
- **Couleur primaire** : #FFD166 (Jaune)
- **Accent** : #FFD166 (Jaune)
- **Fond** : #0D1B2A (Bleu nuit)

---

## 🔧 Éditeur WYSIWYG (React-MDE)

Pour créer et éditer du contenu Markdown, nous utilisons **React-MDE**, un éditeur WYSIWYG avec :

### Fonctionnalités :
- ✅ **Onglet "Write"** : Écriture en Markdown brut
- ✅ **Onglet "Preview"** : Prévisualisation en temps réel
- ✅ **Barre d'outils** : Boutons pour formater rapidement
- ✅ **Raccourcis clavier** : Ctrl+B (gras), Ctrl+I (italique), etc.
- ✅ **Style cohérent** : Adapté au thème panafricain

### Exemples de boutons dans l'éditeur :
- **B** : Gras
- **I** : Italique
- **[Link]** : Insérer un lien
- **`<>`** : Bloc de code
- **"** : Citation
- **1.** : Liste ordonnée
- **•** : Liste non ordonnée

---

## 📚 Bonnes pratiques

### 1. **Structure claire**
Utilisez des titres pour organiser votre contenu :
```markdown
## Question principale
### Contexte
### Ce que j'ai essayé
### Code
```

### 2. **Code lisible**
Spécifiez toujours le langage pour la coloration syntaxique :
````markdown
```python
# Bon
print("Hello World")
```

```
// Moins bon (pas de langage spécifié)
print("Hello World")
```
````

### 3. **Formatage approprié**
- Utilisez `**gras**` pour les points importants
- Utilisez `> citation` pour les remarques
- Utilisez des listes pour énumérer des points

### 4. **Images**
- Utilisez des URLs d'images hébergées
- Ajoutez toujours une description alternative
- Vérifiez que l'image s'affiche correctement

---

## 🚀 Exemples pratiques

### Exemple 1 : Question en mathématiques

```markdown
## Comment résoudre une intégrale par parties ?

Je cherche à résoudre l'intégrale suivante :

∫ x·e^x dx

### Ce que j'ai essayé

J'ai utilisé la formule d'intégration par parties :

> ∫ u·v' dx = u·v - ∫ u'·v dx

Avec :
- u = x
- v' = e^x

**Résultat :**
Je trouve `x·e^x - e^x + C`

Est-ce correct ?
```

---

### Exemple 2 : Question en programmation

```markdown
## Erreur "TypeError" en Python

J'obtiens l'erreur suivante :

```python
TypeError: unsupported operand type(s) for +: 'int' and 'str'
```

### Mon code

```python
age = 25
message = "J'ai " + age + " ans"
print(message)
```

Pourquoi cette erreur ? 🤔
```

---

### Exemple 3 : Réponse détaillée

```markdown
## Réponse

Le problème vient du **mélange de types** entre `int` et `str`.

### Solution 1 : Conversion explicite

```python
age = 25
message = "J'ai " + str(age) + " ans"
print(message)
```

### Solution 2 : f-strings (recommandé)

```python
age = 25
message = f"J'ai {age} ans"
print(message)
```

> **Note :** Les f-strings sont disponibles depuis Python 3.6 et sont plus lisibles.

### Comparaison des performances

| Méthode | Lisibilité | Performance |
|---------|------------|-------------|
| Concaténation | ⭐⭐ | ⭐⭐⭐ |
| f-strings | ⭐⭐⭐ | ⭐⭐⭐ |
| .format() | ⭐⭐ | ⭐⭐ |

**Conclusion :** Utilisez les f-strings ! 🎉
```

---

## 🛠️ Dépannage

### Le Markdown ne s'affiche pas correctement

1. Vérifiez la syntaxe Markdown
2. Assurez-vous que le composant `MarkdownRenderer` est importé
3. Vérifiez la console pour les erreurs

### La coloration syntaxique ne fonctionne pas

1. Vérifiez que vous avez spécifié le langage après les backticks
2. Exemple : ````javascript` au lieu de ````

### Les images ne s'affichent pas

1. Vérifiez que l'URL est correcte et accessible
2. Utilisez des URLs HTTPS
3. Vérifiez que l'image n'est pas bloquée par CORS

---

## 📖 Ressources

- [Guide Markdown officiel](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [React-MDE Documentation](https://github.com/andrerpena/react-mde)

---

**EduConnect Africa** - Ensemble vers l'excellence académique 🌍📚✨
