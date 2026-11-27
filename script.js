document.addEventListener('DOMContentLoaded', function () {
    function createNotification(title, message) {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications.');
            return false;
        }

        try {
            const iconUrl = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/af8bc113-d9a4-40cf-9077-06b673c583e0/dl7kpss-efb9b50c-edb4-41ea-ac4e-ca3f93c6c189.png/v1/fit/w_800,h_800/cookie_tappers_icon_by_unknown9394998_dl7kpss-414w-2x.png';
            const notification = new Notification(title, {
                body: message,
                icon: iconUrl,
                badge: iconUrl,
                vibrate: [200, 100, 200],
                data: { url: window.location.href }
            });

            notification.onclick = (event) => {
                event.preventDefault();
                try { window.focus(); } catch (e) {}
                try { notification.close(); } catch (e) {}
            };

            return true;
        } catch (err) {
            console.warn('Failed to create Notification:', err);
            return false;
        }
    }

    function requestPermissionAndNotify(title, message) {
        if (!('Notification' in window)) {
            console.warn('Notifications not supported.');
            try { alert(title + '\n\n' + message); } catch (e) {}
            return;
        }

        const handleResult = (permission) => {
            if (permission !== 'granted') {
                console.log('Notification permission result:', permission);
                return;
            }

            if (!createNotification(title, message)) {
                try { alert(title + '\n\n' + message); } catch (e) {}
            }
        };

        if (Notification.permission === 'granted') {
            handleResult('granted');
            return;
        }

        try {
            const result = Notification.requestPermission();
            if (result && typeof result.then === 'function') {
                result.then(handleResult).catch((err) => {
                    console.warn('requestPermission promise rejected:', err);
                });
            } else if (typeof result === 'string') {
                handleResult(result);
            }
        } catch (err) {
            console.warn('Notification.requestPermission failed:', err);
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

    cookiesPerClick = 0.01 + clickBoostAdd * ownedClickBoosts;

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

    const suffixes = [
        'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp',
        'Oc', 'No', 'Dc', 'Udc', 'Ddc', 'Tdc', 'Qadc'
    ];

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

    const clickSoundElement = document.getElementById('click-sound');
    const upgradeSoundElement = document.getElementById('upgrade-sound');
    const upgradedSoundElement = document.getElementById('upgraded-sound');

    const userInfoElement = document.querySelector('.user-info');
    const usernameDisplayElement = document.getElementById('username-display');
    const notifyButton = document.getElementById('notify-btn');

    const buildingsButton = document.getElementById('buildings-button');
    const upgradesButton = document.getElementById('upgrades-button');
    const changelogButton = document.getElementById('changelog-button');
    const menuButton = document.getElementById('settings-button');

    const upgradeContainer = document.getElementById('upgrade-container');
    const upgradesContainer = document.getElementById('upgrades-container');
    const upgradesListElement = document.getElementById('upgrades-list');
    const changelogContainer = document.getElementById('changelog-container');

    const statsContainer = document.getElementById('stats-container');
    const settingsContainer = document.getElementById('settings-container');
    const totalCookiesRow = document.getElementById('total-cookies-row');
    const clicksRow = document.getElementById('clicks-row');
    const totalBuildingsRow = document.getElementById('total-buildings-row');

    const navigationMenu = document.getElementById('navigation-menu');
    const panelModalOverlay = document.getElementById('panel-modal-overlay');
    const closePanelModalButton = document.getElementById('close-panel-modal');

    const themeDropdownRoot = document.getElementById('theme-dropdown');
    const themeDropdownButton = document.getElementById('theme-button');
    const themeDropdownMenu = document.getElementById('themeDropdown');

    const numberFormatRoot = document.getElementById('numberformat-dropdown');
    const numberFormatButton = document.getElementById('numberformat-button');
    const numberFormatMenu = document.getElementById('numberformatDropdown');

    const sfxVolumeSlider = document.getElementById('sfx-volume');
    const AUDIO_MAX = 5;

    function clampNumber(value, min, max) {
        let number = Number(value) || 0;
        if (number < min) number = min;
        if (number > max) number = max;
        return number;
    }

    function setSfxVolume(value) {
        const volume = clampNumber(value, 0, AUDIO_MAX) / AUDIO_MAX;
        if (clickSoundElement) clickSoundElement.volume = volume;
        if (upgradeSoundElement) upgradeSoundElement.volume = volume;
        if (upgradedSoundElement) upgradedSoundElement.volume = volume;
    }

    function getDefaultSliderFillColor() {
        try {
            const styles = getComputedStyle(document.documentElement);
            const value = styles.getPropertyValue('--accent-2')
                || styles.getPropertyValue('--accent');

            if (value && value.trim()) return value.trim();
        } catch (e) {}

        return '#2a79e0';
    }

    function updateSliderBackground(slider, fillColor, emptyColor = '#ededed') {
        if (!slider) return;

        const fill = typeof fillColor === 'string' && fillColor.trim()
            ? fillColor
            : getDefaultSliderFillColor();

        const percentage = Math.round((Number(slider.value) / AUDIO_MAX) * 100);
        slider.style.background =
            `linear-gradient(90deg, ${fill} ${percentage}%, ${emptyColor} ${percentage}%)`;
    }

    sfxVolumeSlider?.addEventListener('input', (event) => {
        setSfxVolume(parseInt(event.target.value, 10));
        updateSliderBackground(event.target);
    });

    let numberFormatMode = 'normal';
    try {
        numberFormatMode = localStorage.getItem('cookieClicks_numberFormat') || 'normal';
    } catch (e) {}

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
            const scaled = number / Math.pow(10, exponent);
            return `${scaled.toFixed(2)}e${exponent}`;
        }
        return Math.floor(number).toLocaleString();
    }

    function formatNumberEngineeringPlain(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const exponent = tier * 3;
            const scaled = number / Math.pow(10, exponent);
            return `${scaled.toFixed(2)}e${exponent}`;
        }
        if (Math.abs(number - Math.round(number)) > 0.0001) {
            return number.toFixed(2);
        }
        return Math.floor(number).toLocaleString();
    }

    function formatNumberEmojis(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const suffix = suffixes[tier - 1] || '';
            const scaled = number / Math.pow(10, tier * 3);
            const emoji = emojiSuffixMap[suffix] || suffix;
            return `${scaled.toFixed(2)}<span class="num-suffix">${emoji}</span>`;
        }
        return Math.floor(number).toLocaleString();
    }

    function formatNumberEmojisPlain(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const suffix = suffixes[tier - 1] || '';
            const scaled = number / Math.pow(10, tier * 3);
            const emoji = emojiSuffixMap[suffix] || suffix;
            return `${scaled.toFixed(2)}${emoji}`;
        }
        if (Math.abs(number - Math.round(number)) > 0.0001) {
            return number.toFixed(2);
        }
        return Math.floor(number).toLocaleString();
    }

    function formatNumberNormal(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const suffix = suffixes[tier - 1] || '';
            const scaled = number / Math.pow(10, tier * 3);
            return `${scaled.toFixed(2)}<span class="num-suffix">${suffix}</span>`;
        }
        return Math.floor(number).toLocaleString();
    }

    function formatNumberNormalPlain(number) {
        if (number >= 1000) {
            const tier = Math.floor(Math.log10(number) / 3);
            const suffix = suffixes[tier - 1] || '';
            const scaled = number / Math.pow(10, tier * 3);
            return `${scaled.toFixed(2)}${suffix}`;
        }
        if (Math.abs(number - Math.round(number)) > 0.0001) {
            return number.toFixed(2);
        }
        return Math.floor(number).toLocaleString();
    }

    function formatNumber(number) {
        switch (numberFormatMode) {
            case 'engineering':
                return formatNumberEngineering(number);
            case 'emojis':
                return formatNumberEmojis(number);
            default:
                return formatNumberNormal(number);
        }
    }

    function formatNumberPlain(number) {
        switch (numberFormatMode) {
            case 'engineering':
                return formatNumberEngineeringPlain(number);
            case 'emojis':
                return formatNumberEmojisPlain(number);
            default:
                return formatNumberNormalPlain(number);
        }
    }

    function formatCookieValue(number) {
        if (number >= 1000) return formatNumber(number);
        if (Math.abs(number - Math.round(number)) > 0.0001) {
            return number.toFixed(2);
        }
        return Math.round(number).toLocaleString();
    }

    function formatPerSecond(number) {
        if (number >= 1000) return formatNumber(number);
        if (Math.abs(number - Math.round(number)) > 0.0001) {
            return number.toFixed(2);
        }
        return Math.round(number).toLocaleString();
    }

    function animateNumber(element, target, options = {}) {
        if (!element) return;

        const duration = typeof options.duration === 'number' ? options.duration : 420;
        const formatter = options.formatter || (number => formatNumber(Math.floor(number)));
        const allowDecrease = !!options.allowDecrease;
        const targetNumber = Math.floor(Number(target) || 0);

        let start = 0;

        if (typeof element._displayedValue === 'number') {
            start = element._displayedValue;
        } else if (element.dataset && element.dataset.value) {
            start = Math.floor(Number(element.dataset.value) || 0);
        } else {
            start = Math.floor(
                parseFloat((element.textContent || '').replace(/[^0-9.\-]/g, '')) || 0
            );
        }

        if (targetNumber < start && !allowDecrease) {
            if (element._animFrame) {
                cancelAnimationFrame(element._animFrame);
                element._animFrame = null;
            }

            element._displayedValue = targetNumber;
            if (element.dataset) element.dataset.value = String(targetNumber);
            element.innerHTML = formatter(targetNumber);
            element.classList.add('animating-number');
            setTimeout(() => element.classList.remove('animating-number'), 120);
            return;
        }

        if (start === targetNumber) {
            element._displayedValue = targetNumber;
            if (element.dataset) element.dataset.value = String(targetNumber);
            element.innerHTML = formatter(targetNumber);
            return;
        }

        if (element._animFrame) {
            cancelAnimationFrame(element._animFrame);
            element._animFrame = null;
        }

        const startTime = performance.now();
        element.classList.add('animating-number');

        function easeOutQuad(value) {
            return value * (2 - value);
        }

        function step(now) {
            const progress = Math.min(1, (now - startTime) / duration);
            const eased = easeOutQuad(progress);
            const current = Math.floor(start + (targetNumber - start) * eased);

            element._displayedValue = current;
            if (element.dataset) element.dataset.value = String(current);
            element.innerHTML = formatter(current);

            if (progress < 1) {
                element._animFrame = requestAnimationFrame(step);
            } else {
                element._displayedValue = targetNumber;
                if (element.dataset) element.dataset.value = String(targetNumber);
                element.innerHTML = formatter(targetNumber);
                element._animFrame = null;
                setTimeout(() => element.classList.remove('animating-number'), 80);
            }
        }

        element._animFrame = requestAnimationFrame(step);
    }

    function computeTotalBuildings() {
        return ownedAutotaps + ownedClickBoosts + ownedPickaxes + ownedFarms
            + ownedMines + ownedFactories + ownedBanks + ownedTemples + ownedWizards;
    }

    function computeCookiesPerSecond() {
        cookiesPerSecond =
            ownedAutotaps * autotapCps
            + ownedPickaxes * pickaxeCps
            + ownedFarms * farmCps
            + ownedMines * mineCps
            + ownedFactories * factoryCps
            + ownedBanks * bankCps
            + ownedTemples * templeCps
            + ownedWizards * wizardCps;

        return cookiesPerSecond;
    }

    function ensureButtonStructure(button) {
        if (!button) return;

        if (!button.hasAttribute('role')) button.setAttribute('role', 'button');
        if (!button.hasAttribute('tabindex')) button.setAttribute('tabindex', '0');

        button.innerHTML = `
            <span class="btn-cost">
                <span class="inline-cookie">💧</span>
                <span class="cost" data-value="0">${formatCookieValue(0)}</span>
            </span>
        `;
    }

    function addRippleEffect(button) {
        if (!button || button._rippleAttached) return;
        button._rippleAttached = true;

        if (getComputedStyle(button).position === 'static') {
            button.style.position = 'relative';
        }
        button.style.overflow = 'hidden';

        function createRippleAt(x, y) {
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.8;
            const ripple = document.createElement('span');

            ripple.className = 'ripple';
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${x - rect.left - size / 2}px`;
            ripple.style.top = `${y - rect.top - size / 2}px`;
            button.appendChild(ripple);

            requestAnimationFrame(() => ripple.classList.add('ripple-active'));
            setTimeout(() => ripple.remove(), 750);
        }

        button.addEventListener('pointerdown', (event) => {
            if (event.button !== undefined && event.button !== 0) return;
            createRippleAt(event.clientX, event.clientY);
        });

        button.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            event.preventDefault();
            const rect = button.getBoundingClientRect();
            createRippleAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
            button.click();
        });
    }

    function wireUpgradeButtonRipples() {
        document.querySelectorAll('.upgrade-item button').forEach(addRippleEffect);
    }

    function initUpgradeButtons() {
        [
            upgradeButtonElement,
            pickaxeButtonElement,
            farmButtonElement,
            mineButtonElement,
            factoryButtonElement,
            bankButtonElement,
            templeButtonElement,
            wizardButtonElement,
            clickboostButtonElement
        ].forEach((button) => {
            ensureButtonStructure(button);
            if (button) button.classList.add('glowing-btn');
        });

        wireUpgradeButtonRipples();
    }

    function updateUpgradesPanel() {
        if (!upgradesListElement) return;

        upgradesListElement.innerHTML = '';
        const nothing = document.createElement('div');
        nothing.className = 'nothing';
        nothing.textContent = 'Upgrades are a work in progress... stay tuned for more updates!';
        upgradesListElement.appendChild(nothing);
    }

    function updateDisplay() {
        if (cookieCountElement) {
            let numberElement = cookieCountElement.querySelector('.cookie-number');

            if (!numberElement) {
                cookieCountElement.innerHTML = `
                    <span class="inline-cookie">${manaEmoji}</span>
                    <span class="cookie-number" data-value="${manaCount}">${formatCookieValue(manaCount)}</span>
                `;
                numberElement = cookieCountElement.querySelector('.cookie-number');
                if (numberElement) {
                    numberElement._displayedValue = manaCount;
                    numberElement.dataset.value = String(manaCount);
                }
            } else {
                numberElement._displayedValue = Math.floor(manaCount);
                numberElement.dataset.value = String(Math.floor(manaCount));
                numberElement.innerHTML = formatCookieValue(manaCount);
            }
        }

        if (perSecondElement) {
            perSecondElement.innerHTML = `${formatPerSecond(cookiesPerSecond)} mps`;
        }

        const labels = [
            { id: 'autotap-label', text: 'Autotap', cps: autotapCps, owned: ownedAutotaps, produced: producedAutotaps, tooltipId: 'autotap-tooltip' },
            { id: 'clickboost-label', text: 'Clickboost', cps: 0, owned: ownedClickBoosts, produced: 0, tooltipId: 'clickboost-tooltip' },
            { id: 'pickaxe-label', text: 'Pickaxe', cps: pickaxeCps, owned: ownedPickaxes, produced: producedPickaxes, tooltipId: 'pickaxe-tooltip' },
            { id: 'farm-label', text: 'Shovel', cps: farmCps, owned: ownedFarms, produced: producedFarms, tooltipId: 'farm-tooltip' },
            { id: 'mine-label', text: 'Crystal', cps: mineCps, owned: ownedMines, produced: producedMines, tooltipId: 'mine-tooltip' },
            { id: 'factory-label', text: 'Factory', cps: factoryCps, owned: ownedFactories, produced: producedFactories, tooltipId: 'factory-tooltip' },
            { id: 'bank-label', text: 'Shield', cps: bankCps, owned: ownedBanks, produced: producedBanks, tooltipId: 'bank-tooltip' },
            { id: 'temple-label', text: 'Temple', cps: templeCps, owned: ownedTemples, produced: producedTemples, tooltipId: 'temple-tooltip' },
            { id: 'wizard-label', text: 'Gametower', cps: wizardCps, owned: ownedWizards, produced: producedWizards, tooltipId: 'wizard-tooltip' }
        ];

        labels.forEach((item) => {
            const label = document.getElementById(item.id);
            if (!label) return;

            const formattedCps = formatPerSecond(item.cps);
            const itemTotalCps = item.owned * item.cps;
            const percent = cookiesPerSecond > 0
                ? ((itemTotalCps / cookiesPerSecond) * 100).toFixed(2)
                : '0.00';
            const producedValue = Math.floor(item.produced);
            const producingValue = Math.floor(itemTotalCps);

            if (item.id === 'clickboost-label') {
                label.innerHTML = `<strong>${item.text}</strong><span class="subtitle">+${formatCookieValue(clickBoostAdd)}/click</span><span class="tooltiptext" id="${item.tooltipId}">Owned: ${formatCookieValue(item.owned)}<br>Gives ${formatCookieValue(clickBoostAdd)} per upgrade</span>`;
            } else {
                label.innerHTML = `<strong>${item.text}</strong><span class="subtitle">+${formattedCps}/s</span><span class="tooltiptext" id="${item.tooltipId}">Owned: ${formatCookieValue(item.owned)}<br>${percent}% of mps<br>${manaEmoji}<span class="produced-number" data-value="${producedValue}">${formatCookieValue(producedValue)}</span> produced<br>Producing <span class="producing-number" data-value="${producingValue}">${formatCookieValue(producingValue)}</span>${manaEmoji}/s</span>`;
            }

            const tooltip = document.getElementById(item.tooltipId);
            const producedElement = tooltip?.querySelector('.produced-number');
            const producingElement = tooltip?.querySelector('.producing-number');

            if (producedElement) {
                animateNumber(producedElement, producedValue, {
                    duration: 700,
                    formatter: value => formatCookieValue(Math.floor(value))
                });
            }

            if (producingElement) {
                animateNumber(producingElement, producingValue, {
                    duration: 700,
                    formatter: value => formatCookieValue(Math.floor(value))
                });
            }
        });

        const setCost = (button, value) => {
            if (!button) return;

            let costElement = button.querySelector('.cost');
            if (!costElement) {
                ensureButtonStructure(button);
                costElement = button.querySelector('.cost');
            }

            if (costElement) {
                costElement.innerHTML = formatCookieValue(value);
                costElement.dataset.value = String(value);
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

        if (totalCookiesRow) {
            totalCookiesRow.innerHTML = `${manaEmoji} ${formatCookieValue(totalMana)}`;
        }
        if (clicksRow) {
            clicksRow.innerHTML = formatNumber(Math.floor(clickCount));
        }
        if (totalBuildingsRow) {
            totalBuildingsRow.innerHTML = formatNumber(Math.floor(computeTotalBuildings()));
        }

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
        clone.style.opacity = '1';
        clone.style.transition = 'transform 350ms ease-out, opacity 300ms ease-out';
        document.body.appendChild(clone);

        requestAnimationFrame(() => {
            clone.style.transform = 'translateY(-55px)';
        });

        setTimeout(() => {
            clone.style.opacity = '0';
        }, 350);

        setTimeout(() => clone.remove(), 1300);
    }

    function createGoldenCookie(x, y) {
        const goldenCookie = document.createElement('img');
        goldenCookie.src = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/af8bc113-d9a4-40cf-9077-06b673c583e0/dl5xrcg-ca710567-8e32-4fe1-a5dc-0015ee3a93b5.png';
        goldenCookie.className = 'golden-cookie';
        goldenCookie.style.top = `${y}px`;
        goldenCookie.style.left = `${x}px`;

        goldenCookie.addEventListener('click', () => {
            const bonus = 200 + cookiesPerSecond / 10;
            manaCount += bonus;
            totalMana += bonus;
            updateDisplay();
            goldenCookie.remove();
        });

        document.body.appendChild(goldenCookie);
        setTimeout(() => goldenCookie.remove(), 5000);
    }

    function startInterval() {
        if (intervalId) clearInterval(intervalId);

        intervalId = setInterval(() => {
            computeCookiesPerSecond();

            const autoContrib = ownedAutotaps * autotapCps;
            const pickContrib = ownedPickaxes * pickaxeCps;
            const farmContrib = ownedFarms * farmCps;
            const mineContrib = ownedMines * mineCps;
            const factoryContrib = ownedFactories * factoryCps;
            const bankContrib = ownedBanks * bankCps;
            const templeContrib = ownedTemples * templeCps;
            const wizardContrib = ownedWizards * wizardCps;

            const totalTick = autoContrib + pickContrib + farmContrib + mineContrib
                + factoryContrib + bankContrib + templeContrib + wizardContrib;

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
        if (ownedAutotaps >= 1) {
            const element = document.getElementById('pickaxe-upgrade');
            if (element) element.style.display = 'flex';
        }
        if (ownedPickaxes >= 1) {
            const element = document.getElementById('farm-upgrade');
            if (element) element.style.display = 'flex';
        }
        if (ownedFarms >= 1) {
            const element = document.getElementById('mine-upgrade');
            if (element) element.style.display = 'flex';
        }
        if (ownedMines >= 1) {
            const element = document.getElementById('factory-upgrade');
            if (element) element.style.display = 'flex';
        }
        if (ownedFactories >= 1) {
            const element = document.getElementById('bank-upgrade');
            if (element) element.style.display = 'flex';
        }
        if (ownedBanks >= 1) {
            const element = document.getElementById('temple-upgrade');
            if (element) element.style.display = 'flex';
        }
        if (ownedTemples >= 1) {
            const element = document.getElementById('wizard-upgrade');
            if (element) element.style.display = 'flex';
        }
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

        try {
            localStorage.setItem(`cookieClicks_${username}`, JSON.stringify(progress));
        } catch (e) {}
    }

    function loadProgress(username) {
        try {
            const saved = localStorage.getItem(`cookieClicks_${username}`);

            if (saved) {
                const progress = JSON.parse(saved);

                manaCount = typeof progress.manaCount !== 'undefined'
                    ? progress.manaCount
                    : (typeof progress.cookieCount !== 'undefined' ? progress.cookieCount : 0);

                cookiesPerClick = progress.cookiesPerClick || cookiesPerClick;
                cookiesPerSecond = progress.cookiesPerSecond || 0;
                upgradeCost = progress.upgradeCost || upgradeCost;
                pickaxeCost = progress.pickaxeCost || pickaxeCost;
                farmCost = progress.farmCost || farmCost;
                mineCost = progress.mineCost || mineCost;
                factoryCost = progress.factoryCost || factoryCost;
                bankCost = progress.bankCost || bankCost;
                templeCost = progress.templeCost || templeCost;
                wizardCost = progress.wizardCost || wizardCost;

                ownedAutotaps = progress.ownedAutotaps || 0;
                ownedClickBoosts = progress.ownedClickBoosts || 0;
                ownedPickaxes = progress.ownedPickaxes || 0;
                ownedFarms = progress.ownedFarms || 0;
                ownedMines = progress.ownedMines || 0;
                ownedFactories = progress.ownedFactories || 0;
                ownedBanks = progress.ownedBanks || 0;
                ownedTemples = progress.ownedTemples || 0;
                ownedWizards = progress.ownedWizards || 0;

                totalMana = typeof progress.totalMana !== 'undefined'
                    ? progress.totalMana
                    : (typeof progress.totalCookies !== 'undefined' ? progress.totalCookies : manaCount);

                clickCount = progress.clickCount || 0;
                autotapCps = typeof progress.autotapCps !== 'undefined'
                    ? progress.autotapCps
                    : autotapCps;
                cursorMultiplier = typeof progress.cursorMultiplier !== 'undefined'
                    ? progress.cursorMultiplier
                    : cursorMultiplier;

                producedAutotaps = progress.producedAutotaps || 0;
                producedPickaxes = progress.producedPickaxes || 0;
                producedFarms = progress.producedFarms || 0;
                producedMines = progress.producedMines || 0;
                producedFactories = progress.producedFactories || 0;
                producedBanks = progress.producedBanks || 0;
                producedTemples = progress.producedTemples || 0;
                producedWizards = progress.producedWizards || 0;
            }
        } catch (e) {}

        cookiesPerClick = 0.01 + clickBoostAdd * ownedClickBoosts;
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

            sound.addEventListener('ended', () => sound.remove(), { once: true });
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

    cookieElement?.addEventListener('click', (event) => {
        const now = Date.now();

        if (now - lastClickTime < 10) return;

        lastClickTime = now;
        manaCount += cookiesPerClick;
        totalMana += cookiesPerClick;
        clickCount += 1;
        createClickerClone(cookiesPerClick, event.clientX, event.clientY);
        updateDisplay();
        playSfx(clickSoundElement);
    });

    upgradeButtonElement?.addEventListener('click', () => {
        if (manaCount < upgradeCost) return;

        manaCount -= upgradeCost;
        ownedAutotaps++;
        upgradeCost *= 1.15;
        computeCookiesPerSecond();
        updateDisplay();
        startInterval();
        playSfx(upgradeSoundElement);
    });

    pickaxeButtonElement?.addEventListener('click', () => {
        if (manaCount < pickaxeCost) return;

        manaCount -= pickaxeCost;
        ownedPickaxes++;
        pickaxeCost *= 1.2;
        computeCookiesPerSecond();
        updateDisplay();
        startInterval();
        playSfx(upgradeSoundElement);
    });

    farmButtonElement?.addEventListener('click', () => {
        if (manaCount < farmCost) return;

        manaCount -= farmCost;
        ownedFarms++;
        farmCost *= 1.22;
        computeCookiesPerSecond();
        updateDisplay();
        startInterval();
        playSfx(upgradeSoundElement);
    });

    mineButtonElement?.addEventListener('click', () => {
        if (manaCount < mineCost) return;

        manaCount -= mineCost;
        ownedMines++;
        mineCost *= 1.27;
        computeCookiesPerSecond();
        updateDisplay();
        startInterval();
        playSfx(upgradeSoundElement);
    });

    factoryButtonElement?.addEventListener('click', () => {
        if (manaCount < factoryCost) return;

        manaCount -= factoryCost;
        ownedFactories++;
        factoryCost *= 1.2;
        computeCookiesPerSecond();
        updateDisplay();
        startInterval();
        playSfx(upgradeSoundElement);
    });

    bankButtonElement?.addEventListener('click', () => {
        if (manaCount < bankCost) return;

        manaCount -= bankCost;
        ownedBanks++;
        bankCost *= 1.18;
        computeCookiesPerSecond();
        updateDisplay();
        startInterval();
        playSfx(upgradeSoundElement);
    });

    templeButtonElement?.addEventListener('click', () => {
        if (manaCount < templeCost) return;

        manaCount -= templeCost;
        ownedTemples++;
        templeCost *= 1.3;
        computeCookiesPerSecond();
        updateDisplay();
        startInterval();
        playSfx(upgradeSoundElement);
    });

    wizardButtonElement?.addEventListener('click', () => {
        if (manaCount < wizardCost) return;

        manaCount -= wizardCost;
        ownedWizards++;
        wizardCost *= 1.2;
        computeCookiesPerSecond();
        updateDisplay();
        startInterval();
        playSfx(upgradeSoundElement);
    });

    clickboostButtonElement?.addEventListener('click', () => {
        if (manaCount < clickBoostCost) return;

        manaCount -= clickBoostCost;
        ownedClickBoosts++;
        cookiesPerClick = 0.01 + clickBoostAdd * ownedClickBoosts;
        clickBoostCost *= 1.5;
        updateDisplay();
        playSfx(upgradeSoundElement);
    });

    function setDarkMode(enabled) {
        document.body.classList.toggle('dark-mode', enabled);

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
            setDarkMode(localStorage.getItem('cookieClicks_darkMode') === '1');
        } catch (e) {}
    })();

    function closeAllDropdownsExcept(exceptRoot) {
        [themeDropdownRoot, numberFormatRoot].forEach((root) => {
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
        themeDropdownButton.addEventListener('click', () => {
            closeAllDropdownsExcept(themeDropdownRoot);
            const open = themeDropdownRoot.classList.toggle('open');
            themeDropdownButton.setAttribute('aria-expanded', String(open));
            themeDropdownMenu.setAttribute('aria-hidden', String(!open));
        });

        themeDropdownMenu.addEventListener('click', (event) => {
            const button = event.target.closest('[data-theme]');
            if (!button) return;

            setDarkMode(button.getAttribute('data-theme') === 'dark');
            themeDropdownRoot.classList.remove('open');
            themeDropdownButton.setAttribute('aria-expanded', 'false');
            themeDropdownMenu.setAttribute('aria-hidden', 'true');
            updateDisplay();
        });

        themeDropdownButton.addEventListener('keydown', (event) => {
            if (!['ArrowDown', 'Enter', ' '].includes(event.key)) return;

            event.preventDefault();
            closeAllDropdownsExcept(themeDropdownRoot);
            themeDropdownRoot.classList.add('open');
            themeDropdownButton.setAttribute('aria-expanded', 'true');
            themeDropdownMenu.setAttribute('aria-hidden', 'false');
            themeDropdownMenu.querySelector('[data-theme]')?.focus();
        });

        themeDropdownMenu.addEventListener('keydown', (event) => {
            const items = Array.from(themeDropdownMenu.querySelectorAll('[data-theme]'));
            const index = items.indexOf(document.activeElement);

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                items[(index + 1) % items.length]?.focus();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                items[(index - 1 + items.length) % items.length]?.focus();
            } else if (event.key === 'Escape') {
                themeDropdownRoot.classList.remove('open');
                themeDropdownButton.setAttribute('aria-expanded', 'false');
                themeDropdownMenu.setAttribute('aria-hidden', 'true');
                themeDropdownButton.focus();
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                document.activeElement.click();
            }
        });
    }

    (function initNumberFormatDropdown() {
        if (numberFormatButton) {
            const label = numberFormatMode === 'engineering'
                ? 'Engineering ▼'
                : numberFormatMode === 'emojis'
                    ? 'Letters ▼'
                    : 'Normal ▼';

            numberFormatButton.textContent = label;
        }

        if (!numberFormatRoot || !numberFormatButton || !numberFormatMenu) return;

        numberFormatButton.addEventListener('click', () => {
            closeAllDropdownsExcept(numberFormatRoot);
            const open = numberFormatRoot.classList.toggle('open');
            numberFormatButton.setAttribute('aria-expanded', String(open));
            numberFormatMenu.setAttribute('aria-hidden', String(!open));
        });

        numberFormatMenu.addEventListener('click', (event) => {
            const button = event.target.closest('[data-format]');
            if (!button) return;

            const format = button.getAttribute('data-format');
            if (!format) return;

            numberFormatMode = format;

            try {
                localStorage.setItem('cookieClicks_numberFormat', numberFormatMode);
            } catch (e) {}

            numberFormatButton.textContent = format === 'engineering'
                ? 'Engineering ▼'
                : format === 'emojis'
                    ? 'Letters ▼'
                    : 'Normal ▼';

            numberFormatRoot.classList.remove('open');
            numberFormatButton.setAttribute('aria-expanded', 'false');
            numberFormatMenu.setAttribute('aria-hidden', 'true');
            updateDisplay();
        });

        numberFormatButton.addEventListener('keydown', (event) => {
            if (!['ArrowDown', 'Enter', ' '].includes(event.key)) return;

            event.preventDefault();
            closeAllDropdownsExcept(numberFormatRoot);
            numberFormatRoot.classList.add('open');
            numberFormatButton.setAttribute('aria-expanded', 'true');
            numberFormatMenu.setAttribute('aria-hidden', 'false');
            numberFormatMenu.querySelector('[data-format]')?.focus();
        });

        numberFormatMenu.addEventListener('keydown', (event) => {
            const items = Array.from(numberFormatMenu.querySelectorAll('[data-format]'));
            const index = items.indexOf(document.activeElement);

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                items[(index + 1) % items.length]?.focus();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                items[(index - 1 + items.length) % items.length]?.focus();
            } else if (event.key === 'Escape') {
                numberFormatRoot.classList.remove('open');
                numberFormatButton.setAttribute('aria-expanded', 'false');
                numberFormatMenu.setAttribute('aria-hidden', 'true');
                numberFormatButton.focus();
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                document.activeElement.click();
            }
        });
    })();

    function clearSelectedTabs() {
        [buildingsButton, upgradesButton].forEach((button) => {
            if (!button) return;
            button.classList.remove('selected');
            button.setAttribute('aria-pressed', 'false');
        });
    }

    function hideAllPanels() {
        if (upgradeContainer) upgradeContainer.style.display = 'none';
        if (upgradesContainer) upgradesContainer.style.display = 'none';
        if (changelogContainer) changelogContainer.style.display = 'none';
    }

    function showTab(tabName) {
        hideAllPanels();
        clearSelectedTabs();

        if (tabName === 'buildings') {
            if (upgradeContainer) upgradeContainer.style.display = 'flex';
            buildingsButton?.classList.add('selected');
            buildingsButton?.setAttribute('aria-pressed', 'true');
        } else if (tabName === 'upgrades') {
            if (upgradesContainer) upgradesContainer.style.display = 'flex';
            upgradesButton?.classList.add('selected');
            upgradesButton?.setAttribute('aria-pressed', 'true');
        } else if (tabName === 'changelog' && changelogContainer) {
            changelogContainer.style.display = 'flex';
        }
    }

    buildingsButton?.addEventListener('click', () => showTab('buildings'));
    upgradesButton?.addEventListener('click', () => showTab('upgrades'));

    [buildingsButton, upgradesButton].filter(Boolean).forEach((button, index, buttons) => {
        button.tabIndex = 0;

        button.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const direction = event.key === 'ArrowRight' ? 1 : -1;
                const next = buttons[(index + direction + buttons.length) % buttons.length];
                next.focus();
                next.click();
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });
    });

    function closeNavigationMenu({ returnFocus = false } = {}) {
        if (!navigationMenu || !menuButton) return;

        navigationMenu.hidden = true;
        menuButton.setAttribute('aria-expanded', 'false');

        if (returnFocus) menuButton.focus();
    }

    function openPanelModal(panelName) {
        if (!panelModalOverlay) return;

        const panel = panelName === 'settings' ? settingsContainer : statsContainer;
        const otherPanel = panelName === 'settings' ? statsContainer : settingsContainer;

        if (!panel) return;

        closeNavigationMenu();

        if (otherPanel) otherPanel.hidden = true;
        panel.hidden = false;
        panelModalOverlay.hidden = false;
        closePanelModalButton?.focus();
    }

    function closePanelModal({ returnFocus = true } = {}) {
        if (!panelModalOverlay) return;

        panelModalOverlay.hidden = true;

        if (statsContainer) statsContainer.hidden = true;
        if (settingsContainer) settingsContainer.hidden = true;

        if (returnFocus) menuButton?.focus();
    }

    menuButton?.addEventListener('click', () => {
        if (!navigationMenu) return;

        const opening = navigationMenu.hidden;
        navigationMenu.hidden = !opening;
        menuButton.setAttribute('aria-expanded', String(opening));

        if (opening) {
            navigationMenu.querySelector('[data-open-panel]')?.focus();
        }
    });

    navigationMenu?.addEventListener('click', (event) => {
        const menuItem = event.target.closest('[data-open-panel]');
        if (!menuItem) return;

        openPanelModal(menuItem.dataset.openPanel);
    });

    closePanelModalButton?.addEventListener('click', () => closePanelModal());

    panelModalOverlay?.addEventListener('click', (event) => {
        if (event.target === panelModalOverlay) closePanelModal();
    });

    document.addEventListener('click', (event) => {
        if (
            navigationMenu &&
            menuButton &&
            !navigationMenu.hidden &&
            !navigationMenu.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            closeNavigationMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        if (panelModalOverlay && !panelModalOverlay.hidden) {
            closePanelModal();
        } else {
            closeNavigationMenu({ returnFocus: true });
        }
    });

    showTab('buildings');

    const usernameInput = document.querySelector('.username-container input');

    (function wireFloatingLabel() {
        const wrapper = document.querySelector('.username-container .input-wrapper');
        if (!usernameInput || !wrapper) return;

        const update = () => {
            wrapper.classList.toggle('has-value', usernameInput.value.trim() !== '');
        };

        usernameInput.addEventListener('input', update);
        usernameInput.addEventListener('blur', update);
        usernameInput.addEventListener('focus', () => wrapper.classList.add('has-value'));
        update();
    })();

    async function enterGame(usernameRaw) {
        let username = (usernameRaw || '').trim();

        if (!username) {
            username = `player${Math.floor(Math.random() * 1000000000)}`;
        }

        username = username.replace(/[^a-zA-Z0-9_.]/g, '');
        if (!username) return;

        if (usernameContainer) usernameContainer.style.display = 'none';
        if (container) container.style.display = 'block';
        if (userInfoElement) userInfoElement.style.display = 'flex';
        if (usernameDisplayElement) usernameDisplayElement.textContent = username;

        if ('Notification' in window && Notification.permission === 'granted') {
            createNotification('Notification', 'Welcome!');
        }

        loadProgress(username);
    }

    usernameInput?.addEventListener('keypress', async (event) => {
        if (event.key !== 'Enter') return;

        requestPermissionAndNotify('Notification', 'Welcome!');
        await enterGame(usernameInput.value || '');
    });

    notifyButton?.addEventListener('click', async () => {
        requestPermissionAndNotify('Notification', 'Welcome!');
        await enterGame(usernameInput?.value || '');
    });

    setInterval(() => {
        try {
            const username = usernameInput?.value.trim();
            if (username) saveProgress(username);
        } catch (e) {}
    }, 3000);

    initUpgradeButtons();

    function showTooltipForWrapper(wrapper) {
        if (!wrapper) return;

        const tooltip = wrapper.querySelector('.tooltiptext');
        if (!tooltip) return;

        tooltip.classList.add('tooltip-visible', 'fixed-position');
        tooltip.style.visibility = 'hidden';
        tooltip.style.display = 'block';

        const width = tooltip.offsetWidth;
        const height = tooltip.offsetHeight;

        let image = wrapper.querySelector('img');
        if (!image) {
            image = wrapper.closest('.upgrade-item')?.querySelector('img');
        }

        const anchor = image
            ? image.getBoundingClientRect()
            : wrapper.getBoundingClientRect();

        const padding = 8;
        let left = Math.round(anchor.left + anchor.width / 2 - width / 2);
        left = Math.max(padding, Math.min(left, window.innerWidth - padding - width));

        const spaceBelow = window.innerHeight - anchor.bottom;
        let top = Math.round(anchor.bottom + 8);

        if (spaceBelow < height + 12) {
            top = Math.max(padding, Math.round(anchor.top - height - 8));
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.visibility = 'visible';
        tooltip.style.display = 'block';
        wrapper._activeTooltip = tooltip;
    }

    function hideTooltipForWrapper(wrapper) {
        if (!wrapper) return;

        const tooltip = wrapper._activeTooltip || wrapper.querySelector('.tooltiptext');
        if (!tooltip) return;

        tooltip.classList.remove('tooltip-visible', 'fixed-position');
        tooltip.style.left = '';
        tooltip.style.top = '';
        tooltip.style.visibility = '';
        tooltip.style.display = '';
        wrapper._activeTooltip = null;
    }

    function wireTooltipsInBuildings() {
        const tooltipContainers = [upgradeContainer, upgradesContainer].filter(Boolean);

        tooltipContainers.forEach((panel) => {
            panel.querySelectorAll('.tooltip').forEach((wrapper) => {
                let image = wrapper.querySelector('img');

                if (!image) {
                    image = wrapper.closest('.upgrade-item')?.querySelector('img');
                }
                if (!image) return;

                if (!image.hasAttribute('tabindex')) image.setAttribute('tabindex', '0');

                image.removeEventListener('mouseenter', wrapper._enterHandler || (() => {}));
                image.removeEventListener('mouseleave', wrapper._leaveHandler || (() => {}));
                image.removeEventListener('focus', wrapper._focusHandler || (() => {}));
                image.removeEventListener('blur', wrapper._blurHandler || (() => {}));
                image.removeEventListener('touchstart', wrapper._touchHandler || (() => {}));

                const open = () => {
                    document.querySelectorAll('.tooltip').forEach((other) => {
                        if (other !== wrapper) hideTooltipForWrapper(other);
                    });
                    showTooltipForWrapper(wrapper);
                };

                const close = () => hideTooltipForWrapper(wrapper);

                wrapper._enterHandler = open;
                wrapper._leaveHandler = close;
                wrapper._focusHandler = open;
                wrapper._blurHandler = close;
                wrapper._touchHandler = (event) => {
                    if (wrapper._touchedOpen) return;

                    event.preventDefault();
                    open();
                    wrapper._touchedOpen = true;
                    setTimeout(() => {
                        wrapper._touchedOpen = false;
                    }, 1200);
                };

                image.addEventListener('mouseenter', wrapper._enterHandler);
                image.addEventListener('mouseleave', wrapper._leaveHandler);
                image.addEventListener('focus', wrapper._focusHandler);
                image.addEventListener('blur', wrapper._blurHandler);
                image.addEventListener('touchstart', wrapper._touchHandler, { passive: false });
            });
        });

        document.removeEventListener('click', document._tooltipOutsideHandler);

        document._tooltipOutsideHandler = (event) => {
            if (!event.target.closest('.tooltip') && !event.target.closest('.tooltiptext')) {
                document.querySelectorAll('.tooltip').forEach(hideTooltipForWrapper);
            }
        };

        document.addEventListener('click', document._tooltipOutsideHandler);
    }

    wireTooltipsInBuildings();

    const loadingTimerElement = document.getElementById('loading-timer');
    const loadingEndTimestamp = new Date(2026, 2, 26, 9, 0, 0).getTime();
    const minimumLoadingMs = 2000;
    const loadingStartTimestamp = Date.now();
    let loadingFinishScheduled = false;
    let loadingIntervalId = null;

    function formatLoadingRemaining(milliseconds) {
        const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (days >= 1) return `${days}d ${hours}h`;
        if (hours >= 1) return `${hours}h ${minutes}m`;
        return 'Loading...';
    }

    function finishLoading() {
        try {
            if (loadingIntervalId) {
                clearInterval(loadingIntervalId);
                loadingIntervalId = null;
            }

            if (loadingScreen) loadingScreen.style.display = 'none';
            if (usernameContainer) usernameContainer.style.display = 'block';

            try {
                usernameInput?.focus();
            } catch (e) {}
        } catch (error) {
            console.error('finishLoading error', error);
        }
    }

    function updateLoadingTimerNow() {
        if (!loadingTimerElement) return;

        const remaining = loadingEndTimestamp - Date.now();
        const text = formatLoadingRemaining(Math.max(0, remaining));
        const textElement = loadingTimerElement.querySelector('.loading-text');

        if (textElement) {
            textElement.textContent = text;
        } else {
            loadingTimerElement.textContent = text;
        }

        if (remaining > 0 || loadingFinishScheduled) return;

        const elapsed = Date.now() - loadingStartTimestamp;
        const remainingMinimum = Math.max(0, minimumLoadingMs - elapsed);
        loadingFinishScheduled = true;

        if (remainingMinimum === 0) {
            finishLoading();
        } else {
            setTimeout(finishLoading, remainingMinimum);
        }
    }

    updateLoadingTimerNow();
    loadingIntervalId = setInterval(updateLoadingTimerNow, 1000);

    startInterval();

    setInterval(() => {
        document.title = `${formatNumberPlain(manaCount)} Mana`;
    }, 1000);

    if (sfxVolumeSlider) {
        setSfxVolume(sfxVolumeSlider.value);
        updateSliderBackground(sfxVolumeSlider);
    }

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