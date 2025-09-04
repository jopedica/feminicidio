// cadastro.js
const $ = (sel) => document.querySelector(sel);

const tabLogin = $("#tab-login");
const tabRegister = $("#tab-register");
const paneLogin = $("#pane-login");
const paneRegister = $("#pane-register");
const alertBox = $("#auth-alert");

function showAlert(kind, msg) {
  alertBox.className = "alert"; // reset
  if (kind === "error") alertBox.classList.add("alert--danger");
  alertBox.innerHTML = `<h2 class="alert-title">${kind === "error" ? "Ops!" : "Pronto"}</h2><p>${msg}</p>`;
  alertBox.style.display = "block";
}

function clearAlert() {
  alertBox.style.display = "none";
  alertBox.innerHTML = "";
}

function toggleTab(which) {
  clearAlert();
  const loginActive = which === "login";
  tabLogin.setAttribute("aria-selected", loginActive);
  tabRegister.setAttribute("aria-selected", !loginActive);
  paneLogin.hidden = !loginActive;
  paneRegister.hidden = loginActive;
}

tabLogin.addEventListener("click", () => toggleTab("login"));
tabRegister.addEventListener("click", () => toggleTab("register"));

$("#btn-register").addEventListener("click", async () => {
  clearAlert();
  const nome = $("#reg-nome").value.trim();
  const email = $("#reg-email").value.trim().toLowerCase();
  const senha = $("#reg-senha").value;
  const senha2 = $("#reg-senha2").value;

  if (!nome || !email || !senha) return showAlert("error", "Preencha todos os campos.");
  if (senha.length < 8) return showAlert("error", "A senha precisa ter pelo menos 8 caracteres.");
  if (senha !== senha2) return showAlert("error", "As senhas não conferem.");

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });
    const data = await res.json();
    if (!res.ok) return showAlert("error", data?.message || "Erro ao cadastrar.");
    showAlert("ok", "Cadastro realizado com sucesso! Você já pode entrar.");
    toggleTab("login");
  } catch (e) {
    showAlert("error", "Falha de rede. Tente novamente.");
  }
});

$("#btn-login").addEventListener("click", async () => {
  clearAlert();
  const email = $("#login-email").value.trim().toLowerCase();
  const senha = $("#login-password").value;
  if (!email || !senha) return showAlert("error", "Informe e-mail e senha.");

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });
    const data = await res.json();
    if (!res.ok) return showAlert("error", data?.message || "Credenciais inválidas.");

    // Guarde o token (ou troque para cookie HttpOnly no backend)
    localStorage.setItem("vf_token", data.token);
    showAlert("ok", "Login realizado! Redirecionando...");
    setTimeout(() => {
      // ajuste a rota desejada pós-login:
      window.location.href = "index.html";
    }, 800);
  } catch (e) {
    showAlert("error", "Falha de rede. Tente novamente.");
  }
});
