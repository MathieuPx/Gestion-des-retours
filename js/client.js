// client.js — Fonctions JS enrichies pour le portail client AAI

const baseURL = "https://script.google.com/macros/s/AKfycbwHGcjwQZj3nieAjKpAUkepql038zbX1eG8EUpHArxEQ6lZemeQfBKK6aYoOtaNh5Qs/exec";

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-content");
  const showTab = id => {
    tabs.forEach(tab => tab.style.display = "none");
    document.getElementById(id).style.display = "block";
  };

  document.getElementById("btnAccueil").onclick = () => showTab("accueil");
  document.getElementById("btnCompte").onclick = () => showTab("compte");
  document.getElementById("btnAjoutRetour").onclick = () => showTab("ajoutRetour");
  document.getElementById("btnContact").onclick = () => showTab("contact");
  document.getElementById("btnLogout").onclick = () => {
    localStorage.clear();
    location.reload();
  };

  const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));
  if (!utilisateur) {
    alert("Veuillez vous connecter");
    return;
  }

  chargerRetours(utilisateur.client);
  chargerInfosClient(utilisateur.client);
  chargerContact(utilisateur.client);

  const formRetour = document.getElementById("formRetour");
  formRetour.onsubmit = e => {
    e.preventDefault();
    const ligne = formRetour.querySelector(".ligneRetour");
    const retour = {
      numeroClient: utilisateur.client,
      nom: utilisateur.nom,
      email: utilisateur.email,
      reference: ligne.querySelector("[name='reference']").value,
      quantite: ligne.querySelector("[name='quantite']").value,
      type: ligne.querySelector("[name='type']").value,
      precision: ligne.querySelector("[name='precision']").value,
      designation: ligne.querySelector("[name='designation']").value,
      statut: "En attente"
    };

    if (!retour.reference || !retour.designation || !retour.type || !retour.precision) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (ligne.querySelector("[name='designation']").dataset.manual === "true") {
      google.script.run.alerterRDMpourDesignationManuelle(retour);
    }

    google.script.run.enregistrerRetour(retour);
    alert("Retour enregistré");
    formRetour.reset();
    chargerRetours(utilisateur.client);
  };
});

function verifierReferenceAuto(inputRef) {
  const ref = inputRef.value.trim();
  if (ref === '') return;

  google.script.run.withSuccessHandler(designation => {
    const row = inputRef.closest('tr');
    const champDesignation = row.querySelector("input[name='designation']");

    if (designation && designation !== '') {
      champDesignation.value = designation;
      champDesignation.disabled = true;
      champDesignation.dataset.manual = "false";
    } else {
      champDesignation.value = '';
      champDesignation.disabled = false;
      champDesignation.placeholder = "À compléter manuellement";
      champDesignation.dataset.manual = "true";
    }
  }).getDesignationFromReference(ref);
}

function chargerRetours(numeroClient) {
  google.script.run.withSuccessHandler(data => {
    const tbody = document.querySelector("#tableRetours tbody");
    tbody.innerHTML = "";
    data.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r[0]}</td>
        <td>${r[4]}</td>
        <td>${r[6]}</td>
        <td>${r[7]}</td>
        <td>${r[8]}</td>
        <td>${r[9]}</td>
        <td><button onclick="ouvrirPDF('${r[10]}')">📄 Voir PDF</button></td>
      `;
      tbody.appendChild(tr);
    });
  }).getRetoursClient(numeroClient);
}

function ouvrirPDF(numeroRetour) {
  google.script.run.genererPDFpourRetour(numeroRetour);
}

function chargerInfosClient(numeroClient) {
  google.script.run.withSuccessHandler(data => {
    document.getElementById("client-nom").textContent = data[1];
    document.getElementById("client-email").textContent = data[2];
  }).getInfosClient(numeroClient);
}

function chargerContact(numeroClient) {
  google.script.run.withSuccessHandler(data => {
    document.getElementById("magasin-nom").textContent = data.magasin.nom;
    document.getElementById("magasin-mail").textContent = data.magasin.email;
    document.getElementById("commercial-nom").textContent = data.commercial.nom;
    document.getElementById("commercial-mail").textContent = data.commercial.email;
  }).getContactsClient(numeroClient);
}

