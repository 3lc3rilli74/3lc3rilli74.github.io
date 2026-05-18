// =============================================
// Initialize Sidebar (Navbar)
// =============================================
function initializeSidebar() {
    const sidebar = document.getElementById('hLeftCol');
    const toggleBtn = document.getElementById('menubtn');
    const closeBtn = document.getElementById('closeSidebar');
    const sidebarLinks = document.querySelectorAll('#hLeftCol ul.hNav a, #hLeftCol .hTitle a');

    // === Sidebar Height Management ===
    function setSidebarHeight() {
        const hmc = document.getElementById('hMainCol');
        const hlc = document.getElementById('hLeftCol');
        const isMobile = window.innerWidth <= 1150;

        if (!isMobile && hmc && hlc) {
            hlc.style.height = hmc.offsetHeight + 'px';
        } else if (hlc) {
            hlc.style.height = '100vh';
        }
    }

    window.addEventListener('load', setSidebarHeight);
    window.addEventListener('resize', setSidebarHeight);
    setSidebarHeight();

    const observer = new MutationObserver(() => {
        setTimeout(setSidebarHeight, 50);
    });
    observer.observe(document.getElementById('contentArea'), { childList: true, subtree: true });

    // === Toggle Sidebar (Mobile) ===
    const toggleSidebar = () => {
        sidebar.classList.toggle('active');
        toggleBtn.classList.toggle('rotated');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
        localStorage.setItem('sidebarOpen', sidebar.classList.contains('active'));
    };

    if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);

    const sidebarOpen = localStorage.getItem('sidebarOpen') === 'true';
    if (sidebarOpen && window.innerWidth <= 1150 && sidebar) {
        sidebar.classList.add('active');
        if (toggleBtn) toggleBtn.classList.add('rotated');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
            toggleBtn.classList.remove('rotated');
            document.body.style.overflow = 'auto';
            localStorage.setItem('sidebarOpen', 'false');
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1150 && sidebar) {
            sidebar.classList.remove('active');
            document.body.style.overflow = 'auto';
            if (toggleBtn) toggleBtn.classList.remove('rotated');
        }
    });

    // === Highlight Active Link + Auto-close other nested menus ===
    function highlightActiveLink() {
        const currentHash = (window.location.hash || '#Overview').substring(1);
        const currentPath = window.location.pathname;

        // Reset everything first
        sidebarLinks.forEach(link => link.classList.remove('selected'));
        document.querySelectorAll('.nav-parent').forEach(p => p.classList.remove('active'));

        sidebarLinks.forEach(link => {
            try {
                const linkHref = link.getAttribute('href') || '';
                let isActive = false;

                if (linkHref.startsWith('#')) {
                    isActive = linkHref.substring(1) === currentHash;
                } else {
                    const linkPath = new URL(link.href, window.location.origin).pathname;
                    isActive = linkPath === currentPath || currentPath.endsWith(linkPath);
                }

                if (isActive) {
                    link.classList.add('selected');

                    // Expand all ancestor nav-parents
                    let parent = link.closest('.nav-parent');
                    while (parent) {
                        parent.classList.add('active');
                        parent = parent.parentElement.closest('.nav-parent');
                    }
                }
            } catch (e) {}
        });
    }

    highlightActiveLink();
    window.addEventListener('hashchange', () => {
        highlightActiveLink();
        setTimeout(setSidebarHeight, 100);
    });

    // === Click handlers for links ===
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Mobile: close sidebar after click
            if (window.innerWidth <= 1150) {
                setTimeout(() => {
                    sidebar.classList.remove('active');
                    if (toggleBtn) toggleBtn.classList.remove('rotated');
                    document.body.style.overflow = 'auto';
                    localStorage.setItem('sidebarOpen', 'false');
                }, 300);
            }

            // Remove previous selection
            sidebarLinks.forEach(l => l.classList.remove('selected'));
            this.classList.add('selected');

            // === FIXED: Auto-close siblings, but keep current branch open ===
            const clickedParent = this.closest('.nav-parent');

            document.querySelectorAll('.nav-parent').forEach(parent => {
                // Close only siblings at the same level or unrelated branches
                // Do NOT close any ancestor of the clicked item
                if (!clickedParent || !clickedParent.contains(parent)) {
                    // If this parent is NOT an ancestor of the clicked link → close it
                    if (!parent.contains(clickedParent)) {
                        parent.classList.remove('active');
                    }
                }
            });
        });
    });

    // === Caret click (Accordion behavior) - Improved for nested levels ===
    document.querySelectorAll('.nav-parent').forEach(parent => {
        parent.addEventListener('click', function(e) {
            if (e.target.classList.contains('caret')) {
                e.preventDefault();
                e.stopPropagation();

                const wasActive = this.classList.contains('active');

                // Close sibling nav-parents at the SAME level only (true accordion per level)
                const parentList = this.parentElement; // usually the <ul class="nested">
                if (parentList) {
                    parentList.querySelectorAll(':scope > .nav-parent').forEach(sib => {
                        if (sib !== this) {
                            sib.classList.remove('active');
                        }
                    });
                }

                this.classList.toggle('active', !wasActive);
            }
        });
    });
}

// =============================================
// Main DOMContentLoaded
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    const sidebarContainer = document.getElementById('hLeftCol');

    if (sidebarContainer) {
        fetch('/navbar.html')
            .then(response => {
                if (!response.ok) throw new Error('Navbar load failed');
                return response.text();
            })
            .then(html => {
                sidebarContainer.innerHTML = html;
                initializeSidebar();        // ← Now safe to call
            })
            .catch(err => {
                console.error('Error loading navbar:', err);
                sidebarContainer.innerHTML = `<p style="color:red;padding:20px;">⚠️ Could not load navigation bar</p>`;
            });
    }

    // Footer loading (unchanged)
    const footerContainer = document.createElement('div');
    footerContainer.id = 'footer-container';
    document.body.appendChild(footerContainer);

    fetch('/footer.html')
        .then(r => r.text())
        .then(html => { footerContainer.innerHTML = html; })
        .catch(err => {
            console.error('Error loading footer:', err);
            footerContainer.innerHTML = `<footer><p style="color:red;text-align:center;padding:20px;">⚠️ Could not load footer</p></footer>`;
        });
});

// =============================================
// Hash-based Page Loading
// =============================================
function loadPage() {
    let hash = window.location.hash || '#Overview';
    const key = hash.substring(1);
    const contentArea = document.getElementById('contentArea');

    if (window.pageContents && window.pageContents[key]) {
        contentArea.innerHTML = window.pageContents[key];
    } else {
        contentArea.innerHTML = `
            <section>
                <h1 class="ArticleTitle">Page Not Found</h1>
                <p>Sorry, that page doesn't exist yet.</p>
            </section>
        `;
    }
    window.scrollTo(0, 0);
}

window.addEventListener('load', loadPage);
window.addEventListener('hashchange', loadPage);