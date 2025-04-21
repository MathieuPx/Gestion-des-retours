// login.js — Gère l'authentification et redirection selon rôle

window.onload = () => {
  const savedEmail = localStorage.getItem("email");
  if (savedEmail) document.getElementById("email").value = savedEmail;
};

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const remember = document.getElementById("rememberMe").checked;
  const message = document.getElementById("loginMessage");

  message.textContent = "Connexion en cours...";
  message.className = "msg loading";

  google.script.run.withSuccessHandler(response => {
    if (response.success) {
      localStorage.setItem("utilisateur", JSON.stringify(response));
      if (remember) localStorage.setItem("email", email);

      message.textContent = "Connexion réussie !";
      message.className = "msg success";

      setTimeout(() => {
        switch (response.role.toLowerCase()) {
          case "client": window.location.href = "client"; break;
          case "commercial": window.location.href = "commercial"; break;
          case "magasin": window.location.href = "magasin"; break;
          case "cdv": window.location.href = "cdv"; break;
          case "rdm": window.location.href = "rdm"; break;
          case "admin": window.location.href = "admin"; break;
          default:
            message.textContent = "Rôle non reconnu.";
            message.className = "msg error";
        }
      }, 1000);
    } else {
      message.textContent = "Identifiants incorrects.";
      message.className = "msg error";
    }
  }).authentifier(email, password);
}
