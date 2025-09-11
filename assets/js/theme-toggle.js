(function() {
    'use strict';
    
    // Theme management
    const THEME_KEY = 'preferred-theme';
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark',
        SYSTEM: 'system'
    };
    
    // Icons - show actual theme, not preference
    const ICONS = {
        [THEMES.LIGHT]: '☀️',
        [THEMES.DARK]: '🌙'
    };
    
    // Get elements
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;
    
    if (!themeToggle || !themeIcon) {
        console.warn('Theme toggle elements not found');
        return;
    }
    
    // Get saved theme or default to system
    function getSavedTheme() {
        return localStorage.getItem(THEME_KEY) || THEMES.SYSTEM;
    }
    
    // Save theme preference
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }
    
    // Get system theme preference
    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? THEMES.DARK 
            : THEMES.LIGHT;
    }
    
    // Apply theme to DOM
    function applyTheme(theme, skipAnimation = false) {
        // Remove existing theme attributes
        html.removeAttribute('data-theme');
        
        let actualTheme;
        if (theme === THEMES.SYSTEM) {
            // Don't set data-theme, let CSS media queries handle it
            actualTheme = getSystemTheme();
            themeToggle.title = 'Theme: System';
        } else {
            html.setAttribute('data-theme', theme);
            actualTheme = theme;
            themeToggle.title = `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
        }
        
        // Show icon for actual theme being displayed
        themeIcon.textContent = ICONS[actualTheme];
        
        // Add animation class only if not skipping animation
        if (!skipAnimation) {
            themeIcon.classList.add('rotate');
            setTimeout(() => themeIcon.classList.remove('rotate'), 300);
        }
    }
    
    // Toggle between light and dark (system acts as starting point)
    function getNextTheme(currentTheme) {
        if (currentTheme === THEMES.SYSTEM) {
            // From system, go to opposite of current system theme
            const systemTheme = getSystemTheme();
            return systemTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        } else {
            // Toggle between light and dark
            return currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
        }
    }
    
    // Handle theme toggle click
    function handleThemeToggle() {
        const currentTheme = getSavedTheme();
        const nextTheme = getNextTheme(currentTheme);
        
        saveTheme(nextTheme);
        applyTheme(nextTheme);
    }
    
    // Listen for system theme changes
    function setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', () => {
            // Only update if user is using system theme
            if (getSavedTheme() === THEMES.SYSTEM) {
                applyTheme(THEMES.SYSTEM, true); // Skip animation for system changes
            }
        });
    }
    
    // Initialize theme
    function initTheme() {
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme, true); // Skip animation on page load
        setupSystemThemeListener();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        themeToggle.addEventListener('click', handleThemeToggle);
        
        // Keyboard support
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleThemeToggle();
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            setupEventListeners();
        });
    } else {
        initTheme();
        setupEventListeners();
    }
    
    // Expose theme functions globally for debugging
    window.themeManager = {
        getCurrentTheme: getSavedTheme,
        setTheme: (theme) => {
            if (Object.values(THEMES).includes(theme)) {
                saveTheme(theme);
                applyTheme(theme);
            }
        },
        getSystemTheme
    };
})();