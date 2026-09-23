document.addEventListener('DOMContentLoaded', () => {
  const btnSubmit = document.getElementById('btn-submit');
  btnSubmit.addEventListener('click', calculerAssoc);
});

function calculerAssoc() {
  const cerealeSelect = document.getElementById('cereale');
  const legumineuseSelect = document.getElementById('legumineuse');
  const graineSelect = document.getElementById('graine');
  const b12Select = document.getElementById('b12-source');

  const qtyCereale = parseFloat(document.getElementById('qty-cereale').value) || 0;
  const qtyLegumineuse = parseFloat(document.getElementById('qty-legumineuse').value) || 0;
  const qtyGraine = parseFloat(document.getElementById('qty-graine').value) || 0;
  const qtyB12 = parseFloat(document.getElementById('qty-b12').value) || 0;

  if (!cerealeSelect.value && !legumineuseSelect.value && !b12Select.value) {
    alert("Veuillez sélectionner au moins un aliment principal.");
    return;
  }

  // Calcul Protéines
  const protCereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.prot || 0) * qtyCereale) / 100;
  const protLegumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.prot || 0) * qtyLegumineuse) / 100;
  const protGraine = (parseFloat(graineSelect.options[graineSelect.selectedIndex]?.dataset.prot || 0) * qtyGraine) / 100;
  const protB12 = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.prot || 0) * qtyB12) / 100;

  const totalProt = (protCereale + protLegumineuse + protGraine + protB12).toFixed(1);

  // Calcul B12
  const b12Cereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.b12 || 0) * qtyCereale) / 100;
  const b12Legumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.b12 || 0) * qtyLegumineuse) / 100;
  const b12Graine = (parseFloat(graineSelect.options[graineSelect.selectedIndex]?.dataset.b12 || 0) * qtyGraine) / 100;
  const b12Source = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.b12 || 0) * qtyB12) / 100;

  const totalB12 = (b12Cereale + b12Legumineuse + b12Graine + b12Source).toFixed(2);

  // Vérification de la complémentarité des protéines
  const isCerealeComplete = cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.complete === "true";
  const isLegumineuseComplete = legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.complete === "true";
  const isB12Complete = b12Select.options[b12Select.selectedIndex]?.dataset.complete === "true";

  const resultDiv = document.getElementById('result');
  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const totalProteinSpan = document.getElementById('total-protein');
  const totalB12Span = document.getElementById('total-b12');
  const b12StatusText = document.getElementById('b12-status-text');

  if (isCerealeComplete || isLegumineuseComplete || isB12Complete) {
    resultTitle.innerText = "✅ Excellent profil protéique !";
    resultText.innerText = "L'un des aliments choisis apporte un profil complet en acides aminés essentiels (équivalent viande).";
  } else if (cerealeSelect.value && legumineuseSelect.value) {
    resultTitle.innerText = "👌 Association protéique parfaite !";
    resultText.innerText = "L'association Céréale (riches en Méthionine) + Légumineuse (riches en Lysine) garantit une protéine complète.";
  } else {
    resultTitle.innerText = "⚠️ Protéines incomplètes";
    resultText.innerText = "Associez une céréale avec une légumineuse pour former une protéine complète, ou ajoutez du tofu, quinoa ou sarrasin.";
  }

  // Évaluation B12
  if (totalB12 >= 2.5) {
    b12StatusText.innerText = "🎯 Excellent : Ce repas couvre la totalité des besoins journaliers recommandés en vitamine B12.";
    b12StatusText.style.color = "#2e7d32";
  } else if (totalB12 > 0) {
    b12StatusText.innerText = "👍 Bien : Ce repas apporte une contribution intéressante en vitamine B12.";
    b12StatusText.style.color = "#ed6c02";
  } else {
    b12StatusText.innerText = "⚠️ Attention : Ce repas ne contient pas de vitamine B12. Pensez à votre supplémentation.";
    b12StatusText.style.color = "#d32f2f";
  }

  totalProteinSpan.innerText = totalProt;
  totalB12Span.innerText = totalB12;
  resultDiv.style.display = "block";
}
