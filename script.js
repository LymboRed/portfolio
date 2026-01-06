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