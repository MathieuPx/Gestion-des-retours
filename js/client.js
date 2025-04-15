window.addEventListener("DOMContentLoaded", () => {
  const baseURL = "https://script.google.com/macros/s/AKfycbwaaUrWfvfGoqkGsnAMbs-XL9l3psSXjDOQBrUnBetqvTzKOMmwd4MeDsZ8PWPwtNrR/exec";
  const email = localStorage.getItem("email");
  const nom = localStorage.getItem("nom");
  const role = localStorage.getItem("role");
  const numero = localStorage.getItem("numClient");

  if (!email || role !== "client") {
    window.location.href = "login.html";
    return;
  }

  // Injection DOM
  document.getElementById("email")?.innerText = email;
  document.getElementById("nom")?.innerText = nom;
  document.getElementById("numClient")?.innerText = numero;

  document.getElementById("logout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // Génère un bouton PDF par ligne
  function voirPdf(numeroRetour) {
    const url = `${baseURL}?action=genererPdfDepuisRetour&numero=${numeroRetour}`;
    window.open(url, "_blank");
  }

  function afficherRetours(retours) {
    const conteneur = document.getElementById("retours");
    conteneur.innerHTML = "";

    if (!retours.length) {
      conteneur.textContent = "Aucun retour enregistré.";
      return;
    }

    const table = document.createElement("table");
    table.className = "retours-table";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    ["Date", "Référence", "Désignation", "Type", "Quantité", "Statut", "📄"].forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    retours.forEach(row => {
      const tr = document.createElement("tr");

      const tdDate = document.createElement("td");
      tdDate.textContent = new Date(row["DATE"]).toLocaleDateString("fr-FR");
      tr.appendChild(tdDate);

      const tdRef = document.createElement("td");
      tdRef.textContent = row["REFERENCE"];
      tr.appendChild(tdRef);

      const tdDes = document.createElement("td");
      tdDes.textContent = row["DESIGNATION"] || "–";
      tr.appendChild(tdDes);

      const tdType = document.createElement("td");
      tdType.textContent = row["TYPE DE RETOUR"];
      tr.appendChild(tdType);

      const tdQte = document.createElement("td");
      tdQte.textContent = row["QUANTITE"];
      tr.appendChild(tdQte);

      const tdStatut = document.createElement("td");
      tdStatut.textContent = row["STATUT DE RETOUR"];
      if (tdStatut.textContent === "REFUSÉ" && row["MOTIFS REFUS MAGASIN"]) {
        tdStatut.title = row["MOTIFS REFUS MAGASIN"];
      }
      tr.appendChild(tdStatut);

      const tdBtn = document.createElement("td");
      const btn = document.createElement("button");
      btn.textContent = "Voir PDF";
      btn.onclick = () => voirPdf(row["NUMÉRO DE RETOUR"]);
      tdBtn.appendChild(btn);
      tr.appendChild(tdBtn);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    conteneur.appendChild(table);
  }

  async function chargerRetours() {
    const conteneur = document.getElementById("retours");
    conteneur.innerHTML = "Chargement...";

    try {
      const res = await fetch(`${baseURL}?action=getRetoursClient&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        afficherRetours(data.retours);
      } else {
        conteneur.textContent = "Erreur lors du chargement.";
      }
    } catch (e) {
      conteneur.textContent = "Erreur de connexion au serveur.";
    }
  }

  chargerRetours(); // Lancement auto

  const form = document.getElementById("form-retour");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const lignes = [...document.querySelectorAll(".ligne-retour")].map(ligne => ({
        reference: ligne.querySelector("input[name='reference[]']").value,
        quantite: ligne.querySelector("input[name='quantite[]']").value,
        precision: ligne.querySelector("input[name='precision[]']").value,
        type: ligne.querySelector("select[name='type[]']").value
      }));

      const body = JSON.stringify({ email, nom, numClient: numero, lignes });

      try {
        const response = await fetch(baseURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        const result = await response.json();
        if (result.success) {
          chargerRetours();
          afficherSection("retours");
        } else {
          alert("❌ Erreur retour.");
        }
      } catch (err) {
        alert("❌ Connexion serveur.");
        console.error(err);
      }
    });
  }

  // Charger les infos client (Mon compte)
  chargerInfosClient();

  async function chargerInfosClient() {
    try {
      const res = await fetch(`${baseURL}?action=getInfosClient&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        document.getElementById("info-nom").innerText = data.nom || "";
        document.getElementById("info-email").innerText = data.email || "";
        document.getElementById("info-num").innerText = data.numero || "";
        document.getElementById("info-adresse").innerText = data.adresse || "";
        document.getElementById("info-cp").innerText = data.cp || "";
        document.getElementById("info-ville").innerText = data.ville || "";
        document.getElementById("info-tel").innerText = data.telephone || "";
      }
    } catch (e) {
      console.error("❌ Infos client non chargées", e);
    }
  }

  // 📤 Export CSV
  document.getElementById("exportCSV")?.addEventListener("click", () => {
    const filtreStatut = document.getElementById("filtre-statut")?.value || "";
    const lignes = [...document.querySelectorAll("#retours table tbody tr")];

    const enTete = ["Date", "Référence", "Désignation", "Type", "Quantité", "Statut"];
    const csv = [enTete.join(",")];

    lignes.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (!cells.length) return;

      const statut = cells[5]?.innerText;
      if (filtreStatut && statut !== filtreStatut) return;

      const ligneCsv = Array.from(cells).slice(0, 6).map(cell =>
        `"${cell.innerText.replace(/"/g, '""')}"`
      ).join(",");
      csv.push(ligneCsv);
    });

    const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retours-client-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});
