// ===== JS DYNAMIQUE POUR FORMULAIRE MULTI-RÉFÉRENCES AAI =====

const addBtn = document.getElementById("add-reference-btn");
const container = document.getElementById("references-container");

addBtn.addEventListener("click", () => {
  const clone = container.querySelector(".reference-block").cloneNode(true);
  clone.querySelectorAll("input, textarea, select").forEach(input => input.value = "");
  clone.querySelector(".pense-bete").classList.add("hidden");
  container.appendChild(clone);
});

container.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    const blocks = container.querySelectorAll(".reference-block");
    if (blocks.length > 1) {
      e.target.closest(".reference-block").remove();
    }
  }
});

container.addEventListener("change", (e) => {
  if (e.target.classList.contains("type-produit")) {
    const block = e.target.closest(".reference-block");
    const penseBete = block.querySelector(".pense-bete");
    if (e.target.value === "garantie") {
      penseBete.classList.remove("hidden");
    } else {
      penseBete.classList.add("hidden");
    }
  }
});

// Soumission du formulaire vers Apps Script
const retourForm = document.getElementById("retour-form");
retourForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(retourForm);
  const retour = {
    CLIENT: formData.get("CLIENT"),
    NUM_CLIENT: formData.get("NUM_CLIENT"),
    MAGASIN: formData.get("MAGASIN"),
    NUM_MAGASIN: formData.get("NUM_MAGASIN"),
    DATE: formData.get("DATE"),
    NUM_COMMERCIAL: "", // à remplir si utile
    REFERENCES: []
  };

  const refs = container.querySelectorAll(".reference-block");
  refs.forEach(block => {
    retour.REFERENCES.push({
      REFERENCE: block.querySelector('[name="REFERENCE[]"]').value,
      MOTIF: block.querySelector('[name="MOTIF[]"]').value,
      TYPE: block.querySelector('[name="TYPE[]"]').value,
      OBSERVATIONS: block.querySelector('[name="OBSERVATIONS[]"]').value
    });
  });

  try {
    const response = await fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
      method: "POST",
      body: JSON.stringify({
        action: "createRetour",
        retour,
      }),
    });
    const result = await response.json();
    if (result.success) {
      alert("Retour enregistré avec le n° : " + result.numero);
      retourForm.reset();
      container.innerHTML = "";
      container.appendChild(document.querySelector(".reference-block").cloneNode(true));
    } else {
      alert("Erreur : " + result.error);
    }
  } catch (err) {
    console.error(err);
    alert("Erreur de connexion au serveur.");
  }
});
