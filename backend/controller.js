const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  const lengthSlider = document.getElementById("length");
  const lengthValue = document.getElementById("length-value");
  const generateBtn = document.getElementById("generate");
  const passwordInput = document.getElementById("password");
  const copyBtn = document.getElementById("copy");
  const strengthBar = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");
  const historyList = document.getElementById("history-list");

  lengthSlider.addEventListener("input", () => {
    lengthValue.textContent = lengthSlider.value;
  });

  const generatePassword = (length, options) => {
    let chars = "";
    if (options.uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (options.numbers) chars += "0123456789";
    if (options.symbols) chars += "!@#$%^&*";
    if (!chars) return "Выберите хотя бы один вариант";

    return Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  const updateStrength = (password) => {
    let strength = 0;
    if (password.length > 11) strength += 2;
    else if (password.length > 7) strength += 1;

    const checks = [
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    strength += checks.filter(Boolean).length;

    let width, color, text;

    if (strength >= 5) {
      width = "100%";
      color = "#2ecc71";
      text = "Очень надёжный";
    } else if (strength >= 4) {
      width = "75%";
      color = "#27ae60";
      text = "Надёжный";
    } else if (strength >= 3) {
      width = "50%";
      color = "#f1c40f";
      text = "Средний";
    } else if (strength >= 2) {
      width = "25%";
      color = "#e67e22";
      text = "Слабый";
    } else {
      width = "10%";
      color = "#e74c3c";
      text = "Очень слабый";
    }

    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = `Надёжность: ${text}`;

  };

  const loadHistory = async () => {
    const response = await ipcRenderer.invoke("get-history");
    if (response.success) {
      historyList.innerHTML = "";
      response.data.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.password;
        historyList.appendChild(li);
      });
    } else {
      historyList.innerHTML = "<li>Ошибка загрузки истории</li>";
    }
  };

  generateBtn.addEventListener("click", async () => {
    const options = {
      uppercase: document.getElementById("uppercase").checked,
      lowercase: document.getElementById("lowercase").checked,
      numbers: document.getElementById("numbers").checked,
      symbols: document.getElementById("symbols").checked,
    };

    const length = parseInt(lengthSlider.value, 10);
    const password = generatePassword(length, options);
    passwordInput.value = password;
    updateStrength(password);

    // Сохраняем пароль в базу
    const saveResponse = await ipcRenderer.invoke("save-password", password);
    if (saveResponse.success) {
      loadHistory();
    }
  });

  copyBtn.addEventListener("click", () => {
    passwordInput.select();
    document.execCommand("copy");
    copyBtn.textContent = "Скопировано!";
    setTimeout(() => {
      copyBtn.textContent = "Копировать";
    }, 2000);
  });

  lengthValue.textContent = lengthSlider.value;

  loadHistory();
});
