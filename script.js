document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-submit').addEventListener('click', calculerAssoc);
});

function calculerAssoc() {
  const cerealeSelect = document.getElementById('cereale');
  const legumineuseSelect = document.getElementById('legumineuse');
  const laitierSelect = document.getElementById('laitier');
  const legumeSelect = document.getElementById('legume');
  const b12Select = document.getElementById('b12-source');

  // Quantités de base saisies par l'utilisateur
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

  // AJUSTEMENT AUTOMATIQUE : Si une céréale et une légumineuse sont sélectionnées,
  // la quantité de légumineuse s'ajuste automatiquement sur la quantité de céréale
  // pour obtenir le ratio optimal (Lysine / Méthionine) équivalent à la viande.
  if (hasCereale && hasLegumineuse && !isCerealeComplete && !isLegumineuseComplete) {
    qtyLegumineuse = Math.round(qtyCereale * 0.65);
    document.getElementById('qty-legumineuse').value = qtyLegumineuse;
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

  // Calcul Calories (kcal) basées sur les quantités réelles ajustées
  const calCereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.cal || 0) * qtyCereale) / 100;
  const calLegumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.cal || 0) * qtyLegumineuse) / 100;
  const calLaitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.cal || 0) * qtyLaitier) / 100;
  const calLegume = (parseFloat(legumeSelect.options[legumeSelect.selectedIndex]?.dataset.cal || 0) * qtyLegume) / 100;
  const calB12 = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.cal || 0) * qtyB12) / 100;

  const totalCal = Math.round(calCereale + calLegumineuse + calLaitier + calLegume + calB12);

  // EVALUATION DE LA VALEUR BIOLOGIQUE ATTEINTE
  let qualityScore = 60;

  if (isLaitierComplete && protLaitier >= 8) {
    qualityScore = 100;
  } else if ((isCerealeComplete && qtyCereale > 0) || (isLegumineuseComplete && qtyLegumineuse > 0)) {
    qualityScore = 100;
  } else if (hasCereale && qtyLegumineuse > 0) {
    qualityScore = 100; // 100% atteint grâce à l'ajustement du ratio d'acides aminés
  } else if (isLaitierComplete && protLaitier > 0) {
    qualityScore = 80;
  }

  // AFFICHAGE DES RÉSULTATS DANS LA GRILLE DU DESIGN INITIAL
  document.getElementById('total-protein').innerText = totalProt;
  document.getElementById('quality-score').innerText = qualityScore + "%";
  document.getElementById('total-b12').innerText = totalB12;
  document.getElementById('total-calories').innerText = totalCal;

  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const portionAdviceText = document.getElementById('portion-advice-text');
  const b12StatusText = document.getElementById('b12-status-text');

  const effectiveProt = Math.round(totalProt * (qualityScore / 100));

  if (qualityScore === 100) {
    resultTitle.innerText = "🎯 Équilibre en Acides Aminés Ajusté !";
    resultText.innerText = "La quantité de légumineuse a été ajustée pour offrir un profil d'acides aminés équivalent à celui de la viande.";
  } else {
    resultTitle.innerText = "⚠️ Profil aminé incomplet";
    resultText.innerText = "Sélectionnez également une légumineuse pour permettre l'ajustement de l'équilibre aminé.";
  }

  if (effectiveProt >= 18) {
    portionAdviceText.innerText = `🍗 Équivalent viande atteint ! Vous obtenez ${totalProt}g de protéines complètes à haute valeur biologique.`;
    portionAdviceText.style.color = "#2e7d32";
  } else {
    portionAdviceText.innerText = `💡 Portion globale légère (${effectiveProt}g assimilables). Augmentez la quantité de céréale si c'est un plat principal.`;
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
