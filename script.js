document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-submit').addEventListener('click', calculerAssoc);
});

/* ============================================================
   DONNÉES ACIDES AMINÉS
   Valeurs en mg d'acide aminé par g de protéines (moyennes de tables
   USDA / FAO, approximatives : à affiner avec tes propres sources).
   lys = lysine, saa = acides aminés soufrés (méthionine + cystéine)
   ============================================================ */
const REF_AA = { lys: 45, saa: 22 };      // profil de référence adulte FAO/WHO/UNU 2007 (≈ viande, qui le dépasse)
const AA_DEFAUT = { lys: 55, saa: 25 };   // si un aliment n'est pas dans la table

const AA = {
  // Céréales
  riz:              { lys: 37, saa: 35 },
  quinoa:           { lys: 54, saa: 36 },
  pates:            { lys: 25, saa: 40 },
  avoine:           { lys: 41, saa: 43 },
  sarrasin:         { lys: 50, saa: 31 },
  // Légumineuses / soja
  lentilles:        { lys: 69, saa: 19 },
  lentilles_corail: { lys: 69, saa: 19 },
  pois_chiches:     { lys: 67, saa: 24 },
  haricots_rouges:  { lys: 63, saa: 24 },
  haricots_blancs:  { lys: 67, saa: 22 },
  haricots_noirs:   { lys: 69, saa: 26 },
  pois_casses:      { lys: 72, saa: 25 },
  feves:            { lys: 64, saa: 21 },
  soja_graines:     { lys: 74, saa: 33 },
  edamame:          { lys: 66, saa: 28 },
  tofu:             { lys: 62, saa: 26 },
  tempeh:           { lys: 55, saa: 26 },
  // Produits laitiers / œufs
  skyr:             { lys: 80, saa: 33 },
  yaourt_grec:      { lys: 82, saa: 33 },
  oeuf:             { lys: 72, saa: 52 },
  lait_vache:       { lys: 80, saa: 34 },
  lait_veg_b12:     { lys: 60, saa: 25 },  // supposé à base de soja
  fromage:          { lys: 80, saa: 30 },
  // Fruits à coque / graines
  sesame:           { lys: 32, saa: 53 },
  tournesol:        { lys: 45, saa: 45 },
  courge:           { lys: 41, saa: 30 },
  chanvre:          { lys: 36, saa: 51 },
  amandes:          { lys: 28, saa: 16 },
  noix:             { lys: 28, saa: 29 },
  cajou:            { lys: 51, saa: 38 },
  noisettes:        { lys: 28, saa: 31 },
  // Légumes
  brocoli:          { lys: 60, saa: 21 },
  epinard:          { lys: 61, saa: 29 },
  petits_pois:      { lys: 59, saa: 20 },
  legumes_mix:      { lys: 55, saa: 22 },
  // Levure
  levure_b12:       { lys: 70, saa: 22 }
};

/* ============================================================
   DONNÉES DIGESTIBILITÉ
   Digestibilité vraie des protéines (%), moyennes de littérature
   (proches des coefficients utilisés dans le DIAAS). Approximatif :
   varie selon la cuisson, le trempage, la mouture.
   ============================================================ */
const DIG_DEFAUT = 85;

const DIG = {
  // Céréales
  riz: 89, quinoa: 90, pates: 88, avoine: 86, sarrasin: 85,
  // Légumineuses / soja
  lentilles: 84, lentilles_corail: 84, pois_chiches: 84,
  haricots_rouges: 80, haricots_blancs: 80, haricots_noirs: 80,
  pois_casses: 82, feves: 80,
  soja_graines: 90, edamame: 90, tofu: 95, tempeh: 90,
  // Produits laitiers / œufs
  skyr: 95, yaourt_grec: 95, oeuf: 97, lait_vache: 95, lait_veg_b12: 92, fromage: 95,
  // Fruits à coque / graines
  sesame: 80, tournesol: 78, courge: 80, chanvre: 82,
  amandes: 75, noix: 76, cajou: 80, noisettes: 76,
  // Légumes
  brocoli: 80, epinard: 78, petits_pois: 82, legumes_mix: 78,
  // Levure
  levure_b12: 85
};

/* ============================================================
   OUTILS
   ============================================================ */

// Lit un ingrédient (menu + quantité). Sans sélection, la quantité compte pour 0.
function lireIngredient(selectId, qtyId) {
  const select = document.getElementById(selectId);
  const opt = select.options[select.selectedIndex];
  const key = select.value;
  if (!key) {
    return { key: '', nom: '', qtyId, qty: 0, prot100: 0, protDig100: 0, b12100: 0, cal100: 0, lys: 0, saa: 0 };
  }
  const aa = AA[key] || AA_DEFAUT;
  const dig = DIG[key] ?? DIG_DEFAUT;
  const prot100 = parseFloat(opt.dataset.prot) || 0;
  return {
    key,
    nom: opt.text.split(' (')[0],
    qtyId,
    qty: parseFloat(document.getElementById(qtyId).value) || 0,
    prot100,
    protDig100: (prot100 * dig) / 100,   // protéines réellement absorbées, pour 100g
    b12100: parseFloat(opt.dataset.b12) || 0,
    cal100: parseFloat(opt.dataset.cal) || 0,
    lys: aa.lys,
    saa: aa.saa
  };
}

// Protéines (brutes et digestibles) et score aminé du repas (min lysine / soufrés, plafonné à 1),
// calculé sur les protéines RÉELLEMENT ABSORBÉES (digestibles).
function profilAmine(ings) {
  let protRaw = 0, protDig = 0, lys = 0, saa = 0;
  for (const i of ings) {
    protRaw += (i.prot100 * i.qty) / 100;
    const pDig = (i.protDig100 * i.qty) / 100;
    protDig += pDig;
    lys += pDig * i.lys;
    saa += pDig * i.saa;
  }
  if (protDig === 0) return { prot: protRaw, protDig: 0, scoreLys: 0, scoreSaa: 0, score: 0 };
  const scoreLys = lys / protDig / REF_AA.lys;
  const scoreSaa = saa / protDig / REF_AA.saa;
  return { prot: protRaw, protDig, scoreLys, scoreSaa, score: Math.min(1, scoreLys, scoreSaa) };
}

// Résout M·x = v (petit système) par élimination de Gauss-Jordan ; null si singulier
function resoudreSysteme(M, v) {
  const n = v.length;
  const a = M.map((row, i) => [...row, v[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    if (Math.abs(a[p][c]) < 1e-12) return null;
    [a[c], a[p]] = [a[p], a[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = a[r][c] / a[c][c];
      for (let k = c; k <= n; k++) a[r][k] -= f * a[c][k];
    }
  }
  return a.map((row, i) => row[n] / row[i]);
}

// Trouve les quantités (entières) les plus proches de x0 qui respectent toutes les
// contraintes linéaires  n·x + c >= 0  (dimension quelconque, petite).
// Le point le plus proche est la projection de x0 sur l'intersection de certaines
// frontières : on les essaie toutes et on garde la plus proche qui est faisable.
// Renvoie null si aucune solution.
function resoudre(x0, contraintes) {
  const EPS = 1e-7;
  const dim = x0.length;
  const m = contraintes.length;
  const val = (k, x) => k.n.reduce((s, ni, i) => s + ni * x[i], k.c);
  const ok = x => contraintes.every(k => val(k, x) >= -EPS);
  const dist = x => Math.hypot(...x.map((v, i) => v - x0[i]));

  if (ok(x0)) return x0.slice();

  // Candidats : projection de x0 sur les sous-ensembles (taille 1 à dim) de frontières
  const candidats = [];
  const explorer = (debut, choisis) => {
    if (choisis.length > 0) {
      const S = choisis.map(i => contraintes[i]);
      const G = S.map(a => S.map(b => a.n.reduce((s, ni, i) => s + ni * b.n[i], 0)));
      const r = S.map(a => val(a, x0));
      const lambda = resoudreSysteme(G, r);
      if (lambda) {
        candidats.push(x0.map((v, j) => v - S.reduce((s, a, i) => s + lambda[i] * a.n[j], 0)));
      }
    }
    if (choisis.length === dim) return;
    for (let i = debut; i < m; i++) explorer(i + 1, [...choisis, i]);
  };
  explorer(0, []);

  const faisables = candidats.filter(ok).sort((p, q) => dist(p) - dist(q));

  // Arrondi en grammes en restant dans la zone faisable
  for (const brut of faisables) {
    let combos = [[]];
    for (const v of brut) {
      const opts = [Math.floor(v), Math.ceil(v), Math.ceil(v) + 1];
      combos = combos.flatMap(c => opts.map(o => [...c, o]));
    }
    let meilleur = null, meilleureDist = Infinity;
    for (const c of combos) {
      if (c.every(v => v >= 0) && ok(c)) {
        const d = dist(c);
        if (d < meilleureDist) { meilleur = c; meilleureDist = d; }
      }
    }
    if (meilleur) return meilleur;
  }
  return null;
}

// Cherche les quantités des aliments « adjustables » (les autres restent fixes) pour que
// lysine ET acides aminés soufrés DIGESTIBLES atteignent la référence, au plus près de la saisie.
//  - céréale / légumineuse : peuvent monter ou descendre (minimum 10 g)
//  - compléments (laitier/œuf, fruits à coque/graines) : peuvent seulement augmenter (max ×2, au moins 50 g)
function ajusterQuantites(ings, adjustables) {
  const fixes = ings.filter(i => !adjustables.includes(i));
  const contraintes = ['lys', 'saa'].map(aa => ({
    n: adjustables.map(i => (i.protDig100 / 100) * (i[aa] - REF_AA[aa])),
    c: fixes.reduce((s, i) => s + (i.protDig100 / 100) * i.qty * (i[aa] - REF_AA[aa]), 0)
  }));
  adjustables.forEach((i, k) => {
    const e = adjustables.map((_, j) => (j === k ? 1 : 0));
    if (i.complement) {
      contraintes.push({ n: e, c: -i.qty });                                   // pas de réduction
      contraintes.push({ n: e.map(v => -v), c: Math.max(2 * i.qty, 50) });      // plafond raisonnable
    } else {
      contraintes.push({ n: e, c: -Math.min(10, i.qty) });                      // jamais réduit à presque rien
    }
  });
  return resoudre(adjustables.map(i => i.qty), contraintes);
}

/* ============================================================
   CALCUL PRINCIPAL
   ============================================================ */
function calculerAssoc() {
  const cereale = lireIngredient('cereale', 'qty-cereale');
  const legumineuse = lireIngredient('legumineuse', 'qty-legumineuse');
  const laitier = lireIngredient('laitier', 'qty-laitier');
  const graines = lireIngredient('graines', 'qty-graines');
  const legume = lireIngredient('legume', 'qty-legume');
  const b12 = lireIngredient('b12-source', 'qty-b12');
  laitier.complement = true;
  graines.complement = true;
  const ings = [cereale, legumineuse, laitier, graines, legume, b12];

  if (!ings.some(i => i.key)) {
    alert("Veuillez choisir au moins un aliment.");
    return;
  }
  if (!ings.some(i => i.qty > 0)) {
    alert("Veuillez saisir au moins une quantité.");
    return;
  }

  // Cible de protéines (champ facultatif #cible-prot, 20 g par défaut) : sert uniquement aux messages
  const cibleProt = parseFloat(document.getElementById('cible-prot')?.value) || 20;

  // ---- AJUSTEMENT : rapprocher le profil aminé DIGESTIBLE de l'équivalent viande ----
  // Étape 1 : céréale + légumineuse seules, au plus près de la saisie.
  // Étape 2 (dernier recours) : si l'étape 1 est impossible, ou si les compléments corrigent
  //         le profil en déplaçant les quantités au moins deux fois moins, on augmente aussi
  //         les compléments choisis (laitier/œuf, fruits à coque/graines).
  const base = [cereale, legumineuse].filter(i => i.key && i.qty > 0);
  const complements = [laitier, graines].filter(i => i.key);
  const ajustements = [];
  let ajustementImpossible = false;
  let dernierRecours = false;

  const appliquer = (adj, sol) => {
    adj.forEach((i, k) => {
      if (sol[k] !== i.qty) {
        ajustements.push(`${i.nom} ${i.qty} → ${sol[k]} g`);
        i.qty = sol[k];
        document.getElementById(i.qtyId).value = i.qty;
      }
    });
  };

  if (profilAmine(ings).score < 1 - 1e-9) {
    const ecart = (adj, sol) => Math.hypot(...adj.map((i, k) => sol[k] - i.qty));

    const sol1 = base.length ? ajusterQuantites(ings, base) : null;
    const tous = [...base, ...complements];
    const sol2 = complements.length ? ajusterQuantites(ings, tous) : null;

    // On garde l'étape 1, sauf si elle est impossible ou si les compléments
    // permettent de corriger en déplaçant les quantités deux fois moins.
    const preferer2 = sol2 && (!sol1 || ecart(tous, sol2) < 0.5 * ecart(base, sol1));

    if (preferer2) {
      appliquer(tous, sol2);
      dernierRecours = true;
    } else if (sol1) {
      appliquer(base, sol1);
    } else {
      ajustementImpossible = true;
    }
  }

  // ---- 1. PROTÉINES ET SCORE AMINÉ (sur base digestible) ----
  const profil = profilAmine(ings);
  const totalProt = parseFloat(profil.prot.toFixed(1));          // protéines brutes ingérées
  const totalProtDig = parseFloat(profil.protDig.toFixed(1));    // protéines réellement absorbées
  const qualityScore = Math.round(profil.score * 100);

  // ---- 2. VITAMINE B12 (µg) ----
  const totalB12 = parseFloat(ings.reduce((s, i) => s + (i.b12100 * i.qty) / 100, 0).toFixed(2));

  // ---- 3. CALORIES (kcal) ----
  const totalCal = Math.round(ings.reduce((s, i) => s + (i.cal100 * i.qty) / 100, 0));

  // ---- 4. AFFICHAGE ----
  document.getElementById('total-protein').innerText = totalProt;
  document.getElementById('quality-score').innerText = qualityScore + "%";
  document.getElementById('total-b12').innerText = totalB12;
  document.getElementById('total-calories').innerText = totalCal;

  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const portionAdviceText = document.getElementById('portion-advice-text');
  const b12StatusText = document.getElementById('b12-status-text');

  const detailAjust = ajustements.length
    ? ` Quantités ajustées au plus près de votre saisie${dernierRecours ? " (complément augmenté en dernier recours)" : ""} : ${ajustements.join(', ')}.`
    : '';
  const detailDig = ` Protéines réellement absorbées (digestibilité prise en compte) : ${totalProtDig}g.`;

  if (qualityScore === 100 && totalProt >= cibleProt * 0.9) {
    resultTitle.innerText = "🎯 Qualité protéique équivalente à la viande !";
    resultText.innerText = `Profil en acides aminés digestibles équivalent à la viande, avec ${totalProt}g de protéines.${detailDig}${detailAjust}`;
  } else if (qualityScore === 100) {
    resultTitle.innerText = "✅ Profil aminé complet";
    resultText.innerText = `Profil complet (sur base digestible), mais seulement ${totalProt}g de protéines : augmentez les portions pour égaler un steak.${detailDig}${detailAjust}`;
  } else {
    const lysLimite = profil.scoreLys <= profil.scoreSaa;
    const limitant = lysLimite ? 'lysine' : 'acides aminés soufrés (méthionine + cystéine)';
    const conseil = lysLimite
      ? 'une légumineuse, un produit laitier ou un œuf'
      : 'une céréale (riz, avoine, quinoa…), un œuf ou des graines (sésame, tournesol…)';
    resultTitle.innerText = "⚠️ Profil aminé incomplet";
    resultText.innerText = `${ajustementImpossible ? "Impossible de corriger avec ces seuls aliments. " : ""}Acide aminé limitant (sur base digestible) : ${limitant} (${qualityScore}% du profil de référence). Ajoutez ${conseil}.${detailDig}`;
  }

  if (totalProt >= cibleProt * 0.9) {
    portionAdviceText.innerText = `🍗 Dose parfaite : Vous obtenez ${totalProt}g de protéines, équivalent nutritionnel d'un steak de viande.`;
    portionAdviceText.style.color = "#2e7d32";
  } else {
    portionAdviceText.innerText = `💡 Dose légère (${totalProt}g de protéines). Considérez augmenter les portions si c'est un repas principal.`;
    portionAdviceText.style.color = "#ed6c02";
  }

  const B12_REF_JOUR = 4; // µg/j, référence ANSES adulte
  const pctB12 = Math.round((totalB12 / B12_REF_JOUR) * 100);

  if (totalB12 >= B12_REF_JOUR) {
    b12StatusText.innerText = `🎯 Vitamine B12 : ${pctB12}% de la référence journalière (4 µg). L'absorption plafonne à ~1,5–2 µg par prise : répartissez sur la journée.`;
    b12StatusText.style.color = "#2e7d32";
  } else if (totalB12 >= 1.3) {
    b12StatusText.innerText = `👍 Vitamine B12 : bon apport pour un repas (${pctB12}% de la référence journalière de 4 µg).`;
    b12StatusText.style.color = "#2e7d32";
  } else if (totalB12 > 0) {
    b12StatusText.innerText = `⚠️ Vitamine B12 : apport faible (${pctB12}% de la référence journalière). À compléter aux autres repas.`;
    b12StatusText.style.color = "#ed6c02";
  } else {
    b12StatusText.innerText = "⚠️ Vitamine B12 : 0 µg. Repas sans B12.";
    b12StatusText.style.color = "#d32f2f";
  }

  document.getElementById('result').style.display = "block";
}
