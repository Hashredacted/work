document.addEventListener('DOMContentLoaded', () => {
            const themeBtn = document.getElementById('theme-toggle');
            if (themeBtn) {
                const currentTheme = localStorage.getItem('rcs_theme') || 'dark';
                document.documentElement.setAttribute('data-theme', currentTheme);
                updateThemeIcon(themeBtn, currentTheme);

                themeBtn.addEventListener('click', () => {
                    const activeTheme = document.documentElement.getAttribute('data-theme');
                    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-theme', newTheme);
                    localStorage.setItem('rcs_theme', newTheme);
                    updateThemeIcon(themeBtn, newTheme);
                });
            }

            function updateThemeIcon(btn, theme) {
                btn.innerHTML = theme === 'dark'
                    ? '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>'
                    : '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
            }
        });