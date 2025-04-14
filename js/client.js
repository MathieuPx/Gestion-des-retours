window.addEventListener("DOMContentLoaded", () => {
  const baseURL = "https://script.google.com/macros/s/AKfycbwaaUrWfvfGoqkGsnAMbs-XL9l3psSXjDOQBrUnBetqvTzKOMmwd4MeDsZ8PWPwtNrR/exec";
  const email = localStorage.getItem("email");
  const nom = localStorage.getItem("nom");
  const role = localStorage.getItem("role");
  const numero = localStorage.getItem("numClient");

  // Sécurité : redirection si mauvais rôle
  if (!email || role !== "client") {
    window.location.href = "login.html";
    return;
  }

  // Injecter les infos dans le DOM si dispo
  const emailEl = document.getElementById("email");
  const nomEl = document.getElementById("nom");
  const numEl = document.getElementById("numClient");
  if (emailEl) emailEl.innerText = email;
  if (nomEl) nomEl.innerText = nom;
  if (numEl) numEl.innerText = numero;

  // 🔒 Déconnexion
  document.getElementById("logout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  function voirPdf(numeroRetour) {
  const url = `https://script.google.com/macros/s/TON_DEPLOYMENT_ID/exec?numero=${numeroRetour}`;
  window.open(url, '_blank');
}

  // 🧾 Affichage tableau des retours
  function afficherRetours(retours) {
    const conteneur = document.getElementById("retours");
    if (!conteneur) return;

    conteneur.innerHTML = "";
    if (!retours.length) {
      conteneur.textContent = "Aucun retour enregistré.";
      return;
    }
    const btn = document.createElement("button");
btn.textContent = "📄 Voir PDF";
btn.onclick = () => voirPdf(row["NUMÉRO DE RETOUR"]);
td.appendChild(btn);

    const table = document.createElement("table");
    table.className = "retours-table";

    const headers = ["Date", "Référence", "Type", "Quantité", "Statut"];
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    headers.forEach(h => {
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

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    conteneur.appendChild(table);
  }

  // 📥 Charger les retours du client
  async function chargerRetours() {
    const conteneur = document.getElementById("retours");
    if (!conteneur) return;
    conteneur.innerHTML = "Chargement...";

    try {
      const res = await fetch(`${baseURL}?action=getRetoursClient&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        afficherRetours(data.retours);
      } else {
        conteneur.textContent = "Erreur lors du chargement des retours.";
      }
    } catch (e) {
      conteneur.textContent = "Erreur de communication avec le serveur.";
    }
  }

  // 🔄 Charger retours au démarrage
  chargerRetours();

  // 📨 Formulaire d'ajout de retour
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

      const body = JSON.stringify({
        email,
        nom,
        numClient: numero,
        lignes
      });

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
          alert("❌ Une erreur est survenue.");
          console.error(result.error);
        }
      } catch (err) {
        alert("❌ Connexion au serveur impossible.");
        console.error(err);
      }
    });
  }
});
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
    console.error("Erreur chargement infos client", e);
  }
}
