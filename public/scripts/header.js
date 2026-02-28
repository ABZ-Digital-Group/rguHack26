// Header / hamburger toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const sideMenu = document.getElementById('sideMenu');

    if (!hamburger || !sideMenu) return;

    function openMenu() {
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        sideMenu.classList.add('open');
        sideMenu.setAttribute('aria-hidden', 'false');
    }

    function closeMenu() {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        sideMenu.classList.remove('open');
        sideMenu.setAttribute('aria-hidden', 'true');
    }

    function toggleMenu() {
        if (sideMenu.classList.contains('open')) closeMenu();
        else openMenu();
    }

    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!sideMenu.contains(e.target) && !hamburger.contains(e.target)) {
            closeMenu();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeMenu();
    });
});
