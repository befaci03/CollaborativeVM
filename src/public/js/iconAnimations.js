document.addEventListener('DOMContentLoaded', () => {
    let xtwitterIco = document.querySelector('i.fa-brands.fa-x-twitter');
    if (!xtwitterIco) return;

    const loop = setInterval(() => {
        if (xtwitterIco.classList.contains('fa-x-twitter')) {
            xtwitterIco.classList.remove('fa-x-twitter');
            xtwitterIco.classList.add('fa-twitter');
            xtwitterIco.style.color = '#1da1f2';
        } else {
            xtwitterIco.classList.remove('fa-twitter');
            xtwitterIco.classList.add('fa-x-twitter');
            xtwitterIco.style.color = '#000';
        }
    }, 3000);
});