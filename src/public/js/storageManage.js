document.addEventListener('DOMContentLoaded', (event) => {
    const themeToggler = document.getElementById('themeToggler');
    const currentTheme = localStorage.getItem('theme') || 'Dark';

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/css/themes/${currentTheme.toLowerCase()}.css`;
    themeToggler.innerHTML = `${currentTheme} Mode`;
    document.head.appendChild(link);

    themeToggler.addEventListener('click', () => {
        let newTheme = link.href.includes('light') ? 'Dark' : 'Light';
        link.href = `/css/themes/${newTheme.toLowerCase()}.css`;
        localStorage.setItem('theme', newTheme);
        themeToggler.innerHTML = `${newTheme} Mode`;
    });
});
