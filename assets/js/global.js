document.addEventListener('DOMContentLoaded', function () {

    // --- Elemen UI Global ---
    const header = document.getElementById('header');
    const headerMainContent = document.getElementById('header-main-content');
    const mobileSearchView = document.getElementById('mobile-search-view');
    const mobileSearchOpenButton = document.getElementById('mobile-search-open-button');
    const mobileSearchCloseButton = document.getElementById('mobile-search-close-button');
    const mobileSearchForm = document.getElementById('mobile-search-form');
    const desktopSearchForm = document.getElementById('desktop-search-form');
    const desktopSearchInput = document.querySelector('#desktop-search-form input[name="q"]');
    const mobileSearchInput = document.querySelector('#mobile-search-input');
    const desktopMenuButtonText = document.querySelector('#desktop-dropdown-button span');

    // --- Data untuk Menu & Terjemahan UI ---
    const langMenuItems = [
        { href: '#', text: 'Bahasa Indonesia', dataLang: 'id' },
        { href: '#', text: 'English', dataLang: 'en' }
    ];

    // Update data subdomain menu dengan dukungan multi-bahasa
    const subdomainMenuItems = [
        { 
            href: function(lang) { return `/${lang}/`; }, 
            text: 'dayverse.id', 
            description: {
                id: 'Situs utama',
                en: 'Main site'
            },
            colorClass: 'main',
            subdomain: 'main'
        },
        { 
            href: function(lang) { return `https://u.dayverse.id/${lang}`; }, 
            text: 'u.dayverse.id', 
            description: {
                id: 'Urdzien - Gagasan & Keilmuan',
                en: 'Urdzien - Ideas & Knowledge'
            },
            colorClass: 'urdzien',
            subdomain: 'urdzien'
        },
        { 
            href: function(lang) { return `https://n.dayverse.id/${lang}`; }, 
            text: 'n.dayverse.id', 
            description: {
                id: 'Nurimator - Animasi & desain',
                en: 'Nurimator - Animation & design'
            },
            colorClass: 'nurimator',
            subdomain: 'nurimator'
        },
        { 
            href: function(lang) { return `https://app.dayverse.id/${lang}`; }, 
            text: 'app.dayverse.id', 
            description: {
                id: 'Aplikasi web',
                en: 'Web app'
            },
            colorClass: 'webapp',
            subdomain: 'webapp'
        }
    ];

    const mainMenuItems = {
        id: [
            { href: '/id/', text: 'Beranda' },
            { href: '/id/articles/', text: 'Artikel' },
            { href: 'https://app.dayverse.id/id', text: 'Aplikasi' },
            { href: '/id/about-us', text: 'Tentang Kami' }
        ],
        en: [
            { href: '/en/', text: 'Home' },
            { href: '/en/articles/', text: 'Articles' },
            { href: 'https://app.dayverse.id/en', text: 'Apps' },
            { href: '/en/about-us', text: 'About Us' }
        ]
    };

    const uiStrings = {
        id: {
            searchPlaceholder: 'Cari...',
            menuButton: 'Menu',
            footer: {
                description: 'Dengan rasa ingin tahu sebagai landasan, Membuka ruang cipta keberagaman.',
                navTitle: 'Navigasi',
                infoTitle: 'Informasi',
                socialTitle: 'Ikuti kami',
                navLinks: [
                    { text: 'Artikel', href: '/id/articles/' },
                    { text: 'Aplikasi', href: 'https://app.dayverse.id/id' },
                    { text: 'Nurimator', href: 'https://n.dayverse.id/id' },
                    { text: 'Urdzien', href: 'https://u.dayverse.id/id' },
                    { text: 'Donasi', href: '/id/donate.html' }
                ],
                infoLinks: [
                    { text: 'Term and Conditions', href: '/id/terms-and-conditions' },
                    { text: 'Privacy Policy', href: '/id/privacy-policy' },
                    { text: 'License', href: '/id/license' },
                    { text: 'Disclaimer', href: '/id/disclaimer' },
                    { text: 'Tentang Kami', href: '/id/about-us' }
                ]
            }
        },
        en: {
            searchPlaceholder: 'Search...',
            menuButton: 'Menu',
            footer: {
                description: 'Driven by curiosity as a foundation, Reaching into diverse spaces of creation.',
                navTitle: 'Navigation',
                infoTitle: 'Information',
                socialTitle: 'Follow us',
                navLinks: [
                    { text: 'Articles', href: '/en/articles/' },
                    { text: 'Apps', href: 'https://app.dayverse.id/en' },
                    { text: 'Nurimator', href: 'https://n.dayverse.id/en' },
                    { text: 'Urdzien', href: 'https://u.dayverse.id/en' },
                    { text: 'Donate', href: '/en/donate' }
                ],
                infoLinks: [
                    { text: 'Term and Conditions', href: '/en/terms-and-conditions' },
                    { text: 'Privacy Policy', href: '/en/privacy-policy' },
                    { text: 'License', href: '/en/license' },
                    { text: 'Disclaimer', href: '/en/disclaimer' },
                    { text: 'About Us', href: '/en/about-us' }
                ]
            }
        }
    };
    
    // --- Sistem Kontrol Menu Terpusat (Disederhanakan) ---
    const activeMenus = new Map();

    const closeAllMenus = (excludeId = null) => {
        activeMenus.forEach((menuControl, menuId) => {
            if (menuId !== excludeId) {
                menuControl.close();
            }
        });
    };

    const createMenuItem = (item) => {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.text;
        
        // Gunakan class CSS yang sudah didefinisikan di header
        a.className = 'header-menu-item';
        
        if (item.dataLang) {
            a.dataset.lang = item.dataLang;
            a.classList.add('lang-option');
        }
        return a;
    };

    // Function untuk mendeteksi subdomain berdasarkan warna aksen logo
    const detectCurrentSubdomain = () => {
        const logo = document.querySelector('#logo-dropdown-button span .text-teal-600, #logo-dropdown-button span .text-amber-400, #logo-dropdown-button span .text-blue-600, #logo-dropdown-button span .text-slate-600');
        
        if (!logo) return 'main'; // default
        
        if (logo.classList.contains('text-teal-600')) return 'nurimator';
        if (logo.classList.contains('text-amber-400')) return 'main';
        if (logo.classList.contains('text-blue-600')) return 'urdzien';
        if (logo.classList.contains('text-slate-600')) return 'webapp';
        
        return 'main'; // fallback
    };

    // Update fungsi untuk membuat item subdomain menu dengan icon home
    const createSubdomainMenuItem = (item, lang) => {
        const a = document.createElement('a');
        // Handle href yang berupa function atau string
        a.href = typeof item.href === 'function' ? item.href(lang) : item.href;
        a.className = `subdomain-menu-item ${item.colorClass}`;
        
        // Deteksi subdomain aktif berdasarkan warna aksen logo
        const currentSubdomain = detectCurrentSubdomain();
        const isActive = item.subdomain === currentSubdomain;
        
        if (isActive) {
            // Gunakan warna Tailwind -600 sebagai background untuk item aktif
            switch (item.colorClass) {
                case 'main': 
                    a.style.backgroundColor = '#d97706'; // amber-700
                    break;
                case 'urdzien': 
                    a.style.backgroundColor = '#1d4ed8'; // blue-700
                    break;
                case 'nurimator': 
                    a.style.backgroundColor = '#0f766e'; // teal-700
                    break;
                case 'webapp': 
                    a.style.backgroundColor = '#334155'; // slate-700
                    break;
                default: 
                    a.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
            }
            a.style.cursor = 'default';
            a.addEventListener('click', e => e.preventDefault());
        }
        
        // Gunakan deskripsi sesuai bahasa yang aktif
        const description = typeof item.description === 'object' 
            ? item.description[lang] || item.description.id 
            : item.description;
        
        // Icon selalu putih baik aktif maupun tidak
        const iconColor = 'white';
        
        // Tentukan warna deskripsi berdasarkan status aktif
        const descriptionColor = isActive ? 'text-white' : 'text-gray-400';
        
        a.innerHTML = `
            <svg class="subdomain-home-icon" viewBox="0 0 16 16" fill="${iconColor}" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0L0 6V8H1V15H4V10H7V15H15V8H16V6L14 4.5V1H11V2.25L8 0ZM9 10H12V13H9V10Z"/>
            </svg>
            <div>
                <div class="font-semibold text-white">${item.text}</div>
                <div class="text-xs ${descriptionColor} mt-1">${description}</div>
            </div>
        `;
        
        return a;
    };

    const setupAnimatedMenu = (buttonId, menuId, itemsData) => {
        const button = document.getElementById(buttonId);
        const menu = document.getElementById(menuId);
        if (!button || !menu) return;
        
        let isOpen = false;
        
        const populateMenu = () => {
            const pageLang = document.documentElement.lang || 'id';
            
            // Bersihkan menu terlebih dahulu
            while (menu.firstChild) {
                menu.removeChild(menu.firstChild);
            }
            
            // Logika khusus untuk subdomain menu dengan support multi-bahasa
            if (menuId === 'logo-dropdown-menu') {
                subdomainMenuItems.forEach(item => {
                    menu.appendChild(createSubdomainMenuItem(item, pageLang));
                });
            } else if (menuId.includes('lang-switcher')) {
                const currentPath = window.location.pathname;
                const currentLang = pageLang;

                langMenuItems.forEach(item => {
                    const targetLang = item.dataLang;
                    let newHref = '#';
                    let isAvailable = true;

                    if (targetLang === currentLang) {
                        // Tautan untuk bahasa saat ini, tidak perlu href
                    } else if (typeof postMeta !== 'undefined' && typeof allSitePosts !== 'undefined') {
                        // Logika prioritas untuk halaman konten spesifik
                        const alternatePost = allSitePosts.find(p => String(p.page_id) === String(postMeta.page_id) && p.lang === targetLang);
                        if (alternatePost && alternatePost.url) {
                            newHref = alternatePost.url;
                        } else {
                            isAvailable = false; // Terjemahan tidak ditemukan
                        }
                    } else {
                        // Logika global untuk pergantian URL (disederhanakan)
                        if (currentPath.startsWith('/en/')) {
                                if (targetLang === 'id') newHref = currentPath.replace('/en/', '/id/');
                        } else if (currentPath.startsWith('/id/')) {
                                if (targetLang === 'en') newHref = currentPath.replace('/id/', '/en/');
                        } else {
                            // Halaman tanpa awalan bahasa (misal: /privacy-policy.html)
                            isAvailable = false;
                        }
                    }

                    const newItem = { ...item, href: newHref };
                    const menuItemElement = createMenuItem(newItem);
                    
                    if (!isAvailable) {
                        menuItemElement.classList.add('disabled');
                        menuItemElement.title = 'Terjemahan tidak tersedia';
                        menuItemElement.addEventListener('click', e => e.preventDefault());
                    }

                    menu.appendChild(menuItemElement);
                });
                
                // Panggil langsung tanpa delay
                setupLanguageSwitcherUI();
            } else {
                // Logika untuk menu lainnya
                const itemsToRender = itemsData[pageLang] || itemsData.id || itemsData;
                itemsToRender.forEach(item => menu.appendChild(createMenuItem(item)));
            }
        };

        // Populate menu saat pertama kali
        populateMenu();

        const openMenu = () => {
            if (isOpen) return;
            isOpen = true;

            // Re-populate menu setiap kali dibuka untuk memastikan bahasa terkini
            populateMenu();

            const buttonRect = button.getBoundingClientRect();
            const headerHeight = header.offsetHeight;
            menu.style.top = `${headerHeight + 8}px`; 
            
            // Posisi khusus untuk logo dropdown (di kiri)
            if (menuId === 'logo-dropdown-menu') {
                menu.style.left = `${buttonRect.left}px`;
                menu.style.right = 'auto';
            } else {
                menu.style.right = `${window.innerWidth - buttonRect.right}px`;
                menu.style.left = 'auto';
            }
            
            menu.classList.remove('hidden');
            menu.classList.add('flex');
        };

        const closeMenu = () => {
            if (!isOpen) return;
            isOpen = false;
            menu.classList.add('hidden');
            menu.classList.remove('flex');
        };

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen) {
                closeMenu();
            } else {
                closeAllMenus(menuId);
                openMenu();
            }
        });

        activeMenus.set(menuId, { open: openMenu, close: closeMenu, populate: populateMenu });
    };

    // --- Fungsi Global Lainnya ---
    const setupLanguageSwitcherUI = () => {
        const pageLang = document.documentElement.lang || 'id';
        const currentLangDisplay = document.getElementById('current-lang-display');
        if (currentLangDisplay) currentLangDisplay.textContent = pageLang.toUpperCase();

        document.querySelectorAll('.lang-option').forEach(link => {
            link.classList.remove('active', 'disabled');
            if (link.dataset.lang === pageLang) {
                link.classList.add('active');
                link.addEventListener('click', e => e.preventDefault());
            } else if (link.title === 'Terjemahan tidak tersedia') {
                link.classList.add('disabled');
                link.addEventListener('click', e => e.preventDefault());
            }
        });
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const input = event.target.querySelector('input[name="q"]');
        const query = input.value.trim();
        if (!query) return;
        const pageLang = document.documentElement.lang || 'id';
        window.location.href = `/${pageLang}/articles/?q=${encodeURIComponent(query)}`;
    };
    
    const setUiLanguage = () => {
        const pageLang = document.documentElement.lang || 'id';
        const translations = uiStrings[pageLang] || uiStrings.id;
        const searchActionUrl = `/${pageLang}/articles/`;

        if(desktopSearchInput) desktopSearchInput.placeholder = translations.searchPlaceholder;
        if(mobileSearchInput) mobileSearchInput.placeholder = translations.searchPlaceholder;
        if(desktopMenuButtonText) desktopMenuButtonText.textContent = translations.menuButton;
        if(desktopSearchForm) desktopSearchForm.action = searchActionUrl;
        if(mobileSearchForm) mobileSearchForm.action = searchActionUrl;
    };

    const setFooterLanguage = () => {
        const pageLang = document.documentElement.lang || 'id';
        const footerStrings = uiStrings[pageLang]?.footer || uiStrings.id.footer;

        if (!footerStrings) return;

        const footerDescription = document.getElementById('footer-description');
        const footerNavTitle = document.getElementById('footer-nav-title');
        const footerInfoTitle = document.getElementById('footer-info-title');
        const footerSocialTitle = document.getElementById('footer-social-title');

        if (footerDescription) footerDescription.textContent = footerStrings.description;
        if (footerNavTitle) footerNavTitle.textContent = footerStrings.navTitle;
        if (footerInfoTitle) footerInfoTitle.textContent = footerStrings.infoTitle;
        if (footerSocialTitle) footerSocialTitle.textContent = footerStrings.socialTitle;

        const navLinksContainer = document.getElementById('footer-nav-links');
        if (navLinksContainer) {
            navLinksContainer.innerHTML = '';
            footerStrings.navLinks.forEach(linkData => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = linkData.href;
                a.textContent = linkData.text;
                a.className = 'text-gray-400 hover:text-amber-400';
                li.appendChild(a);
                navLinksContainer.appendChild(li);
            });
        }
        
        const infoLinksContainer = document.getElementById('footer-info-links');
        if (infoLinksContainer) {
            infoLinksContainer.innerHTML = '';
            footerStrings.infoLinks.forEach(linkData => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = linkData.href;
                a.textContent = linkData.text;
                a.className = 'text-gray-400 hover:text-amber-400';
                li.appendChild(a);
                infoLinksContainer.appendChild(li);
            });
        }
    };

    // Tambahkan fungsi untuk memperbarui semua menu sesuai bahasa
    const updateMenusForLanguageChange = () => {
        activeMenus.forEach((menuControl) => {
            if (menuControl.populate) {
                menuControl.populate();
            }
        });
    };

    // --- Inisialisasi ---
    setUiLanguage();
    setFooterLanguage();
    
    // Panggil setupAnimatedMenu untuk semua menu termasuk logo dropdown
    setupAnimatedMenu('logo-dropdown-button', 'logo-dropdown-menu', subdomainMenuItems);
    setupAnimatedMenu('desktop-lang-switcher-button', 'desktop-lang-switcher-menu', langMenuItems);
    setupAnimatedMenu('desktop-dropdown-button', 'desktop-dropdown-menu', mainMenuItems);
    setupAnimatedMenu('mobile-lang-switcher-button', 'mobile-lang-switcher-menu', langMenuItems);
    setupAnimatedMenu('mobile-menu-button', 'mobile-menu', mainMenuItems);

    // Tambahkan observer untuk perubahan bahasa
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
                setUiLanguage();
                setFooterLanguage();
                updateMenusForLanguageChange();
                // setupLanguageSwitcherUI akan dipanggil otomatis dari populateMenu
            }
        });
    });

    // Mulai observasi perubahan atribut lang pada element html
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });

    if (mobileSearchOpenButton) {
        mobileSearchOpenButton.addEventListener('click', () => {
            closeAllMenus();
            if (headerMainContent) headerMainContent.classList.add('hidden');
            if (mobileSearchView) {
                mobileSearchView.classList.remove('hidden');
                mobileSearchView.classList.add('flex');
                mobileSearchView.querySelector('input')?.focus();
            }
        });
    }

    if (mobileSearchCloseButton) {
        mobileSearchCloseButton.addEventListener('click', () => {
            if (headerMainContent) headerMainContent.classList.remove('hidden');
            if (mobileSearchView) {
                mobileSearchView.classList.add('hidden');
                mobileSearchView.classList.remove('flex');
            }
        });
    }
    
    // Tutup menu saat klik di luar
    window.addEventListener('click', () => {
        closeAllMenus();
    });
    
    // Hapus setTimeout terakhir untuk setupLanguageSwitcherUI
    // setTimeout(() => setupLanguageSwitcherUI(), 200);
    
    desktopSearchForm?.addEventListener('submit', handleSearch);
    mobileSearchForm?.addEventListener('submit', handleSearch);
    
    window.scrollTo(0, 0);
});
