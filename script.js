document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-submit').addEventListener('click', calculerAssoc);
});

function calculerAssoc() {
  const cerealeSelect = document.getElementById('cereale');
  const legumineuseSelect = document.getElementById('legumineuse');
  const laitierSelect = document.getElementById('laitier');
  const legumeSelect = document.getElementById('legume');
  const b12Select = document.getElementById('b12-source');

  // Quantités saisies par l'utilisateur
  let qtyCereale = parseFloat(document.getElementById('qty-cereale').value) || 0;
  let qtyLegumineuse = parseFloat(document.getElementById('qty-legumineuse').value) || 0;
  let qtyLaitier = parseFloat(document.getElementById('qty-laitier').value) || 0;
  let qtyLegume = parseFloat(document.getElementById('qty-legume').value) || 0;
  let qtyB12 = parseFloat(document.getElementById('qty-b12').value) || 0;

  if (!cerealeSelect.value && !legumineuseSelect.value && !laitierSelect.value && !legumeSelect.value && !b12Select.value) {
    alert("Veuillez choisir au moins un aliment.");
    return;
  }

  const isCerealeComplete = cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.complete === "true";
  const isLegumineuseComplete = legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.complete === "true";
  const isLaitierComplete = laitierSelect.options[laitierSelect.selectedIndex]?.dataset.complete === "true";

  const hasCereale = qtyCereale > 0 && cerealeSelect.value !== "";
  const hasLegumineuse = legumineuseSelect.value !== "";

  // 1. AJUSTEMENT AUTOMATIQUE DES QUANTITÉS
  // Si une céréale et une légumineuse incomplètes sont choisies, la quantité de légumineuse 
  // est ajustée pour respecter le ratio d'équilibre en acides aminés (~65% du poids de la céréale).
  if (hasCereale && hasLegumineuse && !isCerealeComplete && !isLegumineuseComplete) {
    qtyLegumineuse = Math.round(qtyCereale * 0.65);
    document.getElementById('qty-legumineuse').value = qtyLegumineuse;
  }

  // 2. CALCUL DES PROTÉINES TOTALES (g)
  const protCereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.prot || 0) * qtyCereale) / 100;
  const protLegumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.prot || 0) * qtyLegumineuse) / 100;
  const protLaitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.prot || 0) * qtyLaitier) / 100;
  const protLegume = (parseFloat(legumeSelect.options[legumeSelect.selectedIndex]?.dataset.prot || 0) * qtyLegume) / 100;
  const protB12 = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.prot || 0) * qtyB12) / 100;

  const totalProt = parseFloat((protCereale + protLegumineuse + protLaitier + protLegume + protB12).toFixed(1));

  // 3. CALCUL DE LA VITAMINE B12 (µg)
  const b12Laitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.b12 || 0) * qtyLaitier) / 100;
  const b12Source = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.b12 || 0) * qtyB12) / 100;
  const totalB12 = parseFloat((b12Laitier + b12Source).toFixed(2));

  // 4. CALCUL DES CALORIES TOTALES (kcal)
  const calCereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.cal || 0) * qtyCereale) / 100;
  const calLegumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.cal || 0) * qtyLegumineuse) / 100;
  const calLaitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.cal || 0) * qtyLaitier) / 100;
  const calLegume = (parseFloat(legumeSelect.options[legumeSelect.selectedIndex]?.dataset.cal || 0) * qtyLegume) / 100;
  const calB12 = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.cal || 0) * qtyB12) / 100;

  const totalCal = Math.round(calCereale + calLegumineuse + calLaitier + calLegume + calB12);

  // 5. ÉVALUATION RIGOUREUSE DE LA VALEUR BIOLOGIQUE (VS PORTION DE VIANDE ~18g-20g PROT)
  let qualityScore = 0;
  const isComplementary = (hasCereale && qtyLegumineuse > 0);
  const hasCompleteProteinSource = isLaitierComplete || isCerealeComplete || isLegumineuseComplete || isComplementary;

  if (totalProt >= 18) {
    // Si la dose protéique cible d'un repas principal est atteinte :
    qualityScore = hasCompleteProteinSource ? 100 : 65;
  } else if (totalProt > 0) {
    // Si la dose est inférieure à une portion de viande, le score est proportionnel à la quantité atteinte
    let baseRatio = (totalProt / 18);
    if (hasCompleteProteinSource) {
      qualityScore = Math.min(100, Math.round(baseRatio * 100));
    } else {
      qualityScore = Math.min(65, Math.round(baseRatio * 65));
    }
  }

  // 6. AFFICHAGE DANS L'INTERFACE
  document.getElementById('total-protein').innerText = totalProt;
  document.getElementById('quality-score').innerText = qualityScore + "%";
  document.getElementById('total-b12').innerText = totalB12;
  document.getElementById('total-calories').innerText = totalCal;

  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const portionAdviceText = document.getElementById('portion-advice-text');
  const b12StatusText = document.getElementById('b12-status-text');

  const effectiveProt = Math.round(totalProt * (qualityScore / 100));

  if (qualityScore >= 90) {
    resultTitle.innerText = "🏆 Équivalent Viande Atteint !";
    resultText.innerText = "L'association ET les quantités sont suffisantes pour égaler une portion de viande (~100g).";
  } else if (totalProt < 12) {
    resultTitle.innerText = "⚠️ Quantité insuffisante";
    resultText.innerText = "Même avec la bonne association d'acides aminés, les doses saisies sont trop faibles pour égaler une portion de viande.";
  } else {
    resultTitle.innerText = "⚠️ Profil aminé ou quantité incomplète";
    resultText.innerText = "Pensez à associer une céréale et une légumineuse en quantités suffisantes.";
  }

  if (effectiveProt >= 18) {
    portionAdviceText.innerText = `🍗 Équivalent viande atteint ! Vous obtenez ${totalProt}g de protéines complètes à haute valeur biologique.`;
    portionAdviceText.style.color = "#2e7d32";
  } else {
    portionAdviceText.innerText = `💡 En dessous d'une portion de viande : Vos protéines assimilables (${effectiveProt}g) sont inférieures à la cible (~18-20g).`;
    portionAdviceText.style.color = "#ed6c02";
  }

  if (totalB12 >= 2.5) {
    b12StatusText.innerText = "🎯 Vitamine B12 : Besoins journaliers entièrement couverts.";
    b12StatusText.style.color = "#2e7d32";
  } else if (totalB12 > 0) {
    b12StatusText.innerText = "👍 Vitamine B12 : Apport partiel.";
    b12StatusText.style.color = "#ed6c02";
  } else {
    b12StatusText.innerText = "⚠️ Vitamine B12 : 0 µg. Repas sans B12.";
    b12StatusText.style.color = "#d32f2f";
  }

  document.getElementById('result').style.display = "block";
}
