

document.addEventListener('DOMContentLoaded', function () {
    function createNotification(title, message) {
      if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notifications.");
        return false;
      }
      try {
        const options = {
          body: message,
          icon: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/af8bc113-d9a4-40cf-9077-06b673c583e0/dl7kpss-efb9b50c-edb4-41ea-ac4e-ca3f93c6c189.png/v1/fit/w_800,h_800/cookie_tappers_icon_by_unknown9394998_dl7kpss-414w-2x.png",
          badge: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/af8bc113-d9a4-40cf-9077-06b673c583e0/dl7kpss-efb9b50c-edb4-41ea-ac4e-ca3f93c6c189.png/v1/fit/w_800,h_800/cookie_tappers_icon_by_unknown9394998_dl7kpss-414w-2x.png",
          vibrate: [200, 100, 200],
          data: { url: window.location.href }
        };
        const notification = new Notification(title, options);
        notification.onclick = (event) => {
          event.preventDefault();
          try { window.focus(); } catch (e) {}
          try { notification.close(); } catch (e) {}
        };
        return true;
      } catch (err) {
        console.warn("Failed to create Notification:", err);
        return false;
      }
    }

    function requestPermissionAndNotify(title, message) {
      if (!("Notification" in window)) {
        console.warn("Notifications not supported.");
        try { alert(title + "\n\n" + message); } catch (e) {}
        return;
      }

      if (Notification.permission === 'granted') {
        const ok = createNotification(title, message);
        if (!ok) {
          try { alert(title + "\n\n" + message); } catch (e) {}
        }
        return;
      }

      const handleResult = (perm) => {
        try {
          if (perm === 'granted') {
            const ok = createNotification(title, message);
            if (!ok) {
              try { alert(title + "\n\n" + message); } catch (e) {}
            }
          } else {
            console.log('Notification permission result:', perm);
          }
        } catch (err) {
          console.error('Error handling permission result:', err);
        }
      };

      try {
        const maybePromise = Notification.requestPermission(handleResult);
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.then(handleResult).catch((err) => {
            console.warn('requestPermission promise rejected:', err);
          });
        }
      } catch (e) {
        try {
          Notification.requestPermission(function (perm) {
            handleResult(perm);
          });
        } catch (err) {
          console.warn('Notification.requestPermission failed completely:', err);
        }
      }
    }

    let manaCount = 0;
    let totalMana = 0;
    let cookiesPerClick = 0.01;
    let upgradeCost = 2;
    let pickaxeCost = 60;
    let farmCost = 220;
    let mineCost = 1100;
    let factoryCost = 3400;
    let bankCost = 8900;
    let templeCost = 30000;
    let wizardCost = 125000;

    let autotapCps = 0.25;
    let pickaxeCps = 1.5;
    let farmCps = 8;
    let mineCps = 42;
    let factoryCps = 150;
    let bankCps = 320;
    let templeCps = 999;
    let wizardCps = 2800;

    let clickBoostCost = 0.15;
    const clickBoostAdd = 0.005;
    let ownedClickBoosts = 0;

    cookiesPerClick = 0.01 + (clickBoostAdd * ownedClickBoosts);

    let cookiesPerSecond = 0;
    let lastClickTime = 0;
    let intervalId = null;

    let ownedAutotaps = 0;
    let ownedPickaxes = 0;
    let ownedFarms = 0;
    let ownedMines = 0;
    let ownedFactories = 0;
    let ownedBanks = 0;
    let ownedTemples = 0;
    let ownedWizards = 0;

    let producedAutotaps = 0;
    let producedPickaxes = 0;
    let producedFarms = 0;
    let producedMines = 0;
    let producedFactories = 0;
    let producedBanks = 0;
    let producedTemples = 0;
    let producedWizards = 0;

    let clickCount = 0;
    let cursorMultiplier = 1;

    const suffixes = ["k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Udc", "Ddc", "Tdc", "Qadc"];
    const manaIconUrl = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/af8bc113-d9a4-40cf-9077-06b673c583e0/dlyaxmt-560e69d6-5c7f-4398-a1c2-185ea8492e09.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9hZjhiYzExMy1kOWE0LTQwY2YtOTA3Ny0wNmI2NzNjNTgzZTAvZGx5YXhtdC01NjBlNjlkNi01YzdmLTQzOTgtYTFjMi0xODVlYTg0OTJlMDkucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.evf-Y9_EM8dsSuCkPY9RQ2z0n55A9y5sDLTWWaj8PoE';
    const manaEmoji = `<img src="${manaIconUrl}" alt="Mana" class="mana-icon" />`;

    const loadingScreen = document.querySelector('.loading-screen');
    const container = document.querySelector('.container');
    const usernameContainer = document.querySelector('.username-container');
    const cookieCountElement = document.getElementById('cookie-count');
    const perSecondElement = document.getElementById('per-second');
    const cookieElement = document.getElementById('cookie');
    const upgradeButtonElement = document.getElementById('upgrade-button');
    const pickaxeButtonElement = document.getElementById('pickaxe-button');
    const farmButtonElement = document.getElementById('farm-button');
    const mineButtonElement = document.getElementById('mine-button');
    const factoryButtonElement = document.getElementById('factory-button');
    const bankButtonElement = document.getElementById('bank-button');
    const templeButtonElement = document.getElementById('temple-button');
    const wizardButtonElement = document.getElementById('wizard-button');
    const clickboostButtonElement = document.getElementById('clickboost-button');
    const clickboostLabelElement = document.getElementById('clickboost-label');
    const clickSoundElement = document.getElementById('click-sound');
    const upgradeSoundElement = document.getElementById('upgrade-sound');
    const upgradedSoundElement = document.getElementById('upgraded-sound');
    const userInfoElement = document.querySelector('.user-info');
    const usernameDisplayElement = document.getElementById('username-display');
    const notifyButton = document.getElementById('notify-btn');
    const buildingsButton = document.getElementById('buildings-button');
    const upgradesButton = document.getElementById('upgrades-button');
    const statsButton = document.getElementById('stats-button');
    const changelogButton = document.getElementById('changelog-button');
    const settingsButton = document.getElementById('settings-button');
    const upgradeContainer = document.getElementById('upgrade-container');
    const upgradesContainer = document.getElementById('upgrades-container');
    const upgradesListElement = document.getElementById('upgrades-list');
    const statsContainer = document.getElementById('stats-container');
    const changelogContainer = document.getElementById('changelog-container');
    const settingsContainer = document.getElementById('settings-container');
    const totalCookiesRow = document.getElementById('total-cookies-row');
    const clicksRow = document.getElementById('clicks-row');
    const totalBuildingsRow = document.getElementById('total-buildings-row');

    const themeDropdownRoot = document.getElementById('theme-dropdown');
    const themeDropdownButton = document.getElementById('theme-button');
    const themeDropdownMenu = document.getElementById('themeDropdown');

    const numberFormatRoot = document.getElementById('numberformat-dropdown');
    const numberFormatButton = document.getElementById('numberformat-button');
    const numberFormatMenu = document.getElementById('numberformatDropdown');

    const sfxVolumeSlider = document.getElementById('sfx-volume');

    const AUDIO_MAX = 5;

    function clampNumber(v, min, max) {
        let n = Number(v) || 0;
        if (n < min) n = min;
        if (n > max) n = max;
        return n;
    }

    function setSfxVolume(val) {
        const v = clampNumber(val, 0, AUDIO_MAX) / AUDIO_MAX;
        if (clickSoundElement) clickSoundElement.volume = v;
        if (upgradeSoundElement) upgradeSoundElement.volume = v;
        if (upgradedSoundElement) upgradedSoundElement.volume = v;
    }

    function getDefaultSliderFillColor() {
        try {
            const cs = getComputedStyle(document.documentElement);
            const val = cs.getPropertyValue('--accent-2') || cs.getPropertyValue('--accent');
            if (val && val.trim()) return val.trim();
        } catch (e) {}
        return '#2a79e0';
    }

    function updateSliderBackground(slider, fillColor, emptyColor = '#ededed') {
        if (!slider) return;
        const fill = (typeof fillColor === 'string' && fillColor.trim()) ? fillColor : getDefaultSliderFillColor();
        const val = Number(slider.value);
        const pct = Math.round((val / AUDIO_MAX) * 100);
        slider.style.background = `linear-gradient(90deg, ${fill} ${pct}%, ${emptyColor} ${pct}%)`;
    }

    if (sfxVolumeSlider) {
        sfxVolumeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10);
            setSfxVolume(value);
            updateSliderBackground(e.target);
        });
    }

    let numberFormatMode = 'normal';
    try { numberFormatMode = localStorage.getItem('cookieClicks_numberFormat') || 'normal'; } catch (e) {}

    const emojiSuffixMap = {
        k: 'a',
        M: 'b',
        B: 'c',
        T: 'd',
        Qa: 'e',
        Qi: 'f',
        Sx: 'g',
        Sp: 'h',
        Oc: 'i',
        No: 'j',
        Dc: 'k',
        Udc: 'l',
        Ddc: 'm',
        Tdc: 'n',
        Qadc: 'o'
    };

    function formatNumberEngineering(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const exponent = tier * 3;
            const scale = Math.pow(10, exponent);
            const scaled = number / scale;
            return `${scaled.toFixed(2)}e+${exponent}`;
        }
        return Math.floor(number).toLocaleString();
    }

    function formatNumberEngineeringPlain(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const exponent = tier * 3;
            const scale = Math.pow(10, exponent);
            const scaled = number / scale;
            return `${scaled.toFixed(2)}e+${exponent}`;
        }
        if (Math.abs(number - Math.round(number)) > 0.0001) return number.toFixed(2);
        return Math.floor(number).toLocaleString();
    }

    function formatNumberEmojis(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const suffix = suffixes[tier - 1] || '';
            const scale = Math.pow(10, tier * 3);
            const scaled = number / scale;
            const emoji = emojiSuffixMap[suffix] || suffix;
            return `${scaled.toFixed(2)}<span class="num-suffix">${emoji}</span>`;
        }
        return Math.floor(number).toLocaleString();
    }

    function formatNumberEmojisPlain(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const suffix = suffixes[tier - 1] || '';
            const scale = Math.pow(10, tier * 3);
            const scaled = number / scale;
            const emoji = emojiSuffixMap[suffix] || suffix;
            return `${scaled.toFixed(2)}${emoji}`;
        }
        if (Math.abs(number - Math.round(number)) > 0.0001) return number.toFixed(2);
        return Math.floor(number).toLocaleString();
    }

    function formatNumberNormal(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const suffix = suffixes[tier - 1] || '';
            const scale = Math.pow(10, tier * 3);
            const scaled = number / scale;
            return `${scaled.toFixed(2)}<span class="num-suffix">${suffix}</span>`;
        }
        return Math.floor(number).toLocaleString();
    }

    function formatNumberNormalPlain(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const suffix = suffixes[tier - 1] || '';
            const scale = Math.pow(10, tier * 3);
            const scaled = number / scale;
            return `${scaled.toFixed(2)}${suffix}`;
        }
        if (Math.abs(number - Math.round(number)) > 0.0001) return number.toFixed(2);
        return Math.floor(number).toLocaleString();
    }

    function formatNumber(number) {
        switch (numberFormatMode) {
            case 'engineering': return formatNumberEngineering(number);
            case 'emojis': return formatNumberEmojis(number);
            default: return formatNumberNormal(number);
        }
    }

    function formatNumberPlain(number) {
        switch (numberFormatMode) {
            case 'engineering': return formatNumberEngineeringPlain(number);
            case 'emojis': return formatNumberEmojisPlain(number);
            default: return formatNumberNormalPlain(number);
        }
    }

    function formatCookieValue(number) {
        if (numberFormatMode === 'engineering' || numberFormatMode === 'emojis' || numberFormatMode === 'normal') {
            if (number >= 1000) return formatNumber(number);
            if (Math.abs(number - Math.round(number)) > 0.0001) return number.toFixed(2);
            return Math.round(number).toLocaleString();
        } else {
            if (Math.abs(number - Math.round(number)) > 0.0001) return number.toFixed(2);
            return Math.round(number).toLocaleString();
        }
    }

    function formatPerSecond(number) {
        if (numberFormatMode === 'engineering' || numberFormatMode === 'emojis' || numberFormatMode === 'normal') {
            if (number >= 1000) return formatNumber(number);
            if (Math.abs(number - Math.round(number)) > 0.0001) return number.toFixed(2);
            return Math.round(number).toLocaleString();
        } else {
            if (Math.abs(number - Math.round(number)) > 0.0001) return number.toFixed(2);
            return Math.round(number).toLocaleString();
        }
    }

    function animateNumber(el, target, opts = {}) {
        if (!el) return;
        const duration = (typeof opts.duration === 'number') ? opts.duration : 420;
        const formatter = opts.formatter || (n => formatNumber(Math.floor(n)));
        const allowDecrease = !!opts.allowDecrease;

        const targetNum = Math.floor(Number(target) || 0);

        let start = 0;
        if (typeof el._displayedValue === 'number') {
            start = el._displayedValue;
        } else if (el.dataset && el.dataset.value) {
            start = Math.floor(Number(el.dataset.value) || 0);
        } else {
            const parsed = parseFloat((el.textContent || '').replace(/[^0-9.\-]/g, '')) || 0;
            start = Math.floor(parsed);
        }

        if (targetNum < start && !allowDecrease) {
            if (el._animFrame) {
                cancelAnimationFrame(el._animFrame);
                el._animFrame = null;
            }
            el._displayedValue = targetNum;
            if (el.dataset) el.dataset.value = String(targetNum);
            el.innerHTML = formatter(targetNum);
            el.classList.add('animating-number');
            setTimeout(() => { el.classList.remove('animating-number'); }, 120);
            return;
        }

        if (start === targetNum) {
            el._displayedValue = targetNum;
            if (el.dataset) el.dataset.value = String(targetNum);
            el.innerHTML = formatter(targetNum);
            return;
        }

        if (el._animFrame) {
            cancelAnimationFrame(el._animFrame);
            el._animFrame = null;
        }

        const startTime = performance.now();
        el.classList.add('animating-number');

        function easeOutQuad(t) { return t * (2 - t); }

        function step(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const eased = easeOutQuad(t);
            const current = Math.floor(start + (targetNum - start) * eased);
            el._displayedValue = current;
            if (el.dataset) el.dataset.value = String(current);
            el.innerHTML = formatter(current);
            if (t < 1) {
                el._animFrame = requestAnimationFrame(step);
            } else {
                el._displayedValue = targetNum;
                if (el.dataset) el.dataset.value = String(targetNum);
                el.innerHTML = formatter(targetNum);
                el._animFrame = null;
                setTimeout(() => { el.classList.remove('animating-number'); }, 80);
            }
        }

        el._animFrame = requestAnimationFrame(step);
    }

    function computeTotalBuildings() {
        return ownedAutotaps + ownedClickBoosts + ownedPickaxes + ownedFarms + ownedMines + ownedFactories + ownedBanks + ownedTemples + ownedWizards;
    }

    function computeCookiesPerSecond() {
        let cps = 0;
        cps += ownedAutotaps * autotapCps;
        cps += ownedPickaxes * pickaxeCps;
        cps += ownedFarms * farmCps;
        cps += ownedMines * mineCps;
        cps += ownedFactories * factoryCps;
        cps += ownedBanks * bankCps;
        cps += ownedTemples * templeCps;
        cps += ownedWizards * wizardCps;
        cookiesPerSecond = cps;
        return cps;
    }

    function ensureButtonStructure(btn) {
        if (!btn) return;
        if (btn.querySelector('.btn-cost')) return;

        if (!btn.hasAttribute('role')) btn.setAttribute('role', 'button');
        if (!btn.hasAttribute('tabindex')) btn.setAttribute('tabindex', '0');

        btn.innerHTML = `
            <span class="btn-left-icon" aria-hidden="true">💧</span>
            <span class="btn-center" aria-hidden="true"></span>
            <span class="btn-cost">
                <span class="inline-cookie"></span>
                <span class="cost" data-value="0">${formatCookieValue(0)}</span>
            </span>
        `;
    }

    function addRippleEffect(btn) {
        if (!btn || btn._rippleAttached) return;
        btn._rippleAttached = true;

        const computedPos = window.getComputedStyle(btn).position;
        if (computedPos === 'static') btn.style.position = 'relative';
        btn.style.overflow = 'hidden';

        function createRippleAt(x, y) {
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.8;
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (x - rect.left - size / 2) + 'px';
            ripple.style.top = (y - rect.top - size / 2) + 'px';
            btn.appendChild(ripple);

            requestAnimationFrame(() => {
                ripple.classList.add('ripple-active');
            });

            setTimeout(() => {
                try { ripple.remove(); } catch (e) {}
            }, 750);
        }

        btn.addEventListener('pointerdown', function (ev) {
            if (ev.button !== undefined && ev.button !== 0) return;
            createRippleAt(ev.clientX, ev.clientY);
        });

        btn.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                const rect = btn.getBoundingClientRect();
                createRippleAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
                try { btn.click(); } catch (e) {}
            }
        });
    }

    function wireUpgradeButtonRipples() {
        const btns = Array.from(document.querySelectorAll('.upgrade-item button'));
        btns.forEach(b => addRippleEffect(b));
    }

    function initUpgradeButtons() {
        ensureButtonStructure(upgradeButtonElement);
        ensureButtonStructure(pickaxeButtonElement);
        ensureButtonStructure(farmButtonElement);
        ensureButtonStructure(mineButtonElement);
        ensureButtonStructure(factoryButtonElement);
        ensureButtonStructure(bankButtonElement);
        ensureButtonStructure(templeButtonElement);
        ensureButtonStructure(wizardButtonElement);
        ensureButtonStructure(clickboostButtonElement);

        [upgradeButtonElement, pickaxeButtonElement, farmButtonElement, mineButtonElement, factoryButtonElement, bankButtonElement, templeButtonElement, wizardButtonElement, clickboostButtonElement].forEach(btn => {
            if (btn && !btn.classList.contains('glowing-btn')) btn.classList.add('glowing-btn');
        });

        wireUpgradeButtonRipples();
    }

    function updateUpgradesPanel() {
        if (!upgradesListElement) return;
        upgradesListElement.innerHTML = '';

        const nothing = document.createElement('div');
        nothing.className = 'nothing';
        nothing.textContent = `Upgrades are a work in progress... stay tuned for more updates!`;
        upgradesListElement.appendChild(nothing);
    }

    function updateDisplay() {
        if (cookieCountElement) {
            const existingNumber = cookieCountElement.querySelector('.cookie-number');
            const targetMana = manaCount;

            if (!existingNumber) {
                cookieCountElement.innerHTML = `
                    <span class="inline-cookie">${manaEmoji}</span>
                    <span class="cookie-number" data-value="${targetMana}">${formatCookieValue(targetMana)}</span>
                `;
                const el = cookieCountElement.querySelector('.cookie-number');
                if (el) {
                    el._displayedValue = targetMana;
                    if (el.dataset) el.dataset.value = String(targetMana);
                }
            } else {
                existingNumber._displayedValue = Math.floor(targetMana);
                if (existingNumber.dataset) existingNumber.dataset.value = String(Math.floor(targetMana));
                existingNumber.innerHTML = formatCookieValue(targetMana);
            }
        }

        if (perSecondElement) perSecondElement.innerHTML = `${formatPerSecond(cookiesPerSecond)} mps`;

        const labels = [
            { id: 'autotap-label', text: `Autotap: ${ownedAutotaps}`, cps: autotapCps, owned: ownedAutotaps, produced: producedAutotaps, tooltipId: 'autotap-tooltip' },
            { id: 'clickboost-label', text: `Clickboost: ${ownedClickBoosts}`, cps: 0, owned: ownedClickBoosts, produced: 0, tooltipId: 'clickboost-tooltip' },
            { id: 'pickaxe-label', text: `Pickaxe: ${ownedPickaxes}`, cps: pickaxeCps, owned: ownedPickaxes, produced: producedPickaxes, tooltipId: 'pickaxe-tooltip' },
            { id: 'farm-label', text: `Shovel: ${ownedFarms}`, cps: farmCps, owned: ownedFarms, produced: producedFarms, tooltipId: 'farm-tooltip' },
            { id: 'mine-label', text: `Crystal: ${ownedMines}`, cps: mineCps, owned: ownedMines, produced: producedMines, tooltipId: 'mine-tooltip' },
            { id: 'factory-label', text: `Factory: ${ownedFactories}`, cps: factoryCps, owned: ownedFactories, produced: producedFactories, tooltipId: 'factory-tooltip' },
            { id: 'bank-label', text: `Shield: ${ownedBanks}`, cps: bankCps, owned: ownedBanks, produced: producedBanks, tooltipId: 'bank-tooltip' },
            { id: 'temple-label', text: `Temple: ${ownedTemples}`, cps: templeCps, owned: ownedTemples, produced: producedTemples, tooltipId: 'temple-tooltip' },
            { id: 'wizard-label', text: `Gametower: ${ownedWizards}`, cps: wizardCps, owned: ownedWizards, produced: producedWizards, tooltipId: 'wizard-tooltip' },
        ];

        labels.forEach(l => {
            const el = document.getElementById(l.id);
            if (el) {
                const formattedCps = formatPerSecond(l.cps);
                const itemTotalCps = l.owned * l.cps;
                const percent = (cookiesPerSecond > 0) ? ((itemTotalCps / cookiesPerSecond) * 100).toFixed(2) : '0.00';
                const producedVal = Math.floor(l.produced);
                const producingVal = Math.floor(itemTotalCps);

                if (l.id === 'clickboost-label') {
                    el.innerHTML = `<strong>${l.text}</strong><span class="subtitle">+${formatCookieValue(clickBoostAdd)}/click</span><span class="tooltiptext" id="${l.tooltipId}">Gives ${formatCookieValue(clickBoostAdd)} per upgrade</span>`;
                } else {
                    el.innerHTML = `<strong>${l.text}</strong><span class="subtitle">+${formattedCps}/s</span><span class="tooltiptext" id="${l.tooltipId}">${percent}% of mps<br>${manaEmoji}<span class="produced-number" data-value="${producedVal}">${formatNumber(producedVal)}</span> produced<br>Producing <span class="producing-number" data-value="${producingVal}">${formatCookieValue(producingVal)}</span>${manaEmoji}/s</span>`;
                }

                const tooltipEl = document.getElementById(l.tooltipId);
                if (tooltipEl) {
                    const prodSpan = tooltipEl.querySelector('.produced-number');
                    const prodCpsSpan = tooltipEl.querySelector('.producing-number');
                    if (prodSpan) {
                        animateNumber(prodSpan, producedVal, { duration: 700, formatter: (n) => formatNumber(Math.floor(n)), allowDecrease: false });
                    }
                    if (prodCpsSpan) {
                        animateNumber(prodCpsSpan, producingVal, { duration: 700, formatter: (n) => formatCookieValue(Math.floor(n)), allowDecrease: false });
                    }
                }
            }
        });

        const setCost = (btn, value) => {
            if (!btn) return;
            const span = btn.querySelector('.cost');
            if (span) {
                span.innerHTML = formatCookieValue(value);
                if (span.dataset) span.dataset.value = String(value);
            } else {
                ensureButtonStructure(btn);
                const s = btn.querySelector('.cost');
                if (s) {
                    s.innerHTML = formatCookieValue(value);
                    if (s.dataset) s.dataset.value = String(value);
                }
            }
        };

        setCost(upgradeButtonElement, upgradeCost);
        setCost(pickaxeButtonElement, pickaxeCost);
        setCost(farmButtonElement, farmCost);
        setCost(mineButtonElement, mineCost);
        setCost(factoryButtonElement, factoryCost);
        setCost(bankButtonElement, bankCost);
        setCost(templeButtonElement, templeCost);
        setCost(wizardButtonElement, wizardCost);
        setCost(clickboostButtonElement, clickBoostCost);

        if (totalCookiesRow) totalCookiesRow.innerHTML = `${manaEmoji} ${formatNumber(Math.floor(totalMana))}`;
        if (clicksRow) clicksRow.innerHTML = `${formatNumber(Math.floor(clickCount))}`;
        if (totalBuildingsRow) totalBuildingsRow.innerHTML = `${formatNumber(Math.floor(computeTotalBuildings()))}`;

        updateUpgradesPanel();
        wireTooltipsInBuildings();
        wireUpgradeButtonRipples();
    }

    function createClickerClone(clicks, x, y) {
        const clone = document.createElement('div');
        clone.className = 'clicker-clone';
        clone.innerHTML = `+${formatCookieValue(cookiesPerClick)}`;
        clone.style.top = `${y}px`;
        clone.style.left = `${x}px`;
        document.body.appendChild(clone);
        requestAnimationFrame(() => {
            clone.style.transform = 'translateY(-25px)';
            clone.style.opacity = '0';
        });
        setTimeout(() => {
            if (clone.parentNode) clone.parentNode.removeChild(clone);
        }, 400);
    }

    function createGoldenCookie(x, y) {
        const goldenCookie = document.createElement('img');
        goldenCookie.src = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/af8bc113-d9a4-40cf-9077-06b673c583e0/dl5xrcg-ca710567-8e32-4fe1-a5dc-0015ee3a93b5.png';
        goldenCookie.className = 'golden-cookie';
        goldenCookie.style.top = `${y}px`;
        goldenCookie.style.left = `${x}px`;
        goldenCookie.addEventListener('click', () => {
            const bonus = 200 + (cookiesPerSecond / 10);
            manaCount += bonus;
            totalMana += bonus;
            updateDisplay();
            if (goldenCookie.parentNode) goldenCookie.parentNode.removeChild(goldenCookie);
        });
        document.body.appendChild(goldenCookie);
        setTimeout(() => {
            if (document.body.contains(goldenCookie)) document.body.removeChild(goldenCookie);
        }, 5000);
    }

    function startInterval() {
        if (intervalId) clearInterval(intervalId);
        const perTick = 1;
        intervalId = setInterval(() => {
            computeCookiesPerSecond();

            const autoContrib = ownedAutotaps * autotapCps * perTick;
            const pickContrib = ownedPickaxes * pickaxeCps * perTick;
            const farmContrib = ownedFarms * farmCps * perTick;
            const mineContrib = ownedMines * mineCps * perTick;
            const factoryContrib = ownedFactories * factoryCps * perTick;
            const bankContrib = ownedBanks * bankCps * perTick;
            const templeContrib = ownedTemples * templeCps * perTick;
            const wizardContrib = ownedWizards * wizardCps * perTick;

            const totalTick = autoContrib + pickContrib + farmContrib + mineContrib + factoryContrib + bankContrib + templeContrib + wizardContrib;

            manaCount += totalTick / 60;
            totalMana += totalTick / 60;

            producedAutotaps += autoContrib / 60;
            producedPickaxes += pickContrib / 60;
            producedFarms += farmContrib / 60;
            producedMines += mineContrib / 60;
            producedFactories += factoryContrib / 60;
            producedBanks += bankContrib / 60;
            producedTemples += templeContrib / 60;
            producedWizards += wizardContrib / 60;

            updateDisplay();
            checkUpgrades();
        }, 1000 / 60);
    }

    function checkUpgrades() {
        if (ownedAutotaps >= 1) { const el = document.getElementById('pickaxe-upgrade'); if (el) el.style.display = 'flex'; }
        if (ownedPickaxes >= 1) { const el = document.getElementById('farm-upgrade'); if (el) el.style.display = 'flex'; }
        if (ownedFarms >= 1) { const el = document.getElementById('mine-upgrade'); if (el) el.style.display = 'flex'; }
        if (ownedMines >= 1) { const el = document.getElementById('factory-upgrade'); if (el) el.style.display = 'flex'; }
        if (ownedFactories >= 1) { const el = document.getElementById('bank-upgrade'); if (el) el.style.display = 'flex'; }
        if (ownedBanks >= 1) { const el = document.getElementById('temple-upgrade'); if (el) el.style.display = 'flex'; }
        if (ownedTemples >= 1) { const el = document.getElementById('wizard-upgrade'); if (el) el.style.display = 'flex'; }
    }

    function saveProgress(username) {
        const progress = {
            manaCount,
            cookiesPerClick,
            cookiesPerSecond,
            upgradeCost,
            pickaxeCost,
            farmCost,
            mineCost,
            factoryCost,
            bankCost,
            templeCost,
            wizardCost,
            ownedAutotaps,
            ownedClickBoosts,
            ownedPickaxes,
            ownedFarms,
            ownedMines,
            ownedFactories,
            ownedBanks,
            ownedTemples,
            ownedWizards,
            totalMana,
            clickCount,
            autotapCps,
            cursorMultiplier,
            producedAutotaps,
            producedPickaxes,
            producedFarms,
            producedMines,
            producedFactories,
            producedBanks,
            producedTemples,
            producedWizards
        };
        try { localStorage.setItem(`cookieClicks_${username}`, JSON.stringify(progress)); } catch (e) {}
    }

    function loadProgress(username) {
        try {
            const saved = localStorage.getItem(`cookieClicks_${username}`);
            if (saved) {
                const p = JSON.parse(saved);
                manaCount = (typeof p.manaCount !== 'undefined') ? p.manaCount : (typeof p.cookieCount !== 'undefined' ? p.cookieCount : 0);
                cookiesPerClick = p.cookiesPerClick || cookiesPerClick;
                cookiesPerSecond = p.cookiesPerSecond || 0;
                upgradeCost = p.upgradeCost || upgradeCost;
                pickaxeCost = p.pickaxeCost || pickaxeCost;
                farmCost = p.farmCost || farmCost;
                mineCost = p.mineCost || mineCost;
                factoryCost = p.factoryCost || factoryCost;
                bankCost = p.bankCost || bankCost;
                templeCost = p.templeCost || templeCost;
                wizardCost = p.wizardCost || wizardCost;
                ownedAutotaps = p.ownedAutotaps || 0;
                ownedClickBoosts = p.ownedClickBoosts || 0;
                ownedPickaxes = p.ownedPickaxes || 0;
                ownedFarms = p.ownedFarms || 0;
                ownedMines = p.ownedMines || 0;
                ownedFactories = p.ownedFactories || 0;
                ownedBanks = p.ownedBanks || 0;
                ownedTemples = p.ownedTemples || 0;
                ownedWizards = p.ownedWizards || 0;
                totalMana = (typeof p.totalMana !== 'undefined') ? p.totalMana : (typeof p.totalCookies !== 'undefined' ? p.totalCookies : manaCount);
                clickCount = p.clickCount || 0;
                autotapCps = (typeof p.autotapCps !== 'undefined') ? p.autotapCps : autotapCps;
                cursorMultiplier = (typeof p.cursorMultiplier !== 'undefined') ? p.cursorMultiplier : cursorMultiplier;
                producedAutotaps = p.producedAutotaps || 0;
                producedPickaxes = p.producedPickaxes || 0;
                producedFarms = p.producedFarms || 0;
                producedMines = p.producedMines || 0;
                producedFactories = p.producedFactories || 0;
                producedBanks = p.producedBanks || 0;
                producedTemples = p.producedTemples || 0;
                producedWizards = p.producedWizards || 0;
            }
        } catch (e) {}

        cookiesPerClick = 0.01 + (clickBoostAdd * ownedClickBoosts);
        computeCookiesPerSecond();
        updateDisplay();
        startInterval();
    }

    function playSfx(audioElement) {
        if (!audioElement) return;

        try {
            const sound = audioElement.cloneNode(true);
            sound.volume = audioElement.volume;
            sound.currentTime = 0;

            sound.addEventListener('ended', () => {
                if (sound.parentNode) sound.parentNode.removeChild(sound);
            }, { once: true });

            sound.style.position = 'absolute';
            sound.style.left = '-9999px';
            document.body.appendChild(sound);

            const playPromise = sound.play();
            if (playPromise) {
                playPromise.catch(() => {
                    try {
                        audioElement.currentTime = 0;
                        audioElement.play().catch(() => {});
                    } catch (e) {}
                });
            }
        } catch (err) {
            try {
                audioElement.currentTime = 0;
                audioElement.play().catch(() => {});
            } catch (e) {}
        }
    }

    if (cookieElement) {
        cookieElement.addEventListener('click', (event) => {
            const now = Date.now();
            if (now - lastClickTime >= 10) {
                lastClickTime = now;
                manaCount += cookiesPerClick;
                totalMana += cookiesPerClick;
                clickCount += 1;
                createClickerClone(cookiesPerClick, event.clientX, event.clientY);
                updateDisplay();
                playSfx(clickSoundElement);
            }
        });
    }

    upgradeButtonElement && upgradeButtonElement.addEventListener('click', () => {
        if (manaCount >= upgradeCost) {
            manaCount -= upgradeCost;
            ownedAutotaps++;
            upgradeCost = (upgradeCost * 1.15);
            computeCookiesPerSecond();
            updateDisplay();
            startInterval();
            playSfx(upgradeSoundElement);
        }
    });

    pickaxeButtonElement && pickaxeButtonElement.addEventListener('click', () => {
        if (manaCount >= pickaxeCost) {
            manaCount -= pickaxeCost;
            ownedPickaxes++;
            pickaxeCost = (pickaxeCost * 1.2);
            computeCookiesPerSecond();
            updateDisplay();
            startInterval();
            playSfx(upgradeSoundElement);
        }
    });

    farmButtonElement && farmButtonElement.addEventListener('click', () => {
        if (manaCount >= farmCost) {
            manaCount -= farmCost;
            ownedFarms++;
            farmCost = (farmCost * 1.22);
            computeCookiesPerSecond();
            updateDisplay();
            startInterval();
            playSfx(upgradeSoundElement);
        }
    });

    mineButtonElement && mineButtonElement.addEventListener('click', () => {
        if (manaCount >= mineCost) {
            manaCount -= mineCost;
            ownedMines++;
            mineCost = (mineCost * 1.27);
            computeCookiesPerSecond();
            updateDisplay();
            startInterval();
            playSfx(upgradeSoundElement);
        }
    });

    factoryButtonElement && factoryButtonElement.addEventListener('click', () => {
        if (manaCount >= factoryCost) {
            manaCount -= factoryCost;
            ownedFactories++;
            factoryCost = (factoryCost * 1.2);
            computeCookiesPerSecond();
            updateDisplay();
            startInterval();
            playSfx(upgradeSoundElement);
        }
    });

    bankButtonElement && bankButtonElement.addEventListener('click', () => {
        if (manaCount >= bankCost) {
            manaCount -= bankCost;
            ownedBanks++;
            bankCost = (bankCost * 1.18);
            computeCookiesPerSecond();
            updateDisplay();
            startInterval();
            playSfx(upgradeSoundElement);
        }
    });

    templeButtonElement && templeButtonElement.addEventListener('click', () => {
        if (manaCount >= templeCost) {
            manaCount -= templeCost;
            ownedTemples++;
            templeCost = (templeCost * 1.3);
            computeCookiesPerSecond();
            updateDisplay();
            startInterval();
            playSfx(upgradeSoundElement);
        }
    });

    wizardButtonElement && wizardButtonElement.addEventListener('click', () => {
        if (manaCount >= wizardCost) {
            manaCount -= wizardCost;
            ownedWizards++;
            wizardCost = (wizardCost * 1.2);
            computeCookiesPerSecond();
            updateDisplay();
            startInterval();
            playSfx(upgradeSoundElement);
        }
    });

    clickboostButtonElement && clickboostButtonElement.addEventListener('click', () => {
        if (manaCount >= clickBoostCost) {
            manaCount -= clickBoostCost;
            ownedClickBoosts++;
            cookiesPerClick = 0.01 + (clickBoostAdd * ownedClickBoosts);
            clickBoostCost = (clickBoostCost * 1.5);
            updateDisplay();
            playSfx(upgradeSoundElement);
        }
    });

    function setDarkMode(enabled) {
        if (enabled) document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');

        if (themeDropdownButton) {
            themeDropdownButton.textContent = `${enabled ? 'Dark ▼' : 'Light ▼'}`;
            themeDropdownButton.setAttribute('aria-expanded', 'false');
        }
        try {
            localStorage.setItem('cookieClicks_darkMode', enabled ? '1' : '0');
        } catch (e) {}
    }

    (function initDarkModeFromStorage() {
        try {
            const val = localStorage.getItem('cookieClicks_darkMode');
            const enabled = val === '1';
            setDarkMode(enabled);
        } catch (e) {}
    })();

    function closeAllDropdownsExcept(exceptRoot) {
        const roots = [themeDropdownRoot, numberFormatRoot];
        roots.forEach(root => {
            if (!root || root === exceptRoot) return;
            root.classList.remove('open');
            if (root === themeDropdownRoot && themeDropdownButton && themeDropdownMenu) {
                themeDropdownButton.setAttribute('aria-expanded', 'false');
                themeDropdownMenu.setAttribute('aria-hidden', 'true');
            }
            if (root === numberFormatRoot && numberFormatButton && numberFormatMenu) {
                numberFormatButton.setAttribute('aria-expanded', 'false');
                numberFormatMenu.setAttribute('aria-hidden', 'true');
            }
        });
    }

    if (themeDropdownRoot && themeDropdownButton && themeDropdownMenu) {
        themeDropdownButton.addEventListener('click', (e) => {
            closeAllDropdownsExcept(themeDropdownRoot);
            const open = themeDropdownRoot.classList.toggle('open');
            themeDropdownButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            themeDropdownMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
        });

        themeDropdownMenu.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-theme]');
            if (!btn) return;
            const theme = btn.getAttribute('data-theme');
            if (theme === 'dark') {
                setDarkMode(true);
            } else {
                setDarkMode(false);
            }
            themeDropdownRoot.classList.remove('open');
            themeDropdownButton.setAttribute('aria-expanded', 'false');
            themeDropdownMenu.setAttribute('aria-hidden', 'true');
            updateDisplay();
        });

        themeDropdownButton.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeAllDropdownsExcept(themeDropdownRoot);
                themeDropdownRoot.classList.add('open');
                themeDropdownMenu.setAttribute('aria-hidden', 'false');
                themeDropdownButton.setAttribute('aria-expanded', 'true');
                const first = themeDropdownMenu.querySelector('[data-theme]');
                if (first) first.focus();
            }
        });

        themeDropdownMenu.addEventListener('keydown', (e) => {
            const items = Array.from(themeDropdownMenu.querySelectorAll('[data-theme]'));
            const idx = items.indexOf(document.activeElement);
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = items[(idx + 1) % items.length];
                if (next) next.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = items[(idx - 1 + items.length) % items.length];
                if (prev) prev.focus();
            } else if (e.key === 'Escape') {
                themeDropdownRoot.classList.remove('open');
                themeDropdownButton.focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.activeElement.click();
            }
        });

        document.addEventListener('click', (ev) => {
            if (!ev.target.closest || (!ev.target.closest('.dropdown'))) {
                themeDropdownRoot.classList.remove('open');
                themeDropdownButton.setAttribute('aria-expanded', 'false');
                themeDropdownMenu.setAttribute('aria-hidden', 'true');
            }
        });
    }

    (function initNumberFormatDropdown() {
        if (numberFormatButton) {
            const label = numberFormatMode === 'engineering' ? 'Engineering ▼' : (numberFormatMode === 'emojis' ? 'Letters ▼' : 'Normal ▼');
            numberFormatButton.textContent = `${label}`;
        }

        if (!numberFormatRoot || !numberFormatButton || !numberFormatMenu) return;

        numberFormatButton.addEventListener('click', (e) => {
            closeAllDropdownsExcept(numberFormatRoot);
            const open = numberFormatRoot.classList.toggle('open');
            numberFormatButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            numberFormatMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
        });

        numberFormatMenu.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-format]');
            if (!btn) return;
            const fmt = btn.getAttribute('data-format');
            if (!fmt) return;
            numberFormatMode = fmt;
            try { localStorage.setItem('cookieClicks_numberFormat', numberFormatMode); } catch (err) {}
            numberFormatButton.textContent = (fmt === 'engineering') ? 'Engineering ▼' : (fmt === 'emojis' ? 'Letters ▼' : 'Normal ▼');

            numberFormatRoot.classList.remove('open');
            numberFormatButton.setAttribute('aria-expanded', 'false');
            numberFormatMenu.setAttribute('aria-hidden', 'true');

            updateDisplay();
        });

        numberFormatButton.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeAllDropdownsExcept(numberFormatRoot);
                numberFormatRoot.classList.add('open');
                numberFormatMenu.setAttribute('aria-hidden', 'false');
                numberFormatButton.setAttribute('aria-expanded', 'true');
                const first = numberFormatMenu.querySelector('[data-format]');
                if (first) first.focus();
            }
        });

        numberFormatMenu.addEventListener('keydown', (e) => {
            const items = Array.from(numberFormatMenu.querySelectorAll('[data-format]'));
            const idx = items.indexOf(document.activeElement);
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = items[(idx + 1) % items.length];
                if (next) next.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = items[(idx - 1 + items.length) % items.length];
                if (prev) prev.focus();
            } else if (e.key === 'Escape') {
                numberFormatRoot.classList.remove('open');
                numberFormatButton.focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.activeElement.click();
            }
        });

        document.addEventListener('click', (ev) => {
            if (!ev.target.closest || (!ev.target.closest('.dropdown'))) {
                numberFormatRoot.classList.remove('open');
                numberFormatButton.setAttribute('aria-expanded', 'false');
                numberFormatMenu.setAttribute('aria-hidden', 'true');
            }
        });
    })();

    function clearSelectedTabs() {
        [buildingsButton, upgradesButton, statsButton, changelogButton, settingsButton].forEach(btn => {
            if (btn) { btn.classList.remove('selected'); btn.setAttribute('aria-pressed', 'false'); }
        });
    }

    function hideAllPanels() {
        if (upgradeContainer) upgradeContainer.style.display = 'none';
        if (upgradesContainer) upgradesContainer.style.display = 'none';
        if (statsContainer) statsContainer.style.display = 'none';
        if (changelogContainer) changelogContainer.style.display = 'none';
        if (settingsContainer) settingsContainer.style.display = 'none';
    }

    function showTab(tabName) {
        hideAllPanels();
        clearSelectedTabs();
        switch (tabName) {
            case 'buildings': if (upgradeContainer) upgradeContainer.style.display = 'flex'; if (buildingsButton) { buildingsButton.classList.add('selected'); buildingsButton.setAttribute('aria-pressed','true'); } break;
            case 'upgrades': if (upgradesContainer) upgradesContainer.style.display = 'flex'; if (upgradesButton) { upgradesButton.classList.add('selected'); upgradesButton.setAttribute('aria-pressed','true'); } break;
            case 'stats': if (statsContainer) statsContainer.style.display = 'flex'; if (statsButton) { statsButton.classList.add('selected'); statsButton.setAttribute('aria-pressed','true'); } break;
            case 'changelog': if (changelogContainer) changelogContainer.style.display = 'flex'; if (changelogButton) { changelogButton.classList.add('selected'); changelogButton.setAttribute('aria-pressed','true'); } break;
            case 'settings': if (settingsContainer) settingsContainer.style.display = 'flex'; if (settingsButton) { settingsButton.classList.add('selected'); settingsButton.setAttribute('aria-pressed','true'); } break;
        }
    }

    buildingsButton && buildingsButton.addEventListener('click', () => showTab('buildings'));
    upgradesButton && upgradesButton.addEventListener('click', () => showTab('upgrades'));
    statsButton && statsButton.addEventListener('click', () => showTab('stats'));
    changelogButton && changelogButton.addEventListener('click', () => showTab('changelog'));
    settingsButton && settingsButton.addEventListener('click', () => showTab('settings'));

    const segButtons = [buildingsButton, upgradesButton, statsButton, changelogButton, settingsButton].filter(Boolean);
    segButtons.forEach((btn, idx) => {
        btn.tabIndex = 0;
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                const next = segButtons[(idx + 1) % segButtons.length]; next && next.focus(); next && next.click();
            } else if (e.key === 'ArrowLeft') {
                const prev = segButtons[(idx - 1 + segButtons.length) % segButtons.length]; prev && prev.focus(); prev && prev.click();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); btn.click();
            }
        });
    });

    showTab('buildings');

    const usernameInput = document.querySelector('.username-container input');

    (function wireFloatingLabel() {
        const wrapper = document.querySelector('.username-container .input-wrapper');
        if (!usernameInput || !wrapper) return;
        const update = () => {
            if (usernameInput.value && usernameInput.value.trim() !== '') wrapper.classList.add('has-value');
            else wrapper.classList.remove('has-value');
        };
        usernameInput.addEventListener('input', update);
        usernameInput.addEventListener('blur', update);
        usernameInput.addEventListener('focus', () => wrapper.classList.add('has-value'));
        update();
    })();

    async function enterGame(usernameRaw) {
        let username = (usernameRaw || '').trim();
        if (!username || username.match(/^\s*$/)) {
            username = `player${Math.floor(Math.random() * 1000000000)}`;
        }
        username = username.replace(/[^a-zA-Z0-9_.]/g, '');
        if (!username) return;

        if (usernameContainer) usernameContainer.style.display = 'none';
        if (container) container.style.display = 'block';
        if (userInfoElement) userInfoElement.style.display = 'flex';
        if (usernameDisplayElement) usernameDisplayElement.textContent = username;

        if ("Notification" in window && Notification.permission === 'granted') {
            createNotification('Notification', 'Welcome!');
        }

        loadProgress(username);
    }

    usernameInput && usernameInput.addEventListener('keypress', async (event) => {
        if (event.key === 'Enter') {
            const val = usernameInput ? usernameInput.value || '' : '';
            requestPermissionAndNotify('Notification', 'Welcome!');
            await enterGame(val);
        }
    });

    const notifyButtonAction = async () => {
        const val = usernameInput ? usernameInput.value || '' : '';
        requestPermissionAndNotify('Notification', 'Welcome!');
        await enterGame(val);
    };
    notifyButton && notifyButton.addEventListener('click', notifyButtonAction);

    setInterval(() => {
        try {
            const username = usernameInput ? usernameInput.value.trim() : '';
            if (username) saveProgress(username);
        } catch (e) {}
    }, 3000);

    initUpgradeButtons();

    function showTooltipForWrapper(wrapper) {
        if (!wrapper) return;
        const tooltipEl = wrapper.querySelector('.tooltiptext');
        if (!tooltipEl) return;

        tooltipEl.classList.add('tooltip-visible');
        tooltipEl.style.visibility = 'hidden';
        tooltipEl.style.display = 'block';

        tooltipEl.classList.add('fixed-position');
        const tw = tooltipEl.offsetWidth;
        const th = tooltipEl.offsetHeight;

        let img = wrapper.querySelector('img');
        if (!img) {
            const parent = wrapper.closest('.upgrade-item');
            img = parent ? parent.querySelector('img') : null;
        }
        const anchorRect = img ? img.getBoundingClientRect() : wrapper.getBoundingClientRect();

        let left = Math.round(anchorRect.left + (anchorRect.width / 2) - (tw / 2));
        const pad = 8;
        if (left < pad) left = pad;
        if (left + tw > window.innerWidth - pad) left = window.innerWidth - pad - tw;

        const spaceBelow = window.innerHeight - anchorRect.bottom;
        let top = Math.round(anchorRect.bottom + 8);
        if (spaceBelow < th + 12) {
            top = Math.round(anchorRect.top - th - 8);
            if (top < pad) top = pad;
        }

        tooltipEl.style.left = left + 'px';
        tooltipEl.style.top = top + 'px';
        tooltipEl.style.visibility = 'visible';
        tooltipEl.style.display = 'block';
        tooltipEl.classList.add('tooltip-visible');

        wrapper._activeTooltip = tooltipEl;
    }

    function hideTooltipForWrapper(wrapper) {
        if (!wrapper) return;
        const tooltipEl = wrapper._activeTooltip || wrapper.querySelector('.tooltiptext');
        if (!tooltipEl) return;

        tooltipEl.classList.remove('tooltip-visible', 'fixed-position');
        tooltipEl.style.left = '';
        tooltipEl.style.top = '';
        tooltipEl.style.visibility = '';
        tooltipEl.style.display = '';
        wrapper._activeTooltip = null;
    }

    function wireTooltipsInBuildings() {
        const containers = [];
        if (upgradeContainer) containers.push(upgradeContainer);
        if (upgradesContainer) containers.push(upgradesContainer);

        containers.forEach((containerEl) => {
            const wrappers = containerEl.querySelectorAll('.tooltip');
            wrappers.forEach(w => {
                let img = w.querySelector('img');
                if (!img) {
                    const parent = w.closest('.upgrade-item');
                    img = parent ? parent.querySelector('img') : null;
                }
                if (!img) return;

                if (!img.hasAttribute('tabindex')) img.setAttribute('tabindex', '0');

                img.removeEventListener('mouseenter', w._enterHandler || (()=>{}));
                img.removeEventListener('mouseleave', w._leaveHandler || (()=>{}));
                img.removeEventListener('focus', w._focusHandler || (()=>{}));
                img.removeEventListener('blur', w._blurHandler || (()=>{}));
                img.removeEventListener('touchstart', w._touchHandler || (()=>{}));

                const open = () => {
                    document.querySelectorAll('.tooltip').forEach(other => {
                        if (other !== w) hideTooltipForWrapper(other);
                    });
                    showTooltipForWrapper(w);
                };
                const close = () => hideTooltipForWrapper(w);

                w._enterHandler = open;
                w._leaveHandler = close;
                w._focusHandler = open;
                w._blurHandler = close;
                w._touchHandler = function (ev) {
                    if (!w._touchedOpen) {
                        ev.preventDefault();
                        open();
                        w._touchedOpen = true;
                        setTimeout(() => { w._touchedOpen = false; }, 1200);
                    }
                };

                img.addEventListener('mouseenter', w._enterHandler);
                img.addEventListener('mouseleave', w._leaveHandler);
                img.addEventListener('focus', w._focusHandler);
                img.addEventListener('blur', w._blurHandler);
                img.addEventListener('touchstart', w._touchHandler, { passive: false });
            });
        });

        document.removeEventListener('click', document._tooltipOutsideHandler);
        document._tooltipOutsideHandler = function (e) {
            if (!e.target.closest('.tooltip') && !e.target.closest('.tooltiptext')) {
                document.querySelectorAll('.tooltip').forEach(w => hideTooltipForWrapper(w));
            }
        };
        document.addEventListener('click', document._tooltipOutsideHandler);
    }

    wireTooltipsInBuildings();

    const loadingTimerEl = document.getElementById('loading-timer');
    const loadingEndTimestamp = new Date(2026, 2, 26, 9, 0, 0).getTime();
    const MIN_LOADING_MS = 2000;
    const loadingStartTimestamp = Date.now();
    let loadingFinishScheduled = false;

    function formatLoadingRemaining(msRemaining) {
        const totalSec = Math.max(0, Math.floor(msRemaining / 1000));
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;

        if (days >= 1) {
            return `${days}d ${hours}h`;
        } else if (hours >= 1) {
            return `${hours}h ${mins}m`;
        } else {
            return `Loading...`;
        }
    }

    let loadingIntervalId = null;

    function finishLoading() {
        try {
            if (loadingIntervalId) {
                clearInterval(loadingIntervalId);
                loadingIntervalId = null;
            }
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (usernameContainer) usernameContainer.style.display = 'block';
            try { if (usernameInput) usernameInput.focus(); } catch (e) {}
        } catch (e) {
            console.error('finishLoading error', e);
        }
    }

    function updateLoadingTimerNow() {
        if (!loadingTimerEl) return;
        const now = Date.now();
        const rem = loadingEndTimestamp - now;
        const textTarget = (rem <= 0) ? formatLoadingRemaining(0) : formatLoadingRemaining(rem);

        const textSpan = loadingTimerEl.querySelector('.loading-text');
        if (textSpan) {
            textSpan.textContent = textTarget;
        } else {
            loadingTimerEl.textContent = textTarget;
        }

        if (rem <= 0) {
            if (loadingFinishScheduled) return;
            const elapsed = Date.now() - loadingStartTimestamp;
            const remainingMin = Math.max(0, MIN_LOADING_MS - elapsed);
            loadingFinishScheduled = true;
            if (remainingMin === 0) {
                finishLoading();
            } else {
                setTimeout(() => {
                    finishLoading();
                }, remainingMin);
            }
            return;
        }
    }

    updateLoadingTimerNow();
    loadingIntervalId = setInterval(updateLoadingTimerNow, 1000);

    startInterval();
    setInterval(() => { document.title = `${formatNumberPlain((manaCount))} Mana`; }, 1000);

    if (sfxVolumeSlider) { setSfxVolume(sfxVolumeSlider.value); updateSliderBackground(sfxVolumeSlider); }

    computeCookiesPerSecond();
    updateDisplay();

    window.__cookieTappers = {
        formatCookieValue,
        wireTooltipsInBuildings,
        showTooltipForWrapper,
        hideTooltipForWrapper,
        createNotification,
        requestPermissionAndNotify,
        animateNumber,
        _loadingEndTimestamp: loadingEndTimestamp,
        _finishLoading: finishLoading
    };
});