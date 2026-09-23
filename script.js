document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-submit').addEventListener('click', calculerAssoc);
});

function calculerAssoc() {
  const cerealeSelect = document.getElementById('cereale');
  const legumineuseSelect = document.getElementById('legumineuse');
  const laitierSelect = document.getElementById('laitier');
  const legumeSelect = document.getElementById('legume');
  const b12Select = document.getElementById('b12-source');

  const qtyCereale = parseFloat(document.getElementById('qty-cereale').value) || 0;
  const qtyLegumineuse = parseFloat(document.getElementById('qty-legumineuse').value) || 0;
  const qtyLaitier = parseFloat(document.getElementById('qty-laitier').value) || 0;
  const qtyLegume = parseFloat(document.getElementById('qty-legume').value) || 0;
  const qtyB12 = parseFloat(document.getElementById('qty-b12').value) || 0;

  if (!cerealeSelect.value && !legumineuseSelect.value && !laitierSelect.value && !legumeSelect.value && !b12Select.value) {
    alert("Veuillez choisir au moins un aliment.");
    return;
  }

  // Calcul Protéines (g)
  const protCereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.prot || 0) * qtyCereale) / 100;
  const protLegumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.prot || 0) * qtyLegumineuse) / 100;
  const protLaitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.prot || 0) * qtyLaitier) / 100;
  const protLegume = (parseFloat(legumeSelect.options[legumeSelect.selectedIndex]?.dataset.prot || 0) * qtyLegume) / 100;
  const protB12 = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.prot || 0) * qtyB12) / 100;

  const totalProt = parseFloat((protCereale + protLegumineuse + protLaitier + protLegume + protB12).toFixed(1));

  // Calcul B12 (µg)
  const b12Laitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.b12 || 0) * qtyLaitier) / 100;
  const b12Source = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.b12 || 0) * qtyB12) / 100;

  const totalB12 = parseFloat((b12Laitier + b12Source).toFixed(2));

  // Calcul Calories (kcal)
  const calCereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.cal || 0) * qtyCereale) / 100;
  const calLegumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.cal || 0) * qtyLegumineuse) / 100;
  const calLaitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.cal || 0) * qtyLaitier) / 100;
  const calLegume = (parseFloat(legumeSelect.options[legumeSelect.selectedIndex]?.dataset.cal || 0) * qtyLegume) / 100;
  const calB12 = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.cal || 0) * qtyB12) / 100;

  const totalCal = Math.round(calCereale + calLegumineuse + calLaitier + calLegume + calB12);

  // EVALUATION DE LA QUALITE AMINEE
  const isCerealeComplete = cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.complete === "true";
  const isLegumineuseComplete = legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.complete === "true";
  const isLaitierComplete = laitierSelect.options[laitierSelect.selectedIndex]?.dataset.complete === "true";

  const hasCereale = qtyCereale > 0 && cerealeSelect.value !== "";
  const hasLegumineuse = qtyLegumineuse > 0 && legumineuseSelect.value !== "";

  let qualityScore = 60; // Valeur de base pour protéines végétales isolées

  if (isLaitierComplete && protLaitier >= 8) {
    qualityScore = 100; // Protéine animale complète en quantité suffisante
  } else if (isCerealeComplete || isLegumineuseComplete) {
    qualityScore = 95;  // Protéine végétale complète (Soja, Quinoa, Sarrasin)
  } else if (hasCereale && hasLegumineuse) {
    qualityScore = 90;  // Association Céréale + Légumineuse
  } else if (isLaitierComplete && protLaitier > 0) {
    qualityScore = 80;  // Un peu de produit laitier
  }

  // AFFICHAGE DES VALEURS
  document.getElementById('total-protein').innerText = totalProt;
  document.getElementById('quality-score').innerText = qualityScore + "%";
  document.getElementById('total-b12').innerText = totalB12;
  document.getElementById('total-calories').innerText = totalCal;

  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const portionAdviceText = document.getElementById('portion-advice-text');
  const b12StatusText = document.getElementById('b12-status-text');

  // Diagnostic
  const effectiveProt = Math.round(totalProt * (qualityScore / 100));

  if (totalProt < 12) {
    resultTitle.innerText = "⚠️ Quantité de protéines insuffisante";
    resultText.innerText = "La dose globale est trop faible pour un repas principal (dose cible : ~20g).";
  } else if (qualityScore >= 90) {
    resultTitle.innerText = "✅ Excellent profil d'acides aminés !";
    resultText.innerText = "L'association de vos aliments garantit une assimilation optimale par l'organisme.";
  } else {
    resultTitle.innerText = "⚠️ Profil aminé incomplet";
    resultText.innerText = "La quantité est là, mais le manque d'association limite l'assimilation globale des protéines.";
  }

  // Équivalent viande
  if (effectiveProt >= 18) {
    portionAdviceText.innerText = `🍗 Équivalent viande atteint ! Vos ${totalProt}g de protéines assimilables égalent une portion de viande (~100g).`;
    portionAdviceText.style.color = "#2e7d32";
  } else {
    portionAdviceText.innerText = `💡 En dessous d'une portion de viande : Vos protéines assimilables (${effectiveProt}g) sont inférieures à la cible (~20g).`;
    portionAdviceText.style.color = "#ed6c02";
  }

  // B12
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
