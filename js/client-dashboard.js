// ===== CLIENT DASHBOARD LOGIC =====

async function chargerDashboardClient(user) {
  const section = document.getElementById("dashboard-client");
  const tableBody = document.getElementById("table-retours-client");
  const noRetour = tableBody.querySelector(".no-retour");

  section.classList.add("active");
  section.classList.remove("hidden");

  chargerInfosClient(user);
  chargerRetoursClient(user);
}

async function chargerRetoursClient(user) {
  const tableBody = document.getElementById("table-retours-client");
  const noRetour = tableBody.querySelector(".no-retour");

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbz_L4-i-8lgLrWCoRni-ImJMoAQa2jDUJm7Ct00cEsZlsS1O_5RMdNE75yCxEafNaU/exec", {
      method: "POST",
      body: JSON.stringify({
        action: "getRetours",
        email: user.email
      }),
    });

    const result = await response.json();
    if (!result.success || !result.retours.length) {
      noRetour.style.display = "table-row";
      return;
    }

    noRetour.style.display = "none";
    let rows = "";

    result.retours.forEach(retour => {
      const statutColor = retour.STATUT === "Validé" ? "#4CAF50" : retour.STATUT === "Refusé" ? "#F44336" : "#999";
      const motifTooltip = retour.STATUT === "Refusé" && retour.MOTIF_REFUS ? `title=\"${retour.MOTIF_REFUS}\"` : "";
      const pdfCell = retour.ID_RETOUR ? `<button onclick=\"telechargerPdf('${retour.ID_RETOUR}')\">📄</button>` : "-";

      rows += `<tr>
        <td>${retour.DATE}</td>
        <td>${retour.MAGASIN}</td>
        <td>${retour.REFERENCE}</td>
        <td>${retour.MOTIF}</td>
        <td style=\"color:${statutColor}; font-weight: bold;\" ${motifTooltip}>${retour.STATUT}</td>
        <td>${retour.ID_RETOUR || "-"}</td>
        <td>${pdfCell}</td>
      </tr>`;
    });

    tableBody.innerHTML += rows;
  } catch (err) {
    console.error("Erreur chargement client:", err);
    tableBody.innerHTML += `<tr><td colspan='7'>Erreur lors du chargement des retours.</td></tr>`;
  }
}

function telechargerPdf(numero) {
  fetch("https://script.google.com/macros/s/AKfycbz_L4-i-8lgLrWCoRni-ImJMoAQa2jDUJm7Ct00cEsZlsS1O_5RMdNE75yCxEafNaU/exec", {
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

async function chargerInfosClient(user) {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbz_L4-i-8lgLrWCoRni-ImJMoAQa2jDUJm7Ct00cEsZlsS1O_5RMdNE75yCxEafNaU/exec", {
      method: "POST",
      body: JSON.stringify({
        action: "getClientInfo",
        email: user.email
      })
    });
    const result = await response.json();
    if (result.success) {
      document.getElementById("client-nom").textContent = result.nom;
      document.getElementById("client-numero").textContent = result.numero;
      document.getElementById("client-email").value = result.email;
      document.getElementById("client-tel").value = result.tel;
      document.getElementById("client-adresse").value = result.adresse;
      document.getElementById("magasin-nom").textContent = result.magasin.nom;
      document.getElementById("magasin-numero").textContent = result.magasin.numero;
      document.getElementById("magasin-tel").textContent = result.magasin.tel;
      document.getElementById("magasin-email").textContent = result.magasin.email;
      document.getElementById("commercial-nom").textContent = result.commercial.nom;
      document.getElementById("commercial-secteur").textContent = result.commercial.secteur;
      document.getElementById("commercial-tel").textContent = result.commercial.tel;
      document.getElementById("commercial-email").textContent = result.commercial.email;
    }
  } catch (e) {
    console.error("Erreur lors du chargement des infos client:", e);
  }
}

document.getElementById("client-info-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const updated = {
    email: document.getElementById("client-email").value,
    tel: document.getElementById("client-tel").value,
    adresse: document.getElementById("client-adresse").value,
    motdepasse: document.getElementById("client-password").value,
  };
  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbz_L4-i-8lgLrWCoRni-ImJMoAQa2jDUJm7Ct00cEsZlsS1O_5RMdNE75yCxEafNaU/exec", {
      method: "POST",
      body: JSON.stringify({
        action: "updateClientInfo",
        data: updated
      })
    });
    const result = await res.json();
    if (result.success) {
      alert("Informations mises à jour avec succès.");
      document.getElementById("client-password").value = "";
    } else {
      alert("Erreur lors de la mise à jour.");
    }
  } catch (e) {
    alert("Erreur de réseau");
    console.error(e);
  }
});
