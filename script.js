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

// Sound Manager (Web Audio API)
const SoundManager = {
    ctx: null,
    enabled: localStorage.getItem('audio_enabled') !== 'false',
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playUI(frequency = 440, type = 'sine', duration = 0.1) {
        if (!this.enabled) return;
        this.init();
        
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime); // Volume increased to 20%
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) { console.warn("Audio Context blocked"); }
    },

    click() { this.playUI(1000, 'sine', 0.03); }, // Softer, cleaner click
    beep() { this.playUI(400, 'sine', 0.08); },
    glitch() { this.playUI(150, 'sawtooth', 0.1); },
    
    starCoin() {
        if (!this.enabled) return;
        this.init();
        
        const playTone = (freq, start, duration, type = 'sine') => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + start);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime + start);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + start + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + start);
            osc.stop(this.ctx.currentTime + start + duration);
        };

        // Star Coin sparkly sequence
        playTone(987.77, 0, 0.1, 'sine');   // B5
        playTone(1318.51, 0.05, 0.1, 'sine'); // E6
        playTone(1567.98, 0.1, 0.1, 'sine');  // G6
        playTone(1975.53, 0.15, 0.4, 'sine'); // B6
    }
};

// Initialize Audio & Hover Listeners
document.addEventListener('DOMContentLoaded', () => {
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        if (!SoundManager.enabled) {
            audioToggle.classList.add('muted');
            audioToggle.querySelector('i').className = 'fas fa-volume-mute';
        }

        audioToggle.addEventListener('click', () => {
            SoundManager.enabled = !SoundManager.enabled;
            localStorage.setItem('audio_enabled', SoundManager.enabled);
            audioToggle.classList.toggle('muted');
            
            const icon = audioToggle.querySelector('i');
            icon.className = SoundManager.enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            
            if (SoundManager.enabled) SoundManager.click();
        });
    }

    // Attach sounds to global hover elements
    document.querySelectorAll('.project-card, .badge, #language-switcher button, #theme-switch-wrapper').forEach(el => {
        el.addEventListener('mouseenter', () => SoundManager.beep());
    });
});

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
        SoundManager.click();
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
    SoundManager.click();
    const currentUrl = window.location.href;
    qrCodeContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}" alt="QR Code">`;
    qrModal.style.display = 'flex';
    console.log("> GENERATING_ACCESS_LINK...");
});

qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal || e.target === closeQr) {
        SoundManager.click();
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
    SoundManager.starCoin();
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Start rotation immediately
    body.classList.toggle('coin-flipped');

    // Change theme colors at midpoint (300ms)
    setTimeout(() => {
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        // Notify other modules of theme change
        document.body.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    }, 300);
});
// --- Terminal CLI Logic ---
const TerminalHandler = {
    container: document.getElementById('terminal-container'),
    toggle: document.getElementById('terminal-toggle'),
    input: document.getElementById('terminal-input'),
    output: document.getElementById('terminal-output'),
    minimizeBtn: document.querySelector('.minimize-terminal'),
    
    commands: {
        help: () => `
Available commands:
  help     - Show this list
  about    - System kernel information
  skills   - List technical capabilities
  projects - View deployed modules
  clear    - Flush terminal buffer
  contact  - Initiate secure link
  sudo     - Restricted access
  matrix   - Re-run boot sequence
  whoami   - Display user identity`,
        
        about: () => "LymboOS v2.0.42. Built by Vadzim H., Intelligence Engineer. Purpose: High-performance data analysis and software architecture.",
        
        skills: () => "Primary: Python, SQL, Docker, Bash.\nSecondary: JavaScript, C, NoSQL, Git.",
        
        projects: () => "1. Pokémon CLI - Game engine\n2. Data Analysis Pipeline - Pandas/NumPy\n3. LymboOS - Current Environment",
        
        clear: function() {
            TerminalHandler.output.innerHTML = '';
            return null;
        },
        
        contact: () => "Direct Line: vadzimhast@icloud.com\nLinkedIn: [ENCRYPTED]\nGitHub: /LymboRed",
        
        sudo: () => "Error: Access denied. Root privileges required. This incident will be reported.",
        
        matrix: () => {
            initMatrixLoader();
            return "Re-initializing matrix backdrop...";
        },
        
        whoami: () => "guest_researcher@lymbo_os. Session: Temporary.",

        ls: () => "about.txt  skills.md  projects/  secrets.vault",

        cat: function(fullCmd) {
            const file = fullCmd.split(' ')[1];
            if (!file) return "Usage: cat [file]";
            if (file === 'about.txt') return this.about();
            if (file === 'skills.md') return this.skills();
            if (file === 'secrets.vault') return "[ENCRYPTED CONTENT] - Decryption key required.";
            return `cat: ${file}: No such file or directory`;
        }
    },

    init() {
        this.toggle.addEventListener('click', () => {
            SoundManager.click();
            this.container.classList.toggle('terminal-minimized');
            if (!this.container.classList.contains('terminal-minimized')) {
                this.input.focus();
            }
        });

        this.minimizeBtn.addEventListener('click', () => {
            SoundManager.click();
            this.container.classList.add('terminal-minimized');
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const fullCmd = this.input.value.trim().toLowerCase();
                const cmd = fullCmd.split(' ')[0];
                
                this.print(`guest@lymbo_os:~$ ${fullCmd}`);
                
                if (cmd === '') {
                    // Do nothing
                } else if (this.commands[cmd]) {
                    const result = this.commands[cmd](fullCmd);
                    if (result) this.print(result);
                } else {
                    this.print(`Command not found: ${cmd}. Type 'help' for available commands.`);
                }
                
                this.input.value = '';
                this.container.querySelector('#terminal-body').scrollTop = this.container.querySelector('#terminal-body').scrollHeight;
            }
        });

        // Click anywhere in terminal to focus input
        this.container.addEventListener('click', () => {
            this.input.focus();
        });
    },

    print(text) {
        const div = document.createElement('div');
        div.style.whiteSpace = 'pre-wrap';
        div.style.marginBottom = '5px';
        div.textContent = text;
        this.output.appendChild(div);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    TerminalHandler.init();
});

// --- GitHub Stats Dashboard Logic ---
const GitHubStats = {
    username: 'LymboRed',
    
    async init() {
        console.log("> INITIATING_GITHUB_API_FETCH...");
        try {
            const [userRes, reposRes, eventsRes] = await Promise.all([
                fetch(`https://api.github.com/users/${this.username}`),
                fetch(`https://api.github.com/users/${this.username}/repos?per_page=100`),
                fetch(`https://api.github.com/users/${this.username}/events/public`)
            ]);

            const userData = await userRes.json();
            const reposData = await reposRes.json();
            const eventsData = await eventsRes.json();

            if (userData.id) {
                this.updateStats(userData, reposData);
                this.updateActivity(eventsData);
                console.log("> DATALINK_ESTABLISHED: GITHUB_ANALYTICS_LOADED");
            } else {
                throw new Error("User not found");
            }
        } catch (error) {
            console.error("> GITHUB_API_ERROR:", error);
            document.querySelector('#github-recent-activity').innerHTML = "<p style='color: var(--secondary-accent)'>> ERROR: CONNECTION_TIMEOUT_OR_RATE_LIMIT</p>";
        }
    },

    updateStats(user, repos) {
        document.getElementById('github-repos').textContent = user.public_repos;
        document.getElementById('github-followers').textContent = user.followers;
        
        const stars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        document.getElementById('github-stars').textContent = stars;

        document.getElementById('github-commits').textContent = user.public_gists;
    },

    updateActivity(events) {
        const container = document.getElementById('github-recent-activity');
        container.innerHTML = '';
        
        // Take last 5 relevant events
        const relevantEvents = events
            .filter(e => ['PushEvent', 'CreateEvent', 'WatchEvent'].includes(e.type))
            .slice(0, 5);

        if (relevantEvents.length === 0) {
            container.innerHTML = "<p>> NO_RECENT_ACTIVITY_DETECTED</p>";
            return;
        }

        relevantEvents.forEach(event => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            let action = '';
            if (event.type === 'PushEvent') action = 'committed to';
            if (event.type === 'CreateEvent') action = 'created';
            if (event.type === 'WatchEvent') action = 'starred';

            const repoName = event.repo.name.split('/')[1];
            const date = new Date(event.created_at).toLocaleDateString();

            item.innerHTML = `> ${date}: ${action} <span class="repo-name">${repoName}</span>`;
            container.appendChild(item);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    GitHubStats.init();
});

// --- Neural Link Logic ---
const HologramManager = {
    init() {
        this.container = document.getElementById('hologram-container');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.camera.position.z = 15;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.particles = null;
        this.createBrain();
        this.animate();

        window.addEventListener('resize', () => this.onResize());
        
        // Drag interactivity
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };

        this.container.addEventListener('mousedown', (e) => {
            this.isDragging = true;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            const currentMouse = { x: e.clientX, y: e.clientY };
            if (this.isDragging && this.particles) {
                const deltaMove = {
                    x: currentMouse.x - this.previousMousePosition.x,
                    y: currentMouse.y - this.previousMousePosition.y
                };

                this.particles.rotation.y += deltaMove.x * 0.01;
                this.particles.rotation.x += deltaMove.y * 0.01;
            }
            this.previousMousePosition = currentMouse;
        });

        // Update color on theme change
        document.body.addEventListener('themeChanged', () => {
            this.updateColors();
        });
    },

    updateColors() {
        if (!this.particles) return;
        const accentColor = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#00ff41');
        const colors = this.particles.geometry.attributes.color.array;
        
        for (let i = 0; i < colors.length / 3; i++) {
            const mixedColor = accentColor.clone().lerp(new THREE.Color('#ffffff'), Math.random() * 0.3);
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }
        this.particles.geometry.attributes.color.needsUpdate = true;
    },

    createBrain() {
        const particleCount = 2500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const accentColor = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#00ff41');

        for (let i = 0; i < particleCount; i++) {
            // Brain-like shape using two spheres/hemispheres with noise
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            
            const r = 5 + Math.random() * 1.5;
            let x = r * Math.sin(theta) * Math.cos(phi) * 1.3;
            let y = r * Math.sin(theta) * Math.sin(phi) * 0.9;
            let z = r * Math.cos(theta) * 0.8;

            // Fold distortion
            const angle = Math.atan2(y, x);
            const dist = Math.sqrt(x*x + y*y);
            const fold = Math.sin(dist * 1.2) * 0.5;
            x += Math.cos(angle) * fold;
            y += Math.sin(angle) * fold;

            // Hemisphere split
            if (x > 0) x += 0.4;
            else x -= 0.4;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const mixedColor = accentColor.clone().lerp(new THREE.Color('#ffffff'), Math.random() * 0.4);
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0, // Start invisible for entry animation
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Neural web connections
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: accentColor, 
            transparent: true, 
            opacity: 0.1 
        });
        
        for(let i = 0; i < 60; i++) {
            const p1 = Math.floor(Math.random() * particleCount);
            const p2 = Math.floor(Math.random() * particleCount);
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(positions[p1*3], positions[p1*3+1], positions[p1*3+2]),
                new THREE.Vector3(positions[p2*3], positions[p2*3+1], positions[p2*3+2])
            ]);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.particles.add(line);
        }

        // Fade in animation
        let opacity = 0;
        const fadeIn = setInterval(() => {
            opacity += 0.05;
            this.particles.material.opacity = opacity;
            if (opacity >= 0.8) clearInterval(fadeIn);
        }, 50);
    },

    onResize() {
        if (!this.container) return;
        this.camera.aspect = 1;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    },

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.particles) {
            this.particles.rotation.y += 0.005;
            this.particles.rotation.x += 0.002;
            
            // Subtle "breathing" effect
            const time = Date.now() * 0.001;
            this.particles.scale.setScalar(1 + Math.sin(time) * 0.05);

            // Flicker effect
            if (Math.random() > 0.98) {
                this.particles.material.opacity = 0.3;
            } else {
                this.particles.material.opacity = 0.8;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
};

const NeuralLink = {
    form: document.getElementById('neural-form'),
    feedback: document.getElementById('form-feedback'),
    syncText: document.getElementById('sync-status'),
    nodeLocation: document.getElementById('node-location'),

    init() {
        if (!this.form) return;

        // Simulate node location scanning
        setTimeout(() => {
            if(this.nodeLocation) {
                this.nodeLocation.textContent = "CONNECTED: NODE_" + Math.random().toString(36).substring(7).toUpperCase();
            }
        }, 2000);

        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                SoundManager.beep();
                if(this.syncText) this.syncText.textContent = "SYNCHRONIZING...";
            });
            
            input.addEventListener('blur', () => {
                if(this.syncText) this.syncText.textContent = "WAITING";
            });

            input.addEventListener('input', () => {
                if (Math.random() > 0.95) {
                    if(this.syncText) this.syncText.textContent = "DATA_STREAM_ACTIVE";
                    setTimeout(() => { if(this.syncText) this.syncText.textContent = "SYNCHRONIZING..."; }, 500);
                }
            });
        });

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            SoundManager.glitch();
            
            const btn = document.getElementById('submit-link');
            const originalHTML = btn.innerHTML;
            
            btn.innerHTML = 'ESTABLISHING_UPLINK...';
            btn.disabled = true;
            
            if(this.syncText) this.syncText.textContent = "UPLOADING_PAYLOAD";

            const formData = new FormData(this.form);
            
            try {
                const response = await fetch(this.form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    this.showFeedback("TRANSMISSION_SUCCESSFUL: DATA_LOGGED_IN_CORE", "var(--accent-color)");
                    this.form.reset();
                    if(this.syncText) this.syncText.textContent = "LINK_TERMINATED";
                } else {
                    throw new Error();
                }
            } catch (err) {
                this.showFeedback("CRITICAL_ERROR: UPLINK_FAILED", "var(--secondary-accent)");
                if(this.syncText) this.syncText.textContent = "CONNECTION_LOST";
            } finally {
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                }, 2000);
            }
        });
    },

    showFeedback(text, color) {
        if (!this.feedback) return;
        this.feedback.textContent = `> ${text}`;
        this.feedback.style.color = color;
        this.feedback.style.display = 'block';
        setTimeout(() => {
            this.feedback.style.display = 'none';
        }, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    HologramManager.init();
    NeuralLink.init();
});
