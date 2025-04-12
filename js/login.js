const baseURL = "https://script.google.com/macros/s/AKfycbzE1WSO1Bb5_zMnWfjBQWIE9okRMx6jJQmAH53yv9ob_U93Bf97eb02H7wKhfatkAxY/exec";

document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error");

  if (!email || !password) {
    errorMsg.textContent = "❗ Email et mot de passe requis.";
    return;
  }

  fetch(`${baseURL}?action=verifierCompte&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.success) {
        errorMsg.textContent = "❌ Identifiants incorrects.";
        return;
      }

      // ✅ Stockage
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);
      localStorage.setItem("nom", data.nom);
      localStorage.setItem("numClient", data.numero);

      // ✅ Redirection vers le bon HTML (client.html, cdv.html, etc.)
      window.location.href = `${data.role}.html`;
    })
    .catch(() => {
      errorMsg.textContent = "❌ Erreur de communication avec le serveur.";
    });
});
