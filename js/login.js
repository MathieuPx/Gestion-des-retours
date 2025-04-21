// login.js — compatible GitHub Pages + Apps Script

const baseURL = "https://script.google.com/macros/s/AKfycbwHGcjwQZj3nieAjKpAUkepql038zbX1eG8EUpHArxEQ6lZemeQfBKK6aYoOtaNh5Qs/exec"; // <-- remplace TON_ID_SCRIPT

window.onload = () => {
  const savedEmail = localStorage.getItem("email");
  if (savedEmail) document.getElementById("email").value = savedEmail;

  const form = document.getElementById("loginForm");
  form.addEventListener("submit", handleLogin);
};

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const remember = document.getElementById("rememberMe").checked;
  const message = document.getElementById("loginMessage");

  message.textContent = "Connexion en cours...";
  message.className = "msg loading";

  fetch(baseURL + "?action=authentifier", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        localStorage.setItem("utilisateur", JSON.stringify(response));
        if (remember) localStorage.setItem("email", email);

        message.textContent = "Connexion réussie !";
        message.className = "msg success";

        setTimeout(() => {
          const role = response.role.toLowerCase();
          window.location.href = `${role}.html`;
        }, 800);
      } else {
        message.textContent = "Identifiants incorrects.";
        message.className = "msg error";
      }
    })
    .catch(err => {
      console.error(err);
      message.textContent = "Erreur lors de la connexion.";
      message.className = "msg error";
    });
}
