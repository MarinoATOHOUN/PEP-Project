import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MarkdownTest = () => {
  const sampleMarkdown = `
# Titre principal (H1)

Ceci est un paragraphe de texte normal. Il démontre comment le contenu Markdown est rendu avec le style panafricain d'EduConnect Africa.

## Titre secondaire (H2)

Vous pouvez utiliser du **texte en gras**, du *texte en italique*, et même du ~~texte barré~~.

### Titre niveau 3 (H3)

Voici du \`code inline\` qui est mis en évidence avec notre couleur d'accent jaune.

#### Titre niveau 4 (H4)

> Ceci est une citation importante.  
> Elle peut s'étendre sur plusieurs lignes et utilise nos couleurs primaires.

---

## Listes

### Liste non ordonnée :
- Premier élément
- Deuxième élément
  - Sous-élément A
  - Sous-élément B
- Troisième élément

### Liste ordonnée :
1. Première étape
2. Deuxième étape
3. Troisième étape

---

## Code avec coloration syntaxique

### JavaScript :
\`\`\`javascript
function calculerFactorielle(n) {
  if (n <= 1) return 1;
  return n * calculerFactorielle(n - 1);
}

console.log(calculerFactorielle(5)); // 120
\`\`\`

### Python :
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Afficher les 10 premiers nombres de Fibonacci
for i in range(10):
    print(fibonacci(i))
\`\`\`

---

## Tableaux

| Langage | Difficulté | Popularité |
|---------|------------|------------|
| Python | Facile | ⭐⭐⭐⭐⭐ |
| JavaScript | Moyenne | ⭐⭐⭐⭐⭐ |
| C++ | Difficile | ⭐⭐⭐⭐ |
| Java | Moyenne | ⭐⭐⭐⭐ |

---

## Liens et ressources

Pour plus d'informations, consultez [la documentation officielle](https://educonnect-africa.com).

Vous pouvez également visiter [Stack Overflow](https://stackoverflow.com) pour trouver des solutions.

---

## Exemple de problème mathématique

Soit l'équation du second degré : **ax² + bx + c = 0**

Pour résoudre cette équation, on utilise le discriminant :

> Δ = b² - 4ac

**Cas possibles :**
1. Si Δ > 0 : deux solutions réelles distinctes
2. Si Δ = 0 : une solution réelle double
3. Si Δ < 0 : deux solutions complexes conjuguées

### Code de résolution :

\`\`\`python
import math

def resoudre_second_degre(a, b, c):
    """
    Résout une équation du second degré ax² + bx + c = 0
    """
    delta = b**2 - 4*a*c
    
    if delta > 0:
        x1 = (-b + math.sqrt(delta)) / (2*a)
        x2 = (-b - math.sqrt(delta)) / (2*a)
        return f"Deux solutions: x₁ = {x1:.2f}, x₂ = {x2:.2f}"
    elif delta == 0:
        x = -b / (2*a)
        return f"Une solution double: x = {x:.2f}"
    else:
        partie_reelle = -b / (2*a)
        partie_imaginaire = math.sqrt(-delta) / (2*a)
        return f"Solutions complexes: {partie_reelle:.2f} ± {partie_imaginaire:.2f}i"

# Exemple
print(resoudre_second_degre(1, -5, 6))  # x² - 5x + 6 = 0
\`\`\`

---

## Emphase et importance

Voici quelques points **très importants** à retenir :

- *L'apprentissage* est un processus continu
- **La pratique** est essentielle pour progresser
- ~~L'échec~~ L'expérience fait partie de l'apprentissage
- \`console.log()\` est ton meilleur ami en JavaScript 😊

---

## Citation inspirante

> "L'éducation est l'arme la plus puissante que l'on puisse utiliser pour changer le monde."  
> — Nelson Mandela

> "Le savoir est la seule richesse que l'on peut partager sans la diminuer."  
> — Proverbe africain

---

## Conclusion

Ce composant **MarkdownRenderer** offre un rendu riche et élégant du contenu Markdown, parfaitement intégré au design panafricain d'EduConnect Africa ! 🌍✨

**Fonctionnalités principales :**
1. ✅ Coloration syntaxique
2. ✅ Tables responsives
3. ✅ Citations stylisées
4. ✅ Thème adaptatif (jour/nuit)
5. ✅ Design panafricain cohérent
`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Test du composant MarkdownRenderer
          </CardTitle>
          <p className="text-muted-foreground">
            Démonstration de toutes les fonctionnalités du rendu Markdown
          </p>
        </CardHeader>
        <CardContent>
          <MarkdownRenderer content={sampleMarkdown} />
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkdownTest;
