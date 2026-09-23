document.addEventListener('DOMContentLoaded', () => {
  const btnSubmit = document.getElementById('btn-submit');
  btnSubmit.addEventListener('click', calculerAssoc);
});

function calculerAssoc() {
  const cerealeSelect = document.getElementById('cereale');
  const legumineuseSelect = document.getElementById('legumineuse');
  const animalSelect = document.getElementById('animal-source');
  const b12Select = document.getElementById('b12-source');

  const qtyCereale = parseFloat(document.getElementById('qty-cereale').value) || 0;
  const qtyLegumineuse = parseFloat(document.getElementById('qty-legumineuse').value) || 0;
  const qtyAnimal = parseFloat(document.getElementById('qty-animal').value) || 0;
  const qtyB12 = parseFloat(document.getElementById('qty-b12').value) || 0;

  if (!cerealeSelect.value && !legumineuseSelect.value && !animalSelect.value && !b12Select.value) {
    alert("Veuillez sélectionner au moins un aliment.");
    return;
  }

  // Calcul Protéines (g)
  const protCereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.prot || 0) * qtyCereale) / 100;
  const protLegumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.prot || 0) * qtyLegumineuse) / 100;
  const protAnimal = (parseFloat(animalSelect.options[animalSelect.selectedIndex]?.dataset.prot || 0) * qtyAnimal) / 100;
  const protB12 = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.prot || 0) * qtyB12) / 100;

  const totalProt = (protCereale + protLegumineuse + protAnimal + protB12).toFixed(1);

  // Calcul B12 (µg)
  const b12Cereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.b12 || 0) * qtyCereale) / 100;
  const b12Legumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.b12 || 0) * qtyLegumineuse) / 100;
  const b12Animal = (parseFloat(animalSelect.options[animalSelect.selectedIndex]?.dataset.b12 || 0) * qtyAnimal) / 100;
  const b12Source = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.b12 || 0) * qtyB12) / 100;

  const totalB12 = (b12Cereale + b12Legumineuse + b12Animal + b12Source).toFixed(2);

  // Calcul Calories (kcal)
  const calCereale = (parseFloat(cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.cal || 0) * qtyCereale) / 100;
  const calLegumineuse = (parseFloat(legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.cal || 0) * qtyLegumineuse) / 100;
  const calAnimal = (parseFloat(animalSelect.options[animalSelect.selectedIndex]?.dataset.cal || 0) * qtyAnimal) / 100;
  const calB12 = (parseFloat(b12Select.options[b12Select.selectedIndex]?.dataset.cal || 0) * qtyB12) / 100;

  const totalCal = Math.round(calCereale + calLegumineuse + calAnimal + calB12);

  // Vérification de la qualité des protéines
  const isCerealeComplete = cerealeSelect.options[cerealeSelect.selectedIndex]?.dataset.complete === "true";
  const isLegumineuseComplete = legumineuseSelect.options[legumineuseSelect.selectedIndex]?.dataset.complete === "true";
  const isAnimalComplete = animalSelect.options[animalSelect.selectedIndex]?.dataset.complete === "true";

  const resultDiv = document.getElementById('result');
  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const totalProteinSpan = document.getElementById('total-protein');
  const totalB12Span = document.getElementById('total-b12');
  const totalCaloriesSpan = document.getElementById('total-calories');
  const b12StatusText = document.getElementById('b12-status-text');
  const portionAdviceText = document.getElementById('portion-advice-text');

  if (isAnimalComplete || isCerealeComplete || isLegumineuseComplete) {
    resultTitle.innerText = "✅ Excellent profil d'acides aminés !";
    resultText.innerText = "Votre plat contient une source de protéines complètes (œufs/laitages, tofu, tempeh, quinoa ou sarrasin).";
  } else if (cerealeSelect.value && legumineuseSelect.value) {
    resultTitle.innerText = "👌 Association parfaite !";
    resultText.innerText = "L'association Céréale + Légumineuse garantit un profil complet d'acides aminés.";
  } else {
    resultTitle.innerText = "⚠️ Protéines incomplètes";
    resultText.innerText = "Associez des céréales avec des légumineuses, ou ajoutez des œufs, des produits laitiers ou du tofu.";
  }

  // Évaluation du total de protéines vs Viande
  if (totalProt >= 20) {
    portionAdviceText.innerText = "🍗 Équivalent viande atteint ! Vous obtenez la dose de protéines d'un steak standard de 100g (~20-25g).";
    portionAdviceText.style.color = "#2e7d32";
  } else {
    portionAdviceText.innerText = `💡 Pour atteindre un apport comparable à un steak (20g de protéines), augmentez un peu les portions (il manque environ ${(20 - totalProt).toFixed(1)}g).`;
    portionAdviceText.style.color = "#ed6c02";
  }

  // Évaluation B12
  if (totalB12 >= 2.5) {
    b12StatusText.innerText = "🎯 B12 : Excellent ! Vos besoins journaliers en vitamine B12 sont complètement couverts.";
    b12StatusText.style.color = "#2e7d32";
  } else if (totalB12 > 0) {
    b12StatusText.innerText = "👍 B12 : Bon apport (partiel). Un complément ou une autre source sur la journée complètera votre besoin.";
    b12StatusText.style.color = "#ed6c02";
  } else {
    b12StatusText.innerText = "⚠️ B12 : 0 µg. Ce repas ne contient pas de vitamine B12. Pensez à une supplémentation.";
    b12StatusText.style.color = "#d32f2f";
  }

  totalProteinSpan.innerText = totalProt;
  totalB12Span.innerText = totalB12;
  totalCaloriesSpan.innerText = totalCal;
  resultDiv.style.display = "block";
}
