document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-submit').addEventListener('click', ajusterEtCalculer);
});

function ajusterEtCalculer() {
  const cereale = document.getElementById('cereale');
  const legumineuse = document.getElementById('legumineuse');
  const laitier = document.getElementById('laitier');
  const legume = document.getElementById('legume');

  const cOpt = cereale.options[cereale.selectedIndex];
  const lOpt = legumineuse.options[legumineuse.selectedIndex];
  const dOpt = laitier.options[laitier.selectedIndex];
  const vOpt = legume.options[legume.selectedIndex];

  if (!cOpt.value && !lOpt.value && !dOpt.value && !vOpt.value) {
    alert("Veuillez choisir au moins un aliment.");
    return;
  }

  let qtyCereale = 0, qtyLegumineuse = 0, qtyLaitier = 0, qtyLegume = vOpt.value ? 150 : 0;
  let qualityScore = 60;

  // Calcul intelligent des portions cibles (~20g prot)
  if (dOpt.value) {
    qualityScore = 100;
    if (cOpt.value && lOpt.value) { qtyLaitier = 100; qtyCereale = 50; qtyLegumineuse = 40; }
    else if (cOpt.value) { qtyLaitier = 120; qtyCereale = 60; }
    else if (lOpt.value) { qtyLaitier = 120; qtyLegumineuse = 50; }
    else { qtyLaitier = Math.round((20 / parseFloat(dOpt.dataset.prot)) * 100); }
  } else if (cOpt.value && lOpt.value) {
    qualityScore = 95;
    qtyCereale = 65; 
    qtyLegumineuse = 45; 
  } else if (cOpt.value) {
    qtyCereale = Math.round((20 / parseFloat(cOpt.dataset.prot)) * 100);
  } else if (lOpt.value) {
    qtyLegumineuse = Math.round((20 / parseFloat(lOpt.dataset.prot)) * 100);
  }

  // Totaux
  const items = [
    { opt: cOpt, qty: qtyCereale, name: "Céréale" },
    { opt: lOpt, qty: qtyLegumineuse, name: "Légumineuse" },
    { opt: dOpt, qty: qtyLaitier, name: "Produit laitier" },
    { opt: vOpt, qty: qtyLegume, name: "Légume" }
  ];

  let totalProt = 0, totalCal = 0, totalB12 = 0;
  let details = [];

  items.forEach(item => {
    if (item.opt && item.opt.value && item.qty > 0) {
      const p = (parseFloat(item.opt.dataset.prot) * item.qty) / 100;
      const c = (parseFloat(item.opt.dataset.cal) * item.qty) / 100;
      const b = (parseFloat(item.opt.dataset.b12 || 0) * item.qty) / 100;

      totalProt += p;
      totalCal += c;
      totalB12 += b;
      details.push(`${item.qty}g de ${item.opt.text}`);
    }
  });

  // Remplissage interface (Design d'origine)
  document.getElementById('total-protein').innerText = Math.round(totalProt) + "g";
  document.getElementById('quality-score').innerText = qualityScore + "%";
  document.getElementById('total-calories').innerText = Math.round(totalCal) + " kcal";

  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const adviceEl = document.getElementById('portion-advice-text');
  const b12El = document.getElementById('b12-status-text');

  if (qualityScore >= 90) {
    resultTitle.innerText = "🏆 Équivalent Viande Atteint !";
    resultTitle.style.color = "#2e7d32";
    resultText.innerText = "Portions optimales calculées : " + details.join(" + ");
    adviceEl.innerText = "✅ Profil aminé complet : la valeur biologique de ce repas égale parfaitement celle d'une pièce de viande.";
    adviceEl.style.color = "#2e7d32";
  } else {
    resultTitle.innerText = "⚠️ Repas déséquilibré en acides aminés";
    resultTitle.style.color = "#ed6c02";
    resultText.innerText = "Portions proposées : " + details.join(" + ");
    adviceEl.innerText = "💡 Astuce : Associez une céréale et une légumineuse (ou un produit laitier) pour atteindre 100% de valeur biologique.";
    adviceEl.style.color = "#ed6c02";
  }

  if (totalB12 >= 2.5) {
    b12El.innerText = `🎯 Vitamine B12 : ${totalB12.toFixed(1)} µg (Besoins du jour totalement couverts !).`;
    b12El.style.color = "#2e7d32";
  } else if (totalB12 > 0) {
    b12El.innerText = `👍 Vitamine B12 : ${totalB12.toFixed(1)} µg (Apport partiel).`;
    b12El.style.color = "#ed6c02";
  } else {
    b12El.innerText = "⚠️ Vitamine B12 : 0 µg. Pensez à compléter.";
    b12El.style.color = "#d32f2f";
  }

  document.getElementById('result').style.display = "block";
}
