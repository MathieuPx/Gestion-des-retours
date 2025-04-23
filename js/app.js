// ===== AAI RETOURS - JS CORE LOGIC =====

// DOM Elements
const loginForm = document.getElementById("login-form");
const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const userNameDisplay = document.getElementById("user-name");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

// Simulated backend call to Apps Script API (will be replaced)
async function loginUser(email, password) {
  const response = await fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
    method: "POST",
    body: JSON.stringify({
      action: "login",
      email,
      password,
    }),
  });
  return await response.json();
}

// Handle login submit
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";

  const email = loginForm.querySelector("input[type='email']").value;
  const password = loginForm.querySelector("input[type='password']").value;

  try {
    const result = await loginUser(email, password);

    if (result.success) {
      showDashboard(result);
    } else {
      loginError.textContent = "Identifiants invalides.";
    }
  } catch (err) {
    console.error(err);
    loginError.textContent = "Erreur de connexion au serveur.";
  }
});

function showDashboard(user) {
  loginView.classList.remove("active");
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  dashboardView.classList.add("active");

  userNameDisplay.textContent = user.nom;
  // TODO : charger les retours selon le rôle de l'utilisateur ici
}

logoutBtn.addEventListener("click", () => {
  loginView.classList.add("active");
  loginView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
  dashboardView.classList.remove("active");
  loginForm.reset();
});
return ContentService
  .createTextOutput(JSON.stringify(responseObj))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader("Access-Control-Allow-Origin", "*");
