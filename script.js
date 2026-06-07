/**
 * SAMA URGENCE - Moteur d'Interaction JavaScript
 * Spécifications : Performance, Accessibilité et Animations Fluides.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. MENU MOBILE RESPONSIVE
    // ==========================================
    const menuToggle = document.querySelector('#menuToggle');
    const navMenu = document.querySelector('#navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Empêcher le défilement du corps en arrière-plan lorsque le menu est ouvert
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Fermeture automatique du menu lors du clic sur un lien
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }


    // ==========================================
    // 2. COMPORTEMENT DE L'EN-TÊTE AU SCROLL
    // ==========================================
    const header = document.querySelector('header');
    const backToTopBtn = document.querySelector('#backToTop');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        // Effet de réduction de la navbar
        if (scrollPos > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Affichage/Masquage du bouton Retour en Haut
        if (backToTopBtn) {
            if (scrollPos > 600) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    });


    // ==========================================
    // 3. RETOUR EN HAUT DE PAGE FLUIDE
    // ==========================================
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    // ==========================================
    // 4. SCROLL SPY & LIENS ACTIFS
    // ==========================================
    const sections = document.querySelectorAll('section[id]');

    function scrollSpy() {
        const currentScroll = window.scrollY + 120; // Décalage pour compenser la hauteur de la navbar

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const targetLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

            if (targetLink) {
                if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    targetLink.classList.add('active');
                }
            }
        });
    }
    window.addEventListener('scroll', scrollSpy);


    // ==========================================
    // 5. ANIMATION DES COMPTEURS STATISTIQUES
    // ==========================================
    const stats = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const duration = 2000; // Durée globale de l'animation en millisecondes
            const increment = target / (duration / 16); // Approximativement 60 images par seconde
            
            let current = 0;

            const updateCount = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target; // S'assurer que le chiffre final est exact
                }
            };
            updateCount();
        });
    }


    // ==========================================
    // 6. ANIMATION D'APPARITION AU SCROLL (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal-element');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Si l'élément intersecté contient les statistiques et qu'elles n'ont pas encore été animées
                if (entry.target.classList.contains('stats-grid') && !statsAnimated) {
                    animateStats();
                    statsAnimated = true;
                }
                
                observer.unobserve(entry.target); // Arrêter d'observer une fois l'élément affiché
            }
        });
    }, {
        threshold: 0.15, // L'élément doit être visible à 15% pour se déclencher
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Optionnel : Si la section statistique est indépendante de la classe de révélation générale
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid && !statsGrid.classList.contains('reveal-element')) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !statsAnimated) {
                animateStats();
                statsAnimated = true;
            }
        }, { threshold: 0.3 });
        statsObserver.observe(statsGrid);
    }
});
