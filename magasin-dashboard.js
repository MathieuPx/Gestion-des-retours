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

      rows += `<tr>
        <td>${r.DATE}</td>
        <td>${r.CLIENT}</td>
        <td>${r.REFERENCE}</td>
        <td>${r.MOTIF}</td>
        <td>${r.STATUT}</td>
        <td>${r.ID_RETOUR || "-"}</td>
      </tr>`;
    });

    document.getElementById("stat-attente").textContent = enAttente;
    document.getElementById("stat-valides").textContent = valides;
    document.getElementById("stat-refuses").textContent = refuses;
    tableBody.innerHTML = rows;

  } catch (err) {
    console.error("Erreur chargement retours:", err);
    tableBody.innerHTML = `<tr><td colspan="6">Erreur de chargement des données</td></tr>`;
  }
}
