document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-submit').addEventListener('click', calculerAssoc);
});

function calculerAssoc() {
  const cerealeSelect = document.getElementById('cereale');
  const legumineuseSelect = document.getElementById('legumineuse');
  const laitierSelect = document.getElementById('laitier');
  const legumeSelect = document.getElementById('legume');
  const b12Select = document.getElementById('b12-source');

  // Quantités initiales de l'utilisateur
  let qtyCereale = parseFloat(document.getElementById('qty-cereale').value) || 0;
  let qtyLegumineuse = parseFloat(document.getElementById('qty-legumineuse').value) || 0;
  let qtyLaitier = parseFloat(document.getElementById('qty-laitier').value) || 0;
  let qtyLegume = parseFloat(document.getElementById('qty-legume').value) || 0;
  let qtyB12 = parseFloat(document.getElementById('qty-b12').value) || 0;

  if (!cerealeSelect.value && !legumineuseSelect.value && !laitierSelect.value && !legumeSelect.value && !b12Select.value) {
    alert("Veuillez choisir au moins un aliment.");
    return;
  }

  // Taux de protéines pour 100g de chaque ingrédient sélectionné
  const prot100Cereale = parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.prot || 0);
  const prot100Legumineuse = parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.prot || 0);
  const prot100Laitier = parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.prot || 0);
  const prot100Legume = parseFloat(legumeSelect.options[legumeSelect.selectedIndex]?.dataset.prot || 0);
  const prot100B12 = parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.prot || 0);

  const isCerealeComplete = cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.complete === "true";
  const isLegumineuseComplete = legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.complete === "true";

  // Protéines apportées par les aliments annexes (œuf, produits laitiers, légumes, compléments)
  const protAnnexes = (prot100Laitier * qtyLaitier) / 100 + 
                      (prot100Legume * qtyLegume) / 100 + 
                      (prot100B12 * qtyB12) / 100;

  // Cible de référence : 20g de protéines complètes (équivalent ~100g de viande)
  const CIBLE_PROT_VIANDE = 20.0;

  // AJUSTEMENT AUTOMATIQUE DES QUANTITÉS POUR ÉGALER LA VIANDE
  if (cerealeSelect.value !== "" && legumineuseSelect.value !== "" && !isCerealeComplete && !isLegumineuseComplete) {
    
    // Si l'utilisateur n'a saisi aucune quantité, on applique une portion standard basée sur la céréale (ex: 80g)
    if (qtyCereale === 0) qtyCereale = 80;

    // Pour un équilibre idéal en acides aminés (Lysine / Méthionine),
    // le ratio massique idéal est d'environ 1 portion de céréale pour 0.65 portion de légumineuse.
    // Protéines fournies par 1g de céréale + 0.65g de légumineuse :
    const protParGrammeCereale = (prot100Cereale / 100) + (0.65 * prot100Legumineuse / 100);

    // Besoin en protéines restant à couvrir pour atteindre l'équivalent viande (20g)
    const protResteACouvrir = Math.max(0, CIBLE_PROT_VIANDE - protAnnexes);

    if (protParGrammeCereale > 0) {
      // Ajustement des deux quantités pour équilibrer le profil AMINÉ ET le TOTAL PROTÉIQUE
      qtyCereale = Math.round(protResteACouvrir / protParGrammeCereale);
      qtyLegumineuse = Math.round(qtyCereale * 0.65);

      // Mise à jour des champs de saisie dans l'interface
      document.getElementById('qty-cereale').value = qtyCereale;
      document.getElementById('qty-legumineuse').value = qtyLegumineuse;
    }

  } else if (cerealeSelect.value !== "" && (qtyCereale > 0 || qtyLegumineuse === 0)) {
    // Si une seule source incomplète est choisie (ex. seulement céréale), on ajuste sa quantité pour atteindre la cible
    if (prot100Cereale > 0) {
      const protReste = Math.max(0, CIBLE_PROT_VIANDE - protAnnexes);
      qtyCereale = Math.round((protReste * 100) / prot100Cereale);
      document.getElementById('qty-cereale').value = qtyCereale;
    }
} else if (cerealeSelect.value !== "" && (qtyCereale > 0 || qtyLegumineuse === 0)) {
    // Une seule source incomplète, ou céréale + légumineuse complète : on déduit ce que la légumineuse apporte déjà
    if (prot100Cereale > 0) {
      const protLegumineuseSaisie = (prot100Legumineuse * qtyLegumineuse) / 100;
      const protReste = Math.max(0, CIBLE_PROT_VIANDE - protAnnexes - protLegumineuseSaisie);
      qtyCereale = Math.round((protReste * 100) / prot100Cereale);
      document.getElementById('qty-cereale').value = qtyCereale;
    }
  } else if (legumineuseSelect.value !== "" && qtyLegumineuse > 0) {
    if (prot100Legumineuse > 0) {
      const protReste = Math.max(0, CIBLE_PROT_VIANDE - protAnnexes);
      qtyLegumineuse = Math.round((protReste * 100) / prot100Legumineuse);
      document.getElementById('qty-legumineuse').value = qtyLegumineuse;
    }
  }
  // 1. CALCUL DES PROTÉINES TOTALES FINALES (g)
  const protCereale = (prot100Cereale * qtyCereale) / 100;
  const protLegumineuse = (prot100Legumineuse * qtyLegumineuse) / 100;
  const protLaitier = (prot100Laitier * qtyLaitier) / 100;
  const protLegume = (prot100Legume * qtyLegume) / 100;
  const protB12 = (prot100B12 * qtyB12) / 100;

  const totalProt = parseFloat((protCereale + protLegumineuse + protLaitier + protLegume + protB12).toFixed(1));

  // 2. CALCUL DE LA VITAMINE B12 (µg)
  const b12Laitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.b12 || 0) * qtyLaitier) / 100;
  const b12Source = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.b12 || 0) * qtyB12) / 100;
  const totalB12 = parseFloat((b12Laitier + b12Source).toFixed(2));

  // 3. CALCUL DES CALORIES TOTALES (kcal)
  const calCereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.cal || 0) * qtyCereale) / 100;
  const calLegumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.cal || 0) * qtyLegumineuse) / 100;
  const calLaitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.cal || 0) * qtyLaitier) / 100;
  const calLegume = (parseFloat(legumeSelect.options[legumeSelect.selectedIndex]?.dataset.cal || 0) * qtyLegume) / 100;
  const calB12 = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.cal || 0) * qtyB12) / 100;

  const totalCal = Math.round(calCereale + calLegumineuse + calLaitier + calLegume + calB12);

  // 4. ÉVALUATION DE LA VALEUR BIOLOGIQUE (SCORE %)
  const hasAssociation = cerealeSelect.value !== "" && legumineuseSelect.value !== "" && qtyCereale > 0 && qtyLegumineuse > 0;
  const isCompleteSource = (protLaitier >= 8) || isCerealeComplete || isLegumineuseComplete;

  let qualityScore = 60;
  if (hasAssociation || isCompleteSource) {
    qualityScore = 100; // Profil aminé complet
  }

  // 5. AFFICHAGE DANS L'INTERFACE
  document.getElementById('total-protein').innerText = totalProt;
  document.getElementById('quality-score').innerText = qualityScore + "%";
  document.getElementById('total-b12').innerText = totalB12;
  document.getElementById('total-calories').innerText = totalCal;

  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const portionAdviceText = document.getElementById('portion-advice-text');
  const b12StatusText = document.getElementById('b12-status-text');

  if (qualityScore === 100 && totalProt >= 18) {
    resultTitle.innerText = "🎯 Équivalent Viande Ajusté !";
    resultText.innerText = `Quantités ajustées (${qtyCereale}g / ${qtyLegumineuse}g) pour obtenir exactement 20g de protéines complètes à haute valeur biologique.`;
 } else if (qualityScore === 100) {
  resultTitle.innerText = "✅ Profil aminé complet";
  resultText.innerText = `Profil complet, mais seulement ${totalProt}g de protéines : augmentez les portions pour égaler un steak.`;
  } else {
    resultTitle.innerText = "⚠️ Association partielle";
    resultText.innerText = "Ajoutez une légumineuse pour associer avec votre céréale et obtenir un profil aminé optimal.";
  }

  if (totalProt >= 18) {
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
