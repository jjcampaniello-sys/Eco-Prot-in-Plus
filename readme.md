# Calculateur d'Équilibre Protéique

Application web (HTML/CSS/JS, sans dépendance) pour composer un repas végétarien et évaluer :

- les protéines totales (g),
- la qualité du profil en acides aminés par rapport à la viande (%),
- la vitamine B12 (µg),
- les calories (kcal).

Tous les ingrédients sont pesés **crus / secs**, sauf indication contraire (produits laitiers, œufs).

## Fichiers

| Fichier       | Rôle                                                        |
|---------------|---------------------------------------------------------------|
| `index.html`  | Structure de la page et listes d'aliments                     |
| `style.css`   | Mise en forme                                                  |
| `script.js`   | Calculs et logique d'ajustement des quantités                  |
| `README.md` / `README.html` | Ce document                                      |

## Utilisation

1. Choisir jusqu'à un aliment par catégorie (céréale, légumineuse/soja, laitier/œuf, fruits à coque/graines, légume, complément B12).
2. Saisir les quantités en grammes (ou ml pour le lait).
3. Cliquer sur « Calculer l'équilibre du repas ».

## Logique de calcul

### Score du profil en acides aminés

Le score compare, par gramme de protéines, la teneur en **lysine** et en **acides aminés soufrés** (méthionine + cystéine) du repas à un profil de référence adulte (FAO/WHO/UNU 2007), pris comme équivalent à la viande. **100 % signifie une qualité de protéine équivalente à la viande, gramme pour gramme — pas que la quantité totale de protéines équivaut à une portion de viande.**

Les autres acides aminés essentiels (thréonine, tryptophane, etc.) ne sont pas limitants dans les combinaisons proposées et ne sont pas pris en compte, pour garder le calcul simple.

### Ajustement automatique des quantités

Si le score est inférieur à 100 %, l'application rapproche tes quantités du profil idéal, **au plus près de ta saisie** :

1. **Étape 1** : ajustement de la céréale et de la légumineuse (peuvent monter ou descendre, jamais sous 10 g).
2. **Étape 2 (dernier recours)** : si l'étape 1 ne suffit pas, ou si les compléments corrigent le profil en déplaçant les quantités deux fois moins, les compléments choisis (laitier/œuf, fruits à coque/graines) sont **augmentés** (jamais réduits, plafonnés à ×2 ou 50 g minimum).

### Vitamine B12

Comparée à une référence journalière de 4 µg (ANSES, adulte). L'absorption plafonnant à ~1,5–2 µg par prise, une forte dose en un seul repas n'est pas entièrement utilisée : mieux vaut répartir les sources sur la journée.

## Limites connues

- Les valeurs nutritionnelles (protéines, acides aminés, B12, calories) sont des moyennes de tables généralistes (USDA/Ciqual) et peuvent varier selon le produit réel utilisé — vérifie les étiquettes si besoin.
- Le score aminé ignore la digestibilité (les protéines végétales sont en général un peu moins bien absorbées que les protéines animales).
- Les calories sont calculées sur le poids saisi (cru/sec pour les céréales et légumineuses) : l'eau absorbée à la cuisson change le poids et le volume, jamais l'apport calorique.
