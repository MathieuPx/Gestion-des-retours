const baseURL = "https://script.google.com/macros/s/AKfycbx65IRqIby9U0zUdOxg9JkmIo-g1FW4DJos3lDHH2rjL9nSGUyXaWFK03fTqfaUMwO6/exec";

// Préremplir email si sauvegardé
window.addEventListener("DOMContentLoaded", () => {
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    document.getElementById("email").value = savedEmail;
    document.getElementById("rememberMe").checked = true;
  }
});

document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const remember = document.getElementById("rememberMe").checked;
  const errorMsg = document.getElementById("loginMessage");
  const loading = document.getElementById("loginLoading");

  if (!email || !password) {
    errorMsg.textContent = "❗ Email et mot de passe requis.";
    errorMsg.className = "error-msg";
    return;
  }

  errorMsg.textContent = "";
  loading.style.display = "block";

  fetch(`${baseURL}?action=verifierCompte&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
    .then(res => res.json())
    .then(data => {
      loading.style.display = "none";

      if (!data || !data.success) {
        errorMsg.textContent = "❌ Identifiants incorrects.";
        errorMsg.className = "error-msg";
        return;
      }

      // ✅ Stockage local
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);
      localStorage.setItem("nom", data.nom);
      localStorage.setItem("numClient", data.numero);

      if (remember) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      errorMsg.textContent = "✔ Connexion réussie !";
      errorMsg.className = "success-msg";

      setTimeout(() => {
        window.location.href = `${data.role.toLowerCase()}.html`;
      }, 1000);
    })
    .catch(() => {
      loading.style.display = "none";
      errorMsg.textContent = "❌ Erreur de communication avec le serveur.";
      errorMsg.className = "error-msg";
    });
});

// 👁️ Afficher / masquer le mot de passe
const toggleBtn = document.createElement("button");
toggleBtn.type = "button";
toggleBtn.textContent = "Afficher";
toggleBtn.style.marginTop = "-10px";
toggleBtn.style.marginBottom = "10px";
toggleBtn.style.border = "none";
toggleBtn.style.background = "none";
toggleBtn.style.color = "#113267";
toggleBtn.style.cursor = "pointer";
toggleBtn.style.fontSize = "0.85rem";

document.getElementById("password").insertAdjacentElement("afterend", toggleBtn);

toggleBtn.addEventListener("click", () => {
  const pwdField = document.getElementById("password");
  if (pwdField.type === "password") {
    pwdField.type = "text";
    toggleBtn.textContent = "Masquer";
  } else {
    pwdField.type = "password";
    toggleBtn.textContent = "Afficher";
  }
});
