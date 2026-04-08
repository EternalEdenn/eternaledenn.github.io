const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'awards', 'publications'];
const no_cache = { cache: 'no-store' };

function initFeatherEffect() {
    const layer = document.getElementById('feather-layer');
    if (!layer) {
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        layer.innerHTML = '';
        return;
    }

    layer.innerHTML = '';
    const count = window.innerWidth < 768 ? 14 : 24;

    for (let i = 0; i < count; i++) {
        const feather = document.createElement('span');
        feather.className = 'feather';

        const size = (Math.random() * 16 + 10).toFixed(1);
        const left = (Math.random() * 100).toFixed(2);
        const duration = (Math.random() * 8 + 11).toFixed(2);
        const delay = (Math.random() * -18).toFixed(2);
        const drift = (Math.random() * 220 - 110).toFixed(0);
        const swayDuration = (Math.random() * 2.8 + 2.2).toFixed(2);
        const opacity = (Math.random() * 0.45 + 0.35).toFixed(2);

        feather.style.setProperty('--size', `${size}px`);
        feather.style.setProperty('--left', `${left}%`);
        feather.style.setProperty('--duration', `${duration}s`);
        feather.style.setProperty('--delay', `${delay}s`);
        feather.style.setProperty('--drift', `${drift}px`);
        feather.style.setProperty('--sway-duration', `${swayDuration}s`);
        feather.style.opacity = opacity;

        layer.appendChild(feather);
    }
}


window.addEventListener('DOMContentLoaded', event => {
    initFeatherEffect();
    let featherResizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(featherResizeTimer);
        featherResizeTimer = setTimeout(initFeatherEffect, 180);
    });

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file + '?v=' + Date.now(), no_cache)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md' + '?v=' + Date.now(), no_cache)
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })
});
