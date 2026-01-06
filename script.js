// Matrix Loader Logic
function initMatrixLoader() {
    const container = document.getElementById('matrix-canvas-container');
    const columns = Math.floor(window.innerWidth / 20);
    
    for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        column.style.left = `${i * 20}px`;
        column.style.animationDuration = `${Math.random() * 3 + 2}s`;
        column.style.animationDelay = `${Math.random() * 5}s`;
        
        // Random binary string
        let binary = '';
        for (let j = 0; j < 50; j++) {
            binary += Math.round(Math.random());
        }
        column.innerText = binary;
        container.appendChild(column);
    }

    // Progress Simulation
    let progress = 0;
    const progressBar = document.getElementById('loader-progress');
    const percentageText = document.getElementById('loader-percentage');
    const loader = document.getElementById('matrix-loader');

    const interval = setInterval(() => {
        progress += Math.random() * 15; // Faster simulation
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('loader-hidden');
                // Absolute fallback for Safari/older browsers
                setTimeout(() => {
                    loader.style.display = 'none';
                    loader.style.opacity = '0';
                    loader.style.pointerEvents = 'none';
                }, 1000);
            }, 500);
        }
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (percentageText) percentageText.innerText = `${Math.floor(progress)}%`;
    }, 80);

    // Hard emergency timeout: Remove loader after 5 seconds no matter what
    setTimeout(() => {
        if (loader && loader.style.display !== 'none') {
            loader.classList.add('loader-hidden');
            setTimeout(() => { loader.style.display = 'none'; }, 1000);
        }
    }, 5000);
}

// Initialize loader on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initMatrixLoader();
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('> PWA_SERVICE_WORKER: REGISTERED'))
                .catch(err => console.log('> PWA_SERVICE_WORKER: FAILED_TO_LINK', err));
        });
    }
});

// Console greeting
console.log("%c> LYMBO_OS v2.0.42 INITIALIZED", "color: #00ff41; font-weight: bold; font-size: 14px;");
console.log("%c> SYSTEM STATUS: ONLINE", "color: #00ff41;");
console.log("%c> UNAUTHORIZED ACCESS DETECTED... ACCESS GRANTED", "color: #ff003c;");

const langButtons = document.querySelectorAll('#language-switcher button');
let translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`./i18n/${lang}.json`);
        translations[lang] = await response.json();
        return translations[lang];
    } catch (error) {
        console.error(`Could not load translations for ${lang}:`, error);
        return null;
    }
}

langButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
        const lang = btn.dataset.lang;
        console.log(`> SWITCHING LANGUAGE TO: ${lang.toUpperCase()}`);
        if (!translations[lang]) {
            await loadTranslations(lang);
        }
        updateLanguage(lang);
    });
});

async function updateLanguage(lang) {
    if (!translations[lang]) {
        await loadTranslations(lang);
    }
    
    document.body.dataset.lang = lang;
    document.documentElement.lang = lang;
    
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = getNestedValue(translations[lang], key);
        
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
                // Update data-text for glitch effect if it's the main title
                if (el.id === 'main-title') {
                    el.setAttribute('data-text', translation);
                }
            }
        }
    });
}

// Helper function to get nested values from object (e.g., "about.p1")
function getNestedValue(obj, path) {
    if (!obj) return null;
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj);
}

// Langue par défaut
updateLanguage('fr');

// Theme Toggle
const themeSwitch = document.getElementById('theme-switch-wrapper');
const body = document.body;

// QR Code Logic
const logo = document.querySelector('.logo');
const qrModal = document.getElementById('qr-modal');
const qrCodeContainer = document.getElementById('qr-code');
const closeQr = document.getElementById('close-qr');

logo.addEventListener('click', () => {
    const currentUrl = window.location.href;
    qrCodeContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}" alt="QR Code">`;
    qrModal.style.display = 'flex';
    console.log("> GENERATING_ACCESS_LINK...");
});

qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal || e.target === closeQr) {
        qrModal.style.display = 'none';
    }
});

// Check for saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
if (savedTheme === 'dark') {
    body.classList.add('coin-flipped');
}

themeSwitch.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Start rotation immediately
    body.classList.toggle('coin-flipped');

    // Change theme colors at midpoint (300ms)
    setTimeout(() => {
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }, 300);
});