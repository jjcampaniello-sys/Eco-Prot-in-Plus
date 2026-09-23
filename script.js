document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-submit').addEventListener('click', calculerAssoc);
});

function calculerAssoc() {
  const cerealeSelect = document.getElementById('cereale');
  const legumineuseSelect = document.getElementById('legumineuse');
  const laitierSelect = document.getElementById('laitier-source');
  const legumeSelect = document.getElementById('legume');
  const b12Select = document.getElementById('b12-source');

  const qtyCereale = parseFloat(document.getElementById('qty-cereale').value) || 0;
  const qtyLegumineuse = parseFloat(document.getElementById('qty-legumineuse').value) || 0;
  const qtyLaitier = parseFloat(document.getElementById('qty-laitier').value) || 0;
  const qtyLegume = parseFloat(document.getElementById('qty-legume').value) || 0;
  const qtyB12 = parseFloat(document.getElementById('qty-b12').value) || 0;

  // Récupération des apports en protéines
  const protCereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.prot || 0) * qtyCereale) / 100;
  const protLegumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.prot || 0) * qtyLegumineuse) / 100;
  const protLaitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.prot || 0) * qtyLaitier) / 100;
  const protLegume = (parseFloat(legumeSelect.options[legumeSelect.selectedIndex]?.dataset.prot || 0) * qtyLegume) / 100;
  const protB12 = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.prot || 0) * qtyB12) / 100;

  const totalProt = parseFloat((protCereale + protLegumineuse + protLaitier + protLegume + protB12).toFixed(1));

  // Récupération B12
  const b12Laitier = (parseFloat(laitierSelect.options[laitierSelect.selectedIndex]?.dataset.b12 || 0) * qtyLaitier) / 100;
  const b12Source = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.b12 || 0) * qtyB12) / 100;
  const totalB12 = parseFloat((b12Laitier + b12Source).toFixed(2));

  // ANALYSE QUALITATIVE (VALEUR BIOLOGIQUE)
  const isCerealeComplete = cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.complete === "true";
  const isLegumineuseComplete = legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.complete === "true";
  const isLaitierComplete = laitierSelect.options[laitierSelect.selectedIndex]?.dataset.complete === "true";

  const hasCereale = qtyCereale > 20 && cerealeSelect.value !== "";
  const hasLegumineuse = qtyLegumineuse > 20 && legumineuseSelect.value !== "";

  let qualityScore = 60; // Base protéines végétales seules/incomplètes

  if (isLaitierComplete && protLaitier >= 10) {
    // Si apport suffisant de produits laitiers/oeufs (Skyr, Fromage Blanc, etc.)
    qualityScore = 100; 
  } else if (isCerealeComplete || isLegumineuseComplete) {
    qualityScore = 95; // Soja / Quinoa / Sarrasin
  } else if (hasCereale && hasLegumineuse) {
    qualityScore = 90; // Complémentarité Céréale + Légumineuse
  } else if (isLaitierComplete && protLaitier > 0) {
    qualityScore = 80; // Un peu de produit laitier, mais dose faible
  }

  // MISE À JOUR DE L'AFFICHAGE
  document.getElementById('total-protein').innerText = totalProt + " g";
  document.getElementById('quality-score').innerText = qualityScore + "%";
  document.getElementById('total-b12').innerText = totalB12 + " µg";

  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const portionAdviceText = document.getElementById('portion-advice-text');
  const b12StatusText = document.getElementById('b12-status-text');

  // Diagnostic Qualité + Quantité
  const effectiveProtein = Math.round(totalProt * (qualityScore / 100));

  if (totalProt >= 20 && qualityScore >= 90) {
    resultTitle.innerText = "🏆 Équivalent Viande Parfait !";
    resultTitle.style.color = "#2e7d32";
    resultText.innerText = `Ce repas apporte l'équivalent réel de 100g de viande (~20g de protéines complètes à haute valeur biologique).`;
  } else if (totalProt >= 20 && qualityScore < 90) {
    resultTitle.innerText = "⚠️ Quantité suffisante, mais profil incomplet";
    resultTitle.style.color = "#ed6c02";
    resultText.innerText = `Vous avez ${totalProt}g de protéines, mais en raison d'un profil en acides aminés déséquilibré, l'assimilation équivaut seulement à ~${effectiveProtein}g de protéines de viande. Associez une céréale et une légumineuse.`;
  } else {
    resultTitle.innerText = "💡 Repas léger en protéines";
    resultTitle.style.color = "#d32f2f";
    resultText.innerText = `Il manque environ ${(20 - totalProt).toFixed(1)}g de protéines pour atteindre la dose cible d'un plat principal.`;
  }

  // Diagnostic B12
  if (totalB12 >= 2.5) {
    b12StatusText.innerText = "🎯 B12 : Besoins journaliers 100% couverts par ce repas.";
    b12StatusText.style.color = "#2e7d32";
  } else if (totalB12 > 0) {
    b12StatusText.innerText = `👍 B12 : Apport partiel (${totalB12} µg sur 2.5 µg recommandés par jour).`;
    b12StatusText.style.color = "#ed6c02";
  } else {
    b12StatusText.innerText = "⚠️ B12 : 0 µg. Pas de vitamine B12 dans ce repas.";
    b12StatusText.style.color = "#d32f2f";
  }

  document.getElementById('result').style.display = "block";
}
