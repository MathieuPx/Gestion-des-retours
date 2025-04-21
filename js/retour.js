// ===== GOOGLE APPS SCRIPT - BACKEND AAI RETOURS COMPLET AVEC PDF ÉPHÉMÈRE =====

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  switch (action) {
    case "login":
      return jsonResponse(login(data.email, data.password));
    case "getRetours":
      return jsonResponse(getRetours(data.email));
    case "createRetour":
      return createRetour(data.retour); // réponse spéciale : ContentService avec PDF
    default:
      return jsonResponse({ success: false, error: "Action inconnue." });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function login(email, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName("UTILISATEURS");
  const adminsSheet = ss.getSheetByName("ADMIN");
  const users = usersSheet.getDataRange().getValues();
  const admins = adminsSheet.getDataRange().getValues();

  for (let i = 1; i < admins.length; i++) {
    const [nom, mail, pass] = admins[i];
    if (mail === email && pass === password) {
      return { success: true, nom, role: "admin", email };
    }
  }

  for (let i = 1; i < users.length; i++) {
    const [mail, nom, numero, role, actif, pass] = users[i];
    if (mail === email && pass === password && actif.toLowerCase() === "oui") {
      return { success: true, nom, role, numero, email };
    }
  }

  return { success: false };
}

function getRetours(email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName("UTILISATEURS");
  const retoursSheet = ss.getSheetByName("RETOURS");
  const users = usersSheet.getDataRange().getValues();
  let userData = null;

  for (let i = 1; i < users.length; i++) {
    const [mail, nom, numero, role, actif, pass] = users[i];
    if (mail === email) {
      userData = { role, numero };
      break;
    }
  }
  if (!userData) return { success: false, error: "Utilisateur introuvable." };

  const data = retoursSheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  let filtered = [];

  rows.forEach(row => {
    const retour = {};
    headers.forEach((h, i) => retour[h] = row[i]);

    switch (userData.role) {
      case "client":
        if (retour.NUM_CLIENT == userData.numero) filtered.push(retour);
        break;
      case "commercial":
        if (retour.NUM_COMMERCIAL == userData.numero) filtered.push(retour);
        break;
      case "magasin":
      case "rdm":
        if (retour.NUM_MAGASIN == userData.numero) filtered.push(retour);
        break;
      case "cdv":
        if (retour.MAGASIN_CDV && retour.MAGASIN_CDV.split(',').includes(userData.numero)) filtered.push(retour);
        break;
      case "admin":
        filtered.push(retour);
        break;
    }
  });
  return { success: true, retours: filtered };
}

function createRetour(retour) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("RETOURS");
  const configSheet = ss.getSheetByName("CONFIG");

  const now = new Date();
  const mois = (now.getMonth() + 1).toString().padStart(2, '0');
  const annee = now.getFullYear();

  const config = configSheet.getDataRange().getValues();
  let compteur = 1;
  for (let i = 1; i < config.length; i++) {
    if (config[i][0] == mois && config[i][1] == annee) {
      compteur = parseInt(config[i][2]) + 1;
      configSheet.getRange(i + 1, 3).setValue(compteur);
      break;
    }
  }
  if (compteur === 1) configSheet.appendRow([mois, annee, compteur]);

  const numeros = [];
  const baseNumero = `${retour.NUM_CLIENT}-${mois}-${annee}`;
  const body = [];

  retour.REFERENCES.forEach((ref, index) => {
    const numeroRetour = `${(compteur + index).toString().padStart(3, '0')}-${baseNumero}`;
    const ligne = [
      numeroRetour,
      retour.NUM_CLIENT,
      retour.CLIENT,
      retour.NUM_MAGASIN,
      retour.MAGASIN,
      retour.NUM_COMMERCIAL || "",
      ref.REFERENCE,
      ref.MOTIF,
      ref.TYPE,
      retour.DATE,
      "En attente",
      "",
      ref.OBSERVATIONS
    ];
    sheet.appendRow(ligne);
    numeros.push(numeroRetour);

    body.push(`<tr><td>${ref.REFERENCE}</td><td>${ref.TYPE}</td><td>${ref.MOTIF}</td></tr>`);
  });

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial; font-size: 12px; }
      h2 { color: #014389; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
    </style>
    <h2>PRÉ-ACCORD DE RETOUR N° ${numeros.join(", ")}</h2>
    <p><strong>Date :</strong> ${Utilities.formatDate(now, Session.getScriptTimeZone(), "dd/MM/yyyy")}</p>
    <p><strong>Client :</strong> ${retour.CLIENT} (${retour.NUM_CLIENT})</p>
    <table>
      <thead><tr><th>Référence</th><th>Type</th><th>Motif</th></tr></thead>
      <tbody>${body.join("")}</tbody>
    </table>
    <p style="margin-top:20px;font-size:11px;color:#444;">
      Le magasin se réserve le droit d'accepter ou non les retours clients.<br>
      Les pièces électriques ne sont ni reprises, ni échangées.<br>
      Une décote sera appliquée si l'achat de la pièce date de plus de 30 jours :<br>
      <em>Retour&lt;30j : Décote 0% - 30j&lt;Retour&lt;60j : 20% - 60j&lt;Retour&lt;90j : 40% - 90j&lt;Retour : 60%</em>
    </p>
  `);

  const blob = Utilities.newBlob(html.getContent(), "text/html").getAs("application/pdf").setName(`Retour-${numeros[0]}.pdf`);
  return ContentService.createTextOutput(blob.getBytes()).setMimeType(ContentService.MimeType.PDF);
}

