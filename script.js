document.addEventListener("DOMContentLoaded", function () {
  const topUpgradeButton = document.getElementById("top-upgrade-btn");
  const playerNameElement = document.getElementById("player-name");
  const usernameInput = document.getElementById("username-input");
  const notifyButton = document.getElementById("notify-btn");
  const cookie = document.getElementById("cookie");
  const cookieCount = document.getElementById("cookie-count");
  const perSecond = document.getElementById("per-second");
  const loadingScreen = document.querySelector(".loading-screen");
  const container = document.querySelector(".container");
  const usernameContainer = document.querySelector(".username-container");
  const buildingsButton = document.getElementById("buildings-button");
  const upgradesButton = document.getElementById("upgrades-button");
  const statsButton = document.getElementById("stats-button");
  const settingsButton = document.getElementById("settings-button");
  const upgradeContainer = document.getElementById("upgrade-container");
  const upgradesContainer = document.getElementById("upgrades-container");
  const statsContainer = document.getElementById("stats-container");
  const settingsContainer = document.getElementById("settings-container");
  const musicVolumeSlider = document.getElementById("music-volume");
  const sfxVolumeSlider = document.getElementById("sfx-volume");
  const numberFormatButton = document.getElementById("numberformat-button");
  const numberFormatMenu = document.getElementById("numberformatDropdown");

  // Game state
  let manaCount = 0;
  let totalMana = 0;
  let cookiesPerSecond = 0;
  let clickCount = 0;
  let ownedAutotaps = 0;
  let ownedClickBoosts = 0;
  let ownedPickaxes = 0;
  let ownedFarms = 0;
  let ownedMines = 0;
  let ownedFactories = 0;
  let ownedBanks = 0;
  let ownedTemples = 0;
  let ownedWizards = 0;
  let autotapCps = 0.2;
  let clickBoostCost = 0.2;
  let clickBoostAdd = 0.02;
  let upgradeCost = 2.5;
  let pickaxeCost = 500;
  let farmCost = 150000;
  let mineCost = 60000000;
  let factoryCost = 310000;
  let bankCost = 799000;
  let templeCost = 2500000;
  let wizardCost = 1010000;
  let numberFormatMode = "normal";

  const manaIconUrl = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/af8bc113-d9a4-40cf-9077-06b673c583e0/dlyaxmt-560e69d6-5c7f-4398-a1c2-185ea8492e09.png?token=eyJ0eXAiOiJKV1Qi...";
  const manaEmoji = '<img src="' + manaIconUrl + '" alt="Mana" class="mana-icon" />';

  function formatNumberPlain(value) {
    value = Number(value) || 0;
    if (value >= 1000) {
      const tier = Math.floor(Math.log10(value) / 3);
      const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Udc", "Ddc", "Tdc", "Qadc"];
      const suffix = suffixes[tier - 1] || "";
      const scale = Math.pow(10, tier * 3);
      const scaled = value / scale;
      return `${scaled.toFixed(2)}${suffix}`;
    }
    return Math.floor(value).toLocaleString();
  }

  function formatCookieValue(value) {
    value = Number(value) || 0;
    if (value >= 1000) {
      const tier = Math.floor(Math.log10(value) / 3);
      const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Udc", "Ddc", "Tdc", "Qadc"];
      const suffix = suffixes[tier - 1] || "";
      const scale = Math.pow(10, tier * 3);
      const scaled = value / scale;
      return `${scaled.toFixed(2)}${suffix}`;
    }
    if (Math.abs(value - Math.round(value)) > 0.0001) return value.toFixed(2);
    return Math.round(value).toLocaleString();
  }

  function updateDisplay() {
    const displayValue = typeof manaCount === "number" ? manaCount : 0;
    cookieCount.innerHTML = `
      <span class="inline-cookie">${manaEmoji}</span>
      <span class="cookie-number">${formatCookieValue(displayValue)}</span>
    `;
    perSecond.innerHTML = `${formatCookieValue(cookiesPerSecond)} mps`;

    if (document.getElementById("autotap-label")) {
      document.getElementById("autotap-label").innerHTML = `<strong>Autotap: ${ownedAutotaps}</strong><span class="subtitle">+${formatCookieValue(autotapCps)}/s</span>`;
    }
    if (document.getElementById("clickboost-label")) {
      document.getElementById("clickboost-label").innerHTML = `<strong>Clickboost: ${ownedClickBoosts}</strong><span class="subtitle">+${formatCookieValue(clickBoostAdd)}/click</span>`;
    }
    if (document.getElementById("pickaxe-label")) {
      document.getElementById("pickaxe-label").innerHTML = `<strong>Pickaxe: ${ownedPickaxes}</strong><span class="subtitle">+${formatCookieValue(500)}/s</span>`;
    }
    if (document.getElementById("farm-label")) {
      document.getElementById("farm-label").innerHTML = `<strong>Shovel: ${ownedFarms}</strong><span class="subtitle">+${formatCookieValue(7000)}/s</span>`;
    }
    if (document.getElementById("mine-label")) {
      document.getElementById("mine-label").innerHTML = `<strong>Crystal: ${ownedMines}</strong><span class="subtitle">+${formatCookieValue(54000)}/s</span>`;
    }
    if (document.getElementById("factory-label")) {
      document.getElementById("factory-label").innerHTML = `<strong>Factory: ${ownedFactories}</strong><span class="subtitle">+${formatCookieValue(280000)}/s</span>`;
    }
    if (document.getElementById("bank-label")) {
      document.getElementById("bank-label").innerHTML = `<strong>Shield: ${ownedBanks}</strong><span class="subtitle">+${formatCookieValue(1700000)}/s</span>`;
    }
    if (document.getElementById("temple-label")) {
      document.getElementById("temple-label").innerHTML = `<strong>Temple: ${ownedTemples}</strong><span class="subtitle">+${formatCookieValue(7800000)}/s</span>`;
    }
    if (document.getElementById("wizard-label")) {
      document.getElementById("wizard-label").innerHTML = `<strong>Gametower: ${ownedWizards}</strong><span class="subtitle">+${formatCookieValue(39000000)}/s</span>`;
    }

    if (document.getElementById("total-cookies-row")) {
      document.getElementById("total-cookies-row").textContent = `${formatCookieValue(totalMana)}`;
    }
    if (document.getElementById("clicks-row")) {
      document.getElementById("clicks-row").textContent = formatNumberPlain(clickCount);
    }
    if (document.getElementById("total-buildings-row")) {
      document.getElementById("total-buildings-row").textContent = formatNumberPlain(ownedAutotaps + ownedClickBoosts + ownedPickaxes + ownedFarms + ownedMines + ownedFactories + ownedBanks + ownedTemples + ownedWizards);
    }
  }

  function computeCookiesPerSecond() {
    let cps = 0;
    cps += ownedAutotaps * autotapCps;
    cps += ownedPickaxes * 16;
    cps += ownedFarms * 2560;
    cps += ownedMines * 409600;
    cps += ownedFactories * 490;
    cps += ownedBanks * 2500;
    cps += ownedTemples * 16000;
    cps += ownedWizards * 92000;
    cookiesPerSecond = cps;
    return cps;
  }

  function clearSelectedTabs() {
    [buildingsButton, upgradesButton, statsButton, settingsButton].forEach((btn) => {
      if (btn) {
        btn.classList.remove("selected");
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  function hideAllPanels() {
    if (upgradeContainer) upgradeContainer.style.display = "none";
    if (upgradesContainer) upgradesContainer.style.display = "none";
    if (statsContainer) statsContainer.style.display = "none";
    if (settingsContainer) settingsContainer.style.display = "none";
  }

  function showTab(tabName) {
    hideAllPanels();
    clearSelectedTabs();

    switch (tabName) {
      case "buildings":
        if (upgradeContainer) upgradeContainer.style.display = "flex";
        if (buildingsButton) {
          buildingsButton.classList.add("selected");
          buildingsButton.setAttribute("aria-pressed", "true");
        }
        break;

      case "upgrades":
        if (upgradesContainer) upgradesContainer.style.display = "flex";
        if (upgradesButton) {
          upgradesButton.classList.add("selected");
          upgradesButton.setAttribute("aria-pressed", "true");
        }
        break;

      case "stats":
        if (statsContainer) statsContainer.style.display = "flex";
        if (statsButton) {
          statsButton.classList.add("selected");
          statsButton.setAttribute("aria-pressed", "true");
        }
        break;

      case "settings":
        if (settingsContainer) settingsContainer.style.display = "flex";
        if (settingsButton) {
          settingsButton.classList.add("selected");
          settingsButton.setAttribute("aria-pressed", "true");
        }
        break;
    }
  }

  function startInterval() {
    setInterval(() => {
      const totalTick = ownedAutotaps * autotapCps;
      manaCount += totalTick / 60;
      totalMana += totalTick / 60;
      computeCookiesPerSecond();
      updateDisplay();
    }, 1000 / 60);
  }

  function saveProgress(username) {
    try {
      const data = {
        manaCount,
        totalMana,
        clickCount,
        ownedAutotaps,
        ownedClickBoosts,
        ownedPickaxes,
        ownedFarms,
        ownedMines,
        ownedFactories,
        ownedBanks,
        ownedTemples,
        ownedWizards
      };
      localStorage.setItem(`cookieClicks_${username}`, JSON.stringify(data));
    } catch (e) {}
  }

  function loadProgress(username) {
    try {
      const saved = localStorage.getItem(`cookieClicks_${username}`);
      if (saved) {
        const data = JSON.parse(saved);
        manaCount = Number(data.manaCount) || 0;
        totalMana = Number(data.totalMana) || 0;
        clickCount = Number(data.clickCount) || 0;
        ownedAutotaps = Number(data.ownedAutotaps) || 0;
        ownedClickBoosts = Number(data.ownedClickBoosts) || 0;
        ownedPickaxes = Number(data.ownedPickaxes) || 0;
        ownedFarms = Number(data.ownedFarms) || 0;
        ownedMines = Number(data.ownedMines) || 0;
        ownedFactories = Number(data.ownedFactories) || 0;
        ownedBanks = Number(data.ownedBanks) || 0;
        ownedTemples = Number(data.ownedTemples) || 0;
        ownedWizards = Number(data.ownedWizards) || 0;
      }
    } catch (e) {}
    computeCookiesPerSecond();
    updateDisplay();
  }

  function enterGame(usernameRaw) {
    let username = (usernameRaw || "").trim();
    if (!username) {
      username = `player${Math.floor(Math.random() * 1000000000)}`;
    }
    username = username.replace(/[^a-zA-Z0-9_.]/g, "");
    if (!username) return;

    if (playerNameElement) playerNameElement.textContent = username;

    if (container) container.style.display = "block";
    if (usernameContainer) usernameContainer.style.display = "none";
    if (loadingScreen) loadingScreen.style.display = "none";

    loadProgress(username);
    updateDisplay();
    startInterval();

    setInterval(() => {
      try {
        saveProgress(username);
      } catch (e) {}
    }, 3000);
  }

  function playSfx(audio) {
    if (!audio) return;
    try {
      const clone = audio.cloneNode(true);
      clone.volume = audio.volume;
      clone.play().catch(() => {});
      document.body.appendChild(clone);
      setTimeout(() => {
        clone.remove();
      }, 700);
    } catch (e) {}
  }

  cookie.addEventListener("click", function (event) {
    const now = Date.now();
    if (now - lastClickTime >= 10) {
      lastClickTime = Date.now();
      manaCount += 0.01 + ownedClickBoosts * 0.02;
      totalMana += 0.01 + ownedClickBoosts * 0.02;
      clickCount += 1;
      updateDisplay();
      playSfx(document.getElementById("click-sound"));
    }
  });

  let lastClickTime = 0;

  document.getElementById("upgrade-button").addEventListener("click", function () {
    if (manaCount >= upgradeCost) {
      manaCount -= upgradeCost;
      ownedAutotaps += 1;
      upgradeCost = upgradeCost * 1.3;
      computeCookiesPerSecond();
      updateDisplay();
      playSfx(document.getElementById("upgrade-sound"));
    }
  });

  document.getElementById("clickboost-button").addEventListener("click", function () {
    if (manaCount >= clickBoostCost) {
      manaCount -= clickBoostCost;
      ownedClickBoosts += 1;
      clickBoostCost = clickBoostCost * 1.7;
      computeCookiesPerSecond();
      updateDisplay();
      playSfx(document.getElementById("upgrade-sound"));
    }
  });

  topUpgradeButton.addEventListener("click", function () {
    showTab("buildings");
  });

  if (buildingsButton) {
    buildingsButton.addEventListener("click", function () {
      showTab("buildings");
    });
  }

  if (upgradesButton) {
    upgradesButton.addEventListener("click", function () {
      showTab("upgrades");
    });
  }

  if (statsButton) {
    statsButton.addEventListener("click", function () {
      showTab("stats");
    });
  }

  if (settingsButton) {
    settingsButton.addEventListener("click", function () {
      showTab("settings");
    });
  }

  if (notifyButton) {
    notifyButton.addEventListener("click", function () {
      const username = usernameInput ? usernameInput.value.trim() : "";
      enterGame(username);
    });
  }

  if (musicVolumeSlider) {
    musicVolumeSlider.addEventListener("input", (e) => {
      const value = Number(e.target.value);
      const pct = (value / 5) * 100;
      musicVolumeSlider.style.background = `linear-gradient(90deg, #2a79e0 0%, #2a79e0 ${pct}%, #ededed ${pct}%)`;
    });
  }

  if (sfxVolumeSlider) {
    sfxVolumeSlider.addEventListener("input", (e) => {
      const value = Number(e.target.value);
      const pct = (value / 5) * 100;
      sfxVolumeSlider.style.background = `linear-gradient(90deg, #2a79e0 0%, #2a79e0 ${pct}%, #ededed ${pct}%)`;
    });
  }

  if (numberFormatButton && numberFormatMenu) {
    numberFormatButton.addEventListener("click", function () {
      numberFormatMenu.classList.toggle("open");
    });
  }

  if (usernameInput) {
    usernameInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        const value = usernameInput.value.trim();
        enterGame(value);
      }
    });
  }

  showTab("buildings");
  updateDisplay();
});
