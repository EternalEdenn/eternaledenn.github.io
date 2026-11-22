const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'experience', 'awards'];
const no_cache = { cache: 'no-store' };

window.addEventListener('DOMContentLoaded', event => {
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
    loadHobbies();
});

async function loadHobbies() {
    const gallery = document.getElementById('hobbies-gallery');
    const status = document.getElementById('hobbies-status');
    if (!gallery) return;

    try {
        const response = await fetch(content_dir + 'hobbies.json?v=' + Date.now(), no_cache);
        if (!response.ok) throw new Error('Could not load hobbies');
        const works = await response.json();
        const categories = { game: 'Game', anime: 'Anime', novel: 'Novel', manga: 'Manga', jpop: 'J-POP' };

        Object.entries(categories).forEach(([category, label]) => {
            const group = document.createElement('div');
            group.className = 'hobby-group';
            group.dataset.category = category;
            const heading = document.createElement('h3');
            heading.textContent = label;
            const grid = document.createElement('div');
            grid.className = 'hobby-grid';

            works.filter(work => work.category === category).forEach(work => {
                const card = document.createElement('figure');
                card.className = 'hobby-card';
                const link = document.createElement('a');
                link.href = work.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.title = work.title + ' — ' + work.source + ' (opens in a new tab)';
                const art = document.createElement('div');
                art.className = 'hobby-art';
                if (category === 'jpop') art.style.aspectRatio = '1 / 1';
                else if (work.artAspectRatio) art.style.aspectRatio = work.artAspectRatio;
                const image = document.createElement('img');
                image.src = work.image;
                if (work.artPosition) image.style.objectPosition = work.artPosition;
                image.alt = work.title + ' — official artwork';
                image.loading = 'lazy';
                image.decoding = 'async';
                const caption = document.createElement('figcaption');
                caption.lang = work.lang || 'ja';
                if (category === 'jpop') {
                    link.title = `${work.title} — ${work.album} (opens in a new tab)`;
                    image.alt = `${work.album} — album cover for ${work.title}`;
                    caption.textContent = work.title;
                } else if (work.italicPrefix && work.title.startsWith(work.italicPrefix)) {
                    const prefix = document.createElement('i');
                    prefix.textContent = work.italicPrefix;
                    caption.append(prefix, work.title.slice(work.italicPrefix.length));
                } else {
                    caption.textContent = /[ぁ-ヿ一-龯]/u.test(work.title) && caption.lang !== 'zh-Hans'
                        ? work.title
                        : work.title.toUpperCase();
                }
                art.append(image);
                if (work.titleArt) {
                    art.classList.add(work.titlePlacement === 'overlay'
                        ? 'hobby-art--overlay-title'
                        : 'hobby-art--with-title');
                    const titleArt = document.createElement('img');
                    titleArt.className = 'hobby-art-title';
                    titleArt.src = work.titleArt;
                    titleArt.alt = '';
                    titleArt.loading = 'lazy';
                    art.append(titleArt);
                }
                link.append(art);
                card.append(link, caption);
                grid.append(card);
            });

            group.append(heading, grid);
            gallery.append(group);
        });

        const filters = document.querySelectorAll('[data-hobby-filter]');
        function showCategory(button) {
            const category = button.dataset.hobbyFilter;
            filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
            gallery.querySelectorAll('.hobby-group').forEach(group => {
                group.hidden = group.dataset.category !== category;
            });
            const count = works.filter(work => work.category === category).length;
            status.textContent = `${count} works displayed`;
            bootstrap.ScrollSpy.getInstance(document.body)?.refresh();
        }
        filters.forEach(button => button.addEventListener('click', () => showCategory(button)));
        showCategory(document.querySelector('[data-hobby-filter][aria-pressed="true"]'));
    } catch (error) {
        status.classList.remove('visually-hidden');
        status.textContent = 'The gallery could not be loaded. Please refresh to try again.';
        console.error(error);
    } finally {
        gallery.setAttribute('aria-busy', 'false');
    }
}
