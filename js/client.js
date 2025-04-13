const baseURL = "https://script.google.com/macros/s/AKfycbwqUzkJDWCSFXOFaukYBvxL69uTsvRJm3GFMcVufKVPYdNX2q0qbxe7mJebEEQ6HA5p/exec";
const email = localStorage.getItem("email");
const nom = localStorage.getItem("nom");
const role = localStorage.getItem("role");
const numero = localStorage.getItem("numClient");

if (!email || role !== "client") {
  window.location.href = "login.html";
}

document.getElementById("email").innerText = email;
document.getElementById("nom").innerText = nom;
document.getElementById("numClient").innerText = numero;

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

function afficherRetours(retours) {
  if (!retours.length) {
    document.getElementById("retours").innerText = "Aucun retour enregistré.";
    return;
  }

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const headers = Object.keys(retours[0]);
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    th.style.borderBottom = "1px solid #e2e8f0";
    th.style.padding = "8px";
    th.style.background = "#113267";
    th.style.color = "white";
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  retours.forEach(row => {
    const tr = document.createElement("tr");
    headers.forEach(h => {
      const td = document.createElement("td");
      td.textContent = row[h] || "";
      td.style.padding = "8px";
      td.style.borderBottom = "1px solid #e2e8f0";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  document.getElementById("retours").appendChild(table);
}

fetch(`${baseURL}?action=getRetoursClient&email=${encodeURIComponent(email)}`)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      afficherRetours(data.retours);
    } else {
      document.getElementById("retours").innerText = "Erreur lors de la récupération des retours.";
    }
  })
  .catch(() => {
    document.getElementById("retours").innerText = "Erreur de connexion au serveur.";
  });
document.getElementById("form-retour").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = localStorage.getItem("email");
  const nom = localStorage.getItem("nom");
  const numClient = localStorage.getItem("numClient");

  const lignes = [...document.querySelectorAll(".ligne-retour")].map(ligne => {
    return {
      reference: ligne.querySelector("input[name='reference[]']").value,
      quantite: ligne.querySelector("input[name='quantite[]']").value,
      precision: ligne.querySelector("input[name='precision[]']").value,
      type: ligne.querySelector("select[name='type[]']").value,
    };
  });

  const body = JSON.stringify({ email, nom, numClient, lignes });

  try {
    const response = await fetch("TON_URL_APPS_SCRIPT", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const result = await response.json();
    if (result.success) {
      afficherSection("retours");
      chargerRetours();
    } else {
      alert("❌ Une erreur est survenue lors de l'envoi.");
      console.error(result.error);
    }

  } catch (err) {
    console.error("Erreur fetch :", err);
    alert("❌ Connexion échouée.");
  }
});
