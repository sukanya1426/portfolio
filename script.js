document.addEventListener('DOMContentLoaded', () => {
    const mobileToggleBtn = document.getElementById('mobile-toggle');
    const siteNav = document.getElementById('site-nav');

    if (mobileToggleBtn && siteNav) {
        mobileToggleBtn.addEventListener('click', () => {
            const isOpen = siteNav.classList.toggle('open');
            mobileToggleBtn.setAttribute('aria-expanded', String(isOpen));
        });

        siteNav.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('open');
                mobileToggleBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const bibButtons = document.querySelectorAll('.toggle-bib-btn');

    bibButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const bibId = btn.getAttribute('data-bib');
            const bibBlock = document.getElementById(bibId);
            if (!bibBlock) return;

            const isShowing = bibBlock.classList.toggle('show');

            if (isShowing) {
                try {
                    await navigator.clipboard.writeText(bibBlock.textContent.trim());
                    const originalText = btn.textContent;
                    btn.textContent = '[BibTeX (Copied!)]';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 2000);
                } catch (err) {
                    console.warn('Could not copy BibTeX:', err);
                }
            }
        });
    });

    const sections = document.querySelectorAll('.academic-section');
    const navLinks = document.querySelectorAll('.site-nav .nav-item');

    const updateActiveNav = () => {
        const offset = 120;
        let currentSectionId = sections[0] ? sections[0].id : '';

        sections.forEach(section => {
            if (window.scrollY + offset >= section.offsetTop) {
                currentSectionId = section.id;
            }
        });

        const navTarget = {
            awards: 'awards',
            leadership: 'leadership',
            service: 'leadership'
        }[currentSectionId] || currentSectionId;

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${navTarget}`);
        });
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    let fileStamp = null;
    const watchFiles = async () => {
        try {
            const response = await fetch('/__mtime?' + Date.now(), { cache: 'no-store' });
            if (!response.ok) return;
            const stamp = await response.text();
            if (fileStamp === null) {
                fileStamp = stamp;
            } else if (stamp !== fileStamp) {
                location.reload();
            }
        } catch (_) {
            /* preview server may not be running */
        }
    };
    setInterval(watchFiles, 800);
});
