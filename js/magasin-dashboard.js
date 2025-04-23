// ===== INTEGRATION DASHBOARD MAGASIN - AAI =====

// Charge les stats et les retours du magasin connecté
async function chargerDashboardMagasin(user) {
  const section = document.getElementById("dashboard-magasin");
  const tableBody = document.getElementById("table-retours");

  section.classList.add("active");
  section.classList.remove("hidden");

  try {
    const response = await fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
      method: "POST",
      body: JSON.stringify({
        action: "getRetours",
        email: user.email
      }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    const retours = result.retours;
    let enAttente = 0, valides = 0, refuses = 0;
    let rows = "";

    retours.forEach(r => {
      if (r.STATUT === "En attente") enAttente++;
      if (r.STATUT === "Validé") valides++;
      if (r.STATUT === "Refusé") refuses++;

      const pdfCell = r.ID_RETOUR ? `<button onclick=\"telechargerPdf('${r.ID_RETOUR}')\">📄</button>` : "-";
      const actionCell = r.STATUT === "En attente" ?
        `<button class='btn-valider-retour' data-id='${r.ID_RETOUR}'>✅</button>
         <button class='btn-refuser-retour' data-id='${r.ID_RETOUR}'>❌</button>` : "-";

      rows += `<tr>
        <td>${r.DATE}</td>
        <td>${r.CLIENT}</td>
        <td>${r.REFERENCE}</td>
        <td>${r.MOTIF}</td>
        <td>${r.STATUT}</td>
        <td>${r.ID_RETOUR || "-"}</td>
        <td>${pdfCell}</td>
        <td>${r.MAGASINIER || ""}</td>
        <td>${actionCell}</td>
      </tr>`;
    });

    document.getElementById("stat-attente").textContent = enAttente;
    document.getElementById("stat-valides").textContent = valides;
    document.getElementById("stat-refuses").textContent = refuses;
    tableBody.innerHTML = rows;
    bindActionsMagasin();

  } catch (err) {
    console.error("Erreur chargement retours:", err);
    tableBody.innerHTML = `<tr><td colspan="9">Erreur de chargement des données</td></tr>`;
  }
}

function telechargerPdf(numero) {
  fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
    method: "POST",
    body: JSON.stringify({
      action: "getPdfByNumRetour",
      numero
    })
  })
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Retour-${numero}.pdf`;
    a.click();
  })
  .catch(err => alert("Erreur lors du téléchargement du PDF."));
}

// ===== MAGASIN - LOGIQUE DE VALIDATION / REFUS RETOURS =====

async function updateStatutRetour(idRetour, statut, motif = "") {
  try {
    const response = await fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
      method: "POST",
      body: JSON.stringify({
        action: "updateRetourStatut",
        idRetour,
        statut,
        motif,
        magasinier: CURRENT_USER_NOM || "Inconnu"
      })
    });
    const result = await response.json();
    if (result.success) {
      alert("Retour mis à jour avec succès.");
      chargerDashboardMagasin({ email: CURRENT_USER_EMAIL });
    } else {
      alert("Erreur: " + result.error);
    }
  } catch (err) {
    console.error("Erreur API statut retour:", err);
    alert("Erreur de connexion serveur.");
  }
}

function bindActionsMagasin() {
  document.querySelectorAll(".btn-valider-retour").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      updateStatutRetour(id, "Validé");
    };
  });

  document.querySelectorAll(".btn-refuser-retour").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      document.getElementById("popup-refus").classList.remove("hidden");
      document.getElementById("btn-envoyer-refus").onclick = () => {
        const motif = document.getElementById("motif-refus").value.trim();
        if (!motif) return alert("Merci de renseigner un motif de refus.");
        updateStatutRetour(id, "Refusé", motif);
        document.getElementById("popup-refus").classList.add("hidden");
        document.getElementById("motif-refus").value = "";
      };
    };
  });
} 
